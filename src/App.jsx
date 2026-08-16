import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Bell, CarFront, Check, ChevronRight,
  CreditCard, LifeBuoy, MapPin, Menu, Mic2, Navigation, ReceiptText,
  Search, Sparkles, TrafficCone, TriangleAlert, WalletCards, Wrench, X
} from 'lucide-react';
import Screen from './components/Screen';
import { tenantConfig } from './tenants/ecorodovias/config';
import { journeyContext, roadData, services as baseServices, tolls as baseTolls, supportOptions, sourceNotes } from './tenants/ecorodovias/data';
import { scenarios } from './demo/scenarios';
import { answerAssistant } from './core/assistant';
import './styles.css';

const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Header({ eyebrow, title, action }) {
  return <header className="page-header">
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <div className="header-line"><h1>{title}</h1>{action}</div>
  </header>;
}

function AssistantComposer({ scenario, tollHistory, services, autoPay, setScreen }) {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [answer, setAnswer] = useState(null);
  const speechSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const ask = (value = query) => {
    if (!value.trim()) return;
    const response = answerAssistant(value, { services, road: roadData, scenario, tollHistory, autoPay, journey: journeyContext });
    setAnswer({ ...response, question: value });
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

  return <>
    <div className="home-composer" role="search">
      <input
        value={query}
        onChange={event => setQuery(event.target.value)}
        onKeyDown={event => event.key === 'Enter' && ask()}
        placeholder={`Pergunte à ${tenantConfig.shortName}`}
        aria-label={`Pergunte à ${tenantConfig.shortName}`}
      />
      <button
        className={`home-voice ${listening ? 'listening' : ''}`}
        onClick={startVoice}
        disabled={!speechSupported}
        aria-label={speechSupported ? 'Perguntar por voz' : 'Entrada por voz não disponível'}
      ><Mic2 size={22}/></button>
      <button className="home-send" onClick={() => ask()} aria-label="Enviar pergunta"><ArrowRight size={22}/></button>
    </div>
    {answer && <section className="assistant-answer" aria-live="polite">
      <span className="assistant-question">{answer.question}</span>
      <strong>{answer.title}</strong>
      <p>{answer.answer}</p>
      {answer.action && <button onClick={() => setScreen(answer.action.target)}>{answer.action.label}<ChevronRight size={17}/></button>}
    </section>}
  </>;
}

function Home({ setScreen, scenario, setScenarioId, tollHistory, services, autoPay }) {
  const startJourney = () => {
    if (!scenario.journeyActive) setScenarioId('normal');
    setScreen('journey');
  };

  return <>
    <div className="brand-row"><strong>{tenantConfig.shortName.toUpperCase()}</strong><button className="round" aria-label="Abrir menu"><Menu size={20}/></button></div>
    <div className="ai-agent-wrap" aria-hidden="true"><img src="/ai-agent.gif" alt="" /></div>
    <h1 className="hero-title">O que você precisa agora?</h1>
    <AssistantComposer {...{ scenario, tollHistory, services, autoPay, setScreen }} />

    <h3 className="section-title home-quick-title">Acesso rápido</h3>
    <div className="quick-grid quick-grid-three">
      <button onClick={startJourney}><span><Navigation/></span><strong>Assistente de viagem</strong><small>{scenario.journeyActive ? 'Viagem em andamento' : 'Iniciar acompanhamento'}</small></button>
      <button onClick={() => setScreen('alerts')}><span><Bell/></span><strong>Alertas</strong><small>Condições e ocorrências</small></button>
      <button onClick={() => setScreen('services')}><span><MapPin/></span><strong>Serviços</strong><small>Posto, banheiro e mais</small></button>
    </div>
  </>;
}

function Journey({ setScreen, scenario }) {
  const segments = roadData.snapshots?.[scenario.trafficSnapshot] || roadData.snapshots.normal;
  const slow = segments.find(segment => segment.status === 'slow');
  return <>
    <button className="back" onClick={() => setScreen('home')}><ArrowLeft size={20}/> Início</button>
    <section className="road-hero">
      <span className="eyebrow on-dark">{tenantConfig.concessionName.toUpperCase()}</span><span className="trip-pill">EM VIAGEM</span>
      <h1>{scenario.journeyActive ? 'Assistente de viagem ativo' : 'Modo viagem disponível'}</h1>
      <p>{roadData.system} · {roadData.currentRoad} · sentido {journeyContext.direction}</p>
    </section>
    <div className="status-grid">
      <article><span>OPERAÇÃO</span><strong>{scenario.operation}</strong><small>Configuração atual de faixas</small></article>
      <article><span>TRÁFEGO</span><strong>{slow ? 'Trecho lento' : 'Normal'}</strong><small>{slow ? `km ${slow.from} a ${slow.to}` : 'Fluxo normal no trecho monitorado'}</small></article>
      <article><span>COMBOIO</span><strong>{scenario.id === 'convoy' ? 'Ativo' : 'Inativo'}</strong><small>{scenario.id === 'convoy' ? 'Siga as orientações operacionais' : 'Sem operação especial no momento'}</small></article>
    </div>
    <h3 className="section-title">Próximos eventos</h3>
    <div className="event-list">
      {scenario.events.length ? scenario.events.map(event => <article key={event.id} className={`event ${event.severity}`}>
        <span className="event-icon">{event.severity === 'critical' ? <TriangleAlert/> : event.kind === 'toll' ? <CreditCard/> : <TrafficCone/>}</span>
        <div><strong>{event.distanceKm} km · {event.title}</strong><p>{event.detail}</p></div>
      </article>) : <article className="empty-state"><Check/><div><strong>Nenhum evento crítico</strong><p>O assistente continua acompanhando sua viagem.</p></div></article>}
    </div>
    <h3 className="section-title">Condição por trecho</h3>
    <div className="road-segments">{segments.map((segment, index) => <div key={index} className={segment.status}><span>km {segment.from} a {segment.to}</span><strong>{segment.status === 'slow' ? 'Lento' : 'Normal'}</strong>{segment.reason && <small>{segment.reason}</small>}</div>)}</div>
  </>;
}

function Alerts({ setScreen, scenario }) {
  const segments = roadData.snapshots?.[scenario.trafficSnapshot] || roadData.snapshots.normal;
  const slow = segments.find(segment => segment.status === 'slow');
  const alerts = [
    ...(scenario.events || []),
    ...(slow && !scenario.events.some(event => event.id === 'slow') ? [{ id: 'segment-slow', kind: 'traffic', distanceKm: 4, title: `Lentidão entre km ${slow.from} e ${slow.to}`, detail: slow.reason, severity: 'warning' }] : [])
  ];

  return <>
    <button className="back" onClick={() => setScreen('home')}><ArrowLeft size={20}/> Início</button>
    <Header eyebrow="SUA VIAGEM" title="Alertas" />
    <section className="alerts-summary">
      <Bell size={22}/>
      <div><strong>{alerts.length ? `${alerts.length} ${alerts.length === 1 ? 'alerta relevante' : 'alertas relevantes'}` : 'Tudo tranquilo por aqui'}</strong><p>{roadData.currentRoad} · sentido {journeyContext.direction} · operação {scenario.operation}</p></div>
    </section>
    <div className="event-list alerts-list">
      {alerts.length ? alerts.map(event => <article key={event.id} className={`event ${event.severity}`}>
        <span className="event-icon">{event.severity === 'critical' ? <TriangleAlert/> : event.kind === 'toll' ? <CreditCard/> : <TrafficCone/>}</span>
        <div><strong>{event.distanceKm} km · {event.title}</strong><p>{event.detail}</p></div>
      </article>) : <article className="empty-state"><Check/><div><strong>Nenhuma ocorrência importante</strong><p>Você será avisado quando houver algo relevante para o seu trajeto.</p></div></article>}
    </div>
    <button className="primary full" onClick={() => setScreen('journey')}><Navigation size={18}/> Ver Assistente de viagem</button>
  </>;
}

function Tolls({ tollHistory, autoPay, setAutoPay, tollNotice }) {
  const total = tollHistory.reduce((sum, item) => sum + item.amount, 0);
  return <>
    <Header title="Pedágios" eyebrow="PAGAMENTOS" />
    {tollNotice && <section className="payment-success"><Check/><div><span>Pedágio processado</span><strong>{money(tollNotice.amount)}</strong><small>{tollNotice.plaza}</small></div></section>}
    <section className="payment-card">
      <div><span>Pagamento automático</span><h2>{autoPay ? 'Ativo' : 'Desativado'}</h2><p>Tag conectada à sua forma principal de pagamento</p></div>
      <button className={`toggle ${autoPay ? 'on' : ''}`} onClick={() => setAutoPay(value => !value)}><span/></button>
      <button className="secondary-action"><WalletCards size={17}/> Gerenciar meios</button>
    </section>
    <h3 className="section-title">Este mês</h3>
    <article className="metric-card"><span>Total em pedágios</span><strong>{money(total)}</strong><small>{tollHistory.length} passagens registradas</small></article>
    <div className="section-heading"><h3>Histórico recente</h3></div>
    <div className="history-list">{tollHistory.length ? tollHistory.map(item => <article key={item.id}><ReceiptText size={20}/><div><strong>{item.concession}</strong><small>{item.plaza}</small></div><b>{money(item.amount)}</b></article>) : <div className="empty-line">Nenhuma passagem registrada.</div>}</div>
  </>;
}

function Support({ supportRequest, setSupportRequest }) {
  const [selected, setSelected] = useState('breakdown');
  const start = () => setSupportRequest({ id: `SUP-${Date.now()}`, type: selected, status: 'Solicitação recebida', eta: '12 min', step: 1 });
  const progress = supportRequest?.step || 0;

  return <>
    <Header title="Apoio 24h" eyebrow="ASSISTÊNCIA" />
    <p className="lead">Se precisar, a Ecovias identifica o contexto da sua viagem para agilizar o atendimento.</p>
    <section className="location-card"><MapPin/><div><span>Localização atual</span><strong>{tenantConfig.concessionName}</strong><small>{roadData.currentRoad} · km {journeyContext.currentKm} · sentido {journeyContext.direction}</small></div></section>
    {!supportRequest ? <>
      <h3 className="section-title">Como podemos ajudar?</h3>
      <div className="support-grid">{supportOptions.map(option => <button key={option.id} className={selected === option.id ? 'selected' : ''} onClick={() => setSelected(option.id)}><Wrench size={20}/><strong>{option.label}</strong><small>{option.description}</small></button>)}</div>
      <button className="primary full" onClick={start}><LifeBuoy size={19}/> Solicitar atendimento</button>
    </> : <section className="request-card">
      <div className="success-icon"><Check/></div>
      <span>ATENDIMENTO EM ANDAMENTO</span>
      <h2>{supportRequest.status}</h2>
      <p>Previsão de chegada: <strong>{supportRequest.eta}</strong></p>
      <div className="progress-steps support-progress"><i className={progress >= 1 ? 'done' : ''}/><i className={progress >= 2 ? 'done' : ''}/><i className={progress >= 3 ? 'done' : ''}/></div>
      <div className="support-status-list">
        <span className={progress >= 1 ? 'done' : ''}>Solicitação recebida</span>
        <span className={progress >= 2 ? 'done' : ''}>Equipe acionada</span>
        <span className={progress >= 3 ? 'done' : ''}>Equipe a caminho</span>
      </div>
      <button className="secondary-action" onClick={() => setSupportRequest(null)}>Encerrar atendimento</button>
    </section>}
  </>;
}

function Services({ services }) {
  const [filter, setFilter] = useState('all');
  const visible = services.filter(service => filter === 'all' || service.type === filter).sort((a, b) => a.distanceKm - b.distanceKm);
  const tabs = [['all', 'Todos'], ['fuel', 'Postos'], ['support', 'Apoio'], ['food', 'Alimentação'], ['rest', 'Descanso']];
  return <>
    <Header title="Serviços próximos" eyebrow="NA SUA ROTA" />
    <div className="search-static"><Search size={19}/><span>O que você procura?</span></div>
    <div className="filter-row">{tabs.map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
    <h3 className="section-title">Mais perto de você</h3>
    <div className="service-list">{visible.map(item => <article key={item.id}><div><span>{item.type === 'fuel' ? 'POSTO' : item.type === 'support' ? 'APOIO' : item.type === 'food' ? 'ALIMENTAÇÃO' : 'DESCANSO'}</span><h2>{item.name}</h2><strong>{item.distanceKm} km</strong><small>{[item.open24h && '24h', item.restroom && 'Banheiro', item.accessible && 'Acessível'].filter(Boolean).join(' · ')}</small></div><button aria-label={`Traçar rota para ${item.name}`}><Navigation size={20}/></button></article>)}</div>
  </>;
}

function Account({ autoPay }) {
  const rows = [
    ['Meu veículo', 'SUV · final 8342', CarFront],
    ['Tag conectada', autoPay ? 'Ativa para pedágios' : 'Pagamento automático desligado', CreditCard],
    ['Forma de pagamento', 'Principal configurada', WalletCards],
    ['Preferências', 'Alertas e permissões', Bell]
  ];
  return <>
    <Header title="Minha Ecovias" eyebrow="CONTA" />
    <section className="account-hero"><span>TUDO CONFIGURADO</span><h2>Pronto para a próxima viagem.</h2><p>Veículo, tag e preferências conectados.</p></section>
    <h3 className="section-title">Seus dados</h3>
    <div className="account-list">{rows.map(([title, subtitle, Icon]) => <button key={title}><Icon size={20}/><div><strong>{title}</strong><small>{subtitle}</small></div><ChevronRight size={18}/></button>)}</div>
    <button className="history-card"><ReceiptText size={20}/><div><strong>Histórico e comprovantes</strong><small>Consulte suas passagens e registros recentes.</small></div></button>
  </>;
}

function DemoPanel({ scenarioId, setScenarioId, autoPay, setAutoPay, setTollHistory, setTollNotice, supportRequest, setSupportRequest }) {
  const [open, setOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 760 : true);
  const passToll = () => {
    const item = { id: `toll-${Date.now()}`, concession: tenantConfig.concessionName, plaza: 'Pedágio Ecovias', amount: 33.8, date: new Date().toISOString(), source: 'prototype' };
    setTollHistory(history => [item, ...history]);
    setTollNotice(item);
  };
  return <aside className={`demo-panel ${open ? '' : 'collapsed'}`}>
    <button className="demo-toggle" onClick={() => setOpen(value => !value)}>{open ? <X size={18}/> : <Sparkles size={18}/>}</button>
    {open && <>
      <span className="eyebrow">MODO APRESENTAÇÃO</span><h2>Controle da demo</h2><p>Use estes controles durante a reunião. Eles ficam fora da experiência principal do app.</p>
      <label>Cenário da viagem</label>
      <select value={scenarioId} onChange={event => setScenarioId(event.target.value)}>{Object.values(scenarios).map(scenario => <option value={scenario.id} key={scenario.id}>{scenario.label}</option>)}</select>
      <small>{scenarios[scenarioId].description}</small>
      <div className="demo-actions"><button onClick={passToll} disabled={!autoPay}><CreditCard size={17}/> Simular pedágio</button><button onClick={() => setAutoPay(value => !value)}><WalletCards size={17}/> {autoPay ? 'Desligar' : 'Ativar'} pagamento</button><button onClick={() => setSupportRequest(null)} disabled={!supportRequest}><LifeBuoy size={17}/> Resetar apoio</button></div>
      <div className="legend"><span><i className="dot doc"/> Fonte documental</span><span><i className="dot sim"/> Simulado</span></div>
      <details><summary>Fontes e limites</summary><p><b>Operação:</b> {sourceNotes.operational}</p><p><b>Limite:</b> dados sem API oficial disponível nesta versão são simulados e marcados no código.</p></details>
    </>}
  </aside>;
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [scenarioId, setScenarioId] = useState('idle');
  const [autoPay, setAutoPay] = useState(true);
  const [tollHistory, setTollHistory] = useState(baseTolls);
  const [tollNotice, setTollNotice] = useState(null);
  const [supportRequest, setSupportRequest] = useState(null);
  const scenario = scenarios[scenarioId];
  const services = baseServices;

  useEffect(() => {
    if (!tollNotice) return undefined;
    const timer = window.setTimeout(() => setTollNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [tollNotice]);

  useEffect(() => {
    if (!supportRequest || supportRequest.step >= 3) return undefined;
    const next = supportRequest.step + 1;
    const statuses = { 2: 'Equipe acionada', 3: 'Equipe a caminho' };
    const timer = window.setTimeout(() => {
      setSupportRequest(current => current ? { ...current, step: next, status: statuses[next] } : current);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [supportRequest?.step]);

  const content = useMemo(() => ({
    home: <Home {...{ setScreen, scenario, setScenarioId, tollHistory, services, autoPay }} />,
    journey: <Journey {...{ setScreen, scenario }} />,
    alerts: <Alerts {...{ setScreen, scenario }} />,
    tolls: <Tolls {...{ tollHistory, autoPay, setAutoPay, tollNotice }} />,
    support: <Support {...{ supportRequest, setSupportRequest }} />,
    services: <Services services={services} />,
    account: <Account autoPay={autoPay} />
  }), [screen, scenarioId, autoPay, tollHistory, tollNotice, supportRequest]);

  return <div className="app-shell" style={{ '--brand': tenantConfig.theme.brand, '--dark': tenantConfig.theme.brandDark, '--accent': tenantConfig.theme.accent, '--bg': tenantConfig.theme.background }}>
    <DemoPanel {...{ scenarioId, setScenarioId, autoPay, setAutoPay, setTollHistory, setTollNotice, supportRequest, setSupportRequest }} />
    <div className="device-wrap">
      <Screen screen={screen} setScreen={setScreen}>{content[screen]}</Screen>
      {tollNotice && <div className="app-toast" aria-live="polite"><span className="toast-check"><Check size={18}/></span><div><strong>Pedágio processado</strong><small>{money(tollNotice.amount)} · pagamento automático</small></div></div>}
    </div>
    <div className="desktop-story"><span className="eyebrow">SÍRIUS MOBILITY PLATFORM · TENANT ECOVIAS</span><h2>Um core, múltiplas concessões.</h2><p>Este build valida a arquitetura funcional white-label. A camada visual definitiva pode ser aplicada por concessão depois da validação do produto.</p><div className="capabilities"><span>IA</span><span>Assistente de Viagem</span><span>Pedágios</span><span>Apoio</span><span>Serviços</span></div></div>
  </div>;
}
