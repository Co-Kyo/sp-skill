import { step } from '@co-kyo/skillpack-types';
import { doAction } from '../actions.js';
import { effectContractSection } from '../domain/effects.js';
import { assembly } from '../domain/prompts.js';
import { nextStep, prevStep } from '../domain/session.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const assemble = step('assemble', '命题组装')
  .target('为每个命题生成四象限研究输出')
  .summary('组装四象限研究输出（overview/edge-cases/trade-offs/experiment）')
  .dependsOn(prevStep('assemble'))
  .reads(refs.briefing, refs.requirementWeb, refs.capabilityGraph)
  .writes(refs.overview, refs.edgeCases, refs.tradeoffs, refs.references, refs.experiment, refs.assemblyRatioTrace)
  .inputs('{workDir}/.meta/briefings/{seq}-{short_name}.md')
  .outputs(
    '{workDir}/{seq}-{short_name}/overview.md',
    '{workDir}/{seq}-{short_name}/edge-cases.md',
    '{workDir}/{seq}-{short_name}/trade-offs.md',
    '{workDir}/{seq}-{short_name}/references.md',
    '{workDir}/{seq}-{short_name}/experiment/README.md',
    '{workDir}/{seq}-{short_name}/_assembly_ratio_trace.json',
  )
  .detail(assembly.detail())
  .section('Markdown Agent', assembly.markdownAgent())
  .section('Experiment Agent', assembly.experimentAgent())
  .section('效果契约', effectContractSection('E-assemble-ratio'))
  .contractRefs(
    refs.briefing,
    refs.requirementWeb,
    refs.capabilityGraph,
    refs.overview,
    refs.edgeCases,
    refs.tradeoffs,
    refs.references,
    refs.experiment,
    refs.assemblyRatioTrace,
    refs.subagentBudget,
  )
  .taskTemplate(
    'Markdown Agent',
    assembly.markdownAgentTask(),
  )
  .taskTemplate(
    'Experiment Agent',
    assembly.experimentAgentTask(),
  )
  .verify(
    verify.file('{workDir}/{seq}-{short_name}/edge-cases.md', 'edge-cases 文件存在'),
    verify.field('筛选_trace', 'edge-cases 每个坑点包含筛选_trace'),
    verify.file('{workDir}/{seq}-{short_name}/_assembly_ratio_trace.json', '组装占比 trace 存在'),
    verify.json('{workDir}/{seq}-{short_name}/_assembly_ratio_trace.json', '组装占比 trace 可解析'),
    verify.count('场景化输入/边界/验证 >= 3，特化占比 >= 30%'),
  )
  .onFail(
    fail.halt('Briefing 缺失', '停止并提示先完成 {{step:briefing-assemble}}'),
    fail.degrade('一个 Agent 失败', '标记 partial，不阻塞同命题另一 Agent'),
  )
  .checkpoint(
    barrier(
      ['完成数', '部分完成数', '失败数'],
      '请确认命题组装质量。',
    ),
  )
  .reuse(
    { ifExists: '{workDir}/{seq}-{short_name}/overview.md', skipDescription: '命题 overview 已存在' },
  )
  .next(nextStep('assemble'))
  .display({
    pattern: 'auto_timeline',
    primary_unit: 'stage',
    max_visible: 4,
    legend: false,
    selection: 'none',
  })
  .map(
    'assemble-map',
    '命题组装滚动窗口',
    { path: '{workDir}/.meta/requirement-web.json#propositions', dynamic: true },
    doAction(
      'assemble',
      'assemble-worker',
      '命题组装 Worker',
      '为单个命题组装 overview、edge-cases、trade-offs、references 和 experiment。',
      8,
    ),
    5,
  )
  .build();
