import assert from 'node:assert/strict';
import test from 'node:test';
import { phaseDefs, flowOverview } from '../../skill.js';
import { steps } from './index.js';

// D8:顺序锚定——11 步顺序是产品规格,恒等于 00-10。
// (链自洽守卫已由 skillnomad 构建期校验承接:validateStepChain / DependencyRefs / PhaseCoverage)
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

test('D8:dependsOn 只引用已声明步骤', () => {
  const ids = new Set(steps.map((s) => s.id));
  for (const s of steps) {
    for (const d of s.dependsOn) {
      assert.ok(ids.has(d), `${s.id} dependsOn 引用未声明步骤:${d}`);
    }
  }
});

test('D8+:flowOverview 标注与 phases 边界一致', () => {
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
