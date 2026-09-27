import { lazy, Suspense, useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import type { Screen } from './components/BottomNav';
import { Dashboard } from './screens/Dashboard';
import { PortfolioScreen } from './screens/PortfolioScreen';
import { AssetsScreen } from './screens/AssetsScreen';
import { ContributionScreen } from './screens/ContributionScreen';
import { loadPortfolio, savePortfolio } from './domain/store';
import { withTemplate } from './domain/models';
import type { PortfolioTemplate } from './domain/models';
import type { Asset, Portfolio, RebalanceCalculation } from './domain/types';

const HorizonScreen = lazy(() => import('./screens/HorizonScreen').then(module => ({ default: module.HorizonScreen })));

export function App() {
  const [portfolio, setPortfolio] = useState<Portfolio>(loadPortfolio);
  const [screen, setScreen] = useState<Screen>('inicio');
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => { setStorageWarning(!savePortfolio(portfolio)); }, [portfolio]);
  useEffect(() => { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {}); }, []);
  const navigate = (target: Screen) => { setScreen(target); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const update = (patch: Partial<Portfolio>) => setPortfolio(current => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));
  const setHolding = (id: string, value: number) => setPortfolio(current => ({
    ...current,
    holdings: [...current.holdings.filter(h => h.assetId !== id), { assetId: id, value: Math.round(value * 100) / 100, updatedAt: new Date().toISOString() }],
    updatedAt: new Date().toISOString(),
  }));
  const applyTemplate = (template: PortfolioTemplate) => { setPortfolio(current => withTemplate(current, template)); navigate('cartera'); };
  const applyCustom = (name: string, assets: Asset[]) => {
    setPortfolio(current => {
      const inactive = current.assets.filter(a => !assets.some(item => item.id === a.id) && current.holdings.some(h => h.assetId === a.id && h.value > 0)).map(a => ({ ...a, targetWeight: 0 }));
      return { ...current, name, templateId: 'custom', assets: [...assets, ...inactive], updatedAt: new Date().toISOString() };
    });
    navigate('cartera');
  };
  const record = (result: RebalanceCalculation) => setPortfolio(current => {
    const holdings = current.holdings.map(h => ({ ...h }));
    for (const allocation of result.allocations) {
      const index = holdings.findIndex(h => h.assetId === allocation.assetId);
      if (index < 0) holdings.push({ assetId: allocation.assetId, value: allocation.contribution });
      else holdings[index].value = Math.round((holdings[index].value + allocation.contribution) * 100) / 100;
    }
    return { ...current, holdings, history: [...current.history, { id: crypto.randomUUID(), at: new Date().toISOString(), amount: result.amount, allocations: Object.fromEntries(result.allocations.map(a => [a.assetId, a.contribution])) }], updatedAt: new Date().toISOString() };
  });

  return <div className="app-shell">
    <header className="site-header"><div className="brand"><img src="/icon.svg" alt=""/><span>RUMBO</span><small>CALCULA · DECIDE · EJECUTA</small></div><span className="header-edition">CONCEPTO 03 / LOVABLE</span></header>
    {storageWarning && <div className="storage-warning" role="alert">El navegador no ha podido guardar los datos. Revisa el espacio o los permisos de almacenamiento.</div>}
    <main id="main-content" key={screen}>
      {screen === 'inicio' && <Dashboard portfolio={portfolio} navigate={navigate}/>}
      {screen === 'cartera' && <PortfolioScreen portfolio={portfolio} setHolding={setHolding} navigate={navigate}/>}
      {screen === 'activos' && <AssetsScreen portfolio={portfolio} applyTemplate={applyTemplate} applyCustom={applyCustom}/>}
      {screen === 'aportar' && <ContributionScreen portfolio={portfolio} navigate={navigate} setMonthly={monthlyContribution => update({ monthlyContribution })} record={record}/>}
      {screen === 'horizonte' && <Suspense fallback={<div className="screen-inner">Cargando simulación…</div>}><HorizonScreen portfolio={portfolio} update={update} navigate={navigate}/></Suspense>}
    </main>
    <footer className="site-footer">RUMBO solo calcula a partir de los datos que introduces. No custodia dinero ni ofrece asesoramiento financiero personalizado.</footer>
    <BottomNav current={screen} onChange={navigate}/>
  </div>;
}
