import { step } from '@co-kyo/skillpack-types';
import { doAction } from '../actions.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const scan = step('scan', '广域扫描')
  .target('生成可被能力图谱消费的素材索引和素材正文')
  .summary('按level_weight差异化搜索信源，结构化提取')
  .dependsOn('partition')
  .reads(
    refs.requirementWeb,
    { ...refs.partitionAnalysis, required: false },
    refs.schemasScan,
    refs.refSources,
    refs.strategyLevel,
    refs.protocolScheduling,
    refs.pipelineParams,
    refs.subagentBudget,
    refs.antiCrawlFetch,
  )
  .writes(refs.scanIndex, refs.scanMaterials)
  .inputs(
    'source_desc',
    'topic',
    '--year / --source 可选约束',
    '{workDir}/.meta/requirement-web.json',
    '可选 {workDir}/.meta/partition-analysis.json',
  )
  .outputs('{workDir}/.meta/.raw-materials/index.json', '{workDir}/.meta/.raw-materials/*.md')
  .detail(`执行前必须完成 Playwright 环境检查。

1. 使用 npx playwright --version 检查全局安装状态。
2. 若未安装，使用 clarify 请用户选择全局安装或跳过。
3. Playwright 安装命令：npm install -g playwright --registry=https://registry.npmmirror.com && npx playwright install chromium。
4. 安装失败时标记 playwright_available=false，反爬域名直接 failed。

搜索密度按 strategy-level 查表：

- core: kw=2, r=8（L2 默认）
- premise: kw=1, r=3
- outlook: kw=1, r=2

每个命题按 role 计算原理轨道和实践轨道的 search_plan。`)
  .section('URL 盘点与策略分配', `Phase A 完成后、Phase B 前，必须先生成 url-preflight.json，禁止未盘点直接批量抓取。

策略规则：

- T0/T1 官方或已知可达域名：direct。
- 反爬特征明确（login-wall、JS-render、403 历史）：playwright。
- 境外网络不可达或代理需求（Google/medium/web.dev 等）：virtual_gateway。
- 已知 404/无价值/SPA 空壳：skip 并记录 skip_reason。

virtual_gateway 表示先经过网络策略层判断，不直接反复访问。`)
  .section('Phase A 执行细节', `按命题批次 spawn search-{batch_id} agent。

批次大小 = ceil(命题数 / W)，W = min(5, 命题数)。

每个搜索 agent 输出 search-batch.{batch_id}.json，主线程 merge 后：

1. 按 URL 去重，保留 snippet 最长的一条。
2. 合并 from_proposition。
3. 按 T0 / anti-crawl / unknown 分级。
4. 按 url-batch-size 分批并写入 url-batches.json。`)
  .section('Phase B 执行细节', `按 URL 批次 spawn extract-{batch_id} agent。

抓取策略：

- T0 直接抓取。
- anti-crawl 且 Playwright 可用时加载 anti-crawl-fetch 插件。
- anti-crawl 且 Playwright 不可用时标记 failed。
- unknown 先直接抓取，失败再降级 Playwright。

提取内容：

- key_concepts
- capability_points
- depth_level
- quality_signals

每完成一个 URL 立即写入 partial.{batch_id}.json 和 B{batch_id}-M{N}-{slug}.md，不等整批结束。

超时恢复规则：

- 子 agent 超时时，主线程读取已落盘 partial，不丢弃已完成部分。
- 未完成 URL 按 url-preflight.json 重新分配策略，禁止重复访问已知失败域名。
- 写入 task_timeout 与 degrade 事件，记录真实时间。`)
  .section('Phase C 执行细节', `主线程合并所有 partial 文件：

1. 合并 materials 与 discarded。
2. 对 unknown 域名按 ref-sources 标准分级。
3. 对多源能力点做 cross-comparison。
4. 动态注册达标域名到 dynamic-sources.json。
5. 生成最终 index.json。`)
  .section('检查点', `展示素材 Tier 分布、丢弃数和 role 覆盖统计，使用 clarify 等待用户确认后再进入 {{step:capability-graph}}。`)
  .section('输出 Schema', `search-batch.{batch_id}.json:

\`\`\`json
{
  "batch_id": "B1",
  "propositions_searched": ["RW-P1"],
  "results": [
    {
      "url": "https://example.com/a",
      "title": "title",
      "snippet": "snippet",
      "domain": "example.com",
      "tier": "unknown",
      "from_proposition": "RW-P1",
      "keyword_group": "principles"
    }
  ],
  "excluded": []
}
\`\`\`

url-batches.json:

\`\`\`json
{
  "generated_at": "ISO时间",
  "total_urls": 1,
  "total_batches": 1,
  "playwright_available": false,
  "batches": [
    {
      "batch_id": "B1",
      "url_count": 1,
      "propositions_covered": ["RW-P1"],
      "urls": [
        {
          "url": "https://example.com/a",
          "title": "title",
          "snippet": "snippet",
          "domain": "example.com",
          "tier": "unknown",
          "need_playwright": false,
          "from_proposition": "RW-P1"
        }
      ]
    }
  ],
  "excluded": []
}
\`\`\`

partial.{batch_id}.json:

\`\`\`json
{
  "batch_id": "B1",
  "materials": [
    {
      "id": "B1-M1",
      "title": "title",
      "url": "https://example.com/a",
      "domain": "example.com",
      "source_tier": "T3",
      "from_proposition": ["RW-P1"],
      "relevance": "与命题的关联说明",
      "fetch_status": "ok",
      "fetch_method": "direct",
      "depth_level": "机制级",
      "file_path": "B1-M1-example.md"
    }
  ],
  "discarded": []
}
\`\`\``)
  .contractRefs(
    refs.schemasScan,
    refs.refSources,
    refs.strategyLevel,
    refs.protocolScheduling,
    refs.pipelineParams,
    refs.antiCrawlFetch,
  )
  .taskTemplate(
    '搜索 Agent',
    `你是搜索发现专家。
读取命题搜索计划，逐条执行搜索，取 max_results 条结果。
记录 url/title/snippet/domain，按 T0/反爬/unknown 分级。
过滤 excluded_keywords 命中项。
写入 search-batch.{batch_id}.json。`,
  )
  .taskTemplate(
    '提取 Agent',
    `你是内容提取专家。
读取 url-batch.{batch_id}.json。
按 T0/Playwright/unknown 分流抓取。
抓取成功时提取 key_concepts、capability_points、depth_level、quality_signals。
写入 partial.{batch_id}.json 和素材 Markdown。`,
  )
  .verify(
    verify.file('{workDir}/.meta/.raw-materials/index.json', 'index.json 已生成'),
    verify.json('{workDir}/.meta/.raw-materials/index.json', 'index.json 可解析'),
    verify.field('file_path', '每条 material 有 file_path'),
    verify.field('fetch_status', '反爬抓取状态已记录'),
  )
  .onFail(
    fail.retry('搜索 agent 超时', '检查 search-batch 文件是否完整，完整则保留，否则重试一次'),
    fail.retry('提取 agent 超时', '检查 partial 文件是否完整，完整则保留，否则重试一次'),
    fail.degrade('Playwright 不可用', '反爬域名标记 failed'),
    fail.degrade('Phase C partial 缺失', '跳过该 batch，标注 degraded'),
    fail.halt('URL 盘点失败', '不进入 Phase B，先修复 preflight'),
    fail.degrade('境外网络不可达', '统一走 virtual_gateway 或 skip'),
    fail.degrade('反爬识别失败', '标记 fetch_status_trace，不反复重试'),
    fail.retry('提取超时有 partial', '读取已落盘 partial，只补未完成 URL'),
  )
  .checkpoint(
    barrier(
      ['素材 Tier 分布', '丢弃数', 'role 覆盖统计'],
      '请确认扫描素材质量和信源覆盖。',
    ),
  )
  .plugins('anti-crawl-fetch', 'year-granularity')
  .next('capability-graph')
  .display({
    pattern: 'coverage_cards',
    primary_unit: 'batch',
    max_visible: 3,
    legend: false,
    selection: 'multi',
  })
  .seq('scan-seq', '扫描三阶段', [
    doAction('search', 'scan-phase-a', 'Phase A 并行搜索', '按命题批次并行搜索 URL，merge 后生成 url-batches.json。', 5),
    doAction('extract', 'scan-phase-b', 'Phase B 并行提取', '按 URL 批次抓取并结构化提取，生成 partial 文件和素材 Markdown。', 10),
    doAction('merge', 'scan-phase-c', 'Phase C 主线程合并', '合并 partial、域名分级、交叉比较并生成 index.json。', 5),
  ])
  .build();
