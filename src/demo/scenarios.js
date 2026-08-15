export const scenarios = {
  idle: {
    id: 'idle',
    label: 'Fora da concessão',
    description: 'Assistente pronto, sem viagem ativa.',
    journeyActive: false,
    operation: '5x5',
    trafficSnapshot: 'normal',
    events: []
  },
  normal: {
    id: 'normal',
    label: 'Viagem normal',
    description: 'Entrada na Ecovias Imigrantes usando o snapshot sem lentidão.',
    journeyActive: true,
    operation: '5x5',
    trafficSnapshot: 'normal',
    events: [
      { id: 'toll', kind: 'toll', distanceKm: 12, title: 'Pedágio à frente', detail: 'Pagamento automático configurado', severity: 'info', source: 'prototype' }
    ]
  },
  slowdown: {
    id: 'slowdown',
    label: 'Lentidão Anchieta',
    description: 'Reproduz o trecho dinâmico registrado no segundo snapshot.',
    journeyActive: true,
    operation: '5x5',
    trafficSnapshot: 'slowdown',
    events: [
      { id: 'slow', kind: 'traffic', distanceKm: 4, title: 'Lentidão entre km 61 e 63', detail: 'Excesso de veículos', severity: 'warning', source: 'document' },
      { id: 'toll', kind: 'toll', distanceKm: 12, title: 'Pedágio à frente', detail: 'Pagamento automático configurado', severity: 'info', source: 'prototype' }
    ]
  },
  convoy: {
    id: 'convoy',
    label: 'Comboio na serra',
    description: 'Cenário demonstrativo para um evento que existe no modelo de dados, mas estava inativo nos snapshots.',
    journeyActive: true,
    operation: '7x3',
    trafficSnapshot: 'normal',
    events: [
      { id: 'convoy', kind: 'critical', distanceKm: 8, title: 'Comboio ativo na serra', detail: 'Siga as orientações operacionais', severity: 'critical', source: 'prototype' }
    ]
  },
  cargo: {
    id: 'cargo',
    label: 'Restrição para pesados',
    description: 'Demonstra o tratamento de uma informação crítica existente nos dados.',
    journeyActive: true,
    operation: '5x5',
    trafficSnapshot: 'normal',
    events: [
      { id: 'cargo', kind: 'restriction', distanceKm: 6, title: 'Restrição para veículos pesados', detail: 'Imigrantes, sentido São Paulo', severity: 'critical', source: 'document' }
    ]
  }
};
