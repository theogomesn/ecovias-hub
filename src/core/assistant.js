const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function answerAssistant(query, context) {
  const q = normalize(query.trim());
  const { services, road, scenario, tollHistory, autoPay = true } = context;
  const nearest = type => [...services].filter(item => item.type === type).sort((a,b) => a.distanceKm - b.distanceKm)[0];
  const support = [...services].filter(item => item.type === 'support').sort((a,b) => a.distanceKm - b.distanceKm)[0];
  const activeSegments = road.snapshots?.[scenario.trafficSnapshot] || road.snapshots?.normal || [];
  const slow = activeSegments.find(s => s.status === 'slow');

  if (!q) return null;

  if (q.includes('socorro') || q.includes('guincho') || q.includes('pane') || q.includes('pneu') || q.includes('bateria') || q.includes('ajuda')) {
    return {
      title: 'Apoio 24h',
      answer: 'Posso iniciar o fluxo de assistência já associado ao contexto da concessão. Nesta demonstração, localização e tempo de atendimento são simulados.',
      action: { label: 'Solicitar apoio', target: 'support' },
      provenance: 'prototype'
    };
  }

  if (q.includes('banheiro') || q.includes('parar') || q.includes('apoio')) {
    const item = support;
    return {
      title: item ? `${item.name} mais próxima` : 'Ponto de apoio',
      answer: item ? `Há uma ${item.name.toLowerCase()} demonstrativa a ${item.distanceKm} km. Ela está configurada no protótipo com banheiro, atendimento 24h e acessibilidade.` : 'Não há ponto cadastrado neste cenário.',
      action: item ? { label: 'Ver em Serviços', target: 'services' } : null,
      provenance: item?.source || 'prototype'
    };
  }

  if (q.includes('posto') || q.includes('combustivel') || q.includes('gasolina')) {
    const item = nearest('fuel');
    return {
      title: 'Posto mais próximo',
      answer: item ? `${item.name} a ${item.distanceKm} km neste cenário demonstrativo.` : 'Nenhum posto cadastrado.',
      action: item ? { label: 'Ver em Serviços', target: 'services' } : null,
      provenance: item?.source || 'prototype'
    };
  }

  if ((q.includes('quanto falta') || q.includes('proximo') || q.includes('proxima')) && q.includes('pedagio')) {
    const tollEvent = scenario.events.find(event => event.kind === 'toll');
    return {
      title: 'Próximo pedágio',
      answer: tollEvent ? `No cenário atual, o próximo pedágio está a ${tollEvent.distanceKm} km e o pagamento automático está ${autoPay ? 'ativo' : 'desativado'}.` : 'Este cenário não tem um pedágio próximo configurado.',
      action: { label: 'Abrir Pedágios', target: 'tolls' },
      provenance: 'prototype'
    };
  }

  if (q.includes('pedagio') || q.includes('pagar') || q.includes('gastei') || q.includes('historico')) {
    const total = tollHistory.reduce((sum, item) => sum + item.amount, 0);
    return {
      title: 'Pedágios',
      answer: `O pagamento automático está ${autoPay ? 'ativo' : 'desativado'} no protótipo. O histórico demonstrativo soma ${money(total)}.`,
      action: { label: 'Abrir Pedágios', target: 'tolls' },
      provenance: 'prototype'
    };
  }

  if (q.includes('pista') || q.includes('anchieta') || q.includes('imigrantes') || q.includes('serra') || q.includes('transito')) {
    const activeEvent = scenario.events.find(event => event.kind !== 'toll');
    if (activeEvent) {
      return { title: 'Condição da viagem', answer: `${activeEvent.title}. ${activeEvent.detail}. Operação ${scenario.operation}.`, action: { label: 'Abrir modo viagem', target: 'journey' }, provenance: activeEvent.source };
    }
    return {
      title: 'Condição da via',
      answer: slow ? `No snapshot analisado, a Anchieta no sentido São Paulo registrou lentidão do km ${slow.from} ao ${slow.to}, por ${slow.reason.toLowerCase()}. A operação observada era ${road.laneOperation}.` : `No snapshot sem lentidão, a Anchieta no sentido São Paulo aparece normal do km 9,7 ao 65. A operação observada era ${road.laneOperation}.`,
      action: { label: 'Abrir modo viagem', target: 'journey' },
      provenance: 'document'
    };
  }

  if (q.includes('comboio')) {
    return { title: 'Comboio', answer: scenario.id === 'convoy' ? 'O cenário de demonstração está com comboio ativo na serra.' : 'Nos dois snapshots analisados o comboio estava inativo. O sistema contém um bloco específico para esse evento e ele deve receber prioridade alta quando ativo.', action: { label: 'Abrir modo viagem', target: 'journey' }, provenance: scenario.id === 'convoy' ? 'prototype' : 'document' };
  }

  if (q.includes('tempo') || q.includes('santos') || q.includes('rota')) {
    return { title: 'Tempo de viagem', answer: 'Os snapshots mostraram 16 alternativas entre São Paulo e Santos, com referências entre 42 e 72 minutos, mas os tempos não variaram ao longo do dia. Por isso este protótipo não os apresenta como estimativa em tempo real.', action: { label: 'Ver viagem', target: 'journey' }, provenance: 'document' };
  }

  return {
    title: 'Assistente Ecovias',
    answer: 'Posso ajudar com condições da via, operação de faixas, pedágios, postos, banheiro, pontos de apoio, comboio e assistência. Para a apresentação, minhas respostas estão limitadas ao conjunto de dados e cenários estruturados no protótipo.',
    action: null,
    provenance: 'prototype'
  };
}
