import assert from 'node:assert/strict';
import test from 'node:test';
import { phaseDefs, flowOverview } from '../../skill.js';
import { HEAD_SESSION_FLOW, TAIL_SESSION_FLOW } from '../domain/session.js';
import { steps } from './index.js';

// D8:顺序一致性——防止 .next()/dependsOn 静默断链(skillnomad 只校验 dependsOn,不校验 next)
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

test('D8+:meta.phases 覆盖全部步骤且顺序与 steps 一致', () => {
  assert.deepEqual(phaseDefs.flatMap((p) => p.stepIds), steps.map((s) => s.id));
  assert.equal(HEAD_SESSION_FLOW.length + TAIL_SESSION_FLOW.length, steps.length);
});

test('D8+:flowOverview 标注与 phases 边界一致(B10-A 修正后恢复真实断言)', () => {
  let idx = 0;
  const pad = (n: number) => String(n).padStart(2, '0');
  const expected = phaseDefs.map((p) => {
    const start = idx;
    idx += p.stepIds.length;
    return start === idx - 1 ? `(${pad(start)})` : `(${pad(start)}-${pad(idx - 1)})`;
  });
  assert.deepEqual(expected, ['(00)', '(01)', '(02)', '(03)', '(04-06)', '(07-10)']);
  for (const tag of expected) {
    assert.ok(flowOverview.includes(tag), `flowOverview 缺少区间标注:${tag}`);
  }
  for (const p of phaseDefs) {
    assert.ok(flowOverview.includes(p.name), `flowOverview 缺少阶段名:${p.name}`);
  }
});
