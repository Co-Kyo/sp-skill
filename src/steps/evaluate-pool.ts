import { step } from 'skillnomad-types';
import { doAction } from '../actions.js';
import * as evaluation from '../domain/content/evaluation.js';
import { runtime, modules } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const evaluatePool = step('evaluate-pool', '评估入池')
  .target('生成按年限阈值入池的评估结果与推荐顺序')
  .summary('四维评估矩阵打分，确定优先级和学习顺序')
  .dependsOn('capability-graph')
  .reads(runtime.capabilityGraph, runtime.dependencyGraph, { ...modules.evaluationMethod, as: 'method' })
  .writes(runtime.evaluations, runtime.readme, runtime.candidates)
  .inputs('{workDir}/.meta/capability-graph.json', '{workDir}/.meta/dependency-graph.json')
  .outputs('{workDir}/.meta/evaluations.json', '{workDir}/README.md', '{workDir}/.meta/candidates.md')
  .detail(evaluation.detail())
  .section('年限阈值', evaluation.thresholdSection())
  // 8.5 迁移：contractRefs 收拢进 reads + as:'contract'，本方法已从 beta.4 类型删除。
  // contractRefs 内 evaluations/readme/candidates 实为 writes 产物，不进 reads。
  .taskTemplate(
    '四维评分',
    evaluation.scoreTask(),
  )
  .taskTemplate(
    '入池归档',
    evaluation.archiveTask(),
  )
  .verify(
    verify.file('{workDir}/README.md', '命题总览存在'),
    verify.json('{workDir}/.meta/evaluations.json', '评估结果可解析'),
    verify.field('priority_trace', '每个命题包含 priority_trace'),
    verify.field('recommended_order', '推荐顺序合理'),
  )
  .onFail(
    fail.degrade('信息不足以打分', '标记 medium 并说明 reasoning'),
    fail.halt('所有命题 rejected', '提示用户调整搜索范围'),
  )
  .checkpoint(
    barrier(
      ['评估表', '优先级分布', '难度分级', '推荐顺序'],
      '请确认评估结果和后处理范围。',
    ),
  )
  .plugins('year-granularity')
  .display({
    pattern: 'threshold_table',
    primary_unit: 'proposition',
    max_visible: 7,
    badge: 'priority',
    legend: true,
    selection: 'multi',
  })
  .seq('evaluate-pool-seq', '评估入池', [
    doAction('score', 'evaluate-score', '四维评分', '按四维矩阵逐命题打分。', 5),
    doAction('validate', 'evaluate-threshold', '年限阈值', '按 L1-L4 阈值判定入池并记录 priority_trace。', 3),
    doAction('generate', 'evaluate-archive', '入池归档', '生成 evaluations.json、README.md 和 candidates.md。', 3),
  ])
  .build();
