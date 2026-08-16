import assistantActive from '../tenants/ecorodovias/icons/assistant-active.svg';
import assistantInactive from '../tenants/ecorodovias/icons/assistant-inactive.svg';
import alertsActive from '../tenants/ecorodovias/icons/alerts-active.svg';
import alertsInactive from '../tenants/ecorodovias/icons/alerts-inactive.svg';
import supportActive from '../tenants/ecorodovias/icons/support-active.svg';
import supportInactive from '../tenants/ecorodovias/icons/support-inactive.svg';
import servicesActive from '../tenants/ecorodovias/icons/services-active.svg';
import servicesInactive from '../tenants/ecorodovias/icons/services-inactive.svg';
import tollsActive from '../tenants/ecorodovias/icons/tolls-active.svg';
import tollsInactive from '../tenants/ecorodovias/icons/tolls-inactive.svg';

const items = [
  ['home', 'Assistente', assistantActive, assistantInactive],
  ['alerts', 'Alertas', alertsActive, alertsInactive],
  ['support', 'Apoio', supportActive, supportInactive],
  ['services', 'Serviços', servicesActive, servicesInactive],
  ['tolls', 'Pedágio', tollsActive, tollsInactive]
];

export default function BottomNav({ screen, setScreen }) {
  return <nav className="bottom-nav" aria-label="Navegação principal">
    {items.map(([id, label, activeIcon, inactiveIcon]) => {
      const active = screen === id;
      return <button key={id} className={active ? 'active' : ''} onClick={() => setScreen(id)} aria-current={active ? 'page' : undefined}>
        <span className="figma-nav-icon"><img src={active ? activeIcon : inactiveIcon} alt="" /></span>
        <span>{label}</span>
      </button>;
    })}
  </nav>;
}
