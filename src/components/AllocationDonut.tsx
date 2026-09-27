import type { Asset } from '../domain/types';
import { formatWeight } from '../domain/models';

interface Props { assets: Asset[]; holdings: Record<string, number> }

export function AllocationDonut({ assets, holdings }: Props) {
  const total = assets.reduce((sum, asset) => sum + (holdings[asset.id] || 0), 0);
  const draw = (target: boolean, radius: number) => {
    let offset = 0;
    const circumference = 2 * Math.PI * radius;
    return assets.map(asset => {
      const percentage = target ? asset.targetWeight : total ? (holdings[asset.id] || 0) / total * 100 : 0;
      const segment = <circle key={asset.id} cx="90" cy="90" r={radius} fill="none" stroke={asset.color} strokeWidth="12" strokeDasharray={`${Math.max(0, percentage * circumference / 100 - 2)} ${circumference}`} strokeDashoffset={-offset * circumference / 100} transform="rotate(-90 90 90)"/>;
      offset += percentage;
      return segment;
    });
  };
  return <div className="allocation-layout">
    <svg className="donut" viewBox="0 0 180 180" role="img" aria-label="Anillo exterior: distribución actual. Anillo interior: reparto objetivo.">
      <circle cx="90" cy="90" r="69" fill="none" stroke="#263B49" strokeWidth="12"/>
      <circle cx="90" cy="90" r="50" fill="none" stroke="#263B49" strokeWidth="12"/>
      {draw(false, 69)}{draw(true, 50)}
      <text x="90" y="85" textAnchor="middle" fill="#F4F7F6" fontSize="14" fontWeight="700">{total ? 'Ahora' : 'Objetivo'}</text>
      <text x="90" y="105" textAnchor="middle" fill="#AEBCC0" fontSize="10">fuera / dentro</text>
    </svg>
    <div className="allocation-list">
      <div className="allocation-heading"><span>Activo</span><span>Ahora</span><span>Plan</span></div>
      {assets.filter(asset => asset.targetWeight > 0 || holdings[asset.id] > 0).map(asset => <div key={asset.id} className="allocation-item">
        <span><i className="swatch" style={{ background: asset.color }}/>{asset.name}</span>
        <b>{total ? formatWeight((holdings[asset.id] || 0) / total * 100) : '—'}</b>
        <b>{formatWeight(asset.targetWeight)}</b>
      </div>)}
    </div>
  </div>;
}
