# Changelog

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
