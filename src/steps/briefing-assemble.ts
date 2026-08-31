import { step } from 'skillnomad-types';
import { doAction } from '../actions.js';
import { effectContractSection } from '../domain/effects.js';
import { briefing } from '../domain/prompts.js';
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
  .detail(briefing.detail())
  .section('内容比例', briefing.contentRatio())
  .section('效果契约', effectContractSection('E-briefing-trace'))
  // 8.5 迁移：contractRefs 收拢进 reads + as:'contract'，本方法已从 beta.4 类型删除。
  // contractRefs 内 briefing 实为 writes 产物，不进 reads；subagentBudget 为调度策略，标记待迁 meta.schedulingPolicy。
  .taskTemplate(
    'Briefing Worker',
    briefing.workerTask(),
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
