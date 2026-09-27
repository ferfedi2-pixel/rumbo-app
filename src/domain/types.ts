export type AssetCategory = 'Renta variable' | 'Renta fija' | 'Criptomonedas' | 'Efectivo' | 'Oro' | 'Materias primas';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  targetWeight: number; // Porcentaje entre 0 y 100.
  color: string;
}

export interface Holding {
  assetId: string;
  value: number; // Valor estimado en EUR introducido por el usuario.
  updatedAt?: string;
}

export interface ContributionRecord {
  id: string;
  at: string;
  amount: number;
  allocations: Record<string, number>;
}

export interface Portfolio {
  id: string;
  name: string;
  templateId: string | null;
  assets: Asset[];
  holdings: Holding[];
  monthlyContribution: number;
  history: ContributionRecord[];
  expectedAnnualReturn: number; // Hipótesis editable, nunca garantía.
  inflationRate: number;
  annualFee: number;
  years: number;
  bandRelative: number; // 0.05 significa ±5 % del peso objetivo.
  updatedAt: string | null;
}

export interface AllocationLine {
  assetId: string;
  name: string;
  currentValue: number;
  currentWeight: number;
  targetWeight: number;
  contribution: number;
  afterValue: number;
  afterWeight: number;
  deviationPoints: number;
  outsideBand: boolean;
  suggestedSale: number;
}

export interface RebalanceCalculation {
  amount: number;
  currentTotal: number;
  totalAfter: number;
  allocations: AllocationLine[];
  maxDeviationPoints: number;
  outsideBand: boolean;
  fullRebalance: { assetId: string; adjustment: number }[];
}
