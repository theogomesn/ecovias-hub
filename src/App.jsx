import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Bell, CarFront, Check, ChevronRight,
  CreditCard, LifeBuoy, MapPin, Menu, Navigation, ReceiptText,
  Search, Sparkles, TrafficCone, TriangleAlert, Volume2, WalletCards, Wrench, X
} from 'lucide-react';
import Screen from './components/Screen';
import { tenantConfig } from './tenants/ecorodovias/config';
import microphoneIcon from './tenants/ecorodovias/icons/microphone.svg';
import sendIcon from './tenants/ecorodovias/icons/send.svg';
import volumeIcon from './tenants/ecorodovias/icons/volume.svg';
import closeIcon from './tenants/ecorodovias/icons/close.svg';
import { journeyContext, roadData, services as baseServices, tolls as baseTolls, supportOptions, sourceNotes } from './tenants/ecorodovias/data';
import { scenarios } from './demo/scenarios';
import { answerAssistant } from './core/assistant';
import './styles.css';

const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusLabel = status => ({ normal: 'Normal', slow: 'Lentidão', congested: 'Congestionamento' }[status] || 'Atenção');

function pickBrazilianVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const ptBr = voices.filter(voice => String(voice.lang || '').toLowerCase().replace('_', '-').startsWith('pt-br'));
  const preferredFemaleNames = /(luciana|francisca|maria|camila|let[ií]cia|helena|bruna|feminina|female)/i;
  return ptBr.find(voice => preferredFemaleNames.test(voice.name)) || ptBr[0] || voices.find(voice => String(voice.lang || '').toLowerCase().startsWith('pt')) || null;
}

function speakText(text, callbacks = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const { onStart, onEnd, onError } = callbacks;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 0.96;
  utterance.pitch = 1.04;
  const voice = pickBrazilianVoice();
  if (voice) utterance.voice = voice;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => {
    onError?.();
    onEnd?.();
  };
  window.speechSynthesis.speak(utterance);
  return utterance;
}

function Header({ eyebrow, title, action }) {
  return <header className="page-header">
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <div className="header-line"><h1>{title}</h1>{action}</div>
  </header>;
}

const FIGMA_ICONS = {
  profile: 'https://www.figma.com/api/mcp/asset/c4ac79b3-6f78-411e-9ada-e50d07ded6fd.svg',
  menu: 'https://www.figma.com/api/mcp/asset/7225c279-9f84-4ed8-b31a-a2492872f87c.svg'
};

function ExactIcon({ src, fallback, className = '' }) {
  return <span className={`exact-icon ${className}`}>
    <img src={src} alt="" onError={event => {
      event.currentTarget.style.display = 'none';
      event.currentTarget.nextElementSibling?.removeAttribute('hidden');
    }}/>
    <span hidden className="exact-icon-fallback">{fallback}</span>
  </span>;
}

function LocalIcon({ src, className = '' }) {
  return <span className={`exact-icon ${className}`} aria-hidden="true"><img src={src} alt="" /></span>;
}

function SendIcon() {
  return <span className="send-icon-stack" aria-hidden="true"><img src={sendIcon} alt="" /></span>;
}


function AssistantComposer({ scenario, tollHistory, services, autoPay, setScreen, initialQuestion = '', onAgentStateChange = () => {}, onVoiceLevelChange = () => {} }) {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [answer, setAnswer] = useState(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const meterDataRef = useRef(null);
  const smoothedLevelRef = useRef(0);
  const lastReportedLevelRef = useRef(0);
  const voiceResultPendingRef = useRef(false);
  const speechSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const suggestions = [
    'Preciso de ajuda',
    'Onde tem banheiro mais próximo?',
    'Quanto falta para o pedágio?',
    'Qual posto mais próximo?',
    'Como está a pista?'
  ];

  const stopAudioMeter = ({ keepAgentState = false } = {}) => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    mediaStreamRef.current?.getTracks?.().forEach(track => track.stop());
    mediaStreamRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    meterDataRef.current = null;
    smoothedLevelRef.current = 0;
    lastReportedLevelRef.current = 0;
    onVoiceLevelChange(0);
    if (!keepAgentState) onAgentStateChange('idle');
  };

  const startAudioMeter = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        stream.getTracks().forEach(track => track.stop());
        return false;
      }
      const context = new AudioContextClass();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      mediaStreamRef.current = stream;
      audioContextRef.current = context;
      analyserRef.current = analyser;
      meterDataRef.current = new Uint8Array(analyser.fftSize);

      const tick = () => {
        const data = meterDataRef.current;
        if (!analyserRef.current || !data) return;
        analyserRef.current.getByteTimeDomainData(data);
        let sumSquares = 0;
        for (let index = 0; index < data.length; index += 1) {
          const sample = (data[index] - 128) / 128;
          sumSquares += sample * sample;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        const normalized = Math.max(0, Math.min(1, (rms - 0.018) / 0.15));
        const smoothed = smoothedLevelRef.current * 0.72 + normalized * 0.28;
        smoothedLevelRef.current = smoothed;
        if (Math.abs(smoothed - lastReportedLevelRef.current) > 0.012 || smoothed === 0) {
          lastReportedLevelRef.current = smoothed;
          onVoiceLevelChange(smoothed);
        }
        onAgentStateChange(smoothed > 0.07 ? 'speaking' : 'listening');
        animationFrameRef.current = window.requestAnimationFrame(tick);
      };
      tick();
      return true;
    } catch {
      return false;
    }
  };

  const ask = (value = query) => {
    if (!value.trim()) return;
    const response = answerAssistant(value, { services, road: roadData, scenario, tollHistory, autoPay, journey: journeyContext });
    setAnswer({ ...response, question: value });
    setQuery('');
    onAgentStateChange('idle');
    onVoiceLevelChange(0);
  };

  useEffect(() => {
    if (initialQuestion) ask(initialQuestion);
  }, [initialQuestion]);

  useEffect(() => () => {
    stopAudioMeter();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const startVoice = async () => {
    if (!speechSupported || listening) return;
    voiceResultPendingRef.current = false;
    onAgentStateChange('listening');
    await startAudioMeter();
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setListening(true);
      onAgentStateChange('listening');
    };
    recognition.onend = () => {
      setListening(false);
      stopAudioMeter({ keepAgentState: voiceResultPendingRef.current });
      if (!voiceResultPendingRef.current) onAgentStateChange('idle');
    };
    recognition.onerror = () => {
      voiceResultPendingRef.current = false;
      setListening(false);
      stopAudioMeter();
    };
    recognition.onresult = event => {
      const result = event.results?.[event.results.length - 1];
      const spoken = result?.[0]?.transcript || '';
      setQuery(spoken);
      if (!result?.isFinal || !spoken.trim()) return;
      voiceResultPendingRef.current = true;
      setListening(false);
      stopAudioMeter({ keepAgentState: true });
      onAgentStateChange('processing');
      window.setTimeout(() => {
        ask(spoken);
        voiceResultPendingRef.current = false;
      }, 420);
    };
    try {
      recognition.start();
    } catch {
      setListening(false);
      stopAudioMeter();
    }
  };

  const closeAnswer = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    onAgentStateChange('idle');
    setAnswer(null);
  };
  const runAction = () => {
    if (!answer?.action?.target) return;
    const target = answer.action.target;
    closeAnswer();
    setScreen(target);
  };
  const spokenAnswer = answer ? [answer.title, answer.answer, answer.detail].filter(Boolean).join('. ') : '';
  const isAction = answer?.kind === 'action';
  const hearResponse = () => speakText(spokenAnswer, {
    onStart: () => onAgentStateChange('responding'),
    onEnd: () => onAgentStateChange('idle'),
    onError: () => onAgentStateChange('idle')
  });

  return <>
    <div className="assistant-composer-wrap">
      <div className="home-composer" role="search">
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => event.key === 'Enter' && ask()}
          placeholder={listening ? 'Estou ouvindo...' : `Pergunte à ${tenantConfig.shortName}`}
          aria-label={`Pergunte à ${tenantConfig.shortName}`}
        />
        <div className="composer-buttons">
          <button
            className={`home-voice ${listening ? 'listening' : ''}`}
            onClick={startVoice}
            disabled={!speechSupported}
            aria-label={speechSupported ? (listening ? 'Ouvindo sua voz' : 'Perguntar por voz') : 'Entrada por voz não disponível'}
          ><LocalIcon src={microphoneIcon} /></button>
          <button className="home-send" onClick={() => ask()} aria-label="Enviar pergunta"><SendIcon /></button>
        </div>
      </div>
      <div className="assistant-suggestions" aria-label="Sugestões de perguntas">
        {suggestions.map(item => <button key={item} onClick={() => ask(item)}>{item}</button>)}
      </div>
    </div>

    {answer && <div className="assistant-modal-layer" role="dialog" aria-modal="true" aria-label="Resposta do Assistente Ecovias">
      <div className="assistant-modal-overlay" onClick={closeAnswer} />
      <div className="assistant-modal-dialog">
        <section className={`assistant-answer-modal ${isAction ? 'action' : 'information'}`} aria-live="polite">
          <p className="assistant-modal-question">{answer.question}</p>
          {isAction ? <>
            <h2>{answer.title}</h2>
            <p className="assistant-action-body">{answer.answer}</p>
            {answer.detail && <p className="assistant-modal-detail">{answer.detail}</p>}
            <button className="assistant-primary-action" onClick={runAction}>{answer.action?.label || 'Continuar'}</button>
          </> : <>
            <h2>{answer.answer}</h2>
            {answer.detail && <p className="assistant-modal-detail">{answer.detail}</p>}
            <button className="assistant-listen-button" onClick={hearResponse}>
              <LocalIcon src={volumeIcon} />
              <span>Ouvir resposta</span>
            </button>
            {answer.action && <button className="assistant-context-action" onClick={runAction}>{answer.action.label}</button>}
          </>}
        </section>
        <button className="assistant-modal-close" onClick={closeAnswer} aria-label="Fechar resposta">
          <LocalIcon src={closeIcon} />
        </button>
      </div>
    </div>}
  </>;
}

function AppHeader({ setScreen }) {
  return <header className="assistant-header">
    <button className="header-circle" onClick={() => setScreen('account')} aria-label="Abrir minha Ecovias">
      <ExactIcon src={FIGMA_ICONS.profile} fallback={<CarFront size={22}/>} />
    </button>
    <img className="assistant-brand-logo" src={tenantConfig.brandAssets.concessionLogo} alt={tenantConfig.concessionName} />
    <button className="header-circle" aria-label="Abrir menu">
      <ExactIcon src={FIGMA_ICONS.menu} fallback={<Menu size={22}/>} />
    </button>
  </header>;
}

function JourneyAssistantCard({ assistantEnabled, inConcession, startJourney, setScreen }) {
  if (!assistantEnabled) return <section className="journey-assistant-card-v6 inactive">
    <div className="journey-card-label-v6"><span>ASSISTENTE DE VIAGEM</span><b>INATIVO</b></div>
    <h2>O assistente de viagem está desativado.</h2>
    <p>Ative para receber alertas oficiais durante seu trajeto pelas concessões EcoRodovias.</p>
    <button className="journey-primary-button" onClick={() => setScreen('permissions')}>Ativar o assistente</button>
  </section>;

  return <section className="journey-assistant-card-v6 active">
    <div className="journey-card-label-v6"><span>ASSISTENTE DE VIAGEM</span><b>ATIVO</b></div>
    <h2>{inConcession ? <>Você está na<br/>{tenantConfig.concessionName}</> : 'Assistente pronto para a próxima viagem'}</h2>
    <p>{inConcession
      ? 'Receba alertas oficiais atualizados pela central de controle durante seu trajeto pela rodovia.'
      : 'O assistente será ativado automaticamente quando sua viagem entrar em uma concessão EcoRodovias.'}</p>
    <button className="journey-outline-button" onClick={startJourney}>Abrir modo viagem</button>
  </section>;
}

function Home({ setScreen, scenario, setScenarioId, tollHistory, services, autoPay, assistantEnabled, initialQuestion = '' }) {
  const [agentState, setAgentState] = useState('idle');
  const [voiceLevel, setVoiceLevel] = useState(0);
  const haloScale = 1.035 + voiceLevel * 0.115;
  const haloOpacity = 0.14 + voiceLevel * 0.52;
  const haloBlur = 14 + voiceLevel * 26;

  const startJourney = () => {
    if (!assistantEnabled) {
      setScreen('permissions');
      return;
    }
    if (!scenario.journeyActive) setScenarioId('normal');
    setScreen('journey');
  };

  const inConcession = assistantEnabled && scenario.journeyActive;

  return <div className="assistant-home-screen">
    <AppHeader setScreen={setScreen} />
    <div
      className={`ai-agent-wrap-v6 agent-${agentState}`}
      style={{ '--halo-scale': haloScale, '--halo-opacity': haloOpacity, '--halo-blur': `${haloBlur}px` }}
      aria-hidden="true"
    >
      <span className="ai-agent-halo halo-outer" />
      <span className="ai-agent-halo halo-inner" />
      <span className="ai-agent-core"><img src={tenantConfig.brandAssets.aiAgent} alt="" /></span>
    </div>
    <h1 className="hero-title-v6">Como podemos ajudar<br/>na sua viagem?</h1>
    <AssistantComposer
      {...{ scenario, tollHistory, services, autoPay, setScreen }}
      initialQuestion={initialQuestion}
      onAgentStateChange={setAgentState}
      onVoiceLevelChange={setVoiceLevel}
    />
    <JourneyAssistantCard {...{ assistantEnabled, inConcession, startJourney, setScreen }} />
  </div>;
}

function Journey({ setScreen, scenario }) {
  const segments = roadData.snapshots?.[scenario.trafficSnapshot] || roadData.snapshots.normal;
  const alertSegment = segments.find(segment => segment.status === 'congested') || segments.find(segment => segment.status === 'slow');
  const trafficTone = alertSegment?.status === 'congested' ? 'red' : alertSegment?.status === 'slow' ? 'orange' : 'green';
  const trafficText = alertSegment
    ? `${statusLabel(alertSegment.status)} entre os km ${alertSegment.from} e ${alertSegment.to}`
    : `Normal até o km ${Math.round(segments[segments.length - 1]?.to || 65)}`;
  const trafficDetail = alertSegment?.reason || 'Fluxo normal no trecho monitorado';
  const sortedEvents = [...(scenario.events || [])].sort((a, b) => a.distanceKm - b.distanceKm);

  const hearEvent = event => speakText(`Atenção. ${event.title}. ${event.detail}.`);

  return <>
    <button className="back" onClick={() => setScreen('home')}><ArrowLeft size={20}/> Assistente</button>
    <section className="road-hero compact">
      <span className="eyebrow on-dark">{tenantConfig.concessionName.toUpperCase()}</span><span className="trip-pill">EM VIAGEM</span>
      <h1>Assistente de viagem ativo</h1>
      <p>{roadData.currentRoad} · sentido {journeyContext.direction}</p>
    </section>

    <section className={`traffic-status-card ${trafficTone}`}>
      <div><span>CONDIÇÃO DE TRÂNSITO</span><strong>{trafficText}</strong><small>{trafficDetail}</small></div>
      <button onClick={() => speakText(`Condição de trânsito. ${trafficText}. ${trafficDetail}.`)}><Volume2 size={18}/> Ouvir condição</button>
    </section>

    <div className="journey-metrics">
      <article><span>OPERAÇÃO DE FAIXAS</span><strong>{scenario.operation}</strong><small>{scenario.operation === '5x5' ? '5 faixas em cada sentido' : 'Configuração operacional atual'}</small></article>
      <article><span>PREVISÃO DE VIAGEM</span><strong>{scenario.travelTime || '52 min'}</strong><small>Até {journeyContext.destination}</small></article>
      <article><span>PISTA</span><strong>{scenario.surface || 'Seca'}</strong><small>{scenario.visibility || 'Boa visibilidade'}</small></article>
    </div>

    <h3 className="section-title">Condição por trecho</h3>
    <div className="road-segments route-view">{segments.map((segment, index) => <div key={index} className={segment.status}>
      <i aria-hidden="true"/>
      <div><span>km {segment.from} a {segment.to}</span><strong>{statusLabel(segment.status)}</strong>{segment.reason && <small>{segment.reason}</small>}</div>
    </div>)}</div>

    <h3 className="section-title">Próximos eventos na sua rota</h3>
    <div className="event-list">
      {sortedEvents.length ? sortedEvents.map(event => <article key={event.id} className={`event ${event.severity}`}>
        <span className="event-icon">{event.severity === 'critical' ? <TriangleAlert/> : event.kind === 'toll' ? <CreditCard/> : <TrafficCone/>}</span>
        <div className="event-copy"><strong>{event.distanceKm} km · {event.title}</strong><p>{event.detail}</p><button className="listen-alert" onClick={() => hearEvent(event)}><Volume2 size={15}/> Ouvir alerta</button></div>
      </article>) : <article className="empty-state"><Check/><div><strong>Nenhum evento crítico</strong><p>O assistente continua acompanhando sua viagem.</p></div></article>}
    </div>
  </>;
}

function Alerts({ setScreen, scenario }) {
  const segments = roadData.snapshots?.[scenario.trafficSnapshot] || roadData.snapshots.normal;
  const alertSegment = segments.find(segment => segment.status === 'congested') || segments.find(segment => segment.status === 'slow');
  const alerts = [
    ...(scenario.events || []),
    ...(alertSegment && !scenario.events.some(event => event.id === 'slow' || event.id === 'congestion') ? [{ id: 'segment-alert', kind: 'traffic', distanceKm: 4, title: `${statusLabel(alertSegment.status)} entre km ${alertSegment.from} e ${alertSegment.to}`, detail: alertSegment.reason, severity: alertSegment.status === 'congested' ? 'critical' : 'warning' }] : [])
  ].sort((a, b) => a.distanceKm - b.distanceKm);

  return <>
    <button className="back" onClick={() => setScreen('home')}><ArrowLeft size={20}/> Assistente</button>
    <Header eyebrow="SUA VIAGEM" title="Alertas" />
    <section className="alerts-summary">
      <Bell size={22}/>
      <div><strong>{alerts.length ? `${alerts.length} ${alerts.length === 1 ? 'alerta relevante' : 'alertas relevantes'}` : 'Tudo tranquilo por aqui'}</strong><p>{roadData.currentRoad} · sentido {journeyContext.direction} · operação {scenario.operation}</p></div>
    </section>
    <div className="event-list alerts-list">
      {alerts.length ? alerts.map(event => <article key={event.id} className={`event ${event.severity}`}>
        <span className="event-icon">{event.severity === 'critical' ? <TriangleAlert/> : event.kind === 'toll' ? <CreditCard/> : <TrafficCone/>}</span>
        <div className="event-copy"><strong>{event.distanceKm} km · {event.title}</strong><p>{event.detail}</p><button className="listen-alert" onClick={() => speakText(`Atenção. ${event.title}. ${event.detail}.`)}><Volume2 size={15}/> Ouvir alerta</button></div>
      </article>) : <article className="empty-state"><Check/><div><strong>Nenhuma ocorrência importante</strong><p>Você será avisado quando houver algo relevante para o seu trajeto.</p></div></article>}
    </div>
    <button className="primary full" onClick={() => setScreen('journey')}><Navigation size={18}/> Ver Assistente de viagem</button>
  </>;
}

function Permissions({ permissions, setPermissions, setAssistantEnabled, setScenarioId, setScreen }) {
  const items = [
    ['location', MapPin, 'Localização durante a viagem', 'Permite reconhecer a rodovia e o trecho para contextualizar os alertas.'],
    ['notifications', Bell, 'Notificações', 'Exibe avisos operacionais, condições da rodovia e informações de apoio.'],
    ['autoActivation', Navigation, 'Ativação nas concessões', 'O assistente entra em modo ativo automaticamente quando a viagem chega a uma área EcoRodovias.']
  ];
  const ready = Object.values(permissions).every(Boolean);
  const confirm = () => {
    if (!ready) return;
    setAssistantEnabled(true);
    setScenarioId('normal');
    setScreen('home');
  };

  return <>
    <button className="back permissions-back" onClick={() => setScreen('home')}><ArrowLeft size={20}/> Configuração inicial</button>
    <Header title="Ative o assistente" />
    <p className="permissions-lead">Você escolhe quais recursos autorizar. Eles permitem contextualizar a viagem e entregar alertas relevantes quando estiver em uma concessão EcoRodovias.</p>
    <div className="permission-list">{items.map(([id, Icon, title, description]) => <article key={id}>
      <span className="permission-icon"><Icon size={24}/></span>
      <div><strong>{title}</strong><p>{description}</p><b>{permissions[id] ? 'Ativo' : 'Inativo'}</b></div>
      <button className={`toggle ${permissions[id] ? 'on' : ''}`} onClick={() => setPermissions(current => ({ ...current, [id]: !current[id] }))} aria-label={`${permissions[id] ? 'Desativar' : 'Ativar'} ${title}`}><span/></button>
    </article>)}</div>
    <p className="permissions-note">Você pode revisar essas permissões a qualquer momento nas configurações do app e do aparelho.</p>
    <button className="primary full permission-confirm" disabled={!ready} onClick={confirm}>Confirmar permissões</button>
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

function DemoPanel({ scenarioId, setScenarioId, autoPay, setAutoPay, setTollHistory, setTollNotice, supportRequest, setSupportRequest, assistantEnabled, setAssistantEnabled, setPermissions }) {
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
      <div className="demo-actions"><button onClick={passToll} disabled={!autoPay}><CreditCard size={17}/> Simular pedágio</button><button onClick={() => setAutoPay(value => !value)}><WalletCards size={17}/> {autoPay ? 'Desligar' : 'Ativar'} pagamento</button><button onClick={() => { const next = !assistantEnabled; setAssistantEnabled(next); setPermissions({ location: next, notifications: next, autoActivation: next }); }}><Navigation size={17}/> {assistantEnabled ? 'Desativar' : 'Ativar'} assistente</button><button onClick={() => setSupportRequest(null)} disabled={!supportRequest}><LifeBuoy size={17}/> Resetar apoio</button></div>
      <div className="legend"><span><i className="dot doc"/> Fonte documental</span><span><i className="dot sim"/> Simulado</span></div>
      <details><summary>Fontes e limites</summary><p><b>Operação:</b> {sourceNotes.operational}</p><p><b>Limite:</b> dados sem API oficial disponível nesta versão são simulados e marcados no código.</p></details>
    </>}
  </aside>;
}

export default function App() {
  const figmaPreset = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('figma') : null;
  const preset = (() => {
    const base = { screen: 'home', scenarioId: 'normal', assistantEnabled: true, initialQuestion: '', tollNotice: null, supportRequest: null };
    if (!figmaPreset) return base;
    const tollItem = { id: 'figma-toll', concession: tenantConfig.concessionName, plaza: 'Pedágio Ecovias', amount: 33.8, date: new Date().toISOString(), source: 'prototype' };
    const map = {
      'home-active': {},
      'home-inactive': { assistantEnabled: false },
      'home-answer': { initialQuestion: 'Onde tem banheiro mais próximo?' },
      'permissions': { screen: 'permissions', assistantEnabled: false },
      'journey-normal': { screen: 'journey', scenarioId: 'normal' },
      'journey-slow': { screen: 'journey', scenarioId: 'slow' },
      'journey-congested': { screen: 'journey', scenarioId: 'congested' },
      'alerts': { screen: 'alerts', scenarioId: 'slow' },
      'services': { screen: 'services' },
      'tolls': { screen: 'tolls' },
      'toll-success': { screen: 'tolls', tollNotice: tollItem },
      'support': { screen: 'support' },
      'support-received': { screen: 'support', supportRequest: { id: 'SUP-FIGMA', type: 'breakdown', status: 'Solicitação recebida', eta: '12 min', step: 1 } },
      'support-on-route': { screen: 'support', supportRequest: { id: 'SUP-FIGMA', type: 'breakdown', status: 'Equipe a caminho', eta: '6 min', step: 3 } },
      'account': { screen: 'account' }
    };
    return { ...base, ...(map[figmaPreset] || {}) };
  })();

  const [screen, setScreen] = useState(preset.screen);
  const [scenarioId, setScenarioId] = useState(preset.scenarioId);
  const [autoPay, setAutoPay] = useState(true);
  const [tollHistory, setTollHistory] = useState(baseTolls);
  const [tollNotice, setTollNotice] = useState(preset.tollNotice);
  const [supportRequest, setSupportRequest] = useState(preset.supportRequest);
  const [assistantEnabled, setAssistantEnabled] = useState(preset.assistantEnabled);
  const [permissions, setPermissions] = useState({ location: preset.assistantEnabled, notifications: preset.assistantEnabled, autoActivation: preset.assistantEnabled });
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
    home: <Home {...{ setScreen, scenario, setScenarioId, tollHistory, services, autoPay, assistantEnabled }} initialQuestion={preset.initialQuestion} />,
    journey: <Journey {...{ setScreen, scenario }} />,
    alerts: <Alerts {...{ setScreen, scenario }} />,
    permissions: <Permissions {...{ permissions, setPermissions, setAssistantEnabled, setScenarioId, setScreen }} /> ,
    tolls: <Tolls {...{ tollHistory, autoPay, setAutoPay, tollNotice }} />,
    support: <Support {...{ supportRequest, setSupportRequest }} />,
    services: <Services services={services} />,
    account: <Account autoPay={autoPay} />
  }), [screen, scenarioId, autoPay, tollHistory, tollNotice, supportRequest, assistantEnabled, permissions]);

  useEffect(() => {
    if (!figmaPreset) return undefined;
    document.documentElement.classList.add('figma-capture-page');
    return () => document.documentElement.classList.remove('figma-capture-page');
  }, [figmaPreset]);

  return <div className={`app-shell ${figmaPreset ? 'capture-mode' : ''}`} style={{ '--brand': tenantConfig.theme.brand, '--dark': tenantConfig.theme.brandDark, '--accent': tenantConfig.theme.accent, '--bg': tenantConfig.theme.background }}>
    <DemoPanel {...{ scenarioId, setScenarioId, autoPay, setAutoPay, setTollHistory, setTollNotice, supportRequest, setSupportRequest, assistantEnabled, setAssistantEnabled, setPermissions }} />
    <div className="device-wrap">
      <Screen screen={screen} setScreen={setScreen} noNav={screen === 'permissions'}>{content[screen]}</Screen>
      {tollNotice && <div className="app-toast" aria-live="polite"><span className="toast-check"><Check size={18}/></span><div><strong>Pedágio processado</strong><small>{money(tollNotice.amount)} · pagamento automático</small></div></div>}
    </div>
    <div className="desktop-story"><span className="eyebrow">SÍRIUS MOBILITY PLATFORM · TENANT ECOVIAS</span><h2>Um core, múltiplas concessões.</h2><p>Este build valida a arquitetura funcional white-label. A camada visual definitiva pode ser aplicada por concessão depois da validação do produto.</p><div className="capabilities"><span>IA</span><span>Assistente de Viagem</span><span>Pedágios</span><span>Apoio</span><span>Serviços</span></div></div>
  </div>;
}
