// 效果契约:结尾产物的既有保证,显式化为源码级数据。
// Phase R:仅数据 + 单测,不渲染进产物(产物零变更);
// Phase I 的信号落盘(judgment/stuck/time 记录)在此扩展,并按登记差异渲染。
// owns = 违约时应修改的源码位置(归属即映射,由构建保证同源)。
export interface EffectContract {
  id: string;
  artifact: string;
  owns: readonly string[];
  expects: readonly string[];
}

export const EFFECT_CONTRACTS: readonly EffectContract[] = [
  {
    id: 'E-ladder-judgment',
    artifact: '{workDir}/{seq}-{short_name}/learning-ladder.md',
    owns: ['src/domain/ladder.ts', 'assets/09-learning-ladder/schemas.md'],
    expects: [
      '每个阶梯 Step 有「做到才算过」二值验证标准',
      '阶段数 3-4',
      '失败时给出明确回退指引',
    ],
  },
  {
    id: 'E-capability-coverage',
    artifact: '{workDir}/capabilities/*.md',
    owns: ['src/steps/capability-research.ts', 'assets/06-capability-research/schemas.md'],
    expects: [
      '每个 fetch_status=ok 素材至少分配到一个能力,不能静默丢弃',
      '每个摘要包含 material_usage(逐条 material_id/file_path/usage/selection_reason)',
      '分组上限 5 个能力',
    ],
  },
  {
    id: 'E-briefing-trace',
    artifact: '{workDir}/.meta/briefings/{seq}-{short_name}.md',
    owns: ['src/steps/briefing-assemble.ts', 'assets/07-briefing-assemble/schemas.md'],
    expects: ['场景化 Trace >= 3/3/3', '缺失能力摘要时标注缺失并继续'],
  },
  {
    id: 'E-assemble-ratio',
    artifact: '{workDir}/{seq}-{short_name}/_assembly_ratio_trace.json',
    owns: ['src/steps/assemble.ts', 'assets/08-assemble/schemas.md'],
    expects: [
      '通用高地 <= 70%,场景化/特化内容 >= 30%',
      '至少 3 个场景化输入、3 个边界、3 个验证点',
      'trace 记录 generic_pct/scenario_pct 与各项计数',
    ],
  },
];
