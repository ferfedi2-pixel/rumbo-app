import { ChartNoAxesCombined, CirclePlus, Compass, Layers3, WalletCards } from 'lucide-react';

export const navItems = [
  { id: 'inicio', title: 'Inicio', Icon: Compass },
  { id: 'cartera', title: 'Cartera', Icon: WalletCards },
  { id: 'activos', title: 'Activos', Icon: Layers3 },
  { id: 'aportar', title: 'Aportar', Icon: CirclePlus },
  { id: 'horizonte', title: 'Horizonte', Icon: ChartNoAxesCombined },
] as const;
export type Screen = typeof navItems[number]['id'];

export function BottomNav({ current, onChange }: { current: Screen; onChange: (id: Screen) => void }) {
  return <nav className="bottom-nav" aria-label="Navegación principal">{navItems.map(({ id, title, Icon }) => <button
    key={id} type="button" className={`nav-button ${current === id ? 'active' : ''}`}
    aria-current={current === id ? 'page' : undefined} onClick={() => onChange(id)}>
    <Icon size={21} strokeWidth={1.8} aria-hidden="true"/><span>{title}</span>
  </button>)}</nav>;
}
