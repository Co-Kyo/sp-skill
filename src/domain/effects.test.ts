import assert from 'node:assert/strict';
import test from 'node:test';
import { EFFECT_CONTRACTS } from './effects.js';

test('效果契约:编号唯一、归属与保证非空', () => {
  const ids = EFFECT_CONTRACTS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, '契约编号必须唯一');
  for (const c of EFFECT_CONTRACTS) {
    assert.ok(c.artifact.length > 0, `${c.id} 缺 artifact`);
    assert.ok(c.owns.length > 0, `${c.id} 缺归属源文件`);
    assert.ok(c.expects.length > 0, `${c.id} 缺保证条目`);
  }
});

test('学习阶梯契约:二值验收与阶段数在保证列表中', () => {
  const ladder = EFFECT_CONTRACTS.find((c) => c.id === 'E-ladder-judgment');
  assert.ok(ladder, '缺少 E-ladder-judgment');
  assert.ok(ladder.expects.some((e) => e.includes('做到才算过')));
  assert.ok(ladder.expects.some((e) => e.includes('阶段数 3-4')));
  assert.ok(ladder.owns.some((o) => o.startsWith('src/domain/')));
});

test('能力研究契约:素材不静默丢弃', () => {
  const research = EFFECT_CONTRACTS.find((c) => c.id === 'E-capability-coverage');
  assert.ok(research, '缺少 E-capability-coverage');
  assert.ok(research.expects.some((e) => e.includes('不能静默丢弃')));
});
