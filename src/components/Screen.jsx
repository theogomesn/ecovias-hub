import BottomNav from './BottomNav';
export default function Screen({ children, screen, setScreen, noNav=false }) {
  return <main className="phone-screen">
    <div className="safe-area-top" aria-hidden="true" />
    <div className="screen-content">{children}</div>
    {!noNav && <BottomNav screen={screen} setScreen={setScreen}/>} 
  </main>;
}
