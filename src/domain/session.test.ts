import assert from 'node:assert/strict';
import test from 'node:test';
import { TAIL_SESSION_FLOW, nextStep, prevStep } from './session.js';

test('会话链边:四步顺序推进并终止于 done', () => {
  assert.equal(nextStep('capability-research'), 'briefing-assemble');
  assert.equal(nextStep('briefing-assemble'), 'assemble');
  assert.equal(nextStep('assemble'), 'learning-ladder');
  assert.equal(nextStep('learning-ladder'), 'done');
});

test('回退边:与流程骨架一致的依赖来源', () => {
  assert.equal(prevStep('capability-research'), 'evaluate-pool');
  assert.equal(prevStep('briefing-assemble'), 'capability-research');
  assert.equal(prevStep('assemble'), 'briefing-assemble');
  assert.equal(prevStep('learning-ladder'), 'assemble');
});

test('会话流声明完整且无重复', () => {
  assert.deepEqual(TAIL_SESSION_FLOW, [
    'capability-research',
    'briefing-assemble',
    'assemble',
    'learning-ladder',
  ]);
});
