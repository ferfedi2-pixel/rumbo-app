import type { Asset, Portfolio, RebalanceCalculation } from './types';

const cents = (amount: number) => Math.round(amount * 100);
const money = (amount: number) => Math.round(amount * 100) / 100;

export function validateWeights(assets: Asset[]): string | null {
  if (!assets.length) return 'Añade al menos un activo.';
  if (assets.some(a => !a.name.trim() || !Number.isFinite(a.targetWeight) || a.targetWeight < 0 || a.targetWeight > 100)) return 'Revisa los nombres y porcentajes.';
  const sum = assets.reduce((value, a) => value + a.targetWeight, 0);
  if (Math.abs(sum - 100) > 0.001) return `El reparto suma ${Math.round(sum * 10) / 10} %. Debe sumar 100 %.`;
  return null;
}

/** Reparte únicamente dinero nuevo. Minimiza la desviación cuadrática del saldo final
 *  frente a los importes objetivo mediante una proyección sobre el simplex.
 *  No recomienda ventas en este paso. Los céntimos se asignan por restos mayores.
 */
export function cashFlowAllocation(assets: Asset[], current: number[], amount: number): number[] {
  if (assets.length !== current.length || validateWeights(assets)) throw new Error('Cartera inválida.');
  if (!Number.isFinite(amount) || amount < 0 || current.some(v => !Number.isFinite(v) || v < 0)) throw new Error('Los importes deben ser positivos.');
  const available = cents(amount);
  if (!available) return assets.map(() => 0);
  const total = current.reduce((sum, value) => sum + value, 0) + available / 100;
  const gaps = assets.map((asset, index) => total * asset.targetWeight / 100 - current[index]);
  let low = Math.min(...gaps) - amount;
  let high = Math.max(...gaps);
  for (let iteration = 0; iteration < 90; iteration++) {
    const level = (low + high) / 2;
    const sum = gaps.reduce((value, gap) => value + Math.max(0, gap - level), 0);
    if (sum > amount) low = level; else high = level;
  }
  const idealCents = gaps.map(gap => Math.max(0, gap - (low + high) / 2) * 100);
  const assigned = idealCents.map(Math.floor);
  let remainder = available - assigned.reduce((sum, value) => sum + value, 0);
  const order = idealCents.map((value, index) => ({ index, fraction: value - assigned[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let position = 0; remainder > 0; position = (position + 1) % order.length, remainder--) assigned[order[position].index]++;
  return assigned.map(value => value / 100);
}

export function calculateContribution(portfolio: Portfolio, amount: number): RebalanceCalculation {
  const { assets, holdings, bandRelative } = portfolio;
  const current = assets.map(asset => holdings.find(h => h.assetId === asset.id)?.value ?? 0);
  const currentTotal = current.reduce((sum, value) => sum + value, 0);
  const contributions = cashFlowAllocation(assets, current, amount);
  const totalAfter = money(currentTotal + money(amount));
  const allocations = assets.map((asset, index) => {
    const afterValue = money(current[index] + contributions[index]);
    const afterWeight = totalAfter ? afterValue / totalAfter * 100 : asset.targetWeight;
    const deviationPoints = afterWeight - asset.targetWeight;
    const outsideBand = totalAfter > 0 && Math.abs(deviationPoints) > asset.targetWeight * bandRelative;
    const upperBound = totalAfter * asset.targetWeight * (1 + bandRelative) / 100;
    return {
      assetId: asset.id, name: asset.name, currentValue: current[index],
      currentWeight: currentTotal ? current[index] / currentTotal * 100 : 0,
      targetWeight: asset.targetWeight, contribution: contributions[index], afterValue, afterWeight,
      deviationPoints, outsideBand, suggestedSale: outsideBand && deviationPoints > 0 ? money(Math.max(0, afterValue - upperBound)) : 0,
    };
  });
  return {
    amount: money(amount), currentTotal: money(currentTotal), totalAfter,
    allocations, maxDeviationPoints: Math.max(0, ...allocations.map(a => Math.abs(a.deviationPoints))),
    outsideBand: allocations.some(a => a.outsideBand),
    fullRebalance: allocations.map(a => ({ assetId: a.assetId, adjustment: money(totalAfter * a.targetWeight / 100 - a.afterValue) })),
  };
}
