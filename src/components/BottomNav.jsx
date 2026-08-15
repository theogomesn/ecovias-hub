import { House, CreditCard, LifeBuoy, UserRound } from 'lucide-react';

const items = [
  ['home','Início',House],
  ['tolls','Pedágios',CreditCard],
  ['support','Apoio',LifeBuoy],
  ['account','Conta',UserRound]
];
export default function BottomNav({ screen, setScreen }) {
  return <nav className="bottom-nav" aria-label="Navegação principal">
    {items.map(([id,label,Icon]) => <button key={id} className={screen===id?'active':''} onClick={()=>setScreen(id)}><Icon size={18}/><span>{label}</span></button>)}
  </nav>;
}
