import { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Bell, CarFront, Check, ChevronRight, CircleAlert,
  Clock3, CreditCard, Fuel, Headphones, House, LifeBuoy, MapPin, Menu,
  Mic2, Navigation, ReceiptText, Search, ShieldCheck, Sparkles, TrafficCone,
  TriangleAlert, UserRound, WalletCards, Wrench, X
} from 'lucide-react';
import Screen from './components/Screen';
import { tenantConfig } from './tenants/ecorodovias/config';
import { roadData, services as baseServices, tolls as baseTolls, supportOptions, sourceNotes } from './tenants/ecorodovias/data';
import { scenarios } from './demo/scenarios';
import { answerAssistant } from './core/assistant';
import './styles.css';

const money = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const sourceLabel = s => s === 'document' ? 'Fonte documental' : 'Simulado para demo';

function Header({ eyebrow, title, action }) {
  return <header className="page-header">
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <div className="header-line"><h1>{title}</h1>{action}</div>
  </header>;
}

function Home({ setScreen, scenario }) {
  return <>
    <div className="brand-row"><strong>ECOVIAS</strong><button className="round"><Menu size={19}/></button></div>
    <span className="eyebrow">Assistente de viagem · {scenario.journeyActive ? 'ativo' : 'pronto'}</span>
    <h1 className="hero-title">O que você precisa agora?</h1>
    <button className="ask-box" onClick={()=>setScreen('assistant')}>
      <div><strong>Pergunte à Ecovias</strong><small>Banheiro, posto, pedágio, condição da pista...</small></div><span className="ask-arrow"><ArrowRight size={20}/></span>
    </button>
    <section className="journey-card">
      <span className="eyebrow on-dark">ASSISTENTE DE VIAGEM</span>
      <h2>{scenario.journeyActive ? 'Acompanhando sua viagem.' : 'Assistente pronto.'}</h2>
      <p>{scenario.journeyActive ? `${tenantConfig.concessionName} · operação ${scenario.operation}.` : 'Ativa no contexto da concessão e reúne operação, alertas e serviços do trecho.'}</p>
      <button onClick={()=>setScreen('journey')}>{scenario.journeyActive ? 'Ver viagem' : 'Abrir modo viagem'}</button>
    </section>
    <h3 className="section-title">Acesso rápido</h3>
    <div className="quick-grid">
      <button onClick={()=>setScreen('tolls')}><span><CreditCard/></span><strong>Pedágios</strong><small>Pagamentos e histórico</small></button>
      <button onClick={()=>setScreen('support')}><span><LifeBuoy/></span><strong>Apoio</strong><small>Assistência na estrada</small></button>
      <button onClick={()=>setScreen('services')}><span><MapPin/></span><strong>Serviços</strong><small>Posto, banheiro e mais</small></button>
      <button onClick={()=>setScreen('journey')}><span><Bell/></span><strong>Alertas</strong><small>Só o que importa</small></button>
    </div>
  </>;
}

function Assistant({ setScreen, scenario, tollHistory, services, autoPay }) {
  const [query,setQuery] = useState('');
  const [listening,setListening] = useState(false);
  const speechSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const [history,setHistory] = useState([
    { role:'assistant', title:'Assistente Ecovias', text:'Pergunte sobre sua viagem. Eu respondo apenas com dados estruturados no protótipo.' }
  ]);
  const ask = (value=query) => {
    if (!value.trim()) return;
    const response = answerAssistant(value,{ services, road:roadData, scenario, tollHistory, autoPay });
    setHistory(h=>[...h,{role:'user',text:value},{role:'assistant',title:response.title,text:response.answer,action:response.action,provenance:response.provenance}]);
    setQuery('');
  };
  const startVoice = () => {
    if (!speechSupported || listening) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = event => {
      const spoken = event.results?.[0]?.[0]?.transcript || '';
      setQuery(spoken);
      if (spoken.trim()) ask(spoken);
    };
    recognition.start();
  };
  const suggestions = ['Onde tem banheiro mais próximo?','Qual posto mais próximo?','Como está a pista?','Quanto falta para o pedágio?','Preciso de ajuda'];
  return <>
    <button className="back" onClick={()=>setScreen('home')}><ArrowLeft size={18}/> Início</button>
    <Header eyebrow="IA COMO INTERFACE" title="Assistente Ecovias" action={<span className="ai-orb"><Sparkles size={18}/></span>} />
    <div className="chat-list">
      {history.map((m,i)=><div key={i} className={`chat-message ${m.role}`}>
        {m.title && <strong>{m.title}</strong>}<p>{m.text}</p>
        {m.provenance && <small>{sourceLabel(m.provenance)}</small>}
        {m.action && <button onClick={()=>setScreen(m.action.target)}>{m.action.label}<ChevronRight size={16}/></button>}
      </div>)}
    </div>
    <div className="suggestions">{suggestions.map(s=><button key={s} onClick={()=>ask(s)}>{s}</button>)}</div>
    <div className="composer"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()} placeholder="Pergunte à Ecovias"/><button className={`voice ${listening?'listening':''}`} onClick={startVoice} disabled={!speechSupported} title={speechSupported?'Perguntar por voz':'Voz não suportada neste navegador'}><Mic2 size={17}/></button><button onClick={()=>ask()}><ArrowRight size={18}/></button></div>
    <small className="voice-note">{speechSupported ? 'Você pode digitar ou usar o microfone.' : 'Entrada por voz depende do navegador. A digitação funciona em qualquer ambiente.'}</small>
  </>;
}

function Journey({ setScreen, scenario }) {
  const segments = roadData.snapshots?.[scenario.trafficSnapshot] || roadData.snapshots.normal;
  const slow = segments.find(s=>s.status==='slow');
  return <>
    <button className="back" onClick={()=>setScreen('home')}><ArrowLeft size={18}/> Início</button>
    <section className="road-hero">
      <span className="eyebrow on-dark">ECOVIAS IMIGRANTES</span><span className="live-pill">AO VIVO</span>
      <h1>{scenario.journeyActive ? 'Assistente de viagem ativo' : 'Modo viagem disponível'}</h1>
      <p>{roadData.system} · {roadData.currentRoad} · sentido {roadData.direction}</p>
    </section>
    <div className="status-grid">
      <article><span>OPERAÇÃO</span><strong>{scenario.operation}</strong><small>Configuração de faixas</small></article>
      <article><span>TRÁFEGO</span><strong>{slow ? 'Trecho lento' : 'Normal'}</strong><small>{slow ? `km ${slow.from} a ${slow.to}` : 'km 9,7 a 65 normal no snapshot'}</small></article>
      <article><span>COMBOIO</span><strong>{scenario.id==='convoy'?'Ativo':'Inativo'}</strong><small>Evento de alta prioridade</small></article>
    </div>
    <h3 className="section-title">Próximos eventos</h3>
    <div className="event-list">
      {scenario.events.length ? scenario.events.map(event=><article key={event.id} className={`event ${event.severity}`}><span className="event-icon">{event.severity==='critical'?<TriangleAlert/>:event.kind==='toll'?<CreditCard/>:<TrafficCone/>}</span><div><strong>{event.distanceKm} km · {event.title}</strong><p>{event.detail}</p><small>{sourceLabel(event.source)}</small></div></article>) : <article className="empty-state"><Check/><div><strong>Nenhum evento crítico</strong><p>O assistente permanece acompanhando o contexto da concessão.</p></div></article>}
    </div>
    <h3 className="section-title">Condição por trecho</h3>
    <div className="road-segments">{segments.map((s,i)=><div key={i} className={s.status}><span>km {s.from} a {s.to}</span><strong>{s.status==='slow'?'Lento':'Normal'}</strong>{s.reason&&<small>{s.reason}</small>}</div>)}</div>
    <div className="data-note"><CircleAlert size={18}/><p>Os tempos das 16 rotas do snapshot não variaram entre as coletas. O protótipo não os trata como tempo real.</p></div>
  </>;
}

function Tolls({ tollHistory, setTollHistory, autoPay, setAutoPay }) {
  const total = tollHistory.reduce((s,i)=>s+i.amount,0);
  return <>
    <Header title="Pedágios" eyebrow="CAMADA TRANSACIONAL" />
    <section className="payment-card">
      <div><span>Pagamento automático</span><h2>{autoPay?'Ativo':'Desativado'}</h2><p>Tag e meio de pagamento demonstrativos</p></div>
      <button className={`toggle ${autoPay?'on':''}`} onClick={()=>setAutoPay(v=>!v)}><span/></button>
      <button className="secondary-action"><WalletCards size={16}/> Gerenciar meios</button>
    </section>
    <h3 className="section-title">Resumo demonstrativo</h3>
    <article className="metric-card"><span>Total registrado</span><strong>{money(total)}</strong><small>{tollHistory.length} passagens simuladas</small></article>
    <div className="section-heading"><h3>Histórico</h3><button onClick={()=>setTollHistory([])}>Limpar demo</button></div>
    <div className="history-list">{tollHistory.length?tollHistory.map(item=><article key={item.id}><ReceiptText size={18}/><div><strong>{item.concession}</strong><small>{item.plaza}</small></div><b>{money(item.amount)}</b></article>):<div className="empty-line">Nenhuma passagem registrada.</div>}</div>
  </>;
}

function Support({ supportRequest, setSupportRequest }) {
  const [selected,setSelected] = useState('breakdown');
  const start = () => setSupportRequest({ id:'SUP-2026-DEMO', type:selected, status:'Equipe acionada', eta:'12 min', source:'prototype' });
  return <>
    <Header title="Apoio 24h" eyebrow="ASSISTÊNCIA" />
    <p className="lead">No protótipo, o contexto da concessão já está associado à solicitação.</p>
    <section className="location-card"><MapPin/><div><span>Localização atual</span><strong>Ecovias Imigrantes</strong><small>km 54 · Sentido Litoral · simulado</small></div></section>
    {!supportRequest ? <>
      <h3 className="section-title">Como podemos ajudar?</h3>
      <div className="support-grid">{supportOptions.map(opt=><button key={opt.id} className={selected===opt.id?'selected':''} onClick={()=>setSelected(opt.id)}><Wrench size={18}/><strong>{opt.label}</strong><small>{opt.description}</small></button>)}</div>
      <button className="primary full" onClick={start}><LifeBuoy size={18}/> Solicitar atendimento</button>
    </> : <section className="request-card"><div className="success-icon"><Check/></div><span>Solicitação aberta</span><h2>{supportRequest.status}</h2><p>Previsão demonstrativa de chegada: <strong>{supportRequest.eta}</strong></p><div className="progress-steps"><i className="done"/><i className="done"/><i/><i/></div><button className="secondary-action" onClick={()=>setSupportRequest(null)}>Encerrar demonstração</button></section>}
    <div className="data-note"><ShieldCheck size={18}/><p>Chamados reais exigem integração com sistemas oficiais da concessionária. Este fluxo é demonstrativo.</p></div>
  </>;
}

function Services({ services }) {
  const [filter,setFilter] = useState('all');
  const visible = services.filter(s=>filter==='all'||s.type===filter).sort((a,b)=>a.distanceKm-b.distanceKm);
  const tabs = [['all','Todos'],['fuel','Postos'],['support','Apoio'],['food','Alimentação'],['rest','Descanso']];
  return <>
    <Header title="Serviços próximos" eyebrow="CONVENIÊNCIA" />
    <div className="search-static"><Search size={18}/><span>O que você procura?</span></div>
    <div className="filter-row">{tabs.map(([id,label])=><button key={id} className={filter===id?'active':''} onClick={()=>setFilter(id)}>{label}</button>)}</div>
    <h3 className="section-title">Mais perto de você</h3>
    <div className="service-list">{visible.map(item=><article key={item.id}><div><span>{item.type==='fuel'?'POSTO':item.type==='support'?'APOIO':item.type==='food'?'ALIMENTAÇÃO':'DESCANSO'}</span><h2>{item.name}</h2><strong>{item.distanceKm} km</strong><small>{[item.open24h&&'24h',item.restroom&&'Banheiro',item.accessible&&'Acessível'].filter(Boolean).join(' · ')}</small></div><button><Navigation size={18}/></button></article>)}</div>
    <div className="data-note"><CircleAlert size={18}/><p>O modelo de dados possui campos para fotos, avaliações, horários, banheiro, chuveiro, caixa eletrônico, acessibilidade e 24h, mas estavam predominantemente vazios nos snapshots. Os estabelecimentos desta demo são simulados.</p></div>
  </>;
}

function Account({ autoPay }) {
  const rows = [
    ['Meu veículo','SUV demonstrativo',CarFront],
    ['Tag conectada',autoPay?'Ativa para pedágios':'Pagamento automático desligado',CreditCard],
    ['Forma de pagamento','Cartão demonstrativo',WalletCards],
    ['Preferências','Alertas e permissões',Bell]
  ];
  return <>
    <Header title="Minha Ecovias" eyebrow="CONTA" />
    <section className="account-hero"><span>TUDO CONFIGURADO</span><h2>Pronto para a próxima viagem.</h2><p>Veículo, tag e preferências conectados na demonstração.</p></section>
    <h3 className="section-title">Seus dados</h3>
    <div className="account-list">{rows.map(([title,sub,Icon])=><button key={title}><Icon size={18}/><div><strong>{title}</strong><small>{sub}</small></div><ChevronRight size={16}/></button>)}</div>
    <button className="history-card"><ReceiptText size={18}/><div><strong>Histórico e comprovantes</strong><small>Consulte passagens e registros recentes.</small></div></button>
  </>;
}

function DemoPanel({ scenarioId, setScenarioId, autoPay, setAutoPay, setTollHistory, supportRequest, setSupportRequest }) {
  const [open,setOpen] = useState(true);
  const passToll = () => setTollHistory(h=>[{ id:`toll-${Date.now()}`, concession:'Ecovias Imigrantes', plaza:'Passagem demonstrativa', amount:33.8, date:new Date().toISOString(), source:'prototype'},...h]);
  return <aside className={`demo-panel ${open?'':'collapsed'}`}>
    <button className="demo-toggle" onClick={()=>setOpen(v=>!v)}>{open?<X size={17}/>:<Sparkles size={17}/>}</button>
    {open && <>
      <span className="eyebrow">MODO APRESENTAÇÃO</span><h2>Controle da demo</h2><p>Use estes controles durante a reunião. Eles não fazem parte do app final.</p>
      <label>Cenário da viagem</label>
      <select value={scenarioId} onChange={e=>setScenarioId(e.target.value)}>{Object.values(scenarios).map(s=><option value={s.id} key={s.id}>{s.label}</option>)}</select>
      <small>{scenarios[scenarioId].description}</small>
      <div className="demo-actions"><button onClick={passToll} disabled={!autoPay}><CreditCard size={16}/> Simular pedágio</button><button onClick={()=>setAutoPay(v=>!v)}><WalletCards size={16}/> {autoPay?'Desligar':'Ativar'} pagamento</button><button onClick={()=>setSupportRequest(null)} disabled={!supportRequest}><LifeBuoy size={16}/> Resetar apoio</button></div>
      <div className="legend"><span><i className="dot doc"/> Fonte documental</span><span><i className="dot sim"/> Simulado</span></div>
      <details><summary>Fontes e limites</summary><p><b>Operação:</b> {sourceNotes.operational}</p><p><b>Limite:</b> dados sem API oficial disponível nesta demo são simulados e marcados no código.</p></details>
    </>}
  </aside>;
}

export default function App(){
  const [screen,setScreen] = useState('home');
  const [scenarioId,setScenarioId] = useState('idle');
  const [autoPay,setAutoPay] = useState(true);
  const [tollHistory,setTollHistory] = useState(baseTolls);
  const [supportRequest,setSupportRequest] = useState(null);
  const scenario = scenarios[scenarioId];
  const services = baseServices;
  const content = useMemo(()=>({
    home:<Home setScreen={setScreen} scenario={scenario}/>,
    assistant:<Assistant setScreen={setScreen} scenario={scenario} tollHistory={tollHistory} services={services} autoPay={autoPay}/>,
    journey:<Journey setScreen={setScreen} scenario={scenario}/>,
    tolls:<Tolls tollHistory={tollHistory} setTollHistory={setTollHistory} autoPay={autoPay} setAutoPay={setAutoPay}/>,
    support:<Support supportRequest={supportRequest} setSupportRequest={setSupportRequest}/>,
    services:<Services services={services}/>,
    account:<Account autoPay={autoPay}/>
  }),[screen,scenarioId,autoPay,tollHistory,supportRequest]);
  const noNav = screen==='assistant';
  return <div className="app-shell" style={{'--brand':tenantConfig.theme.brand,'--dark':tenantConfig.theme.brandDark,'--accent':tenantConfig.theme.accent,'--bg':tenantConfig.theme.background}}>
    <DemoPanel {...{scenarioId,setScenarioId,autoPay,setAutoPay,setTollHistory,supportRequest,setSupportRequest}}/>
    <div className="device-wrap"><Screen screen={screen} setScreen={setScreen} noNav={noNav}>{content[screen]}</Screen></div>
    <div className="desktop-story"><span className="eyebrow">SÍRIUS MOBILITY PLATFORM · TENANT ECOVIAS</span><h2>Um core, múltiplas concessões.</h2><p>Este build separa as capacidades compartilhadas do conteúdo/configuração da Ecovias. O layout final será aplicado depois da validação funcional.</p><div className="capabilities"><span>IA</span><span>Assistente de Viagem</span><span>Pedágios</span><span>Apoio</span><span>Serviços</span></div></div>
  </div>;
}
