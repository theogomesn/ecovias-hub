import assert from 'node:assert/strict';
import { answerAssistant } from '../src/core/assistant.js';
import { journeyContext, roadData, services, tolls } from '../src/tenants/ecorodovias/data.js';
import { scenarios } from '../src/demo/scenarios.js';

const ask = (query, scenario='normal', autoPay=true) => answerAssistant(query, {
  services,
  road: roadData,
  scenario: scenarios[scenario],
  tollHistory: tolls,
  autoPay,
  journey: journeyContext
});

assert.match(ask('Como está a pista?').answer, /trânsito normal/i);
assert.match(ask('Como está a pista?', 'slowdown').answer, /61 (ao|e) 63/i);
assert.match(ask('Quanto falta para o pedágio?').answer, /45 km/i);
assert.match(ask('Onde tem banheiro mais próximo?').answer, /6 km/i);
assert.equal(ask('Preciso de ajuda').kind, 'action');
assert.equal(ask('Preciso de ajuda').action.target, 'support');
assert.match(ask('Quanto gastei em pedágio?').answer, /44,60/);
assert.match(ask('Vou para o litoral').answer, /São Paulo.*Santos/i);

console.log('assistant-smoke: OK');
