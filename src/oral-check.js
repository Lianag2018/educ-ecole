import {ADULT_CONFIRMATION_MS, ORAL_FEEDBACK, resolveOralTarget} from './oral-check-targets.js';

export const ORAL_CAPTURE_SECONDS = 8;
const OUTPUT_RATE = 24000;
const CANCELLED = Symbol('cancelled');
const BUSY = new Set(['starting', 'recording', 'sending']);
const WORKLET_NAME = 'atelier-oral-capture-v1';

function targetDescriptor(target) {
  return !target ? null : target.kind === 'number' ? {kind:'number', value:target.value} : {kind:'word', activityId:target.activityId};
}
function contextKey(context) { return JSON.stringify([context.profileId, context.stage, targetDescriptor(context.target)]); }
function stopTracks(stream) { for (const track of stream?.getTracks?.() || []) { try { track.stop(); } catch {} } }
function disconnect(node) { try { node?.disconnect(); } catch {} }
function closeContext(context) { try { Promise.resolve(context?.close?.()).catch(() => {}); } catch {} }
function slot() {
  const item = {abort:new AbortController(), timers:new Set()};
  item.cancelled = new Promise(resolve => { item.cancel = () => resolve(CANCELLED); });
  return item;
}
function settled(promise) { return Promise.resolve(promise).then(value => ({value}), error => ({error})); }

/** Short mono recordings only. Downsampling averages each source interval;
 * upsampling interpolates adjacent samples. No network or storage side effects.
 */
export function encodeOralWav(samples, sourceRate) {
  if (!(samples instanceof Float32Array) || !Number.isFinite(sourceRate) || sourceRate < 8000 || sourceRate > 192000 || !samples.length || samples.length > sourceRate * ORAL_CAPTURE_SECONDS) throw new Error('invalid_audio');
  const ratio = sourceRate / OUTPUT_RATE, count = Math.floor(samples.length / ratio);
  const buffer = new ArrayBuffer(44 + count * 2), view = new DataView(buffer);
  const text = (at, value) => { for (let i = 0; i < value.length; i++) view.setUint8(at + i, value.charCodeAt(i)); };
  text(0, 'RIFF'); view.setUint32(4, 36 + count * 2, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, OUTPUT_RATE, true); view.setUint32(28, OUTPUT_RATE * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, count * 2, true);
  for (let i = 0; i < count; i++) {
    const start = i * ratio; let value = 0;
    if (ratio >= 1) {
      const end = Math.min(samples.length, (i + 1) * ratio);
      for (let j = Math.floor(start); j < Math.ceil(end); j++) value += (samples[j] || 0) * (Math.min(end, j + 1) - Math.max(start, j));
      value /= end - start;
    } else {
      const low = Math.floor(start), fraction = start - low;
      value = samples[low] * (1 - fraction) + samples[Math.min(low + 1, samples.length - 1)] * fraction;
    }
    value = Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0;
    view.setInt16(44 + i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
  }
  return new Uint8Array(buffer);
}
function base64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return globalThis.btoa(binary);
}

/** One controller survives app renders. Mount destruction only detaches its UI.
 * Audio, requests and the adult attestation are held in memory, never storage.
 */
export class OralCheck {
  constructor({onFeedback = () => {}, onBeforeCapture = () => {}, onListen = () => {}, onParent = () => {},
    fetcher = globalThis.fetch?.bind(globalThis), getUserMedia = globalThis.navigator?.mediaDevices?.getUserMedia?.bind(globalThis.navigator.mediaDevices),
    AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext, AudioWorkletNodeClass = globalThis.AudioWorkletNode,
    now = Date.now, setTimer = globalThis.setTimeout?.bind(globalThis), clearTimer = globalThis.clearTimeout?.bind(globalThis),
    documentRef = globalThis.document, windowRef = globalThis.window,
    permissionTimeoutMs = 12000, requestTimeoutMs = 30000, statusTimeoutMs = 10000} = {}) {
    Object.assign(this, {onFeedback, onBeforeCapture, onListen, onParent, fetcher, getUserMedia, AudioContextClass, AudioWorkletNodeClass, now, setTimer, clearTimer, documentRef, windowRef, permissionTimeoutMs, requestTimeoutMs, statusTimeoutMs});
    this.context = {profileId:'', stage:'', target:null};
    this.phase = 'idle'; this.message = ''; this.result = null; this.seconds = 0;
    this.adultChecked = false; this.adultConfirmedAt = 0; this.consentVersion = 0;
    this.status = {state:'unknown', available:false, authenticated:false, authConfigured:false, reason:'setup_required'};
    this.listeners = new Set(); this.attempt = null; this.statusRequest = null; this.destroyed = false;
    this.onVisibility = () => {
      if (this.documentRef?.hidden) this.reset();
      else if (this.listeners.size && this.status.state === 'unknown') void this.refreshStatus();
    };
    this.onPageHide = () => this.reset();
    documentRef?.addEventListener('visibilitychange', this.onVisibility);
    windowRef?.addEventListener('pagehide', this.onPageHide);
  }

  snapshot() {
    const authorized = this._authorized();
    return {phase:this.phase, message:this.message, result:this.result ? {...this.result} : null, seconds:this.seconds,
      context:{...this.context, target:this.context.target ? {...this.context.target} : null}, status:{...this.status},
      adultChecked:this.adultChecked, authorized, busy:BUSY.has(this.phase),
      canCapture:!!this.context.target && this._ready() && authorized && !BUSY.has(this.phase) && !this.destroyed,
      microphoneSupported:!!(this.getUserMedia && this.AudioContextClass)};
  }
  subscribe(listener) { this.listeners.add(listener); listener(this.snapshot()); return () => this.listeners.delete(listener); }
  _emit() { if (!this.destroyed) for (const listener of [...this.listeners]) listener(this.snapshot()); }
  _ready() { return this.status.state === 'ready' && this.status.available && this.status.authenticated && this.status.authConfigured; }
  _authorized() { const age = this.now() - this.adultConfirmedAt; return this.adultConfirmedAt > 0 && age >= 0 && age < ADULT_CONFIRMATION_MS; }
  _current(attempt) { return !this.destroyed && this.attempt === attempt; }
  _timer(item, callback, ms) {
    const id = this.setTimer(() => { if (!item.timers.has(id)) return; item.timers.delete(id); callback(); }, ms);
    item.timers.add(id); return id;
  }
  _clearTimers(item) { for (const timer of item?.timers || []) this.clearTimer(timer); item?.timers.clear(); }
  _releaseCapture(attempt) {
    if (!attempt) return;
    if (attempt.node) { attempt.node.onaudioprocess = null; if (attempt.node.port) { attempt.node.port.onmessage = null; try { attempt.node.port.close?.(); } catch {} } }
    disconnect(attempt.source); disconnect(attempt.node); disconnect(attempt.gain);
    stopTracks(attempt.stream); closeContext(attempt.audioContext);
    attempt.source = attempt.node = attempt.gain = attempt.stream = attempt.audioContext = null;
  }
  _cancelAttempt() {
    const attempt = this.attempt;
    this.attempt = null;
    if (!attempt) return;
    attempt.cancel(); attempt.abort.abort(); this._clearTimers(attempt); this._releaseCapture(attempt);
    attempt.parts = []; attempt.length = 0;
  }
  _cancelStatus() {
    const request = this.statusRequest; this.statusRequest = null;
    if (request) { request.cancel(); request.abort.abort(); this._clearTimers(request); }
  }
  _clearConsent() {
    this.consentVersion++; this.clearTimer(this.consentTimer); this.consentTimer = null;
    this.adultConfirmedAt = 0; this.adultChecked = false;
  }
  _expireConsent(version) {
    if (this.destroyed || version !== this.consentVersion || !this.adultConfirmedAt) return;
    const remaining = ADULT_CONFIRMATION_MS - (this.now() - this.adultConfirmedAt);
    if (remaining > 0 && remaining <= ADULT_CONFIRMATION_MS) {
      this.consentTimer = this.setTimer(() => this._expireConsent(version), remaining); return;
    }
    this._cancelAttempt(); this._clearConsent(); this.phase = 'idle'; this.result = null;
    this.message = 'La séance est terminée. L’adulte peut autoriser un nouvel essai.'; this._emit();
  }
  setContext({profileId = '', stage = '', target = null} = {}) {
    const resolved = ['p1', 'p2'].includes(profileId) && ['1re année', '3e année'].includes(stage) ? resolveOralTarget(target, profileId === 'p1' ? '1re année' : stage) : null;
    const next = {profileId, stage, target:resolved};
    if (contextKey(next) === contextKey(this.context)) return;
    const differentProfile = profileId !== this.context.profileId || stage !== this.context.stage;
    this._cancelAttempt(); this.phase = 'idle'; this.message = ''; this.result = null; this.seconds = 0;
    if (differentProfile) { this._clearConsent(); this._cancelStatus(); this.status = {state:'unknown', available:false, authenticated:false, authConfigured:false, reason:'setup_required'}; }
    this.context = next; this._emit();
  }
  stop() {
    const busy = BUSY.has(this.phase); this._cancelAttempt();
    if (busy) { this.phase = 'idle'; this.message = 'L’essai est arrêté. Tu peux recommencer quand tu veux.'; this.result = null; this.seconds = 0; this._emit(); }
  }
  reset() {
    this._cancelAttempt(); this._cancelStatus(); this._clearConsent();
    this.phase = 'idle'; this.message = ''; this.result = null; this.seconds = 0;
    this.status = {state:'unknown', available:false, authenticated:false, authConfigured:false, reason:'setup_required'}; this._emit();
  }
  destroy() {
    this.reset(); this.destroyed = true; this.listeners.clear();
    this.documentRef?.removeEventListener('visibilitychange', this.onVisibility);
    this.windowRef?.removeEventListener('pagehide', this.onPageHide);
  }
  setAdultChecked(checked) { this.adultChecked = checked === true; this._emit(); }
  confirmAdult() {
    if (this.destroyed || !this._ready() || !this.adultChecked || BUSY.has(this.phase)) return false;
    this._clearConsent(); this.adultChecked = true; this.adultConfirmedAt = Math.trunc(this.now());
    if (!this._authorized()) { this._clearConsent(); return false; }
    const version = this.consentVersion;
    this.consentTimer = this.setTimer(() => this._expireConsent(version), ADULT_CONFIRMATION_MS);
    this.message = 'L’adulte reste avec toi. Écoute le modèle, puis essaie à ton tour.'; this.result = null; this.phase = 'idle'; this._emit(); return true;
  }
  listen() { if (this.context.target && !this.destroyed) { this.stop(); this.onListen({...this.context.target}); } }
  parent() { if (!this.destroyed) { this.reset(); this.onParent(); } }

  async refreshStatus() {
    if (this.destroyed) return false;
    this._cancelStatus();
    const request = slot(); this.statusRequest = request;
    this.status = {...this.status, state:'checking', available:false}; this._emit();
    this._timer(request, () => { if (this.statusRequest === request) { request.cancel(); request.abort.abort(); } }, this.statusTimeoutMs);
    let outcome;
    try {
      outcome = await Promise.race([settled((async () => {
        const response = await this.fetcher('/api/voice/status', {method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:'{}', signal:request.abort.signal});
        if (!response.ok) throw new Error('status_unavailable');
        return response.json();
      })()), request.cancelled]);
    } catch { outcome = {error:true}; }
    if (this.destroyed || this.statusRequest !== request) return false;
    this.statusRequest = null; this._clearTimers(request);
    const body = outcome !== CANCELLED && !outcome.error ? outcome.value : null;
    const authenticated = body?.authenticated === true, authConfigured = body?.authConfigured === true;
    const ready = body?.oralCheckAvailable === true && authenticated && authConfigured && body?.oralCheckReason === 'ready';
    this.status = {state:body ? ready ? 'ready' : 'unavailable' : 'offline', available:ready, authenticated, authConfigured,
      reason:ready ? 'ready' : body?.oralCheckReason === 'parent_required' ? 'parent_required' : 'setup_required'};
    if (!ready) {
      this._cancelAttempt(); this._clearConsent();
      if (BUSY.has(this.phase)) { this.phase = 'idle'; this.message = 'Le retour vocal est indisponible. Tu peux continuer avec le modèle.'; this.result = null; }
    }
    this._emit(); return ready;
  }

  _fail(attempt, message) {
    if (!this._current(attempt)) return;
    this._cancelAttempt(); this.phase = 'error'; this.result = null; this.message = message; this._emit();
  }
  _checkConsent(attempt) {
    if (this._authorized()) return true;
    if (this._current(attempt)) { this._cancelAttempt(); this._clearConsent(); this.phase = 'idle'; this.result = null; this.message = 'La séance est terminée. L’adulte peut autoriser un nouvel essai.'; this._emit(); }
    return false;
  }
  _samples(attempt, input) {
    if (!this._current(attempt) || this.phase !== 'recording' || !this._checkConsent(attempt) || !input?.length) return;
    const remaining = attempt.maxSamples - attempt.length;
    const chunk = new Float32Array(input.subarray(0, Math.max(0, remaining)));
    if (chunk.length) { attempt.parts.push(chunk); attempt.length += chunk.length; }
    const seconds = Math.min(ORAL_CAPTURE_SECONDS, Math.floor(attempt.length / attempt.rate));
    if (seconds !== this.seconds) { this.seconds = seconds; this._emit(); }
    if (attempt.length >= attempt.maxSamples) void this.finish();
  }
  async _processor(attempt) {
    const context = attempt.audioContext;
    if (context.audioWorklet?.addModule && this.AudioWorkletNodeClass) {
      try {
        await context.audioWorklet.addModule(new URL('./oral-check.js', import.meta.url));
        if (!this._current(attempt)) return null;
        const node = new this.AudioWorkletNodeClass(context, WORKLET_NAME, {numberOfInputs:1, numberOfOutputs:1, outputChannelCount:[1], channelCount:1, channelCountMode:'explicit'});
        node.port.onmessage = event => this._samples(attempt, event.data);
        node.onprocessorerror = () => this._fail(attempt, 'Le microphone s’est interrompu. Tu peux réessayer avec l’adulte.');
        return node;
      } catch {
        if (!this._current(attempt)) return null;
        // Older Safari versions retain this bounded compatibility path.
      }
    }
    const node = context.createScriptProcessor(2048, 1, 1);
    node.onaudioprocess = event => { event.outputBuffer?.getChannelData?.(0)?.fill(0); this._samples(attempt, event.inputBuffer.getChannelData(0)); };
    return node;
  }
  async start() {
    if (this.destroyed || BUSY.has(this.phase) || !this.context.target || !this._ready()) return false;
    if (!this._authorized()) { this._clearConsent(); this.message = 'Un adulte doit autoriser cette séance avant d’ouvrir le micro.'; this._emit(); return false; }
    if (!this.getUserMedia || !this.AudioContextClass) { this.phase = 'error'; this.message = 'Le microphone n’est pas disponible ici. Tu peux écouter le modèle avec l’adulte.'; this._emit(); return false; }
    const attempt = slot(); this.attempt = attempt;
    Object.assign(attempt, {profileId:this.context.profileId, target:{...this.context.target}, adultConfirmedAt:this.adultConfirmedAt, parts:[], length:0});
    this.phase = 'starting'; this.result = null; this.seconds = 0; this.message = 'Le micro se prépare. Autorise-le si le navigateur le demande.'; this._emit();
    this._timer(attempt, () => this._fail(attempt, 'Le micro n’a pas pu démarrer. Tu peux réessayer avec l’adulte.'), this.permissionTimeoutMs);
    try {
      this.onBeforeCapture();
      if (!this._current(attempt)) return false;
      // Resume is invoked during the button gesture, before a permission await.
      try { attempt.audioContext = new this.AudioContextClass({sampleRate:OUTPUT_RATE}); }
      catch { attempt.audioContext = new this.AudioContextClass(); }
      const resume = settled(attempt.audioContext.resume());
      const permission = Promise.resolve(this.getUserMedia({audio:{channelCount:1, echoCancellation:true, noiseSuppression:true}, video:false})).then(stream => {
        if (!this._current(attempt)) { stopTracks(stream); return CANCELLED; }
        attempt.stream = stream; return stream;
      });
      const initialized = await Promise.race([settled((async () => {
        const stream = await permission, resumed = await resume;
        if (resumed.error) throw resumed.error;
        if (stream === CANCELLED || !this._current(attempt)) return CANCELLED;
        attempt.rate = attempt.audioContext.sampleRate;
        if (!Number.isFinite(attempt.rate) || attempt.rate < 8000 || attempt.rate > 192000) throw new Error('sample_rate');
        attempt.maxSamples = Math.floor(attempt.rate * ORAL_CAPTURE_SECONDS);
        attempt.node = await this._processor(attempt);
        if (!this._current(attempt)) { disconnect(attempt.node); return CANCELLED; }
        attempt.source = attempt.audioContext.createMediaStreamSource(stream);
        attempt.gain = attempt.audioContext.createGain(); attempt.gain.gain.value = 0;
        attempt.source.connect(attempt.node); attempt.node.connect(attempt.gain); attempt.gain.connect(attempt.audioContext.destination);
        return true;
      })()), attempt.cancelled]);
      if (!this._current(attempt) || initialized === CANCELLED || initialized.value === CANCELLED) return false;
      if (initialized.error) throw initialized.error;
      if (!this._checkConsent(attempt)) return false;
      this._clearTimers(attempt); this.phase = 'recording'; this.message = 'À toi! Dis le mot ou le nombre, puis touche « J’ai terminé ».'; this._emit();
      this._timer(attempt, () => { if (this._current(attempt) && this.phase === 'recording') void this.finish(); }, ORAL_CAPTURE_SECONDS * 1000);
      return true;
    } catch (error) {
      this._fail(attempt, error?.name === 'NotAllowedError' ? 'Le micro n’a pas été autorisé. Tu peux continuer avec le modèle.' : 'Le microphone est indisponible. Tu peux réessayer avec l’adulte.');
      return false;
    }
  }
  async finish() {
    const attempt = this.attempt;
    if (!attempt || this.phase !== 'recording' || !this._checkConsent(attempt)) return false;
    this.phase = 'sending'; this._clearTimers(attempt); this._releaseCapture(attempt);
    if (attempt.length < attempt.rate * 0.25) { this._fail(attempt, 'L’essai était trop court. Touche « À mon tour », puis prends le temps de parler.'); return false; }
    this.message = 'Le micro est fermé. Nous attendons le petit retour.'; this._emit();
    try {
      const samples = new Float32Array(attempt.length); let offset = 0;
      for (const part of attempt.parts) { samples.set(part, offset); offset += part.length; }
      attempt.parts = [];
      const audio = base64(encodeOralWav(samples, attempt.rate)); samples.fill(0);
      if (!this._current(attempt) || !this._checkConsent(attempt)) return false;
      this._timer(attempt, () => this._fail(attempt, 'Le retour prend trop de temps. Aucun nouvel essai n’a été envoyé. Tu peux réessayer avec l’adulte.'), this.requestTimeoutMs);
      const response = await Promise.race([settled((async () => {
        const reply = await this.fetcher('/api/voice/check', {method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, signal:attempt.abort.signal,
          body:JSON.stringify({profileId:attempt.profileId, target:targetDescriptor(attempt.target), audio, adultPresent:true, adultConfirmedAt:attempt.adultConfirmedAt})});
        return {ok:reply.ok, body:await reply.json()};
      })()), attempt.cancelled]);
      if (!this._current(attempt) || response === CANCELLED || !this._checkConsent(attempt)) return false;
      if (response.error) throw response.error;
      const {ok, body} = response.value;
      if (!ok) {
        if (body?.code === 'parent_login_required') { this._clearConsent(); this.status = {state:'unavailable', available:false, authenticated:false, authConfigured:true, reason:'parent_required'}; }
        if (body?.code === 'adult_presence_required') this._clearConsent();
        const message = body?.code === 'parent_login_required' ? 'L’adulte doit se reconnecter dans l’espace parent.' : body?.code === 'adult_presence_required' ? 'L’adulte doit autoriser une nouvelle séance.' : ['rate_limit', 'budget_unavailable'].includes(body?.code) ? 'Les petits retours sont en pause. Tu peux continuer avec le modèle.' : 'Le retour vocal est indisponible pour cet essai. Tu peux réessayer avec l’adulte.';
        this._fail(attempt, message); return false;
      }
      const key = body?.result;
      const aiValid = body?.ai === true || body?.ai === false && key === 'uncertain';
      if (!Object.hasOwn(ORAL_FEEDBACK, key) || body.feedbackKey !== key || body.feedback !== ORAL_FEEDBACK[key] || !aiValid || body.targetText !== undefined && body.targetText !== attempt.target.text) throw new Error('invalid_response');
      this._cancelAttempt(); this.phase = 'feedback'; this.message = ORAL_FEEDBACK[key]; this.result = {key, ai:body.ai}; this._emit();
      try { this.onFeedback(ORAL_FEEDBACK[key]); } catch {}
      return true;
    } catch {
      this._fail(attempt, 'Le retour n’est pas arrivé. Tu peux réessayer avec l’adulte ou écouter le modèle.'); return false;
    }
  }
}

export function oralCheckPanel() {
  return `<section id="oral-check-panel" class="oral-check" aria-labelledby="oral-check-title">
    <div class="oral-check-heading"><span aria-hidden="true">🎙️</span><div><h3 id="oral-check-title">À mon tour de parler</h3><p data-oral-target>Choisis un mot ou un nombre.</p></div></div>
    <p class="oral-check-access" data-oral-access role="status" aria-live="polite">Vérification du retour vocal…</p>
    <div class="oral-check-access-actions" data-oral-access-actions><button type="button" data-oral-action="parent">Espace parent</button><button type="button" data-oral-action="refresh">Vérifier à nouveau</button></div>
    <fieldset class="oral-check-consent" data-oral-consent hidden><legend>Avec un adulte présent</legend>
      <label><input type="checkbox" data-oral-adult> <span>Je suis un adulte présent et j’autorise l’envoi de la voix à OpenAI pour ces petits essais.</span></label>
      <p>Je reste avec l’enfant. Cette autorisation dure 15 minutes et se termine en quittant l’atelier ou en changeant de profil.</p>
      <button type="button" data-oral-action="authorize" disabled>Autoriser cette séance</button>
    </fieldset>
    <p class="oral-check-authorized" data-oral-authorized hidden>L’adulte reste avec toi. <button type="button" data-oral-action="reset">Terminer l’autorisation</button></p>
    <ol class="oral-check-steps" aria-label="Mon petit essai oral">
      <li><span aria-hidden="true">1</span><button type="button" data-oral-action="listen" disabled>Écouter le modèle</button></li>
      <li><span aria-hidden="true">2</span><button type="button" data-oral-action="start" disabled>À mon tour</button></li>
      <li><span aria-hidden="true">3</span><button type="button" data-oral-action="finish" disabled>J’ai terminé</button></li>
    </ol>
    <div class="oral-check-recording" data-oral-recording hidden><progress data-oral-progress max="8" value="0" aria-label="Temps de parole, huit secondes maximum"></progress><span data-oral-seconds>0 / 8 s</span></div>
    <p class="oral-check-message" data-oral-message role="status" aria-live="polite" aria-atomic="true"></p>
    <p class="oral-check-result-note" data-oral-result-note hidden></p>
    <button type="button" data-oral-action="stop" hidden>Annuler l’essai</button>
    <p class="oral-check-note">Un petit retour pour essayer ensemble, sans note de prononciation. Tes progrès ne changent pas automatiquement.</p>
  </section>`;
}

export function mountOralCheck(root, controller, context) {
  if (!root || !controller) return {destroy() {}};
  if (!root.querySelector('[data-oral-target]')) root.innerHTML = oralCheckPanel();
  controller.setContext(context);
  const node = name => root.querySelector(`[data-oral-${name}]`);
  const button = name => root.querySelector(`[data-oral-action="${name}"]`);
  const controls = Object.fromEntries(['parent', 'refresh', 'authorize', 'reset', 'listen', 'start', 'finish', 'stop'].map(name => [name, button(name)]));
  const elements = Object.fromEntries(['target', 'access', 'access-actions', 'consent', 'adult', 'authorized', 'recording', 'progress', 'seconds', 'message', 'result-note'].map(name => [name, node(name)]));
  let active = true;
  const paint = state => {
    if (!active) return;
    const ready = state.status.state === 'ready', target = state.context.target;
    elements.target.textContent = target ? `${target.kind === 'number' ? 'Le nombre' : 'Le mot'} : ${target.kind === 'number' ? target.value : target.text}` : 'Choisis un mot ou un nombre pour faire un essai.';
    elements.access.textContent = state.status.state === 'checking' ? 'Vérification du retour vocal…' : state.status.state === 'unknown' ? 'Le retour vocal doit être vérifié avant un nouvel essai.' : ready ? state.authorized ? 'Un adulte a confirmé sa présence pour les essais avec OpenAI.' : 'Le retour vocal est disponible. L’adulte peut autoriser la séance.' : state.status.state === 'offline' ? 'La connexion au retour vocal est indisponible. Tu peux écouter le modèle.' : state.status.reason === 'parent_required' ? 'L’adulte doit se connecter dans l’espace parent avant les essais.' : 'Le retour vocal avec OpenAI n’est pas activé. Tu peux écouter le modèle.';
    elements['access-actions'].hidden = ready;
    controls.refresh.disabled = state.status.state === 'checking';
    elements.consent.hidden = !ready || state.authorized;
    elements.adult.checked = state.adultChecked; elements.adult.disabled = state.busy;
    controls.authorize.disabled = !state.adultChecked || state.busy;
    elements.authorized.hidden = !state.authorized;
    controls.listen.disabled = !target;
    controls.start.disabled = !state.canCapture || !state.microphoneSupported;
    controls.finish.disabled = state.phase !== 'recording'; controls.stop.hidden = !state.busy;
    elements.recording.hidden = state.phase !== 'recording';
    elements.progress.value = state.seconds; elements.seconds.textContent = `${state.seconds} / ${ORAL_CAPTURE_SECONDS} s`;
    elements.message.textContent = state.message || (ready && !state.microphoneSupported ? 'Le microphone n’est pas disponible ici. Écoute le modèle avec l’adulte.' : 'Écoute, prends ton temps, puis essaie à ton tour.');
    elements['result-note'].hidden = !state.result;
    elements['result-note'].textContent = state.result ? state.result.ai ? 'Retour de reconnaissance avec OpenAI, à écouter avec l’adulte.' : 'Aucun son assez net n’a été détecté. Cet essai n’a pas été envoyé à OpenAI.' : '';
    root.setAttribute('data-oral-phase', state.phase);
  };
  const actions = {parent:() => controller.parent(), refresh:() => { void controller.refreshStatus(); }, authorize:() => controller.confirmAdult(), reset:() => { controller.reset(); void controller.refreshStatus(); }, listen:() => controller.listen(), start:() => { void controller.start(); }, finish:() => { void controller.finish(); }, stop:() => controller.stop()};
  for (const [name, handler] of Object.entries(actions)) controls[name].addEventListener('click', handler);
  const checked = () => controller.setAdultChecked(elements.adult.checked);
  elements.adult.addEventListener('change', checked);
  const unsubscribe = controller.subscribe(paint);
  if (controller.status.state === 'unknown' && !controller.documentRef?.hidden) void controller.refreshStatus();
  return {destroy() { if (!active) return; active = false; unsubscribe(); for (const [name, handler] of Object.entries(actions)) controls[name].removeEventListener('click', handler); elements.adult.removeEventListener('change', checked); }};
}

// The same self-hosted module is loaded in AudioWorkletGlobalScope. No Blob URL,
// external script, device state or UI is created there. The output stays silent.
if (typeof globalThis.registerProcessor === 'function' && typeof globalThis.AudioWorkletProcessor === 'function') {
  globalThis.registerProcessor(WORKLET_NAME, class extends globalThis.AudioWorkletProcessor {
    process(inputs) {
      const input = inputs[0]?.[0];
      if (input?.length) { const samples = new Float32Array(input); this.port.postMessage(samples, [samples.buffer]); }
      return true;
    }
  });
}
