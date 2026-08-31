import assert from 'node:assert/strict';
import test from 'node:test';
import { phaseDefs } from '../../skill.js';
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

// D8+-2 已退役：flowOverview 现由 skillnomad 构建期从 phases+链派生
//（deriveFlowOverview），"标注与边界一致"是派生的定义而非待守卫的约束。
