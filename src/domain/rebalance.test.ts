import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cashFlowAllocation, calculateContribution, validateWeights } from './rebalance.ts';
import type { Asset, Portfolio } from './types.ts';

const assets: Asset[] = [
  { id: 'world', name: 'Global', category: 'Renta variable', targetWeight: 60, color: '#fff' },
  { id: 'bond', name: 'Bonos', category: 'Renta fija', targetWeight: 40, color: '#aaa' },
];

function portfolio(values: number[]): Portfolio {
  return { id: 'test', name: 'Test', templateId: 'custom', assets, holdings: values.map((value, i) => ({ assetId: assets[i].id, value })), monthlyContribution: 100, history: [], expectedAnnualReturn: 6, inflationRate: 2, annualFee: .2, years: 20, bandRelative: .05, updatedAt: null };
}

test('sin saldos reparte el dinero según el objetivo', () => {
  assert.deepEqual(cashFlowAllocation(assets, [0, 0], 1000), [600, 400]);
});
test('dirige el dinero al rezagado sin vender y conserva cada céntimo', () => {
  assert.deepEqual(cashFlowAllocation(assets, [700, 300], 100), [0, 100]);
  const result = calculateContribution(portfolio([700, 300]), 100);
  assert.equal(result.allocations.reduce((sum, line) => sum + line.contribution, 0), 100);
  assert.equal(result.allocations.every(line => line.contribution >= 0), true);
});
test('céntimos exactos con tres activos y objetivo de peso cero', () => {
  const data: Asset[] = [...assets.map(a => ({ ...a, targetWeight: a.targetWeight / 2 })), { id: 'old', name: 'Fuera del plan', category: 'Renta variable', targetWeight: 0, color: '#bbb' }, { id: 'em', name: 'Emergentes', category: 'Renta variable', targetWeight: 50, color: '#ccc' }];
  const allocation = cashFlowAllocation(data, [3123.12, 500.01, 120, 900], 1000.03);
  assert.equal(Math.round(allocation.reduce((sum, value) => sum + value, 0) * 100), 100003);
  assert.equal(allocation[2], 0);
});
test('rechaza pesos inválidos e importes negativos', () => {
  assert.match(validateWeights([{ ...assets[0], targetWeight: 75 }, assets[1]])!, /100/);
  assert.throws(() => cashFlowAllocation(assets, [100, 100], -1));
});
