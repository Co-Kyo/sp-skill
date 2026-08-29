import assert from 'node:assert/strict';
import test from 'node:test';
import { LEVELS, calibrateJudgment } from './learner.js';

test('级别集合完备且有序', () => {
  assert.deepEqual(LEVELS, ['L1', 'L2', 'L3', 'L4']);
});

test('Phase R 校准恒等:不改变判据文本', () => {
  assert.equal(calibrateJudgment('能做到 X', 'L1'), '能做到 X');
  assert.equal(calibrateJudgment('能做到 X', 'L3'), '能做到 X');
});
