import { initialPortfolio } from './models';
import type { Portfolio } from './types';

const KEY = 'rumbo_lovable_v1';

export function loadPortfolio(): Portfolio {
  try {
    const value = localStorage.getItem(KEY);
    if (!value) return initialPortfolio();
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return initialPortfolio();
    const data = parsed as Partial<Portfolio>;
    if (!Array.isArray(data.assets) || !Array.isArray(data.holdings) || !Array.isArray(data.history)) return initialPortfolio();
    return { ...initialPortfolio(), ...data };
  } catch { return initialPortfolio(); }
}

export function savePortfolio(portfolio: Portfolio): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(portfolio)); return true; }
  catch { return false; }
}
