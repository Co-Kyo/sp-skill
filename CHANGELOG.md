# Changelog

## post-v1.4.0（8.16 产物路径投射，beta.9 配套）

- **产物实体声明**：新建 `src/domain/entities.ts`（27 条实体：8 组领域概念 + 机制产物，含 `init.json` 补漏）；`refOf`/`schemaRef` 概念引用辅助。
- **步骤层路径字面量清零**：reads/writes/inputs/outputs/map-over/verify/reuse 全部改概念引用（`refOf('xxx').path`）；代码级 `{workDir}` 字面量 0（仅提示词文本保留）。
- **contracts.ts**：runtime 表删除；modules 12→9（3 个 schemas 挂实体，③A）；注册表同步。
- **effects 同源**：4 条 EFFECT_CONTRACTS artifact 从实体取值（ladder 双写消失）。
- 验收：typecheck ✓ · 44 测试 ✓ · 产物 = 预期修正性变化（2 处 description 精化）· 依赖 skillnomad beta.9 候选。

## post-v1.4.0（8.15 模块抽象 Step 1/2，未打 tag）

- **Step 1 · refs 双表拆分**（`e86fb38`）：`contracts.ts` 拆为 `runtime`（26 条数据契约）/ `modules`（12 条内容模块）；移除 4 条下沉残留、收编 1 处裸路径、清空 `contracts` 数组（当时零消费方）；产物零 diff。
- **Step 2 · 模块注册表 + 标签安置**：`contracts` 数组复活为模块注册表（12 条，含 `id`/`kind`/`scope`）；9 处 `as` 标签按真实性质修正（5 rule + 1 method + 3 schema）；2 个 skill 级契约保留。产物 = 预期修正性变化（契约引用 13→4，9 条移入读取表，信息不丢失）。
- 注：依赖 skillnomad beta.7 候选（`scope` 字段 + `validateModuleUsage` 构建期校验）；未打新 sp-skill 发布 tag。

## post-v1.4.0（skillnomad beta.5 / beta.6 配套，依赖对齐）

- **跟随 skillnomad 0.1.0-beta.5**（`170d5f6`）：依赖升级；序言「契约引用」章节恢复（8.5 渲染侧派生修复落地）。
- **跟随 skillnomad 0.1.0-beta.6**（`00cc676`）：8.13/8.14 调度策略 schedulingPolicy 迁移——`skill.ts` meta 加 `schedulingPolicy`（W=5 / 窗口预算 / 分批规则）；7 步「待迁移」注释更新为「已下沉」；6 步调度契约文档从 reads 表消失，策略约束收敛到 SKILL.md「## 调度策略」公共章节（process 级 0 泄漏）。
- 注：以上为依赖对齐 commit，未打新 sp-skill 发布 tag；当前最新 tag 仍为 **v1.4.0**。

## v1.4.0

- 构建工具链换轨：@co-kyo/skillpack → skillnomad（0.1.0-beta.3），产物逐字节不变。
- 阶段 2 顺序收敛：顺序事实 11/11 统一到 dependsOn——删除 EDGES/HEAD/TAIL 会话表、prevStep/nextStep 查表、全部 .next() 字面量；flowOverview 改由构建期派生。
- flow.test 精简为纯锚定断言；链自洽守卫由 skillnomad 构建期校验承接（validateStepChain / DependencyRefs / PhaseCoverage）。
- 修复 B1-A 漂移锁的 Windows 行尾误报（CRLF/LF 归一）。


## v1.0.0

- 使用发布版 `skillnomad` 构建 sp-skill。
- 源码仓库包含 `skill.ts`、`src/`、`assets/`、`plugins/`。
- GitHub Actions 自动生成可直接导入的 Markdown skill 压缩包。
