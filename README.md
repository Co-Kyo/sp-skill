# sp-skill

sp-skill 开发源码仓库。

## 结构

```text
├── skill.ts                 # SkillSourceModel 定义
├── skillpack.config.ts      # skillpack 构建配置
├── src/                     # 开发源码
│   ├── steps/               # 各流程步骤定义
│   ├── contracts.ts
│   ├── policies.ts
│   ├── actions.ts
│   └── verify.ts
├── assets/                  # Markdown 运行资产
└── plugins/                 # 插件片段
```

## 本地构建

```bash
npm install
npm run typecheck
npm run build
```

构建产物：

```text
dist/sp-skill/
├── SKILL.md
└── processes/
```

## Release

推送 `v*` tag 或手动运行 GitHub Actions `Release sp-skill` 工作流：

- 使用发布版 `@co-kyo/skillpack` 构建。
- 组装 `SKILL.md`、`processes/`、`assets/`、`plugins/`。
- 生成 `sp-skill-<tag>.zip`，可直接导入为 Markdown skill。
- 同时生成 `source.zip` 并创建 GitHub Release。

## License

MIT
