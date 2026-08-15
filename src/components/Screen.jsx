import BottomNav from './BottomNav';
export default function Screen({ children, screen, setScreen, noNav=false }) {
  return <main className="phone-screen">
    <div className="safe-area-top"><span>9:41</span><span>5G · 100%</span></div>
    <div className="screen-content">{children}</div>
    {!noNav && <BottomNav screen={screen} setScreen={setScreen}/>} 
  </main>;
}
