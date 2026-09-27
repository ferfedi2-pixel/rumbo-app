import type { Asset, AssetCategory, Portfolio } from './types';

type CatalogAsset = Omit<Asset, 'targetWeight'>;
export const catalog: CatalogAsset[] = [
  { id: 'world', name: 'Renta variable global', category: 'Renta variable', color: '#92A7D0' },
  { id: 'em', name: 'Mercados emergentes', category: 'Renta variable', color: '#67B6B0' },
  { id: 'bonds', name: 'Bonos globales', category: 'Renta fija', color: '#D0BD9D' },
  { id: 'longbonds', name: 'Bonos de largo plazo', category: 'Renta fija', color: '#A8B5C0' },
  { id: 'btc', name: 'Bitcoin', category: 'Criptomonedas', color: '#DDBF87' },
  { id: 'eth', name: 'Ethereum', category: 'Criptomonedas', color: '#B1A3CA' },
  { id: 'gold', name: 'Oro', category: 'Oro', color: '#DCBC71' },
  { id: 'cash', name: 'Efectivo', category: 'Efectivo', color: '#9BB9A9' },
  { id: 'commodities', name: 'Materias primas', category: 'Materias primas', color: '#B99589' },
];

export interface PortfolioTemplate {
  id: string;
  name: string;
  note: string;
  group: 'RUMBO' | 'Otras ideas';
  weights: Record<string, number>;
  suggestedReturn: number;
}

export const templates: PortfolioTemplate[] = [
  { id: 'refugio', name: 'Refugio', group: 'RUMBO', note: 'Más peso defensivo.', weights: { world: 52.89, em: 7.11, bonds: 40 }, suggestedReturn: 5 },
  { id: 'travesia', name: 'Travesía', group: 'RUMBO', note: 'Equilibrio entre bolsa y defensivos.', weights: { world: 57.2975, em: 7.7025, bonds: 25, btc: 10 }, suggestedReturn: 6 },
  { id: 'cumbre', name: 'Cumbre', group: 'RUMBO', note: 'Mayor exposición a bolsa y cripto.', weights: { world: 61.705, em: 8.295, btc: 26.571, eth: 3.429 }, suggestedReturn: 8.5 },
  { id: 'bogleheads', name: 'Dos fondos', group: 'Otras ideas', note: 'Bolsa global y bonos.', weights: { world: 70, bonds: 30 }, suggestedReturn: 6 },
  { id: 'permanente', name: 'Permanente', group: 'Otras ideas', note: 'Cuatro bloques de igual peso.', weights: { world: 25, longbonds: 25, gold: 25, cash: 25 }, suggestedReturn: 5 },
  { id: 'allweather', name: 'All Weather', group: 'Otras ideas', note: 'Reparto orientativo por clases de activos.', weights: { world: 30, longbonds: 40, bonds: 15, gold: 7.5, commodities: 7.5 }, suggestedReturn: 6 },
  { id: 'crecimiento', name: 'Crecimiento', group: 'Otras ideas', note: 'Bolsa global con Bitcoin opcional.', weights: { world: 70, em: 15, btc: 15 }, suggestedReturn: 7 },
];

export function assetsForTemplate(template: PortfolioTemplate): Asset[] {
  return catalog.filter(a => template.weights[a.id] > 0).map(a => ({ ...a, targetWeight: template.weights[a.id] }));
}

export function initialPortfolio(): Portfolio {
  return {
    id: 'local', name: '', templateId: null, assets: [], holdings: [],
    monthlyContribution: 1000, history: [], expectedAnnualReturn: 6,
    inflationRate: 2, annualFee: 0.2, years: 25, bandRelative: 0.05,
    updatedAt: null,
  };
}

export function withTemplate(previous: Portfolio, template: PortfolioTemplate): Portfolio {
  const active = assetsForTemplate(template);
  // Los saldos de un plan anterior permanecen visibles con objetivo cero.
  const inactive = previous.assets.filter(a => !active.some(b => b.id === a.id) && previous.holdings.some(h => h.assetId === a.id && h.value > 0))
    .map(a => ({ ...a, targetWeight: 0 }));
  return { ...previous, name: template.name, templateId: template.id, assets: [...active, ...inactive], expectedAnnualReturn: template.suggestedReturn, updatedAt: new Date().toISOString() };
}

export function newCustomAsset(name: string, category: AssetCategory): Asset {
  return { id: `custom-${crypto.randomUUID()}`, name: name.trim(), category, targetWeight: 0, color: '#A2C9C2' };
}

export const formatMoney = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value);
export const formatWeight = (value: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value) + ' %';
