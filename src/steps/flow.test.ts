import assert from 'node:assert/strict';
import test from 'node:test';
import { phaseDefs, flowOverview } from '../../skill.js';
import { HEAD_SESSION_FLOW, TAIL_SESSION_FLOW } from '../domain/session.js';
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

test('D8+:meta.phases 覆盖全部步骤且顺序与 steps 一致', () => {
  assert.deepEqual(phaseDefs.flatMap((p) => p.stepIds), steps.map((s) => s.id));
  assert.equal(HEAD_SESSION_FLOW.length + TAIL_SESSION_FLOW.length, steps.length);
});

test('D8+:flowOverview 字节锁(6 阶段名 + 区间标注)', () => {
  for (const p of phaseDefs) {
    assert.ok(flowOverview.includes(p.name), `flowOverview 缺少阶段名:${p.name}`);
  }
  // 已知数据审计发现(B10):区间标注 (03-05)/(06-10) 与 phases 边界不一致
  // (6 阶段只有 5 个标注)。此处仅字节锁防无意识改动;语义修正属 Phase III 登记决策。
  for (const tag of ['(00)', '(01)', '(02)', '(03-05)', '(06-10)']) {
    assert.ok(flowOverview.includes(tag), `flowOverview 缺少区间标注:${tag}`);
  }
});
