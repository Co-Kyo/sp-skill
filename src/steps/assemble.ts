import { step } from '@co-kyo/skillpack-types';
import { doAction } from '../actions.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const assemble = step('assemble', '命题组装')
  .target('为每个命题生成四象限研究输出')
  .summary('组装四象限研究输出（overview/edge-cases/trade-offs/experiment）')
  .dependsOn('briefing-assemble')
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
  .detail(`每个命题使用 2 个 Agent：

- Markdown Agent：overview / edge-cases / trade-offs / references
- Experiment Agent：experiment/README.md + experiment/src/

两个 Agent 无相互依赖，可并行。

完成判定：

- 两个 Agent 均完成 = 命题完成
- 一个失败 = partial
- 两个失败 = failed`)
  .section('Markdown Agent', `读取 Briefing 和涉及能力摘要。

按数据流顺序编排 overview。

edge-cases 至少 3 个坑点，每个坑点附带筛选_trace。

trade-offs 输出 2-3 种技术路线。

references 按 Tier 排序去重。

每个命题必须包含至少 3 个场景化输入、3 个边界、3 个验证点。
内容比例：通用高地 <= 70%，场景化/特化内容 >= 30%。
完成后写入 _assembly_ratio_trace.json，记录 generic_pct、scenario_pct 和各项计数。`)
  .section('Experiment Agent', `读取 Briefing。

选取战略价值最高的实验代码。

合并为可运行的 HTML/JS 文件。

README 必须包含运行方式和验证检查点。`)
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
    `你是 {proposition_name} 的 Markdown 组装专家。
读取 Briefing。
组装 overview、edge-cases、trade-offs、references。
每个坑点必须包含筛选_trace。
内容比例：通用高地 <= 70%，场景化/特化内容 >= 30%。
至少 3 个场景化输入、3 个边界、3 个验证点。
写入 _assembly_ratio_trace.json。`,
  )
  .taskTemplate(
    'Experiment Agent',
    `你是 {proposition_name} 的实验组装专家。
读取 Briefing。
选取战略价值最高的实验代码。
合并为可运行 HTML/JS。
README 说明运行方式和验证检查点。`,
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
  .next('learning-ladder')
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
