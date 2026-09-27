import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { projectPortfolio } from '../domain/projection';
import { formatMoney } from '../domain/models';
import type { Portfolio } from '../domain/types';
import type { Screen } from '../components/BottomNav';
import { ArrowRight } from 'lucide-react';

interface Props { portfolio: Portfolio; update: (patch: Partial<Portfolio>) => void; navigate: (id: Screen) => void }
type NumericalKey = 'monthlyContribution' | 'expectedAnnualReturn' | 'inflationRate' | 'annualFee' | 'years';

export function HorizonScreen({ portfolio, update, navigate }: Props) {
  const total = portfolio.holdings.reduce((sum, h) => sum + h.value, 0);
  const real = portfolio.inflationRate > 0;
  const points = projectPortfolio(portfolio, total, real);
  const end = points.at(-1)!;
  const field = (key: NumericalKey, label: string, min: number, max: number, step = 0.1) => <label className="scenario-field" key={key}><span>{label}</span><div><input type="number" inputMode="decimal" min={min} max={max} step={step} value={portfolio[key]} onChange={e => {
    const value = Number(e.target.value);
    if (Number.isFinite(value) && value >= min && value <= max) update({ [key]: value });
  }}/><span>{key === 'years' ? 'años' : key === 'monthlyContribution' ? '€' : '%'}</span></div></label>;
  return <div className="screen-inner horizon-screen">
    <span className="section-index">SIMULACIÓN</span><h1>Mira más lejos.</h1><p className="page-lead">Explora escenarios, no previsiones. Ajusta las hipótesis a tu criterio.</p>
    {!portfolio.assets.length && <button className="inline-action" onClick={() => navigate('activos')}>Crear una cartera para guardar el escenario <ArrowRight size={17}/></button>}
    <section className="scenario-result"><span>CAPITAL FINAL ESTIMADO · {portfolio.years} AÑOS</span><strong>{formatMoney(end.total)}</strong><small>{real ? 'En euros de hoy, con la inflación indicada' : 'En euros nominales'} · rentabilidad no garantizada</small></section>
    <div className="chart-legend"><span><i className="legend-paid"/> Capital aportado</span><span><i className="legend-growth"/> Crecimiento estimado</span></div>
    <div className="projection-chart" role="img" aria-label={`Proyección a ${portfolio.years} años: capital aportado ${formatMoney(end.paid)}, crecimiento estimado ${formatMoney(end.growth)}, capital total ${formatMoney(end.total)}`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{ top: 10, right: 4, bottom: 0, left: -24 }}><CartesianGrid vertical={false} stroke="#263C4C" strokeDasharray="2 5"/><XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: '#A3B2BB', fontSize: 11 }} unit="a"/><YAxis tickLine={false} axisLine={false} tick={{ fill: '#A3B2BB', fontSize: 11 }} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`}/><Tooltip contentStyle={{ background: '#132232', border: '1px solid #385367', borderRadius: 12, color: '#F4F7F6' }} formatter={value => formatMoney(Number(value))} labelFormatter={year => `Año ${year}`} /><Area type="monotone" dataKey="paid" name="Aportado" stackId="1" stroke="#D9CCA8" fill="#D9CCA8" fillOpacity={.74}/><Area type="monotone" dataKey="growth" name="Crecimiento" stackId="1" stroke="#34D399" fill="#34D399" fillOpacity={.68}/></AreaChart></ResponsiveContainer></div>
    <div className="projection-totals"><div><span>Capital aportado</span><strong>{formatMoney(end.paid)}</strong></div><div><span>Crecimiento estimado</span><strong>{formatMoney(end.growth)}</strong></div></div>
    <section className="scenario-inputs"><div className="section-title"><span className="section-index">SUPUESTOS EDITABLES</span></div><div className="scenario-grid"><div className="scenario-field"><span>Patrimonio inicial</span><strong>{formatMoney(total)}</strong><small>Se modifica en Cartera</small></div>{field('monthlyContribution', 'Aportación mensual', 0, 100000, 10)}{field('expectedAnnualReturn', 'Rentabilidad anual nominal', 0, 20)}{field('years', 'Horizonte', 1, 40, 1)}{field('inflationRate', 'Inflación estimada', 0, 15)}{field('annualFee', 'Comisiones anuales (TER)', 0, 5)}</div><p className="fine-print">El gráfico descuenta las comisiones del crecimiento. Con inflación superior a cero, expresa valor total y capital aportado en euros equivalentes al final de cada año. No incluye impuestos ni variaciones de mercado.</p></section>
    <p className="horizon-warning">Esta proyección es una estimación basada en hipótesis. No representa una garantía de rentabilidad futura.</p>
  </div>;
}
