import { useState } from 'react';
import { ArrowRight, Plus, X } from 'lucide-react';
import { catalog, formatWeight, newCustomAsset, templates } from '../domain/models';
import { validateWeights } from '../domain/rebalance';
import type { Asset, AssetCategory, Portfolio } from '../domain/types';
import type { PortfolioTemplate } from '../domain/models';

interface Props { portfolio: Portfolio; applyTemplate: (template: PortfolioTemplate) => void; applyCustom: (name: string, assets: Asset[]) => void }
const categoryOptions: AssetCategory[] = ['Renta variable', 'Renta fija', 'Criptomonedas', 'Efectivo', 'Oro', 'Materias primas'];

export function AssetsScreen({ portfolio, applyTemplate, applyCustom }: Props) {
  const [candidate, setCandidate] = useState<PortfolioTemplate | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [draft, setDraft] = useState<Asset[]>([]);
  const [draftName, setDraftName] = useState('Mi cartera');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AssetCategory>('Renta variable');
  const [error, setError] = useState('');
  const total = draft.reduce((sum, asset) => sum + asset.targetWeight, 0);

  const startCustom = () => {
    setDraft(portfolio.assets.filter(a => a.targetWeight > 0).map(a => ({ ...a })));
    setDraftName(portfolio.templateId === 'custom' ? portfolio.name : 'Mi cartera');
    setCustomOpen(true); setError('');
  };
  const toggleCatalog = (id: string) => {
    setDraft(current => current.some(a => a.id === id) ? current.filter(a => a.id !== id) : [...current, { ...catalog.find(a => a.id === id)!, targetWeight: 0 }]);
    setError('');
  };
  const saveCustom = () => {
    const problem = validateWeights(draft);
    if (problem || !draftName.trim()) { setError(problem || 'Pon un nombre a tu cartera.'); return; }
    applyCustom(draftName.trim(), draft);
    setCustomOpen(false); setError('');
  };
  return <div className="screen-inner assets-screen">
    <span className="section-index">ELIGE UN REPARTO</span>
    <h1>Activos y modelos.</h1>
    <p className="page-lead">Puntos de partida editables. La decisión sobre activos y pesos es tuya.</p>
    {(['RUMBO', 'Otras ideas'] as const).map(group => <section key={group} className="model-group"><div className="section-title"><span className="section-index">{group.toUpperCase()}</span></div><div className="template-grid">{templates.filter(template => template.group === group).map((template, index) => <button type="button" className={`template ${portfolio.templateId === template.id ? 'chosen' : ''}`} key={template.id} onClick={() => setCandidate(template)}>
      <span className="template-number">0{index + 1} <span className="template-glyph" aria-hidden="true">{template.id === 'refugio' ? '⌂' : template.id === 'travesia' ? '↗' : template.id === 'cumbre' ? '⌁' : '◇'}</span></span>
      <strong>{template.name}</strong><small>{template.note}</small>
      <span className="template-weights">{Object.entries(template.weights).map(([id, weight]) => <span key={id}>{catalog.find(a => a.id === id)?.name} <b>{formatWeight(weight)}</b></span>)}</span>
      <span className="template-cta">{portfolio.templateId === template.id ? 'Plan actual' : 'Ver reparto'} <ArrowRight size={16}/></span>
    </button>)}</div></section>)}

    <section className="custom-entry"><span className="section-index">A TU MEDIDA</span><h2>Tu propio reparto.</h2><p>Selecciona activos y ajusta los pesos hasta sumar 100 %.</p><button className="secondary-button" onClick={startCustom}>Crear cartera personalizada <ArrowRight size={18}/></button></section>

    {candidate && <div className="dialog-backdrop" onClick={() => setCandidate(null)}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="template-title" onClick={e => e.stopPropagation()}><button className="dialog-close" aria-label="Cerrar" onClick={() => setCandidate(null)}><X size={20}/></button><span className="section-index">REPARTO OBJETIVO</span><h2 id="template-title">{candidate.name}</h2><p>{candidate.note}</p><div className="dialog-weights">{Object.entries(candidate.weights).map(([id, weight]) => <div key={id}><span>{catalog.find(a => a.id === id)?.name}</span><b>{formatWeight(weight)}</b></div>)}</div><p className="fine-print">Hipótesis inicial para la simulación: {candidate.suggestedReturn} % anual. Edítala en Horizonte; no es una previsión.</p>{portfolio.assets.length > 0 && <p className="fine-print">Los saldos registrados se conservarán. Este cambio solo ajusta el objetivo.</p>}<button className="primary-button" onClick={() => { applyTemplate(candidate); setCandidate(null); }}>Confirmar reparto <ArrowRight size={18}/></button></div></div>}

    {customOpen && <div className="dialog-backdrop" onClick={() => setCustomOpen(false)}><div className="dialog custom-dialog" role="dialog" aria-modal="true" aria-labelledby="custom-title" onClick={e => e.stopPropagation()}><button className="dialog-close" aria-label="Cerrar" onClick={() => setCustomOpen(false)}><X size={20}/></button><span className="section-index">CARTERA PERSONALIZADA</span><h2 id="custom-title">Diseña tu reparto.</h2><label className="field-label">Nombre<input type="text" value={draftName} maxLength={36} onChange={e => setDraftName(e.target.value)}/></label><div className="catalog-pills">{catalog.map(a => <button type="button" className={draft.some(item => item.id === a.id) ? 'selected' : ''} key={a.id} onClick={() => toggleCatalog(a.id)}>{draft.some(item => item.id === a.id) ? '✓ ' : '+ '}{a.name}</button>)}</div><div className="custom-rows">{draft.map(asset => <label key={asset.id}><span>{asset.name}</span><input type="number" aria-label={`Peso de ${asset.name}`} min="0" max="100" step="0.1" inputMode="decimal" value={asset.targetWeight} onChange={e => setDraft(items => items.map(a => a.id === asset.id ? { ...a, targetWeight: Number(e.target.value) } : a))}/><span>%</span>{asset.id.startsWith('custom-') && <button type="button" aria-label={`Quitar ${asset.name}`} onClick={() => setDraft(items => items.filter(a => a.id !== asset.id))}><X size={15}/></button>}</label>)}</div><div className="custom-add"><input aria-label="Nombre de nuevo activo" placeholder="Otro activo" value={newName} onChange={e => setNewName(e.target.value)}/><select aria-label="Categoría" value={newCategory} onChange={e => setNewCategory(e.target.value as AssetCategory)}>{categoryOptions.map(category => <option key={category}>{category}</option>)}</select><button aria-label="Añadir activo" type="button" onClick={() => { if (newName.trim()) { setDraft(items => [...items, newCustomAsset(newName, newCategory)]); setNewName(''); } }}><Plus size={18}/></button></div><div className="custom-sum"><span>Total</span><b className={Math.abs(total - 100) < .001 ? 'balanced' : ''}>{total.toLocaleString('es-ES')} %</b></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" onClick={saveCustom}>Guardar reparto <ArrowRight size={18}/></button></div></div>}
  </div>;
}
