import { Bell, CreditCard, LifeBuoy, MapPin, Sparkles } from 'lucide-react';

const FIGMA_NAV_ICONS = {
  home: {
    active: 'https://www.figma.com/api/mcp/asset/40d7d79a-e078-4709-95d0-f9b30c798cd5.svg',
    inactive: 'https://www.figma.com/api/mcp/asset/63099177-2aa2-41b4-8193-6f53ac6d8ba6.svg'
  },
  alerts: {
    active: 'https://www.figma.com/api/mcp/asset/e0f3b7bb-a8c2-45ec-a4e0-7e230c2b2d72.svg',
    inactive: 'https://www.figma.com/api/mcp/asset/1495f89b-2abd-4277-be5b-36ac51b323fc.svg'
  },
  support: {
    active: 'https://www.figma.com/api/mcp/asset/5046ad57-93c2-49ac-bb06-b864d7787c3e.svg',
    inactive: 'https://www.figma.com/api/mcp/asset/cd4c9f86-e611-4576-a246-45eb685bdb04.svg'
  },
  services: {
    active: 'https://www.figma.com/api/mcp/asset/a42f06d5-beb0-4885-8059-29e5f8d22f6e.svg',
    inactive: 'https://www.figma.com/api/mcp/asset/ff325448-615a-4f10-a495-5b5f6b214b6a.svg'
  },
  tolls: {
    active: 'https://www.figma.com/api/mcp/asset/33f72992-d57f-47ae-bbd7-59379c3f0cb5.svg',
    inactive: 'https://www.figma.com/api/mcp/asset/75cb6dcc-5e13-4610-a9ec-87768db06872.svg'
  }
};

const items = [
  ['home', 'Assistente', Sparkles],
  ['alerts', 'Alertas', Bell],
  ['support', 'Apoio', LifeBuoy],
  ['services', 'Serviços', MapPin],
  ['tolls', 'Pedágio', CreditCard]
];

function NavIcon({ screen, active, Fallback }) {
  return <span className="figma-nav-icon">
    <img
      src={FIGMA_NAV_ICONS[screen][active ? 'active' : 'inactive']}
      alt=""
      onError={event => {
        event.currentTarget.style.display = 'none';
        event.currentTarget.nextElementSibling?.removeAttribute('hidden');
      }}
    />
    <span hidden className="figma-icon-fallback"><Fallback size={22}/></span>
  </span>;
}

export default function BottomNav({ screen, setScreen }) {
  return <nav className="bottom-nav" aria-label="Navegação principal">
    {items.map(([id, label, Icon]) => {
      const active = screen === id;
      return <button key={id} className={active ? 'active' : ''} onClick={() => setScreen(id)} aria-current={active ? 'page' : undefined}>
        <NavIcon screen={id} active={active} Fallback={Icon}/>
        <span>{label}</span>
      </button>;
    })}
  </nav>;
}
