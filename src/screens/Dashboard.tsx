import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { AllocationDonut } from '../components/AllocationDonut';
import { CompassDial } from '../components/CompassDial';
import { calculateContribution } from '../domain/rebalance';
import { formatMoney } from '../domain/models';
import type { Portfolio } from '../domain/types';
import type { Screen } from '../components/BottomNav';

export function Dashboard({ portfolio, navigate }: { portfolio: Portfolio; navigate: (id: Screen) => void }) {
  const configured = portfolio.assets.length > 0;
  const holdings = Object.fromEntries(portfolio.holdings.map(h => [h.assetId, h.value]));
  const total = portfolio.holdings.reduce((sum, h) => sum + h.value, 0);
  const result = configured ? calculateContribution(portfolio, 0) : null;
  const hasBalances = total > 0;
  return <div className="screen-home">
    <section className="hero-panel">
      <div className="hero-orbit" aria-hidden="true"/>
      <div className="eyebrow">INVERSIÓN A LARGO PLAZO</div>
      <h1>Tu inversión,<br/><em>con dirección.</em></h1>
      <p>Calcula cada aportación. Tú decides y ejecutas.</p>
      <div className="hero-compass"><CompassDial assets={portfolio.assets} holdings={holdings} bandRelative={portfolio.bandRelative}/></div>
      <div className="hero-foot"><span>{configured ? portfolio.name : 'Empieza por definir tu cartera'}</span><span>{hasBalances && result ? !result.outsideBand && result.maxDeviationPoints <= 2 ? 'En rumbo' : `Desvío ${result.maxDeviationPoints.toLocaleString('es-ES',{maximumFractionDigits:1})} pp` : 'Tu plan, a tu ritmo'}</span></div>
    </section>

    {!configured ? <section className="start-row">
      <span className="section-index">01 / COMIENZA</span>
      <h2>Define tu reparto.</h2>
      <p>Escoge una cartera modelo o crea una propia. Después podrás introducir tus saldos.</p>
      <button className="primary-button" onClick={() => navigate('activos')}>Crear mi cartera <ArrowUpRight size={20}/></button>
    </section> : <>
      <section className="dashboard-stats">
        <div><span className="section-index">VALOR REGISTRADO</span><strong>{formatMoney(total)}</strong><small>Importes introducidos por ti</small></div>
        <div><span className="section-index">APORTACIÓN PREVISTA</span><strong>{formatMoney(portfolio.monthlyContribution)}</strong><small>Al mes · editable</small></div>
      </section>
      {!hasBalances && <button className="inline-action" onClick={() => navigate('cartera')}>Introduce los saldos actuales <ArrowRight size={17}/></button>}
      <button className="primary-button home-action" onClick={() => navigate('aportar')}>Calcular aportación <ArrowUpRight size={20}/></button>
      {hasBalances && <section className="section-block">
        <div className="section-title"><div><span className="section-index">TU REPARTO</span><h2>Ahora y objetivo</h2></div><button className="text-link" onClick={() => navigate('cartera')}>Ver cartera <ArrowRight size={15}/></button></div>
        <AllocationDonut assets={portfolio.assets} holdings={holdings}/>
      </section>}
      <section className="quiet-row"><span>EL LARGO PLAZO</span><p>La próxima aportación puede acercar tu cartera al plan sin vender.</p><button onClick={() => navigate('horizonte')}>Ver simulación <ArrowRight size={15}/></button></section>
    </>}
  </div>;
}
