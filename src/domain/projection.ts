import type { Portfolio } from './types';

export interface ProjectionPoint { year: number; paid: number; growth: number; total: number }

export function projectPortfolio(portfolio: Portfolio, initialValue: number, realTerms: boolean): ProjectionPoint[] {
  const annualNet = (1 + portfolio.expectedAnnualReturn / 100) * (1 - portfolio.annualFee / 100) - 1;
  const monthlyRate = Math.pow(1 + annualNet, 1 / 12) - 1;
  const monthly = portfolio.monthlyContribution;
  let balance = initialValue;
  const result: ProjectionPoint[] = [];
  for (let year = 0; year <= portfolio.years; year++) {
    if (year > 0) for (let month = 0; month < 12; month++) balance = balance * (1 + monthlyRate) + monthly;
    const factor = realTerms ? Math.pow(1 + portfolio.inflationRate / 100, year) : 1;
    const paid = (initialValue + monthly * year * 12) / factor;
    const total = balance / factor;
    result.push({ year, paid, growth: total - paid, total });
  }
  return result;
}
