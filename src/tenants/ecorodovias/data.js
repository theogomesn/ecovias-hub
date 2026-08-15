export const sourceNotes = {
  operational: 'Briefing Ecovias Imigrantes e análise exploratória de dois snapshots do endpoint /api/playful-map compartilhados no projeto.',
  brand: 'Brand book EcoVias, janeiro de 2025.',
  prototype: 'Informações criadas apenas para demonstrar fluxos que dependem de APIs, cadastros ou integrações ainda não fornecidos.'
};

const snapshotNormal = [
  { from: 9.7, to: 65, status: 'normal', reason: null, source: 'document' }
];

const snapshotSlowdown = [
  { from: 9.7, to: 61, status: 'normal', reason: null, source: 'document' },
  { from: 61, to: 63, status: 'slow', reason: 'Excesso de veículos', source: 'document' },
  { from: 63, to: 65, status: 'normal', reason: null, source: 'document' }
];

export const roadData = {
  id: 'sai',
  concession: 'Ecovias Imigrantes',
  system: 'Sistema Anchieta-Imigrantes',
  currentRoad: 'Anchieta',
  direction: 'São Paulo',
  laneOperation: '5x5',
  laneOperationSource: 'document',
  snapshots: {
    normal: snapshotNormal,
    slowdown: snapshotSlowdown
  },
  convoy: { active: false, source: 'document' },
  heavyVehicleRestriction: { active: true, road: 'Imigrantes', direction: 'São Paulo', segment: 'trecho específico', source: 'document' },
  weather: { status: 'Sem variação confirmada nos snapshots', source: 'document', reliability: 'unknown-frequency' },
  routeReference: {
    origin: 'São Paulo',
    destination: 'Santos',
    fastestMinutes: 42,
    slowestMinutes: 72,
    alternatives: 16,
    live: false,
    note: 'Os tempos não variaram entre os snapshots e não devem ser tratados como estimativa em tempo real.',
    source: 'document'
  }
};

export const services = [
  { id: 'support-59', type: 'support', name: 'Base de apoio', km: 59, distanceKm: 6, open24h: true, restroom: true, accessible: true, source: 'prototype' },
  { id: 'fuel-1', type: 'fuel', name: 'Posto de serviço', km: 57.8, distanceKm: 2.8, open24h: true, restroom: true, accessible: false, source: 'prototype' },
  { id: 'food-1', type: 'food', name: 'Alimentação e conveniência', km: 63, distanceKm: 8, open24h: false, restroom: true, accessible: true, source: 'prototype' },
  { id: 'rest-1', type: 'rest', name: 'Pátio de descanso', km: 70, distanceKm: 15, open24h: true, restroom: true, accessible: true, source: 'prototype' }
];

export const tolls = [
  { id: 'toll-demo-1', concession: 'Ecovias Imigrantes', plaza: 'Praça demonstrativa', amount: 22.3, date: '2026-08-12T18:10:00', source: 'prototype' },
  { id: 'toll-demo-2', concession: 'Ecovias Imigrantes', plaza: 'Praça demonstrativa', amount: 22.3, date: '2026-08-09T10:24:00', source: 'prototype' }
];

export const supportOptions = [
  { id: 'breakdown', label: 'Pane', description: 'Veículo parado' },
  { id: 'tire', label: 'Pneu', description: 'Troca ou apoio' },
  { id: 'battery', label: 'Bateria', description: 'Falha elétrica' },
  { id: 'other', label: 'Outro', description: 'Descrever situação' }
];
