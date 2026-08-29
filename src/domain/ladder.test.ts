import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LADDER_STAGE_COUNT,
  LADDER_STEP_FIELDS,
  LAYER_RULES,
  ladderDetail,
  stepFormat,
  workerTask,
} from './ladder.js';
import { calibrateJudgment } from './learner.js';

test('ladderDetail 派生文本包含分层规则与阶段数约束', () => {
  const d = ladderDetail();
  for (const rule of LAYER_RULES) {
    assert.ok(d.includes(`- ${rule}`), `缺少分层规则:${rule}`);
  }
  assert.ok(d.includes(`归纳 ${LADDER_STAGE_COUNT.min}-${LADDER_STAGE_COUNT.max} 个阶段`));
});

test('stepFormat 包含全部固定字段,且含二值验收字段', () => {
  const s = stepFormat();
  for (const f of LADDER_STEP_FIELDS) {
    assert.ok(s.includes(`- ${f}`), `缺少字段:${f}`);
  }
  assert.ok(LADDER_STEP_FIELDS.includes('做到才算过'));
});

test('workerTask 输出经校准签名(Phase R 恒等)', () => {
  const base = workerTask();
  assert.equal(calibrateJudgment(base, 'L1'), base);
  assert.equal(calibrateJudgment(base, 'L4'), base);
  assert.ok(base.includes('学习阶梯生成专家'));
});
