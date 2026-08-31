# Changelog

## v1.4.0

- 构建工具链换轨：@co-kyo/skillpack → skillnomad（0.1.0-beta.3），产物逐字节不变。
- 阶段 2 顺序收敛：顺序事实 11/11 统一到 dependsOn——删除 EDGES/HEAD/TAIL 会话表、prevStep/nextStep 查表、全部 .next() 字面量；flowOverview 改由构建期派生。
- flow.test 精简为纯锚定断言；链自洽守卫由 skillnomad 构建期校验承接（validateStepChain / DependencyRefs / PhaseCoverage）。
- 修复 B1-A 漂移锁的 Windows 行尾误报（CRLF/LF 归一）。


## v1.0.0

- 使用发布版 `skillnomad` 构建 sp-skill。
- 源码仓库包含 `skill.ts`、`src/`、`assets/`、`plugins/`。
- GitHub Actions 自动生成可直接导入的 Markdown skill 压缩包。
