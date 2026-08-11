import { step } from '@co-kyo/skillpack-types';
import { doAction } from '../actions.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const evaluatePool = step('evaluate-pool', '评估入池')
  .target('生成按年限阈值入池的评估结果与推荐顺序')
  .summary('四维评估矩阵打分，确定优先级和学习顺序')
  .dependsOn('capability-graph')
  .reads(refs.capabilityGraph, refs.dependencyGraph)
  .writes(refs.evaluations, refs.readme, refs.candidates)
  .inputs('{workDir}/.meta/capability-graph.json', '{workDir}/.meta/dependency-graph.json')
  .outputs('{workDir}/.meta/evaluations.json', '{workDir}/README.md', '{workDir}/.meta/candidates.md')
  .detail(`四维评分：

- cross_stack_coupling：跨栈耦合
- doc_vacuum：文档真空
- experience_barrier：经验壁垒
- topical_heat：时事热度

每个维度 1-3 分，总分 12。

防虚高：4 个维度均 >= 2 时必须重新审视并压低至少 1 分，除非有明确论据。`)
  .section('年限阈值', `L1：通常不入池。
L2：总分 >= 6。
L3：总分 >= 5。
L4：任一维度 >= 2 即入池。

一票入池条件：多源讨论、明确 trade-off、新兴与既有体系碰撞。`)
  .contractRefs(
    refs.capabilityGraph,
    refs.dependencyGraph,
    refs.evaluations,
    refs.readme,
    refs.candidates,
  )
  .taskTemplate(
    '四维评分',
    `对每个命题按四维矩阵打分。
记录每个维度的 reasoning。
检查防虚高规则。
写入 evaluations.json。`,
  )
  .taskTemplate(
    '入池归档',
    `按年限阈值判定 priority。
记录 priority_trace。
评估 difficulty 和 recommended_order。
生成 README.md 和 candidates.md。`,
  )
  .verify(
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
  .next('capability-research')
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
