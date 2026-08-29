// 学习域:学习阶梯领域服务。
// 阶段数量、拓扑分层、Step 字段是学习规则——在此声明为数据,
// 提示词由规则派生(Phase R 输出与流程版逐字一致)。
import { calibrateJudgment } from './learner.js';
import type { Level } from './learner.js';

export const LADDER_STAGE_COUNT = { min: 3, max: 4 } as const;

export const LAYER_RULES = [
  'Layer 0：无依赖能力',
  'Layer 1：依赖 Layer 0',
  'Layer 2：依赖 Layer 0+1',
] as const;

/** 阶梯 Step 的固定字段;「做到才算过」是二值验收字段(见 effects.ts E-ladder-judgment) */
export const LADDER_STEP_FIELDS = [
  '要做什么',
  '你会看到什么',
  '这说明了什么',
  '接下来去哪',
  '做到才算过',
] as const;

export function ladderDetail(): string {
  const layers = LAYER_RULES.map((l) => `- ${l}`).join('\n');
  return `提取命题能力子图。

按依赖拓扑分层：

${layers}

归纳 ${LADDER_STAGE_COUNT.min}-${LADDER_STAGE_COUNT.max} 个阶段，每阶段包含概念、技能、综合步骤。`;
}

export function stepFormat(): string {
  const fields = LADDER_STEP_FIELDS.map((f) => `- ${f}`).join('\n');
  return `每步包含：

${fields}

失败时给出明确回退指引。`;
}

export function workerTask(level: Level = 'L2'): string {
  const base = `你是 {proposition_name} 的学习阶梯生成专家。
提取能力子图。
拓扑排序并归纳阶段。
每个阶段编排概念、技能、综合步骤。
写入 learning-ladder.md。`;
  return calibrateJudgment(base, level);
}
