import { step } from '@co-kyo/skillpack-types';
import { doAction } from '../actions.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const learningLadder = step('learning-ladder', '学习阶梯')
  .target('为每个命题生成从不会到能讲的渐进学习路径')
  .summary('生成从"不会"到"能讲"的渐进式路径')
  .dependsOn('assemble')
  .reads(refs.dependencyGraph, refs.summaries, refs.overview)
  .writes(refs.ladder)
  .inputs('{workDir}/.meta/dependency-graph.json', '{workDir}/.meta/summaries/*.json', '{workDir}/{seq}-{short_name}/overview.md')
  .outputs('{workDir}/{seq}-{short_name}/learning-ladder.md')
  .detail(`提取命题能力子图。

按依赖拓扑分层：

- Layer 0：无依赖能力
- Layer 1：依赖 Layer 0
- Layer 2：依赖 Layer 0+1

归纳 3-4 个阶段，每阶段包含概念、技能、综合步骤。`)
  .section('步骤格式', `每步包含：

- 要做什么
- 你会看到什么
- 这说明了什么
- 接下来去哪
- 做到才算过

失败时给出明确回退指引。`)
  .contractRefs(
    refs.dependencyGraph,
    refs.summaries,
    refs.overview,
    refs.subagentBudget,
    refs.ladder,
  )
  .taskTemplate(
    '学习阶梯 Worker',
    `你是 {proposition_name} 的学习阶梯生成专家。
提取能力子图。
拓扑排序并归纳阶段。
每个阶段编排概念、技能、综合步骤。
写入 learning-ladder.md。`,
  )
  .verify(
    verify.file('{workDir}/{seq}-{short_name}/learning-ladder.md', '学习阶梯文件存在'),
    verify.count('阶段数 3-4'),
    verify.field('做到才算过', '每步有二值验证标准'),
  )
  .onFail(
    fail.degrade('能力依赖图有环', '打断循环依赖并标记 warning'),
    fail.degrade('能力数量超过 8', '合并相似能力减少阶段数'),
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
  .next('done')
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
