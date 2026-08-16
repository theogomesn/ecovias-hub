export const scenarios = {
  idle: {
    id: 'idle',
    label: 'Antes da viagem',
    description: 'Assistente pronto, sem viagem ativa.',
    journeyActive: false,
    operation: '5x5',
    trafficSnapshot: 'normal',
    events: []
  },
  normal: {
    id: 'normal',
    label: 'São Paulo → Litoral',
    description: 'Viagem ativa pelo Sistema Anchieta-Imigrantes com fluxo normal.',
    journeyActive: true,
    operation: '5x5',
    trafficSnapshot: 'normal',
    events: [
      { id: 'toll', kind: 'toll', distanceKm: 12, title: 'Pedágio à frente', detail: 'Pagamento automático configurado', severity: 'info', source: 'prototype' }
    ]
  },
  slowdown: {
    id: 'slowdown',
    label: 'São Paulo → Litoral com lentidão',
    description: 'Cenário de viagem com lentidão entre os km 61 e 63.',
    journeyActive: true,
    operation: '5x5',
    trafficSnapshot: 'slowdown',
    events: [
      { id: 'slow', kind: 'traffic', distanceKm: 4, title: 'Lentidão entre km 61 e 63', detail: 'Excesso de veículos', severity: 'warning', source: 'prototype' },
      { id: 'toll', kind: 'toll', distanceKm: 12, title: 'Pedágio à frente', detail: 'Pagamento automático configurado', severity: 'info', source: 'prototype' }
    ]
  },
  convoy: {
    id: 'convoy',
    label: 'Comboio na serra',
    description: 'Cenário de apresentação com comboio ativo durante a viagem ao Litoral.',
    journeyActive: true,
    operation: '7x3',
    trafficSnapshot: 'normal',
    events: [
      { id: 'convoy', kind: 'critical', distanceKm: 8, title: 'Comboio ativo na serra', detail: 'Siga as orientações operacionais', severity: 'critical', source: 'prototype' }
    ]
  }
};
