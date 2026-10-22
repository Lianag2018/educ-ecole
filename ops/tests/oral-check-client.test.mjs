import test from 'node:test';
import assert from 'node:assert/strict';
import {OralCheck, ORAL_CAPTURE_SECONDS, encodeOralWav, oralCheckPanel, mountOralCheck} from '../../src/oral-check.js';
import {ADULT_CONFIRMATION_MS, ORAL_FEEDBACK} from '../../src/oral-check-targets.js';
import {validateWav} from '../server/turn.mjs';

// Browser, microphone and HTTP doubles exercise cancellation and the real WAV
// encoding. These tests do not contact OpenAI or assess a child's pronunciation.
const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return {promise, resolve, reject}; }
const ready = {oralCheckAvailable:true, authenticated:true, authConfigured:true, oralCheckReason:'ready'};
const context = {profileId:'p2', stage:'3e année', target:{kind:'number', value:56}};
const json = (body, ok = true) => ({ok, json:async () => body});
const feedback = (key = 'recognized', extra = {}) => ({result:key, feedbackKey:key, feedback:ORAL_FEEDBACK[key], ai:true, targetText:'cinquante-six', ...extra});

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(name, handler) { if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name).add(handler); }
  removeEventListener(name, handler) { this.listeners.get(name)?.delete(handler); }
  emit(name) { for (const handler of [...(this.listeners.get(name) || [])]) handler({target:this, preventDefault() {}}); }
}
function harness(options = {}) {
  const timers = [], contexts = [], streams = [], requests = [], heard = [], listened = [], micCalls = [];
  const documentRef = new Events(), windowRef = new Events();
  let time = 1700000000000;
  class Node {
    connect(node) { this.connected = node; return node; }
    disconnect() { this.disconnected = true; }
  }
  class AudioContext {
    constructor() {
      this.sampleRate = options.rate || 44100; this.destination = new Node(); this.closed = false; contexts.push(this);
      if (options.worklet) this.audioWorklet = {addModule:url => { this.moduleUrl = String(url); return options.worklet.load?.promise || (options.worklet.failure ? Promise.reject(options.worklet.failure) : Promise.resolve()); }};
    }
    resume() { this.resumed = true; return options.resume?.promise || Promise.resolve(); }
    close() { this.closed = true; return Promise.resolve(); }
    createMediaStreamSource(stream) { this.source = new Node(); this.source.stream = stream; return this.source; }
    createGain() { this.gain = new Node(); this.gain.gain = {value:1}; return this.gain; }
    createScriptProcessor() { this.processor = new Node(); return this.processor; }
  }
  class AudioWorkletNode extends Node {
    constructor(audio, name, config) { super(); this.name = name; this.config = config; this.port = {closed:false, close() { this.closed = true; }}; audio.processor = this; }
  }
  function newStream() {
    const track = {stopped:false, stop() { this.stopped = true; }}, stream = {track, getTracks() { return [track]; }};
    streams.push(stream); return stream;
  }
  const check = new OralCheck({
    now:() => time, setTimer(fn, ms) { const timer = {fn, ms, cancelled:false}; timers.push(timer); return timer; }, clearTimer(timer) { if (timer) timer.cancelled = true; },
    getUserMedia(constraints) { micCalls.push(constraints); return options.permission?.promise || Promise.resolve(newStream()); },
    AudioContextClass:AudioContext, AudioWorkletNodeClass:options.worklet ? AudioWorkletNode : null, documentRef, windowRef,
    onFeedback:text => { heard.push(text); options.onFeedback?.(text); },
    onListen:target => listened.push(target), onBeforeCapture:() => options.onBeforeCapture?.(), onParent:() => options.onParent?.(),
    fetcher:async (url, init) => {
      requests.push({url, init});
      if (url.endsWith('/status')) return options.status ? options.status(url, init) : json(ready);
      return options.check ? options.check(url, init) : json(feedback());
    }, ...options.inject
  });
  const api = {check, timers, contexts, streams, requests, heard, listened, micCalls, documentRef, windowRef, newStream,
    setTime(value) { time = value; }, advance(ms) { time += ms; }, now:() => time,
    timer(ms) { return timers.findLast(timer => timer.ms === ms && !timer.cancelled); },
    async authorize(nextContext = context) { check.setContext(nextContext); await check.refreshStatus(); check.setAdultChecked(true); assert.equal(check.confirmAdult(), true); },
    feed(seconds = .5, amplitude = .2) {
      const audio = contexts.at(-1), samples = new Float32Array(Math.floor(audio.sampleRate * seconds));
      for (let i = 0; i < samples.length; i++) samples[i] = amplitude * Math.sin(2 * Math.PI * 440 * i / audio.sampleRate);
      if (audio.processor.port) audio.processor.port.onmessage({data:samples});
      else audio.processor.onaudioprocess({inputBuffer:{getChannelData:() => samples}, outputBuffer:{getChannelData:() => new Float32Array(samples.length)}});
      return samples;
    },
    checks:() => requests.filter(request => request.url.endsWith('/check'))
  };
  return api;
}

test('real status and an explicit adult confirmation gate all microphone and provider access', async () => {
  for (const status of [
    {available:true, authenticated:true, authConfigured:true},
    {...ready, oralCheckAvailable:false, oralCheckReason:'setup_required'},
    {...ready, authenticated:false, oralCheckReason:'parent_required'},
    {...ready, authConfigured:false},
    {...ready, oralCheckReason:'setup_required'}
  ]) {
    const h = harness({status:() => json(status)}); h.check.setContext(context); await h.check.refreshStatus();
    h.check.setAdultChecked(true); assert.equal(h.check.confirmAdult(), false); assert.equal(await h.check.start(), false);
    assert.equal(h.micCalls.length, 0); assert.equal(h.checks().length, 0); h.check.destroy();
  }
  const h = harness(); h.check.setContext(context); await h.check.refreshStatus(); h.check.setAdultChecked(true);
  assert.equal(await h.check.start(), false); assert.equal(h.micCalls.length, 0);
  h.check.setAdultChecked(true); assert.equal(h.check.confirmAdult(), true); assert.equal(await h.check.start(), true);
  assert.equal(h.micCalls.length, 1); assert.equal(h.micCalls[0].video, false); h.check.destroy();
});

test('a status response arriving after reset or logout cannot restore authentication', async () => {
  const status = deferred(), h = harness({status:() => status.promise}); h.check.setContext(context);
  const pending = h.check.refreshStatus(), request = h.requests[0]; h.check.reset();
  assert.equal(await pending, false); assert.equal(request.init.signal.aborted, true);
  status.resolve(json(ready)); await flush();
  assert.equal(h.check.snapshot().status.available, false); assert.equal(h.check.snapshot().authorized, false); h.check.destroy();
});

test('status timeout fails closed and network failure stays honest without an AI result', async () => {
  const status = deferred(), h = harness({status:() => status.promise}); h.check.setContext(context);
  const pending = h.check.refreshStatus(); h.timer(10000).fn(); assert.equal(await pending, false);
  assert.equal(h.check.snapshot().status.state, 'offline'); assert.equal(h.heard.length, 0);
  status.resolve(json(ready)); await flush(); assert.equal(h.check.snapshot().status.available, false); h.check.destroy();
  const failed = harness({status:() => Promise.reject(new Error('offline'))}); failed.check.setContext(context);
  assert.equal(await failed.check.refreshStatus(), false); assert.equal(await failed.check.start(), false); assert.equal(failed.micCalls.length, 0); failed.check.destroy();
});

test('late microphone permission after cancellation closes its tracks and never revives a trial', async () => {
  const permission = deferred(), h = harness({permission}); await h.authorize();
  const pending = h.check.start(); assert.equal(h.contexts[0].resumed, true); h.check.stop();
  assert.equal(await pending, false); assert.equal(h.contexts[0].closed, true);
  const stream = h.newStream(); permission.resolve(stream); await flush();
  assert.equal(stream.track.stopped, true); assert.equal(h.check.phase, 'idle'); assert.equal(h.checks().length, 0); assert.equal(h.check.snapshot().authorized, true); h.check.destroy();
});

test('an ignored permission prompt has a bounded wait and a later grant is closed', async () => {
  const permission = deferred(), h = harness({permission}); await h.authorize(); const pending = h.check.start();
  h.timer(12000).fn(); assert.equal(await pending, false); assert.equal(h.check.phase, 'error');
  assert.match(h.check.message, /micro n’a pas pu démarrer/);
  const stream = h.newStream(); permission.resolve(stream); await flush();
  assert.equal(stream.track.stopped, true); assert.equal(h.checks().length, 0); h.check.destroy();
});

test('a late AudioContext resume after stop cannot connect the microphone', async () => {
  const resume = deferred(), h = harness({resume}); await h.authorize(); const pending = h.check.start(); await flush();
  h.check.stop(); assert.equal(await pending, false); resume.resolve(); await flush();
  assert.equal(h.streams[0].track.stopped, true); assert.equal(h.contexts[0].source, undefined); h.check.destroy();
});

test('a cancelled permission timer cannot stop a recording that has already started', async () => {
  const h = harness(); await h.authorize(); const pending = h.check.start(), permissionTimer = h.timer(12000);
  assert.equal(await pending, true); assert.equal(permissionTimer.cancelled, true); permissionTimer.fn();
  assert.equal(h.check.phase, 'recording'); assert.equal(h.streams[0].track.stopped, false); h.check.destroy();
});

test('the modern worklet path records silently, and module failure has a bounded Safari fallback', async () => {
  for (const worklet of [{}, {failure:new Error('old Safari module support')}]) {
    const h = harness({worklet}); await h.authorize(); assert.equal(await h.check.start(), true);
    const audio = h.contexts[0]; assert.match(audio.moduleUrl, /\/src\/oral-check\.js$/); assert.equal(audio.gain.gain.value, 0);
    if (!worklet.failure) { assert.equal(audio.processor.name, 'atelier-oral-capture-v1'); assert.equal(audio.processor.config.channelCount, 1); }
    h.feed(); assert.equal(await h.check.finish(), true); assert.equal(h.checks().length, 1); assert.equal(audio.closed, true);
    if (!worklet.failure) assert.equal(audio.processor.port.closed, true); h.check.destroy();
  }
});

test('a worklet module loaded after cancellation cannot reconnect a closed microphone', async () => {
  const load = deferred(), h = harness({worklet:{load}}); await h.authorize(); const pending = h.check.start(); await flush();
  assert.ok(h.contexts[0].moduleUrl); h.check.stop(); assert.equal(await pending, false); load.resolve(); await flush();
  assert.equal(h.contexts[0].source, undefined); assert.equal(h.streams[0].track.stopped, true); assert.equal(h.checks().length, 0); h.check.destroy();
});

test('an older permission grant closes only its own tracks while a newer trial continues', async () => {
  const permission = deferred(), h = harness(); await h.authorize(); let call = 0;
  h.check.getUserMedia = () => ++call === 1 ? permission.promise : Promise.resolve(h.newStream());
  const old = h.check.start(); h.check.stop(); assert.equal(await old, false); assert.equal(await h.check.start(), true);
  const currentStream = h.streams[0], oldStream = h.newStream(); permission.resolve(oldStream); await flush();
  assert.equal(oldStream.track.stopped, true); assert.equal(currentStream.track.stopped, false); assert.equal(h.check.phase, 'recording');
  h.check.destroy(); assert.equal(currentStream.track.stopped, true);
});

test('permission refusal and absent microphone support never send a provider request', async () => {
  const permission = deferred(), h = harness({permission}); await h.authorize(); const pending = h.check.start();
  permission.reject(Object.assign(new Error('denied'), {name:'NotAllowedError'})); assert.equal(await pending, false);
  assert.match(h.check.message, /pas été autorisé/); assert.equal(h.contexts[0].closed, true); assert.equal(h.checks().length, 0); h.check.destroy();
  const unsupported = harness({inject:{AudioContextClass:null}}); await unsupported.authorize();
  assert.equal(await unsupported.check.start(), false); assert.equal(unsupported.micCalls.length, 0); unsupported.check.destroy();
});

test('44.1 kHz capture sends a valid 24 kHz mono WAV and closes the mic before the request', async () => {
  let h;
  h = harness({rate:44100, check:(_url, init) => {
    assert.equal(h.streams[0].track.stopped, true); assert.equal(h.contexts[0].closed, true);
    const payload = JSON.parse(init.body), wav = validateWav(payload.audio);
    assert.deepEqual(Object.keys(payload).sort(), ['adultConfirmedAt', 'adultPresent', 'audio', 'profileId', 'target']);
    assert.deepEqual(payload.target, {kind:'number', value:56}); assert.equal(payload.profileId, 'p2');
    assert.equal(payload.adultPresent, true); assert.equal(payload.adultConfirmedAt, h.now());
    assert.equal(wav.readUInt32LE(24), 24000); assert.equal(wav.readUInt16LE(22), 1); assert.equal(wav.readUInt16LE(34), 16);
    assert.equal(wav.length, 44 + 24000); assert.equal(init.credentials, 'same-origin');
    return json(feedback());
  }});
  await h.authorize(); await h.check.start(); h.feed(.5); assert.equal(await h.check.finish(), true);
  assert.deepEqual(h.heard, [ORAL_FEEDBACK.recognized]); assert.equal(h.check.phase, 'feedback'); h.check.destroy();
});

test('WAV resampling preserves duration and amplitude at common device rates, with PCM clipping', () => {
  for (const rate of [16000, 24000, 44100, 48000, 96000]) {
    const input = new Float32Array(rate / 2).fill(.25), wav = Buffer.from(encodeOralWav(input, rate));
    assert.equal(wav.length, 24044); assert.equal(wav.readInt16LE(44), 8192); assert.equal(wav.readInt16LE(wav.length - 2), 8192);
    assert.equal(validateWav(wav.toString('base64')).length, wav.length);
  }
  const wav = Buffer.from(encodeOralWav(new Float32Array([2, -2, NaN]), 24000));
  assert.equal(wav.readInt16LE(44), 32767); assert.equal(wav.readInt16LE(46), -32768); assert.equal(wav.readInt16LE(48), 0);
  assert.throws(() => encodeOralWav(new Float32Array(24000 * 9), 24000));
});

test('eight-second sample cap and wall timer can only submit one bounded recording', async () => {
  const pending = deferred(), h = harness({check:() => pending.promise}); await h.authorize(); await h.check.start();
  const timer = h.timer(8000); h.feed(10); assert.equal(h.check.phase, 'sending'); assert.equal(h.streams[0].track.stopped, true);
  timer.fn(); assert.equal(await h.check.finish(), false); await flush(); assert.equal(h.checks().length, 1);
  const payload = JSON.parse(h.checks()[0].init.body), wav = validateWav(payload.audio);
  assert.equal((wav.length - 44) / 48000, ORAL_CAPTURE_SECONDS);
  pending.resolve(json(feedback())); await flush(); assert.equal(h.heard.length, 1); h.check.destroy();
});

test('the wall timer ends a short recording even when the audio callback stops arriving', async () => {
  const h = harness(); await h.authorize(); await h.check.start(); h.feed(.5); h.timer(8000).fn(); await flush();
  assert.equal(h.streams[0].track.stopped, true); assert.equal(h.checks().length, 1); assert.equal(h.check.phase, 'feedback'); h.check.destroy();
});

test('empty and too short trials close the microphone without a network request or fake feedback', async () => {
  for (const duration of [0, .1]) {
    const h = harness(); await h.authorize(); await h.check.start(); if (duration) h.feed(duration);
    assert.equal(await h.check.finish(), false); assert.equal(h.streams[0].track.stopped, true); assert.equal(h.checks().length, 0);
    assert.equal(h.heard.length, 0); assert.equal(h.check.result, null); assert.match(h.check.message, /trop court/); h.check.destroy();
  }
});

test('target changes cancel active audio and keep consent; invalid targets never reuse the old number', async () => {
  const h = harness(); await h.authorize(); await h.check.start();
  const callback = h.contexts[0].processor.onaudioprocess;
  h.check.setContext({...context, target:{kind:'number', value:1999}});
  assert.equal(h.streams[0].track.stopped, true); assert.equal(h.check.snapshot().authorized, true); assert.equal(h.check.context.target.value, 1999);
  callback({inputBuffer:{getChannelData:() => new Float32Array(44100)}, outputBuffer:{getChannelData:() => new Float32Array(1)}});
  assert.equal(h.checks().length, 0); h.check.setContext({...context, target:null}); assert.equal(await h.check.start(), false); assert.equal(h.check.context.target, null);
  for (const target of [{kind:'number', value:56, text:'fake'}, {kind:'number', value:-1}, {kind:'number', value:2000}, {kind:'word', activityId:'private-word'}]) {
    h.check.setContext({...context, target}); assert.equal(h.check.context.target, null); assert.equal(await h.check.start(), false);
  }
  h.check.setContext({...context, profileId:'p1', target:{kind:'number', value:1999}});
  assert.equal(h.check.context.target, null); assert.equal(h.check.snapshot().authorized, false); h.check.destroy();
});

test('authored word targets send their activity id only and respect the child’s school stage', async () => {
  for (const [activityId, text] of [['g3-sy1', 'animation'], ['g3-sy2', 'invitation']]) {
    const h = harness({check:() => json(feedback('recognized', {targetText:text}))});
    await h.authorize({...context, target:{kind:'word', activityId}}); h.check.listen();
    assert.deepEqual(h.listened, [{kind:'word', activityId, text}]);
    await h.check.start(); h.feed(); assert.equal(await h.check.finish(), true);
    const payload = JSON.parse(h.checks()[0].init.body); assert.deepEqual(payload.target, {kind:'word', activityId});
    assert.ok(!Object.hasOwn(payload, 'text')); assert.ok(!Object.hasOwn(payload.target, 'text'));
    h.check.setContext({profileId:'p1', stage:'3e année', target:{kind:'word', activityId}}); assert.equal(h.check.context.target, null);
    h.check.setContext({profileId:'p2', stage:'inconnue', target:{kind:'word', activityId}}); assert.equal(h.check.context.target, null); h.check.destroy();
  }
});

test('profile changes clear consent and invalidate in-flight recognition results', async () => {
  const reply = deferred(), h = harness({check:() => reply.promise}); await h.authorize(); await h.check.start(); h.feed(); const pending = h.check.finish();
  h.check.setContext({profileId:'p1', stage:'1re année', target:{kind:'number', value:20}});
  assert.equal(await pending, false); assert.equal(h.checks()[0].init.signal.aborted, true);
  reply.resolve(json(feedback())); await flush(); assert.equal(h.heard.length, 0); assert.equal(h.check.result, null); assert.equal(h.check.snapshot().authorized, false); h.check.destroy();
});

test('consent expiry closes an active mic, and a delayed timer cannot extend an authorization', async () => {
  const h = harness(); await h.authorize(); const expiry = h.timer(ADULT_CONFIRMATION_MS); await h.check.start();
  h.advance(ADULT_CONFIRMATION_MS); expiry.fn(); assert.equal(h.streams[0].track.stopped, true); assert.equal(h.check.snapshot().authorized, false);
  assert.equal(h.checks().length, 0); assert.match(h.check.message, /séance est terminée/);
  h.check.setAdultChecked(true); h.check.confirmAdult(); await h.check.start(); h.feed();
  h.advance(ADULT_CONFIRMATION_MS); assert.equal(await h.check.finish(), false); assert.equal(h.checks().length, 0); assert.equal(h.streams[1].track.stopped, true); h.check.destroy();
});

test('expired consent aborts pending recognition and stale expiry callbacks cannot revoke a later session', async () => {
  const reply = deferred(), h = harness({check:() => reply.promise}); await h.authorize(); const expiry = h.timer(ADULT_CONFIRMATION_MS);
  await h.check.start(); h.feed(); const pending = h.check.finish(); h.advance(ADULT_CONFIRMATION_MS); expiry.fn();
  assert.equal(await pending, false); assert.equal(h.checks()[0].init.signal.aborted, true);
  reply.resolve(json(feedback())); await flush(); assert.equal(h.heard.length, 0);
  h.check.setAdultChecked(true); h.check.confirmAdult(); expiry.fn(); assert.equal(h.check.snapshot().authorized, true); h.check.destroy();
});

test('interruption and request timeout never retry automatically or accept a late response', async () => {
  for (const mode of ['stop', 'timeout']) {
    const reply = deferred(), h = harness({check:() => reply.promise}); await h.authorize(); await h.check.start(); h.feed(); const pending = h.check.finish();
    if (mode === 'stop') h.check.stop(); else h.timer(30000).fn();
    assert.equal(await pending, false); assert.equal(h.checks()[0].init.signal.aborted, true);
    reply.resolve(json(feedback())); await flush(); assert.equal(h.heard.length, 0); assert.equal(h.checks().length, 1); assert.equal(h.check.result, null); h.check.destroy();
  }
});

test('network errors and malformed responses have no AI success or fabricated recognition', async () => {
  const responses = [
    () => Promise.reject(new Error('offline')),
    () => json(feedback('recognized', {ai:false})),
    () => json(feedback('recognized', {feedback:'Invented encouragement'})),
    () => json(feedback('recognized', {feedbackKey:'retry'})),
    () => json(feedback('recognized', {targetText:'soixante-cinq'})),
    () => json({text:'a transcript', score:100}),
    () => json({code:'oral_check_unavailable'}, false)
  ];
  for (const response of responses) {
    const h = harness({check:response}); await h.authorize(); await h.check.start(); h.feed(); assert.equal(await h.check.finish(), false);
    assert.equal(h.heard.length, 0); assert.equal(h.check.result, null); assert.equal(h.check.phase, 'error'); assert.equal(h.checks().length, 1); h.check.destroy();
  }
});

test('server authentication expiry requires a fresh parent login and adult authorization', async () => {
  const h = harness({check:() => json({code:'parent_login_required'}, false)}); await h.authorize(); await h.check.start(); h.feed();
  assert.equal(await h.check.finish(), false); assert.equal(h.check.snapshot().authorized, false); assert.equal(h.check.status.reason, 'parent_required');
  assert.equal(await h.check.start(), false); assert.equal(h.micCalls.length, 1); assert.equal(h.heard.length, 0); h.check.destroy();
});

test('fixed feedback alone is exposed; no transcript, score, advance or profile mutation is produced', async () => {
  for (const key of Object.keys(ORAL_FEEDBACK)) {
    const profile = Object.freeze({id:'p2', stage:'3e année', records:Object.freeze({}), points:3});
    const h = harness({check:() => json(feedback(key, {transcript:'private discarded text', score:100}))});
    await h.authorize({profileId:profile.id, stage:profile.stage, target:context.target}); await h.check.start(); h.feed(); assert.equal(await h.check.finish(), true);
    assert.deepEqual(h.heard, [ORAL_FEEDBACK[key]]); assert.deepEqual(h.check.snapshot().result, {key, ai:true});
    assert.ok(!JSON.stringify(h.check.snapshot()).includes('private discarded')); assert.equal(profile.points, 3); assert.deepEqual(profile.records, {});
    assert.equal(h.micCalls.length, 1); assert.equal(h.checks().length, 1); assert.equal(h.check.context.target.value, 56); h.check.destroy();
  }
});

test('near-silence response is honest about not calling OpenAI and keeps the fixed uncertain feedback', async () => {
  const h = harness({check:() => json(feedback('uncertain', {ai:false}))}); await h.authorize(); await h.check.start(); h.feed(.5, 0);
  assert.equal(await h.check.finish(), true); assert.deepEqual(h.check.result, {key:'uncertain', ai:false});
  assert.deepEqual(h.heard, [ORAL_FEEDBACK.uncertain]); h.check.destroy();
});

test('backgrounding and pagehide clear authorization and stop all microphone tracks', async () => {
  for (const action of ['visibility', 'pagehide']) {
    const h = harness(); await h.authorize(); await h.check.start();
    if (action === 'visibility') { h.documentRef.hidden = true; h.documentRef.emit('visibilitychange'); } else h.windowRef.emit('pagehide');
    assert.equal(h.streams[0].track.stopped, true); assert.equal(h.check.snapshot().authorized, false); assert.equal(h.check.status.available, false); h.check.destroy();
    assert.equal(h.documentRef.listeners.get('visibilitychange').size, 0); assert.equal(h.windowRef.listeners.get('pagehide').size, 0);
  }
});

class Element extends Events {
  constructor() { super(); this.textContent = ''; this.hidden = false; this.disabled = false; this.checked = false; this.value = 0; this.attributes = {}; }
  setAttribute(name, value) { this.attributes[name] = value; }
}
class Host extends Element {
  constructor() { super(); this.nodes = new Map(); this.writes = 0; this.innerHTML = oralCheckPanel(); }
  set innerHTML(html) {
    this.writes++; this.html = html; this.nodes.clear();
    for (const match of html.matchAll(/data-oral-([a-z-]+)(?:="([^"]*)")?/g)) {
      const selector = match[1] === 'action' ? `[data-oral-action="${match[2]}"]` : `[data-oral-${match[1]}]`;
      this.nodes.set(selector, new Element());
    }
  }
  querySelector(selector) { return this.nodes.get(selector) || null; }
}

test('mount destruction and same-context rerender preserve recording and stable buttons', async () => {
  const h = harness(); await h.authorize(); const first = new Host(); let mounted = mountOralCheck(first, h.check, context);
  h.check.onBeforeCapture = () => { mounted.destroy(); const next = new Host(); mounted = mountOralCheck(next, h.check, {...context, target:{...context.target}}); };
  assert.equal(await h.check.start(), true); assert.equal(h.check.phase, 'recording');
  const second = new Host(); mounted.destroy(); mounted = mountOralCheck(second, h.check, context);
  const finish = second.querySelector('[data-oral-action="finish"]'), writes = second.writes;
  assert.equal(finish.disabled, false); h.feed(1); assert.equal(second.writes, writes); assert.equal(second.querySelector('[data-oral-action="finish"]'), finish);
  assert.equal(second.querySelector('[data-oral-seconds]').textContent, '1 / 8 s'); assert.equal(h.check.snapshot().authorized, true);
  h.check.onFeedback = () => { mounted.destroy(); mounted = mountOralCheck(new Host(), h.check, context); };
  assert.equal(await h.check.finish(), true); assert.equal(h.check.phase, 'feedback'); assert.equal(h.check.result.key, 'recognized');
  mounted.destroy(); assert.equal(h.check.snapshot().authorized, true); h.check.destroy();
});

test('the three-step UI uses explicit adult consent, safe target text, and no root action collisions', async () => {
  const markup = oralCheckPanel();
  for (const label of ['Écouter le modèle', 'À mon tour', 'J’ai terminé', 'Autoriser cette séance', 'OpenAI', '15 minutes', 'sans note de prononciation']) assert.ok(markup.includes(label));
  assert.ok(!markup.includes('data-action=')); assert.match(markup, /type="checkbox" data-oral-adult/); assert.match(markup, /aria-live="polite"/);
  const h = harness(), host = new Host(), mounted = mountOralCheck(host, h.check, context); await flush();
  assert.equal(host.querySelector('[data-oral-target]').textContent, 'Le nombre : 56');
  assert.equal(host.querySelector('[data-oral-action="start"]').disabled, true);
  const checkbox = host.querySelector('[data-oral-adult]'); checkbox.checked = true; checkbox.emit('change');
  assert.equal(host.querySelector('[data-oral-action="authorize"]').disabled, false); assert.equal(host.querySelector('[data-oral-action="start"]').disabled, true);
  host.querySelector('[data-oral-action="authorize"]').emit('click'); assert.equal(host.querySelector('[data-oral-action="start"]').disabled, false);
  host.querySelector('[data-oral-action="listen"]').emit('click'); assert.deepEqual(h.listened, [{kind:'number', value:56, text:'cinquante-six'}]);
  h.check.setContext({...context, target:{kind:'word', activityId:'<img src=x onerror=bad()>'}});
  assert.equal(host.querySelector('[data-oral-action="start"]').disabled, true); assert.equal(host.querySelector('[data-oral-target]').textContent, 'Choisis un mot ou un nombre pour faire un essai.');
  mounted.destroy(); const prior = h.check.adultChecked; checkbox.checked = !prior; checkbox.emit('change'); assert.equal(h.check.adultChecked, prior); h.check.destroy();
});

test('the UI distinguishes an unavailable service and silence handled without an AI request', async () => {
  const unavailable = harness({status:() => json({...ready, oralCheckAvailable:false, oralCheckReason:'setup_required'})});
  const host = new Host(), mounted = mountOralCheck(host, unavailable.check, context); await flush();
  assert.match(host.querySelector('[data-oral-access]').textContent, /n’est pas activé/); assert.equal(host.querySelector('[data-oral-consent]').hidden, true);
  assert.equal(host.querySelector('[data-oral-action="listen"]').disabled, false); mounted.destroy(); unavailable.check.destroy();
  const h = harness({check:() => json(feedback('uncertain', {ai:false}))}); await h.authorize(); const resultHost = new Host(), resultMount = mountOralCheck(resultHost, h.check, context);
  await h.check.start(); h.feed(); await h.check.finish();
  assert.match(resultHost.querySelector('[data-oral-result-note]').textContent, /n’a pas été envoyé à OpenAI/); resultMount.destroy(); h.check.destroy();
});

test('adult presence is never claimed before confirmation, and ending authorization refreshes access', async () => {
  const h = harness(), host = new Host(), mounted = mountOralCheck(host, h.check, context); await flush();
  assert.equal(host.querySelector('[data-oral-access]').textContent, 'Le retour vocal est disponible. L’adulte peut autoriser la séance.');
  h.check.setAdultChecked(true); h.check.confirmAdult(); assert.match(host.querySelector('[data-oral-access]').textContent, /a confirmé sa présence/);
  const requests = h.requests.length; host.querySelector('[data-oral-action="reset"]').emit('click'); await flush();
  assert.equal(h.requests.length, requests + 1); assert.equal(h.check.snapshot().authorized, false); assert.equal(h.check.status.state, 'ready');
  assert.equal(host.querySelector('[data-oral-consent]').hidden, false); mounted.destroy(); h.check.destroy();
});

test('returning to a mounted visible panel rechecks access without renewing adult consent', async () => {
  const h = harness(), first = new Host(); let mounted = mountOralCheck(first, h.check, context); await flush();
  h.check.setAdultChecked(true); h.check.confirmAdult(); h.documentRef.hidden = true; h.documentRef.emit('visibilitychange');
  const requests = h.requests.length; mounted.destroy(); mounted = mountOralCheck(new Host(), h.check, context); await flush();
  assert.equal(h.requests.length, requests); assert.equal(h.check.status.state, 'unknown');
  h.documentRef.hidden = false; h.documentRef.emit('visibilitychange'); await flush();
  assert.equal(h.requests.length, requests + 1); assert.equal(h.check.status.state, 'ready'); assert.equal(h.check.snapshot().authorized, false);
  mounted.destroy(); h.documentRef.hidden = true; h.documentRef.emit('visibilitychange'); h.documentRef.hidden = false; h.documentRef.emit('visibilitychange'); await flush();
  assert.equal(h.requests.length, requests + 1); h.check.destroy();
});
