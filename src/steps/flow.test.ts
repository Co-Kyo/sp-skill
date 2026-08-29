import assert from 'node:assert/strict';
import test from 'node:test';
import { steps } from './index.js';

// D8:顺序一致性——防止 .next()/dependsOn 静默断链(skillpack 只校验 dependsOn,不校验 next)
test('D8:11 步链连续——每步 next 指向下一步,末步指向 done', () => {
  for (let i = 0; i < steps.length - 1; i++) {
    assert.equal(steps[i].next, steps[i + 1].id, `第 ${i} 步(${steps[i].id})next 断链`);
  }
  assert.equal(steps[steps.length - 1].next, 'done');
});

test('D8:dependsOn 只引用已声明步骤', () => {
  const ids = new Set(steps.map((s) => s.id));
  for (const s of steps) {
    for (const d of s.dependsOn) {
      assert.ok(ids.has(d), `${s.id} dependsOn 引用未声明步骤:${d}`);
    }
  }
});

test('D8:步骤顺序与流程定义一致(00-10)', () => {
  assert.deepEqual(steps.map((s) => s.id), [
    'initialize',
    'intent-anchor',
    'brainstorm',
    'partition',
    'scan',
    'capability-graph',
    'evaluate-pool',
    'capability-research',
    'briefing-assemble',
    'assemble',
    'learning-ladder',
  ]);
});
