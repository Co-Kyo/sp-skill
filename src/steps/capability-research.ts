import { step } from 'skillnomad-types';
import { doAction } from '../actions.js';
import { effectContractSection } from '../domain/effects.js';
import { research } from '../domain/prompts.js';
import { runtime, modules } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const capabilityResearch = step('capability-research', '能力研究')
  .target('生成能力知识库主文件、结构化摘要和索引')
  .summary('深度研究原子能力，产出知识库主文件')
  .dependsOn('evaluate-pool')
  .reads(runtime.capabilityGraph, runtime.readme, { ...modules.refSources, as: 'contract' }, runtime.scanIndex)
  .writes(runtime.researchPlan, runtime.capabilities, runtime.summaries, runtime.capabilitiesReadme)
  .inputs('{workDir}/.meta/capability-graph.json', '{workDir}/README.md', '{workDir}/.meta/.raw-materials/index.json')
  .outputs('{workDir}/.meta/research-plan.json', '{workDir}/capabilities/*.md', '{workDir}/.meta/summaries/*.json', '{workDir}/capabilities/README.md')
  .detail(research.detail())
  .section('域 Agent 任务', research.domainAgentTask())
  .section('素材分配与 usage trace', research.materialAllocation())
  .section('效果契约', effectContractSection('E-capability-coverage'))
  // 8.5 迁移：contractRefs 收拢进 reads + as:'contract'，本方法已从 beta.4 类型删除。
  // contractRefs 内 researchPlan/capabilities/summaries/capabilitiesReadme 实为 writes 产物，不进 reads；
  // subagentBudget 为调度策略，已下沉到 meta.schedulingPolicy（全局口径）。
  .taskTemplate(
    '域 Agent 任务',
    research.domainAgentTemplate(),
  )
  .taskTemplate(
    '能力主文件模板',
    research.capabilityFileTemplate(),
  )
  .verify(
    verify.file('{workDir}/.meta/research-plan.json', '研究素材分配计划存在'),
    verify.json('{workDir}/.meta/research-plan.json', '研究素材分配计划可解析'),
    verify.field('coverage', '研究计划包含素材覆盖率'),
    verify.field('material_usage', '每个能力摘要包含 material_usage'),
    verify.file('{workDir}/capabilities/{id}-{name}.md', '能力主文件存在'),
    verify.json('{workDir}/.meta/summaries/{id}-{name}.json', '能力摘要可解析'),
    verify.count('分组能力数不超过 5'),
  )
  .onFail(
    fail.retry('子组 Agent 超时', '拆分为更小子组重试'),
    fail.degrade('全部失败', '降级为逐个 spawn 重试'),
  )
  .checkpoint(
    barrier(
      ['完成数', '跳过数', '失败数', '素材覆盖率'],
      '请确认能力研究质量。',
    ),
  )
  .reuse(
    { ifExists: '{workDir}/capabilities/{id}-{name}.md', skipDescription: '能力主文件已存在' },
    { ifExists: '{workDir}/.meta/summaries/{id}-{name}.json', skipDescription: '能力摘要已存在' },
  )
  .plugins('capability-research-mode')
  
  .display({
    pattern: 'auto_timeline',
    primary_unit: 'stage',
    max_visible: 4,
    legend: false,
    selection: 'none',
  })
  .map(
    'capability-research-map',
    '能力研究滚动窗口',
    { path: '{workDir}/.meta/capability-graph.json#capabilities', dynamic: true },
    doAction(
      'generate',
      'capability-research-worker',
      '能力研究 Worker',
      '研究一个原子能力，写入能力主文件和结构化摘要。',
      15,
    ),
    5,
  )
  .build();
