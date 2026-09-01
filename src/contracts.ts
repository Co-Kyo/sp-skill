import type {
  SourceContract,
  SourceRef,
} from 'skillnomad-types';

/**
 * **runtime —— 运行时数据契约（26 条）**
 *
 * 路径含 `{workDir}` / `{seq}` 模板变量，运行时才实例化，是 agent 执行期的读写目标
 * （reads 读上游产物，writes 写本步产物）。
 *
 * **路径 = 语义本身**：改路径即改契约（断链历史产物），
 * 因此不属于 8.15「路径降级为渲染载体」的范围 —— 这是把 refs 拆成双表的根本依据
 * （见《refs 拆分报告》《产物路径模型-对齐》）。
 */
export const runtime = {
  run: { path: '{workDir}/.meta/run/run.json', description: '运行信封', required: true },
  anchors: { path: '{workDir}/.meta/brainstorm/anchors.json', description: '共享骨架', required: true },
  requirementWeb: { path: '{workDir}/.meta/requirement-web.json', description: '需求网', required: true },
  partitionAnalysis: { path: '{workDir}/.meta/partition-analysis.json', description: '分区分析', required: true },
  executionPlan: { path: '{workDir}/execution-plan.md', description: '执行计划', required: true },
  scanIndex: { path: '{workDir}/.meta/.raw-materials/index.json', description: '素材索引', required: true },
  scanMaterials: { path: '{workDir}/.meta/.raw-materials/*.md', description: '素材正文', required: true },
  capabilityGraph: { path: '{workDir}/.meta/capability-graph.json', description: '能力图谱', required: true },
  dependencyGraph: { path: '{workDir}/.meta/dependency-graph.json', description: '依赖图', required: true },
  highgrounds: { path: '{workDir}/.meta/highgrounds.json', description: '战略高地', required: true },
  learningPath: { path: '{workDir}/.meta/learning-path.json', description: '学习路径', required: true },
  evaluations: { path: '{workDir}/.meta/evaluations.json', description: '评估结果', required: true },
  readme: { path: '{workDir}/README.md', description: '命题总览', required: true },
  candidates: { path: '{workDir}/.meta/candidates.md', description: '候选池', required: true },
  researchPlan: { path: '{workDir}/.meta/research-plan.json', description: '能力研究素材分配与 usage trace', required: true },
  capabilities: { path: '{workDir}/capabilities/*.md', description: '能力主文件', required: true },
  summaries: { path: '{workDir}/.meta/summaries/*.json', description: '能力摘要', required: true },
  capabilitiesReadme: { path: '{workDir}/capabilities/README.md', description: '能力索引', required: true },
  briefing: { path: '{workDir}/.meta/briefings/{seq}-{short_name}.md', description: '命题 Briefing', required: true },
  overview: { path: '{workDir}/{seq}-{short_name}/overview.md', description: 'Overview', required: true },
  edgeCases: { path: '{workDir}/{seq}-{short_name}/edge-cases.md', description: 'Edge Cases', required: true },
  tradeoffs: { path: '{workDir}/{seq}-{short_name}/trade-offs.md', description: 'Trade-offs', required: true },
  references: { path: '{workDir}/{seq}-{short_name}/references.md', description: 'References', required: true },
  experiment: { path: '{workDir}/{seq}-{short_name}/experiment/README.md', description: 'Experiment', required: true },
  ladder: { path: '{workDir}/{seq}-{short_name}/learning-ladder.md', description: '学习阶梯', required: true },
  assemblyRatioTrace: { path: '{workDir}/{seq}-{short_name}/_assembly_ratio_trace.json', description: '组装特化占比 trace', required: true },
} satisfies Record<string, SourceRef>;

/**
 * **modules —— 内容模块（12 条）**
 *
 * 静态资产路径，构建期已知；路径只是**渲染载体**，改路径 = 打包期重定向，零语义影响。
 * 8.16 起，这些模块中的格式契约（schemas.md ×3）将挂到产物实体名下（裁决 ③A）。
 *
 * 8.15 Step 1 相对旧 `refs` 的两处变化：
 * - **移除 4 条**：protocolScheduling / pipelineParams / subagentBudget / schedulingDetail
 *   已随 8.13/8.14 下沉到 `meta.schedulingPolicy`，步骤不再引用（零处引用，非行为变更）。
 * - **收编 1 条**：`assets/00-intent-anchor/schemas.md` 原为裸路径字面量（intent-anchor.ts），
 *   逃逸在注册表外；收编为 `intentAnchorSchemas`（description 保持原字面量，确保产物零 diff）。
 */
export const modules = {
  schemasScan: { path: 'assets/03-scan/schemas.md', description: '扫描输出格式', required: true },
  refSources: { path: 'assets/common/ref-sources.md', description: 'T0 域名表 + 反爬域名表 + 信源分级规则', required: true },
  strategyLevel: { path: 'assets/common/strategy-level.md', description: '密度参数查表', required: true },
  agentInit: { path: 'assets/01-brainstorm/agent-init.md', description: '维度 Agent 初始化定义', required: true },
  barrierCheck: { path: 'assets/01-brainstorm/barrier-check.md', description: 'Barrier 检查项与决策矩阵', required: true },
  fallbackProtocol: { path: 'assets/01-brainstorm/fallback-protocol.md', description: '收敛者失败降级协议', required: true },
  brainstormSchemas: { path: 'assets/01-brainstorm/schemas.md', description: '头脑风暴输出格式', required: true },
  yearRules: { path: 'assets/00-intent-anchor/year-rules.md', description: '年限推断规则', required: true },
  skipRules: { path: 'assets/00-intent-anchor/skip-rules.md', description: '跳过判断规则', required: true },
  intentAnchorSchemas: { path: 'assets/00-intent-anchor/schemas.md', description: 'anchors 格式', required: true },
  evaluationMethod: { path: 'assets/05-evaluate-pool/method.md', description: '评估方法论（投影）', required: true },
  antiCrawlFetch: { path: 'plugins/anti-crawl-fetch.md', description: 'Playwright 抓取', required: false },
} satisfies Record<string, SourceRef>;

/**
 * **契约注册表（已清空）**
 *
 * 8.5 起「契约引用」章节由 `reads.filter(as === 'contract')` 派生渲染，
 * 本数组在 skillnomad 源码中**无任何消费方**（仅 `SkillSourceModel.contracts` 类型字段），
 * 且 sp-skill 侧无人导入 —— 原 5 条中 4 条与 `modules` 重复登记、1 条（protocol-checkpoint）零引用。
 *
 * 8.15 Step 1 清空（消除双轨冗余），类型字段待 8.15 Step 2 与框架协商移除。
 */
export const contracts: SourceContract[] = [];
