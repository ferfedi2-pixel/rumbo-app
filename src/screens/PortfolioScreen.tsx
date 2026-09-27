import { ArrowRight, Info } from 'lucide-react';
import { calculateContribution } from '../domain/rebalance';
import { formatMoney, formatWeight } from '../domain/models';
import type { Portfolio } from '../domain/types';
import type { Screen } from '../components/BottomNav';

interface Props {
  portfolio: Portfolio;
  setHolding: (id: string, value: number) => void;
  navigate: (id: Screen) => void;
}

export function PortfolioScreen({ portfolio, setHolding, navigate }: Props) {
  if (!portfolio.assets.length) return <div className="screen-inner"><span className="section-index">CARTERA</span><h1>Tus saldos, en un lugar.</h1><p className="page-lead">Primero define un reparto para registrar lo que ya tienes.</p><button className="primary-button" onClick={() => navigate('activos')}>Ver modelos <ArrowRight size={20}/></button></div>;
  const snapshot = calculateContribution(portfolio, 0);
  const hasBalances = snapshot.currentTotal > 0;
  return <div className="screen-inner">
    <span className="section-index">CARTERA ACTUAL</span>
    <h1>{portfolio.name}</h1>
    <p className="page-lead">Introduce el valor actual de cada activo. No conectamos con tu banco.</p>
    <div className="portfolio-total"><span>Valor registrado</span><strong>{formatMoney(snapshot.currentTotal)}</strong></div>
    <div className="column-heading"><span>ACTIVO Y VALOR</span><span>AHORA / PLAN</span></div>
    <div className="holding-list">{snapshot.allocations.map(line => {
      const asset = portfolio.assets.find(a => a.id === line.assetId)!;
      return <div className="holding-row" key={line.assetId}>
        <div className="holding-top"><div className="holding-name"><span className="asset-marker" style={{ background: asset.color }}/><div><strong>{line.name}</strong><small>{asset.category}</small></div></div><div className="holding-weights"><b>{hasBalances ? formatWeight(line.currentWeight) : '—'}</b><small>/{formatWeight(line.targetWeight)}</small></div></div>
        <div className="holding-bottom"><label className="money-edit"><span>€</span><input aria-label={`Valor actual de ${line.name}`} type="number" min="0" step="0.01" inputMode="decimal" key={`${line.assetId}-${line.currentValue}`} defaultValue={line.currentValue || ''} placeholder="0" onBlur={event => {
          const value = Number(event.currentTarget.value);
          if (Number.isFinite(value) && value >= 0 && value !== line.currentValue) setHolding(line.assetId, value);
        }}/></label><div className="compare-track" title={`Actual ${formatWeight(line.currentWeight)}, objetivo ${formatWeight(line.targetWeight)}`}><span style={{ width: `${Math.min(100, line.currentWeight)}%`, background: asset.color }}/><i style={{ left: `${Math.min(100, line.targetWeight)}%` }}/></div></div>
      </div>;
    })}</div>
    {hasBalances && <p className={`status-line ${snapshot.outsideBand ? 'warning' : ''}`}><Info size={17}/>{snapshot.outsideBand ? 'Hay pesos fuera de la banda. Prueba primero con una aportación.' : 'Los pesos están dentro de las bandas configuradas.'}</p>}
    <button className="secondary-button" onClick={() => navigate('aportar')}>Calcular próxima aportación <ArrowRight size={19}/></button>
    <button className="text-link lower-link" onClick={() => navigate('activos')}>Revisar el reparto objetivo <ArrowRight size={16}/></button>
  </div>;
}
