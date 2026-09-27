import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, Info, X } from 'lucide-react';
import { calculateContribution } from '../domain/rebalance';
import { formatMoney, formatWeight } from '../domain/models';
import type { Portfolio, RebalanceCalculation } from '../domain/types';
import type { Screen } from '../components/BottomNav';

interface Props { portfolio: Portfolio; navigate: (id: Screen) => void; setMonthly: (amount: number) => void; record: (result: RebalanceCalculation) => void }

export function ContributionScreen({ portfolio, navigate, setMonthly, record }: Props) {
  const [amountText, setAmountText] = useState(String(portfolio.monthlyContribution));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const amount = Number(amountText.replace(',', '.'));
  const valid = Number.isFinite(amount) && amount >= 0;
  const result = portfolio.assets.length && valid ? calculateContribution(portfolio, amount) : null;
  if (!portfolio.assets.length) return <div className="screen-inner"><span className="section-index">APORTACIÓN</span><h1>Primero, el plan.</h1><p className="page-lead">Define el reparto objetivo y podrás calcular una aportación.</p><button className="primary-button" onClick={() => navigate('activos')}>Definir cartera <ArrowRight size={20}/></button></div>;
  return <div className="screen-inner contribution-screen">
    <span className="section-index">APORTACIÓN INTELIGENTE</span>
    <h1>Tu siguiente paso.</h1>
    <p className="page-lead">El cálculo dirige el dinero nuevo hacia los activos rezagados.</p>
    <section className="amount-stage"><label htmlFor="newMoney">IMPORTE A INVERTIR</label><div className="amount-control"><input id="newMoney" type="text" inputMode="decimal" autoComplete="off" aria-describedby="amount-help" value={amountText} onChange={e => setAmountText(e.target.value)} onBlur={() => { if (valid) setMonthly(amount); }} /><span>€</span></div><p id="amount-help">Se guardará como tu aportación mensual prevista.</p>{!valid && <p className="form-error" role="alert">Introduce un importe válido, igual o mayor que cero.</p>}</section>
    {result && <>
      <div className="result-intro"><div><span className="section-index">REPARTO PROPUESTO</span><h2>{amount > 0 ? `Orientación para ${formatMoney(amount)}` : 'Introduce un importe'}</h2></div><span className="cashflow-tag">SIN VENDER</span></div>
      <div className="contribution-list">{result.allocations.map(line => <div className="contribution-line" key={line.assetId}><div><strong>{line.name}</strong><span>Ahora {result.currentTotal ? formatWeight(line.currentWeight) : '—'} · objetivo {formatWeight(line.targetWeight)}</span></div><div className="contribution-number"><small>{line.contribution > 0 ? 'APORTAR' : 'MANTENER'}</small><b>{formatMoney(line.contribution)}</b></div></div>)}</div>
      {result.outsideBand && result.currentTotal > 0 && <details className="review-disclosure"><summary><Info size={18}/> Desvío fuera de banda tras aportar <ChevronDown size={18}/></summary><p>Al menos un activo seguiría fuera del margen relativo de ±{portfolio.bandRelative * 100} % de su peso objetivo. Revisa el riesgo antes de operar.</p><div className="technical-list">{result.allocations.filter(line => line.outsideBand).map(line => <div key={line.assetId}><span>{line.name}</span><b>{line.deviationPoints >= 0 ? '+' : ''}{line.deviationPoints.toLocaleString('es-ES',{maximumFractionDigits:2})} pp</b></div>)}</div><details className="nested-disclosure"><summary>Ver ajuste completo orientativo</summary><p>Una opción con ventas y compras para volver al objetivo. No se ejecuta ni se registra automáticamente; puede tener costes e impuestos.</p>{result.fullRebalance.filter(item => Math.abs(item.adjustment) >= .01).map(item => <div className="review-order" key={item.assetId}>{item.adjustment < 0 ? 'Venta orientativa' : 'Compra orientativa'} · {portfolio.assets.find(a => a.id === item.assetId)?.name}<b>{formatMoney(Math.abs(item.adjustment))}</b></div>)}</details></details>}
      <p className="execution-note">Consulta tu banco o broker y ejecuta tú las operaciones. Los importes son una orientación basada en los saldos que has introducido.</p>
      <button type="button" disabled={amount <= 0} className="primary-button" onClick={() => { setMonthly(amount); setConfirmOpen(true); }}>He realizado estas aportaciones <Check size={19}/></button>
    </>}
    {confirmOpen && result && <div className="dialog-backdrop" onClick={() => setConfirmOpen(false)}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={e => e.stopPropagation()}><button className="dialog-close" aria-label="Cerrar" onClick={() => setConfirmOpen(false)}><X size={20}/></button><span className="section-index">REGISTRAR</span><h2 id="confirm-title">¿Invertiste estos importes?</h2><p>Esto solo actualizará los saldos guardados en este dispositivo. RUMBO no realiza compras.</p><div className="dialog-weights">{result.allocations.filter(line => line.contribution > 0).map(line => <div key={line.assetId}><span>{line.name}</span><b>{formatMoney(line.contribution)}</b></div>)}</div><p className="fine-print">Si invertiste importes diferentes, actualiza los saldos reales en Cartera.</p><button className="primary-button" onClick={() => { record(result); setConfirmOpen(false); navigate('cartera'); }}>Confirmar registro <Check size={18}/></button><button className="text-link dialog-cancel" onClick={() => setConfirmOpen(false)}>Cancelar</button></div></div>}
  </div>;
}
