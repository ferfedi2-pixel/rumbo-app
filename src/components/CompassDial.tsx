import type { Asset } from '../domain/types';

interface Props { assets: Asset[]; holdings: Record<string, number>; bandRelative?: number; compact?: boolean }

export function CompassDial({ assets, holdings, bandRelative = .05, compact = false }: Props) {
  const total = assets.reduce((sum, asset) => sum + (holdings[asset.id] || 0), 0);
  const deficits = total ? assets.map((asset, index) => ({
    index, asset, points: asset.targetWeight - (holdings[asset.id] || 0) / total * 100,
  })).filter(entry => entry.asset.targetWeight > 0) : [];
  const priority = deficits.sort((a, b) => b.points - a.points)[0];
  const maxDeviation = total ? Math.max(...assets.map(asset => Math.abs((holdings[asset.id] || 0) / total * 100 - asset.targetWeight))) : 0;
  const outsideBand = total > 0 && assets.some(asset => Math.abs((holdings[asset.id] || 0) / total * 100 - asset.targetWeight) > asset.targetWeight * bandRelative);
  const steady = !total || (!outsideBand && maxDeviation <= 2);
  const angle = steady || !priority ? 0 : assets.length <= 1 ? 0 : -53 + 106 * priority.index / (assets.length - 1);
  const label = !total ? 'Esperando saldos' : steady ? 'En rumbo' : `Revisar ${priority?.asset.name || 'cartera'}`;

  return <div className={`compass-wrap ${compact ? 'compass-small' : ''}`}>
    <svg viewBox="0 0 260 260" className="compass" role="img" aria-label={`${label}. Desviación máxima ${maxDeviation.toFixed(1)} puntos porcentuales.`}>
      <defs>
        <linearGradient id="needle" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#B7F4D9"/><stop offset="1" stopColor="#10B981"/></linearGradient>
        <radialGradient id="dial"><stop stopColor="#1F3B49"/><stop offset=".7" stopColor="#132533"/><stop offset="1" stopColor="#0E1B29"/></radialGradient>
      </defs>
      <circle cx="130" cy="130" r="120" fill="url(#dial)" stroke="#2B4858" strokeWidth="1"/>
      <circle cx="130" cy="130" r="101" fill="none" stroke="#294353" strokeWidth="1"/>
      <circle cx="130" cy="130" r="78" fill="none" stroke="#395469" strokeWidth="1" strokeDasharray="1 7"/>
      <path d="M130 26v16 M130 218v16 M26 130h16 M218 130h16" stroke="#8CA5AF" strokeWidth="1.5"/>
      <path d="M130 29A101 101 0 0 1 215 75" fill="none" stroke="#D9CCA8" strokeWidth="1" opacity=".7"/>
      <text x="130" y="63" textAnchor="middle" fill="#E8DEBD" fontSize="15" letterSpacing="3">N</text>
      <text x="208" y="135" textAnchor="middle" fill="#8297A1" fontSize="11">E</text>
      <text x="51" y="135" textAnchor="middle" fill="#8297A1" fontSize="11">O</text>
      <g className="compass-needle" style={{ transform: `rotate(${angle}deg)` }}>
        <path d="M130 55 141 130 130 137 119 130Z" fill="url(#needle)"/>
        <path d="M130 205 141 130 130 137 119 130Z" fill="#8FA2AA"/>
      </g>
      <circle cx="130" cy="130" r="13" fill="#D9CCA8" stroke="#0B1520" strokeWidth="6"/>
    </svg>
    {!compact && <span className="compass-caption">{label}</span>}
  </div>;
}
