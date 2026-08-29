import { step } from '@co-kyo/skillpack-types';
import { doAction } from '../actions.js';
import { effectContractSection } from '../domain/effects.js';
import {
  LADDER_JUDGMENT_FIELD,
  LADDER_MAX_CAPABILITIES,
  LADDER_STAGE_COUNT,
  ladderDetail,
  stepFormat,
  workerTask,
} from '../domain/ladder.js';
import { nextStep, prevStep } from '../domain/session.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const learningLadder = step('learning-ladder', '学习阶梯')
  .target('为每个命题生成从不会到能讲的渐进学习路径')
  .summary('生成从"不会"到"能讲"的渐进式路径')
  .dependsOn(prevStep('learning-ladder'))
  .reads(refs.dependencyGraph, refs.summaries, refs.overview, refs.anchors)
  .writes(refs.ladder)
  .inputs('{workDir}/.meta/dependency-graph.json', '{workDir}/.meta/summaries/*.json', '{workDir}/{seq}-{short_name}/overview.md')
  .outputs('{workDir}/{seq}-{short_name}/learning-ladder.md')
  .detail(ladderDetail())
  .section('步骤格式', stepFormat())
  .section('效果契约', effectContractSection('E-ladder-judgment'))
  .contractRefs(
    refs.dependencyGraph,
    refs.summaries,
    refs.overview,
    refs.subagentBudget,
    refs.ladder,
    refs.anchors,
  )
  .taskTemplate(
    '学习阶梯 Worker',
    workerTask(),
  )
  .verify(
    verify.file('{workDir}/{seq}-{short_name}/learning-ladder.md', '学习阶梯文件存在'),
    verify.count(`阶段数 ${LADDER_STAGE_COUNT.min}-${LADDER_STAGE_COUNT.max}`),
    verify.field(LADDER_JUDGMENT_FIELD, '每步有二值验证标准'),
  )
  .onFail(
    fail.degrade('能力依赖图有环', '打断循环依赖并标记 warning'),
    fail.degrade(`能力数量超过 ${LADDER_MAX_CAPABILITIES}`, '合并相似能力减少阶段数'),
  )
  .checkpoint(
    barrier(
      ['完成数', '跳过数', '失败数'],
      '请确认学习阶梯最终产物。',
    ),
  )
  .reuse(
    { ifExists: '{workDir}/{seq}-{short_name}/learning-ladder.md', skipDescription: '学习阶梯已存在' },
  )
  .next(nextStep('learning-ladder'))
  .display({
    pattern: 'auto_timeline',
    primary_unit: 'stage',
    max_visible: 4,
    legend: false,
    selection: 'none',
  })
  .map(
    'learning-ladder-map',
    '学习阶梯滚动窗口',
    { path: '{workDir}/.meta/requirement-web.json#propositions', dynamic: true },
    doAction(
      'generate',
      'learning-ladder-worker',
      '学习阶梯 Worker',
      '为单个命题基于依赖图生成学习阶梯。',
      5,
    ),
    5,
  )
  .build();
