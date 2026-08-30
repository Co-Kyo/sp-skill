import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { countVerifyText, detail, insufficientAnchorsText, skipSection, target } from './intent.js';
import { detail as partitionDetail, sessionOverflowText, threeLayerSection } from './partition.js';
import { capabilityOverflowText, highgroundSection } from './capability.js';
import { detail as evaluationDetail, thresholdSection } from './evaluation.js';
import { initializeDetail, WORKDIR_NAMING } from './initialize.js';
import { RATIO_CLAUSE, SCENARIO_MINIMUM } from './shared.js';

// 仓库根(src/domain/content/ 上三级)
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));

test('intent:锚点数量常量贯穿派生文本(target/detail/verify/halt)', () => {
  assert.ok(target().startsWith('生成 8-15 个锚点'));
  assert.ok(detail().includes('- 数量 8-15 个'));
  assert.equal(countVerifyText(), '锚点数量为 8-15 个');
  assert.equal(insufficientAnchorsText(), '锚点不足 8 个');
});

test('intent:年限链与 role/level 约束进 detail', () => {
  const d = detail();
  assert.ok(d.includes('1. 显式参数 --year'));
  assert.ok(d.includes('4. 无信号默认 L2'));
  assert.ok(d.includes('core=target_level、premise=target_level-1、outlook=target_level+1'));
});

test('intent:拦截词数组进跳过判断', () => {
  assert.ok(skipSection().includes('面试、场景、分析、复杂'));
});

test('partition:Leiden 阈值与 session 上限贯穿派生文本', () => {
  assert.ok(threeLayerSection().includes('分量节点数大于 8 时运行 Leiden 聚类'));
  assert.ok(partitionDetail().includes('prerequisite：A 是 B 的前置知识'));
  assert.equal(sessionOverflowText(), '当前 session 超过 12 个命题');
});

test('capability:阈值字符串保留小数位,上限 30 进触发词', () => {
  assert.ok(highgroundSection().includes('一级高地 >= 4.0。'));
  assert.ok(highgroundSection().includes('二级高地 2.0-3.9。'));
  assert.equal(capabilityOverflowText(), '能力数量超过 30');
});

test('evaluation:四维评分与年限阈值表', () => {
  const d = evaluationDetail();
  assert.ok(d.includes('- cross_stack_coupling：跨栈耦合'));
  assert.ok(d.includes('防虚高：4 个维度均 >= 2 时必须重新审视并压低至少 1 分'));
  assert.ok(thresholdSection().includes('L2：总分 >= 6。'));
});

test('initialize:workDir 命名规则单一出处', () => {
  assert.equal(WORKDIR_NAMING, '{当前日期}-{场景简称}');
  assert.ok(initializeDetail().includes(`默认使用 ${WORKDIR_NAMING}。`));
});

test('shared:片段与原文逐字一致(供 prompts.ts 双写收敛)', () => {
  assert.equal(RATIO_CLAUSE, '内容比例：通用高地 <= 70%，场景化/特化内容 >= 30%。');
  assert.equal(SCENARIO_MINIMUM, '至少 3 个场景化输入、3 个边界、3 个验证点。');
});

test('B2-A:method.md 投影与评估域正本一致(漂移锁)', () => {
  const text = readFileSync(repoRoot + 'assets/05-evaluate-pool/method.md', 'utf-8');
  assert.ok(text.includes('唯一事实源'), '缺少投影声明');
  assert.ok(text.includes('每个维度 1-3 分'), '评分制未对齐正本');
  assert.ok(text.includes('L2 | 总分 >= 6'), '入池阈值未对齐正本');
  assert.ok(!text.includes('0-3 分'), '旧评分制残留');
  assert.ok(!text.includes('≥ 8'), '旧入池线残留');
  assert.ok(!text.includes('6-7'), '旧档位残留');
});
