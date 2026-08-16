const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const distance = value => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });

export function answerAssistant(query, context) {
  const q = normalize(query.trim());
  const { services, road, scenario, tollHistory, autoPay = true, journey } = context;
  const nearest = type => [...services].filter(item => item.type === type).sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const support = [...services].filter(item => item.type === 'support').sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const activeSegments = road.snapshots?.[scenario.trafficSnapshot] || road.snapshots?.normal || [];
  const congested = activeSegments.find(segment => segment.status === 'congested');
  const slow = activeSegments.find(segment => segment.status === 'slow');

  if (!q) return null;

  if (q.includes('socorro') || q.includes('guincho') || q.includes('pane') || q.includes('pneu') || q.includes('bateria') || q.includes('ajuda')) {
    return {
      kind: 'action',
      title: 'Precisa de ajuda?',
      answer: `Podemos usar sua localização na ${road.currentRoad}, sentido ${journey.direction}, para agilizar o atendimento.`,
      detail: 'Apoio 24h.',
      action: { label: 'Solicitar atendimento', target: 'support' },
      provenance: 'prototype'
    };
  }

  if (q.includes('banheiro') || q.includes('parar') || q.includes('apoio')) {
    const item = support;
    return {
      kind: 'information',
      title: 'Banheiro mais próximo',
      answer: item ? `${item.name} a ${distance(item.distanceKm)} km.` : 'Não encontrei um ponto de apoio próximo.',
      detail: item ? 'Banheiro, acessibilidade e atendimento 24h.' : 'Consulte os serviços disponíveis na rota.',
      action: item ? { label: 'Ver em Serviços', target: 'services' } : null,
      provenance: item?.source || 'prototype'
    };
  }

  if (q.includes('posto') || q.includes('combustivel') || q.includes('gasolina')) {
    const item = nearest('fuel');
    return {
      kind: 'information',
      title: 'Posto mais próximo',
      answer: item ? `${item.name} a ${distance(item.distanceKm)} km.` : 'Não encontrei um posto próximo.',
      detail: item?.open24h ? 'Aberto 24h.' : 'Consulte os serviços disponíveis na rota.',
      action: item ? { label: 'Ver em Serviços', target: 'services' } : null,
      provenance: item?.source || 'prototype'
    };
  }

  if ((q.includes('quanto falta') || q.includes('proximo') || q.includes('proxima')) && q.includes('pedagio')) {
    const tollEvent = scenario.events.find(event => event.kind === 'toll');
    return {
      kind: 'information',
      title: 'Próximo pedágio',
      answer: tollEvent ? `Próximo pedágio a ${distance(tollEvent.distanceKm)} km.` : 'Não há pedágio próximo neste trecho.',
      detail: tollEvent ? `Pagamento automático ${autoPay ? 'ativo' : 'desativado'}.` : 'Continue acompanhando sua viagem.',
      action: { label: 'Abrir Pedágios', target: 'tolls' },
      provenance: 'prototype'
    };
  }

  if (q.includes('pedagio') || q.includes('pagar') || q.includes('gastei') || q.includes('historico')) {
    const total = tollHistory.reduce((sum, item) => sum + item.amount, 0);
    return {
      kind: 'information',
      title: 'Pedágios',
      answer: `Total de pedágios: ${money(total)}.`,
      detail: `Pagamento automático ${autoPay ? 'ativo' : 'desativado'}.`,
      action: { label: 'Abrir Pedágios', target: 'tolls' },
      provenance: 'prototype'
    };
  }

  if (q.includes('pista') || q.includes('anchieta') || q.includes('imigrantes') || q.includes('serra') || q.includes('transito')) {
    const activeEvent = scenario.events.find(event => event.kind === 'traffic' || event.kind === 'critical');
    if (activeEvent) {
      return {
        kind: 'information',
        title: 'Condição da via',
        answer: activeEvent.title.endsWith('.') ? activeEvent.title : `${activeEvent.title}.`,
        detail: `${activeEvent.detail}. Operação ${scenario.operation}.`,
        action: { label: 'Abrir modo viagem', target: 'journey' },
        provenance: activeEvent.source
      };
    }
    if (congested) {
      return {
        kind: 'information',
        title: 'Condição da via',
        answer: `Congestionamento entre os km ${congested.from} e ${congested.to}.`,
        detail: `${congested.reason}. Operação ${scenario.operation}.`,
        action: { label: 'Abrir modo viagem', target: 'journey' },
        provenance: congested.source
      };
    }
    if (slow) {
      return {
        kind: 'information',
        title: 'Condição da via',
        answer: `Lentidão entre os km ${slow.from} e ${slow.to}.`,
        detail: `${slow.reason}. Operação ${scenario.operation}.`,
        action: { label: 'Abrir modo viagem', target: 'journey' },
        provenance: slow.source
      };
    }
    return {
      kind: 'information',
      title: 'Condição da via',
      answer: `Trânsito normal na ${road.currentRoad}.`,
      detail: `Operação ${scenario.operation}.`,
      action: { label: 'Abrir modo viagem', target: 'journey' },
      provenance: 'document'
    };
  }

  if (q.includes('comboio')) {
    return {
      kind: 'information',
      title: 'Comboio',
      answer: scenario.id === 'convoy' ? 'Comboio ativo na serra.' : 'Não há comboio ativo agora.',
      detail: scenario.id === 'convoy' ? 'Siga as orientações operacionais durante o percurso.' : 'O assistente continua acompanhando sua rota.',
      action: { label: 'Abrir modo viagem', target: 'journey' },
      provenance: 'prototype'
    };
  }

  if (q.includes('tempo') || q.includes('santos') || q.includes('rota') || q.includes('litoral')) {
    return {
      kind: 'information',
      title: 'Sua viagem',
      answer: `${journey.origin} → ${journey.destination}.`,
      detail: `Sentido ${journey.direction}. Posso acompanhar operação, pista, pedágios e serviços.`,
      action: { label: 'Abrir modo viagem', target: 'journey' },
      provenance: 'prototype'
    };
  }

  return {
    kind: 'information',
    title: 'Como posso ajudar?',
    answer: 'Pergunte sobre sua viagem.',
    detail: 'Trânsito, pedágios, postos, banheiro, apoio e condições da via.',
    action: null,
    provenance: 'prototype'
  };
}
