import { step } from '@co-kyo/skillpack-types';
import { doAction } from '../actions.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const partition = step('partition', '依赖分区')
  .target('生成可被 scan 消费的分区分析和执行计划')
  .summary('整理命题依赖DAG，识别分区点分批执行')
  .dependsOn('brainstorm')
  .reads(refs.requirementWeb)
  .writes(refs.partitionAnalysis, refs.executionPlan)
  .inputs('{workDir}/.meta/requirement-web.json')
  .outputs('{workDir}/.meta/partition-analysis.json', '{workDir}/execution-plan.md')
  .detail(`依赖类型：

- prerequisite：A 是 B 的前置知识
- enables：A 让 B 更容易理解
- related：无严格先后
- extends：B 是 A 的进阶变体

构建 DAG 时，prerequisite 和 enables 为有向边，related 为无向边。

检测到环时，先断开 related 类型边，直到无环。`)
  .section('三层分区', `1. 连通分量：每个分量是一个候选 session。
2. 拓扑深度：同 depth 的节点组成反链，可并行。
3. 社区发现：分量节点数大于 8 时运行 Leiden 聚类。`)
  .section('Session 分配', `包含最多 core 命题的分量进入当前 session S1。

当前 session 超过 12 个命题时按社区拆分。

其余分量排期到 S2/S3，并写入恢复指令。`)
  .contractRefs(
    refs.requirementWeb,
    refs.partitionAnalysis,
    refs.executionPlan,
    refs.pipelineParams,
  )
  .taskTemplate(
    'DAG 构建',
    `读取 requirement-web.json。
为每对命题判断依赖类型。
构建节点和边。
检测环，断开 related 边直到无环。`,
  )
  .taskTemplate(
    'Session 分配',
    `按连通分量分组。
计算每个分量的拓扑深度。
超过阈值时运行社区发现。
分配 current_session 和 deferred_sessions。
生成 execution-plan.md。`,
  )
  .verify(
    verify.json('{workDir}/.meta/partition-analysis.json', '分区分析可解析'),
    verify.field('current_session', 'current_session 命题明确'),
    verify.field('scan_batches', 'scan_batches 可消费'),
  )
  .onFail(
    fail.degrade('存在循环依赖', '断开 related 类型边并记录 warning'),
    fail.degrade('当前 session 超过 12 个命题', '按社区进一步拆分'),
  )
  .checkpoint(
    barrier(
      ['session 数量', '当前 session 命题', '排期 session 命题'],
      '请确认分区方案和本次执行计划。',
    ),
  )
  .next('scan')
  .display({
    pattern: 'partition_cards',
    primary_unit: 'batch',
    max_visible: 3,
    legend: false,
    selection: 'multi',
  })
  .seq('partition-seq', '依赖分区', [
    doAction('parse', 'partition-confirm', '确认依赖', '读取 requirement-web，确认或推断 dependencies。', 3),
    doAction('validate', 'partition-dag', '构建 DAG', '构建命题 DAG，检测并打断循环依赖。', 3),
    doAction('merge', 'partition-sessions', '分配 Session', '按连通分量、拓扑深度和社区分组生成 sessions。', 3),
  ])
  .build();
