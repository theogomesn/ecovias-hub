export const scenarios = {
  idle: {
    id: 'idle',
    label: 'Antes da viagem',
    description: 'Assistente pronto, sem viagem ativa.',
    journeyActive: false,
    operation: '5x5',
    trafficSnapshot: 'normal',
    travelTime: '52 min',
    surface: 'Seca',
    visibility: 'Boa visibilidade',
    events: []
  },
  normal: {
    id: 'normal',
    label: 'São Paulo → Litoral',
    description: 'Viagem ativa pelo Sistema Anchieta-Imigrantes com fluxo normal.',
    journeyActive: true,
    operation: '5x5',
    trafficSnapshot: 'normal',
    travelTime: '52 min',
    surface: 'Seca',
    visibility: 'Boa visibilidade',
    events: [
      { id: 'works', kind: 'works', distanceKm: 12, title: 'Obras no km 40', detail: 'Faixa da direita interditada', severity: 'warning', source: 'prototype' },
      { id: 'inspection', kind: 'inspection', distanceKm: 23, title: 'Fiscalização eletrônica', detail: 'Reduza a velocidade', severity: 'info', source: 'prototype' },
      { id: 'toll', kind: 'toll', distanceKm: 45, title: 'Pedágio km 70', detail: 'Pagamento automático configurado', severity: 'info', source: 'prototype' }
    ]
  },
  slowdown: {
    id: 'slowdown',
    label: 'São Paulo → Litoral com lentidão',
    description: 'Cenário de viagem com lentidão entre os km 61 e 63.',
    journeyActive: true,
    operation: '5x5',
    trafficSnapshot: 'slowdown',
    travelTime: '1h 08 min',
    surface: 'Seca',
    visibility: 'Boa visibilidade',
    events: [
      { id: 'slow', kind: 'traffic', distanceKm: 8, title: 'Lentidão entre km 61 e 63', detail: 'Excesso de veículos', severity: 'warning', source: 'document' },
      { id: 'works', kind: 'works', distanceKm: 12, title: 'Obras no km 40', detail: 'Faixa da direita interditada', severity: 'warning', source: 'prototype' },
      { id: 'toll', kind: 'toll', distanceKm: 45, title: 'Pedágio km 70', detail: 'Pagamento automático configurado', severity: 'info', source: 'prototype' }
    ]
  },
  congestion: {
    id: 'congestion',
    label: 'São Paulo → Litoral congestionado',
    description: 'Cenário simulado para demonstrar o estado crítico de trânsito.',
    journeyActive: true,
    operation: '5x5',
    trafficSnapshot: 'congestion',
    travelTime: '1h 18 min',
    surface: 'Úmida',
    visibility: 'Moderada',
    events: [
      { id: 'congestion', kind: 'traffic', distanceKm: 2, title: 'Congestionamento a partir do km 55', detail: 'Fluxo intenso e retenção', severity: 'critical', source: 'prototype' },
      { id: 'toll', kind: 'toll', distanceKm: 45, title: 'Pedágio km 70', detail: 'Pagamento automático configurado', severity: 'info', source: 'prototype' }
    ]
  },
  convoy: {
    id: 'convoy',
    label: 'Comboio na serra',
    description: 'Cenário de apresentação com comboio ativo durante a viagem ao Litoral.',
    journeyActive: true,
    operation: '7x3',
    trafficSnapshot: 'normal',
    travelTime: '1h 12 min',
    surface: 'Seca',
    visibility: 'Boa visibilidade',
    events: [
      { id: 'convoy', kind: 'critical', distanceKm: 8, title: 'Comboio ativo na serra', detail: 'Siga as orientações operacionais', severity: 'critical', source: 'prototype' }
    ]
  }
};
