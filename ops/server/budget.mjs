// All amounts are integer CAD microdollars, rounded upward. No floating balance.
export const CAP = 40_000_000;
export const PARENT_EMAIL = 'danielgiroux007@gmail.com';
const positive = n => Number.isSafeInteger(n) && n > 0;
export function quote(config, usdMicros) {
  if (!positive(usdMicros) || !positive(config?.fxPpm) || !positive(config?.bufferPpm) ||
      !positive(config?.feeMicros) || !config?.pricingReviewedAt ||
      !Number.isFinite(Date.parse(config.validUntil)) || Date.parse(config.validUntil) <= Date.now()) throw Error('pricing_fx_unavailable');
  const cost = (BigInt(usdMicros) * BigInt(config.fxPpm) * BigInt(1_000_000 + config.bufferPpm) + 999_999_999_999n) / 1_000_000_000_000n + BigInt(config.feeMicros);
  if (cost > BigInt(Number.MAX_SAFE_INTEGER)) throw Error('invalid_amount');
  return Number(cost);
}
// Store contract: transaction(family, UTC month, fn) must SERIALIZE across processes,
// commit state + reservations + alert outbox atomically, rollback on throw, and persist
// before returning. No in-memory production fallback. No automatic expiry/refund.
export class BudgetLedger {
  constructor(store) { this.store = store; }
  async reserve({family, month, id, amount, config}) {
    if (!this.store?.durable || !this.store?.transaction) throw Error('durable_storage_required');
    if (!family || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || !id || !positive(amount) || !positive(config?.otherCostsMicros) || config.otherCostsMicros >= CAP) throw Error('invalid_budget_config');
    return this.store.transaction(family, month, state => {
      if (!Number.isSafeInteger(state.committed) || state.committed < 0 || Object.values(state.reservations).some(r=>!positive(r.amount))) throw Error('corrupt_ledger');
      if (state.reservations[id]) throw Error('duplicate_reservation');
      const used = state.committed + Object.values(state.reservations).reduce((n,r)=>n+r.amount,0);
      if (!Number.isSafeInteger(used) || used < 0 || used + amount + config.otherCostsMicros > CAP) throw Error('budget_cap');
      state.reservations[id] = {amount};
      for (const threshold of [75,90]) {
        if ((used + amount + config.otherCostsMicros) * 100 >= CAP * threshold && !state.alerts.includes(threshold)) {
          state.alerts.push(threshold);
          state.outbox.push({key:`${family}:${month}:${threshold}`,to:PARENT_EMAIL,threshold,
            subject:`Budget lecture : seuil de ${threshold} %`,
            text:'La voix payante sera mise en pause au plafond de 40 $ CA pour le foyer. Pour demander une hausse, connectez-vous comme parent et confirmez explicitement un nouveau montant. Ce courriel ne donne aucune autorisation.'});
        }
      }
      return {id,amount};
    });
  }
  async settle({family,month,id,actual}) {
    if (!this.store?.durable || !positive(actual)) throw Error('invalid_settlement');
    return this.store.transaction(family,month,state=>{
      const held=state.reservations[id];
      if(!held || actual>held.amount) throw Error('unbounded_usage');
      state.committed+=actual; delete state.reservations[id];
    });
  }
}
