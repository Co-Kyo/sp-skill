import { step } from '@co-kyo/skillpack-types';
import { doAction } from '../actions.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const briefingAssemble = step('briefing-assemble', 'Briefing 组装')
  .target('为每个命题生成包含能力摘要的 Briefing')
  .summary('从能力摘要提取关键信息，组装Briefing')
  .dependsOn('capability-research')
  .reads(refs.requirementWeb, refs.summaries)
  .writes(refs.briefing)
  .inputs('{workDir}/.meta/requirement-web.json', '{workDir}/.meta/summaries/*.json')
  .outputs('{workDir}/.meta/briefings/{seq}-{short_name}.md')
  .detail(`每个命题读取涉及能力摘要。

提取：

- mechanism_summary
- bottlenecks
- tradeoffs
- experiment_code
- references

缺失能力摘要时标注缺失并继续处理其余能力。`)
  .section('内容比例', `开篇 10-15%：从限定词痛点切入。
主体 <= 70%：通用工程原理。
场景化/特化 >= 30%：限定词、上下文、边界、验证点。
收尾 10-15%：回到限定词给落地方案。

每个 Briefing 必须包含场景化 Trace，至少 3 个场景输入、3 个边界、3 个验证点。`)
  .contractRefs(
    refs.requirementWeb,
    refs.summaries,
    refs.subagentBudget,
    refs.briefing,
  )
  .taskTemplate(
    'Briefing Worker',
    `你是 {proposition_name} 的 Briefing 组装专家。
读取涉及能力摘要。
提取机制、瓶颈、权衡、实验和参考。
按内容比例组装 Briefing。
写入场景化 Trace，至少 3/3/3。
写入 {workDir}/.meta/briefings/{seq}-{short_name}.md。`,
  )
  .verify(
    verify.file('{workDir}/.meta/briefings/{seq}-{short_name}.md', 'Briefing 文件存在'),
    verify.field('缺失能力标注', '缺失能力已标注'),
    verify.count('场景化 Trace >= 3/3/3'),
  )
  .onFail(
    fail.degrade('能力摘要缺失', '标注缺失并继续处理其余能力'),
    fail.halt('命题列表为空', '停止并提示先完成 {{step:brainstorm}}'),
  )
  .checkpoint(
    barrier(
      ['完成数', '跳过数', '失败数'],
      '请确认 Briefing 素材完整性。',
    ),
  )
  .reuse(
    { ifExists: '{workDir}/.meta/briefings/{seq}-{short_name}.md', skipDescription: 'Briefing 已存在' },
  )
  .next('assemble')
  .display({
    pattern: 'auto_timeline',
    primary_unit: 'stage',
    max_visible: 4,
    legend: false,
    selection: 'none',
  })
  .map(
    'briefing-assemble-map',
    'Briefing 组装滚动窗口',
    { path: '{workDir}/.meta/requirement-web.json#propositions', dynamic: true },
    doAction(
      'assemble',
      'briefing-worker',
      'Briefing Worker',
      '为单个命题读取能力摘要并组装 Briefing。',
      5,
    ),
    5,
  )
  .build();
