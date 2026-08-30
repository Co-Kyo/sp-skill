# Changelog

## v1.2.0

- 内容域收敛(Phase II):00-06 步骤源码 831→522 行(−37%),14 组规则常量进 `src/domain/content/`。
- 学习闭环(Phase I,D1-D7):判据按 L1-L4 校准、预计时长、进度留痕 progress.json、入口 README 模板、实验判据、效果契约渲染进产物。
- 口径治理(B1-B11):评估阈值唯一正本(method.md 投影化并挂接 reads)、扫描 Schema 以 asset 为正本、拦截词并集 8 词、收敛者职责正本、flowOverview 区间修正、phase 描述统一。
- 护栏:漂移锁 0→11;单测 21→47;typecheck 0 错误;登记差异 12/12 对号,评审 3/3 intentional。
- 步骤编号统一:assets/plugins 内 35 处旧编号引用对齐新体系,失效路径修正(B12)。
- 决策记录:见 `docs/DECISIONS-PhaseIII.md` 与各版验收报告。

## v1.1.0

- 学习闭环补齐(D1-D7):校准/时长/留痕/救援/入口/实验判据/效果契约渲染进产物。
- DDD 重构(Phase R):07-10 学习域收敛,交付与 v1.0 逐字节等价(52/52 文件)。
- 验收:登记差异 25/25 对号;单测 0→21;规则反馈环 ≈1.4 秒。

## v1.0.0

- 使用发布版 `@co-kyo/skillpack` 构建 sp-skill。
- 源码仓库包含 `skill.ts`、`src/`、`assets/`、`plugins/`。
- GitHub Actions 自动生成可直接导入的 Markdown skill 压缩包。
