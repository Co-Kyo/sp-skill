import { step } from '@co-kyo/skillpack-types';
import { doAction } from '../actions.js';
import * as capability from '../domain/content/capability.js';
import { displayFoldMulti } from '../domain/mechanics.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const capabilityGraph = step('capability-graph', '能力图谱')
  .target('生成能力图谱、依赖图、战略高地与学习路径')
  .summary('跨命题去重合并原子能力，计算战略价值')
  .dependsOn('scan')
  .reads(refs.requirementWeb, refs.scanIndex)
  .writes(refs.capabilityGraph, refs.dependencyGraph, refs.highgrounds, refs.learningPath)
  .inputs('{workDir}/.meta/requirement-web.json', '{workDir}/.meta/.raw-materials/index.json')
  .outputs(
    '{workDir}/.meta/capability-graph.json',
    '{workDir}/.meta/dependency-graph.json',
    '{workDir}/.meta/highgrounds.json',
    '{workDir}/.meta/learning-path.json',
  )
  .detail(capability.detail())
  .section('战略高地', capability.highgroundSection())
  .contractRefs(
    refs.requirementWeb,
    refs.scanIndex,
    refs.capabilityGraph,
    refs.dependencyGraph,
    refs.highgrounds,
    refs.learningPath,
  )
  .taskTemplate(
    '能力去重',
    capability.dedupeTask(),
  )
  .taskTemplate(
    '战略高地',
    capability.highgroundTask(),
  )
  .verify(
    verify.json('{workDir}/.meta/capability-graph.json', '能力图谱可解析'),
    verify.field('dependencies_trace', '非空依赖包含 dependencies_trace'),
    verify.field('t0_missing', 'T0 参考状态已记录'),
  )
  .onFail(
    fail.degrade('T0 信源不可达', '标记 t0_missing 并用 T1/T2 补充'),
    fail.checkpoint(capability.capabilityOverflowText(), '提示使用 --filter 缩小范围'),
  )
  .checkpoint(
    barrier(
      ['能力数量', '扇出度 Top 3', '战略高地数量', '学习路径'],
      '请确认能力图谱质量。',
    ),
  )
  .next('evaluate-pool')
  .display(displayFoldMulti('capability'))
  .seq('capability-graph-seq', '能力图谱构建', [
    doAction('merge', 'capability-dedupe', '能力去重', '跨命题合并或拆分能力，并记录 merge/split trace。', 5),
    doAction('infer', 'capability-deps', '标注依赖', '基于层级、内容引用和 covers 交集推断依赖。', 5),
    doAction('score', 'capability-highgrounds', '识别高地', '计算 strategic_value 并生成 highgrounds 与 learning-path。', 5),
  ])
  .build();
