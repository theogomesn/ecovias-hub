const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function answerAssistant(query, context) {
  const q = normalize(query.trim());
  const { services, road, scenario, tollHistory, autoPay = true, journey } = context;
  const nearest = type => [...services].filter(item => item.type === type).sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const support = [...services].filter(item => item.type === 'support').sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const activeSegments = road.snapshots?.[scenario.trafficSnapshot] || road.snapshots?.normal || [];
  const slow = activeSegments.find(segment => segment.status === 'slow');

  if (!q) return null;

  if (q.includes('socorro') || q.includes('guincho') || q.includes('pane') || q.includes('pneu') || q.includes('bateria') || q.includes('ajuda')) {
    return {
      title: 'Apoio 24h',
      answer: `Posso abrir um atendimento usando sua localização atual na ${road.currentRoad}, sentido ${journey.direction}.`,
      action: { label: 'Solicitar apoio', target: 'support' },
      provenance: 'prototype'
    };
  }

  if (q.includes('banheiro') || q.includes('parar') || q.includes('apoio')) {
    const item = support;
    return {
      title: item ? `${item.name} mais próxima` : 'Ponto de apoio',
      answer: item ? `${item.name} a ${item.distanceKm} km. Atendimento 24h, banheiro e acessibilidade disponíveis.` : 'Não encontrei um ponto de apoio próximo neste trecho.',
      action: item ? { label: 'Ver em Serviços', target: 'services' } : null,
      provenance: item?.source || 'prototype'
    };
  }

  if (q.includes('posto') || q.includes('combustivel') || q.includes('gasolina')) {
    const item = nearest('fuel');
    return {
      title: 'Posto mais próximo',
      answer: item ? `${item.name} a ${item.distanceKm} km. ${item.open24h ? 'Aberto 24h.' : ''}` : 'Não encontrei um posto cadastrado próximo ao seu trajeto.',
      action: item ? { label: 'Ver em Serviços', target: 'services' } : null,
      provenance: item?.source || 'prototype'
    };
  }

  if ((q.includes('quanto falta') || q.includes('proximo') || q.includes('proxima')) && q.includes('pedagio')) {
    const tollEvent = scenario.events.find(event => event.kind === 'toll');
    return {
      title: 'Próximo pedágio',
      answer: tollEvent ? `O próximo pedágio está a ${tollEvent.distanceKm} km. Seu pagamento automático está ${autoPay ? 'ativo' : 'desativado'}.` : 'Não há pedágio próximo neste trecho da viagem.',
      action: { label: 'Abrir Pedágios', target: 'tolls' },
      provenance: 'prototype'
    };
  }

  if (q.includes('pedagio') || q.includes('pagar') || q.includes('gastei') || q.includes('historico')) {
    const total = tollHistory.reduce((sum, item) => sum + item.amount, 0);
    return {
      title: 'Pedágios',
      answer: `O pagamento automático está ${autoPay ? 'ativo' : 'desativado'}. Seu histórico atual soma ${money(total)}.`,
      action: { label: 'Abrir Pedágios', target: 'tolls' },
      provenance: 'prototype'
    };
  }

  if (q.includes('pista') || q.includes('anchieta') || q.includes('imigrantes') || q.includes('serra') || q.includes('transito')) {
    const activeEvent = scenario.events.find(event => event.kind !== 'toll');
    if (activeEvent) {
      return { title: 'Condição da viagem', answer: `${activeEvent.title}. ${activeEvent.detail}. Operação ${scenario.operation}.`, action: { label: 'Ver Assistente de viagem', target: 'journey' }, provenance: activeEvent.source };
    }
    return {
      title: 'Condição da via',
      answer: slow ? `Há lentidão entre os km ${slow.from} e ${slow.to}, por ${slow.reason.toLowerCase()}. A operação está em ${scenario.operation}.` : `Fluxo normal no trecho monitorado da ${road.currentRoad}. A operação está em ${scenario.operation}.`,
      action: { label: 'Ver Assistente de viagem', target: 'journey' },
      provenance: 'document'
    };
  }

  if (q.includes('comboio')) {
    return {
      title: 'Comboio',
      answer: scenario.id === 'convoy' ? 'Há comboio ativo na serra. Siga as orientações operacionais durante o percurso.' : 'Não há comboio ativo no seu trajeto agora.',
      action: { label: 'Ver Assistente de viagem', target: 'journey' },
      provenance: 'prototype'
    };
  }

  if (q.includes('tempo') || q.includes('santos') || q.includes('rota') || q.includes('litoral')) {
    return {
      title: 'Sua viagem',
      answer: `Você está no trajeto ${journey.origin} → ${journey.destination}, sentido ${journey.direction}. Posso acompanhar operação, condições da pista, pedágios e serviços durante o percurso.`,
      action: { label: 'Ver Assistente de viagem', target: 'journey' },
      provenance: 'prototype'
    };
  }

  return {
    title: 'Como posso ajudar na sua viagem?',
    answer: 'Você pode perguntar sobre trânsito, operação da rodovia, pedágios, postos, banheiro, pontos de apoio ou solicitar assistência.',
    action: null,
    provenance: 'prototype'
  };
}
