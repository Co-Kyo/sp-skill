# Phase III 决策简报 — B1-B11 唯一源裁决登记册

> 实施状态(2026-08-29,全部完成):
> - **B2-A ✅ B9-A ✅**(method.md 投影对齐+挂接,漂移锁就位)
> - **B1-A ✅ B6-A ✅ B7-A ✅ B8-A ✅ B10-A ✅ B11-A ✅**(第一批登记差分,差分 9 处全部对号)
> - **B3-A ✅ B4-A ✅ B5-A ✅**(漂移锁护栏测试,零产物差异)
> - 评审:散文 3 块经默认子代理评审 **3/3 intentional、0 drift**,B1 Schema 重写逐字段核验零丢失(verdicts-phase3-default-subagent-2026-08-29.json)
> - 单测 47/47;typecheck 0 错误;分支 phase2(未合并,合并/发布时机由用户定)

> 数据来源:Phase II 交叉勘察(两轮独立勘察一致)+ 批次 1 测试护栏新发现(B10)。
> 每项给出:冲突事实 → 处置选项 → 建议选项 → 影响面/工作量。决策后按登记制实施,复用差分协议。

## 〇、总览仪表盘

### 严重度分布

```
B1  scan Schema 双写已漂移     ████████████ 高   运行时歧义 + 产物漂移
B2  评估阈值两套并存           ████████████ 高   评分口径不定(运行时生效其中一套)
B7  跳过拦截词不一致           ██████████░░ 高   直接影响跳过判断行为
B8  Playwright 标记口径        ████████░░░░ 中   两处标记语义未映射
B6  收敛者职责双写             ██████░░░░░░ 中   政策版 vs 任务实文
B9  无主 method.md ×2(551行)  ██████░░░░░░ 中   资产无主 + 与 B2 冲突纠缠
B3  密度表 4 份拷贝            ████░░░░░░░░ 低   数值一致,仅防漂移
B4  role/level 约束 4 份       ████░░░░░░░░ 低   同上(含无主 level-weight.md)
B10 flowOverview 标注错位      ████░░░░░░░░ 低   展示层(SKILL.md)
B11 phase 描述双写漂移         ██░░░░░░░░░░ 低   展示层(两表两个变体)
B5  reason_type 枚举 4 份      ██░░░░░░░░░░ 低   值一致,仅防漂移
```

### 影响面矩阵(●=该选项会触动,○=不触动)

| 编号 | 主题 | 改产物 | 改运行时 | 纯护栏可行 | 建议选项 | 工作量 |
|---|---|---|---|---|---|---|
| B1 | scan Schema 正本 | ● | ● | ✗ | A:asset 版为正本 | 0.5 天 |
| B2 | 评估阈值正本 | ○(A)/●(B) | ○(A)/●(B) | ✗ | A:步骤版为正本 | 0.5 天(A) |
| B3 | 密度表防漂移 | ○ | ○ | ● | A:一致性断言测试 | 0.25 天 |
| B4 | role/level 防漂移 | ○ | ○ | ● | A:一致性断言测试 | 0.25 天 |
| B5 | reason_type 防漂移 | ○ | ○ | ● | A:一致性断言测试 | 0.25 天 |
| B6 | 收敛者职责正本 | ● | ○ | ✗ | A:任务实文为正本 | 0.5 天 |
| B7 | 拦截词并集 | ● | ● | ✗ | A:并集统一(审慎拦截) | 0.5 天 |
| B8 | Playwright 标记映射 | ● | ○ | ✗ | A:写明两标记联动语义 | 0.5 天 |
| B9 | method.md ×2 去留 | ●(移出)/○(挂接) | ●(挂接) | ✗ | A:B2 定案后更新+挂接 | 1 天 |
| B10 | flowOverview 标注修正 | ● | ○ | ✗ | A:对齐 phases 边界 | 0.25 天 |
| B11 | phase 描述统一 | ● | ○ | ✗ | A:以步骤 summary 为正本 | 0.25 天 |

依赖关系:`B2 ──→ B9`(method.md 处置取决于阈值正本裁决);其余互相独立。
打包建议:**第一批登记差分**(B1+B6+B7+B8+B10+B11,一次差分验收);**第二批纯护栏**(B3+B4+B5,零产物差异);**第三批行为域**(B2→B9,顺序不可倒)。

## 一、高严重度项(建议本批决策)

### B1 · scan 输出 Schema:两份已各自演化

| | 内联版(现 content/scan.ts,渲染于 04-scan) | asset 版(assets/03-scan/schemas.md,经 refs.schemasScan 运行时可读) |
|---|---|---|
| url-batches 字段 | 基础 7 字段 | **+ t0_domains / anti_crawl_domains** |
| playwright_available | false | true |
| total_urls | 1(占位) | 150 |
| partial 追踪 | 无 fetch_status_trace | **+ fetch_status_trace** |

- 运行时两份同时可见 → AI 以哪份为准未定义,属真实歧义
- **选项 A(建议)**:asset 版为正本(字段更全,像后续演化版)——`content/scan.ts` 的 outputSchema() 重写为对齐 asset,登记产物变化
- 选项 B:内联版为正本,asset 更新;选项 C:保持双写(不推荐,歧义持续)

### B2 · 评估阈值:两套体系并存

| | 步骤版(运行时实际生效) | method.md 版(未挂 reads,运行时不可见) |
|---|---|---|
| 评分制 | 每维 1-3 分,总分 12 | 每维 0-3 分 |
| 入池阈值 | L1 不入池 / L2≥6 / L3≥5 / L4 任一≥2 | ≥8 high / 6-7 medium / ≤5 不达标 |
| 一票入池 | 有(三条件) | 有(同义) |

- **选项 A(建议)**:步骤版为正本(已随 v1.0/v1.1 运行的口径;difficulty/recommended_order 下游均基于它)→ method.md 更新对齐
- 选项 B:method.md 版为正本 → **行为变更**(阈值体系重设计,下游全部重标定),工作量 1-2 天起

### B7 · 跳过拦截词:asset 比散文多 4 个词

- 散文版(INTERCEPT_WORDS,现 src 单源):面试、场景、分析、复杂
- asset 版(skip-rules.md):上述 + **考察、问、中大型、多团队**
- 运行时两份都可见 → 跳过头脑风暴的判断集有歧义
- **选项 A(建议)**:并集统一(INTERCEPT_WORDS 扩为 8 词,asset 同步)——审慎拦截,宁多勿漏;选项 B:以 asset 为准;选项 C:以散文为准(删 asset 4 词)

## 二、中严重度项

### B6 · 收敛者职责:strategy-level.md 政策版 vs 步骤任务实文
建议 A:任务实文(integratorTask)为正本,strategy-level.md 收敛者节改为摘要+指向(政策文档不应维护第二份操作细节)。

### B8 · Playwright 标记口径
scan 散文用 `playwright_available=false`,插件用 `fetch_status: failed`——两标记无映射说明。建议 A:在插件与散文各加一句联动语义(插件抓取失败 → url-batches 标记 playwright_available=false)。

### B9 · 无主 method.md ×2(551 行)
assets/04-capability-graph/method.md(392 行,与散文基本一致仅多"⚪ 基础设施<1.0"档)+ assets/05-evaluate-pool/method.md(159 行,**含与 B2 冲突的旧阈值**)。rule-isolation.md:63 宣称可读但 refs 未挂。
建议 A:**B2 定案(选步骤版)后** → 更新 method.md 对齐 → 挂接 reads(运行时可见,方法论正本);另需同步 rule-isolation 或删除宣称。顺序:必须在 B2 之后。

## 三、低严重度项(可并入任一批次顺手处理)

- **B3/B4/B5**:src 侧已单源(SCAN_DENSITY / LEVEL_ROLE_CONSTRAINT / REASON_TYPES),assets 侧是文档拷贝且数值一致 → 纯护栏方案:一致性断言测试(src 常量 ↔ asset 文本),零产物差异;另 B4 附带 level-weight.md(46 行无主)建议保留并标注归属
- **B10**:flowOverview 标注 (03-05)/(06-10) 与 phases 边界(依赖分区=03,前处理=04-06,后处理=07-10)错位 → 建议修正为 (00)(01)(02)(03)(04-06)(07-10),SKILL.md 登记变更
- **B11**:phase 描述与步骤 summary 双写已漂移(如"确认 workDir(交互步骤),各步骤按需加载公共规则"两变体)→ 建议以 summary 为正本统一,SKILL.md 登记变更

## 四、建议执行节奏

| 批次 | 内容 | 特点 | 工作量 |
|---|---|---|---|
| 第一批 | B1 + B6 + B7 + B8 + B10 + B11 | 全部登记后改产物,一次差分 + 评审员复核 | 1-1.5 天 |
| 第二批 | B3 + B4 + B5 | 纯护栏测试,零产物差异 | 0.5 天 |
| 第三批 | B2(A) → B9(A) | 顺序依赖,含 method.md 更新与挂接 | 1-1.5 天 |
| 收尾 | 版本 1.2.0 发布 + 真实学习标定 | 与"效果裁决"合并进行 | — |
