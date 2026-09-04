# 管线参数配置

> 所有可调参数集中管理。process 文件引用 `{{pipeline-params}}` 读取本表，按参数名取值。

## 调度参数

| 参数名 | 值 | 说明 | 使用步骤 |
|--------|-----|------|---------|
| `w` | 5 | 并发上限（W） | scan / briefing-assemble / assemble / learning-ladder |
| `poll-interval` | 15s | 轮询间隔 | intent-anchor / scan |
| `retry-max` | 1 | 补发/重试次数上限 | intent-anchor / scan / capability-research / briefing-assemble / assemble / learning-ladder |

## 超时参数

| 参数名 | 值 | 说明 | 使用步骤 |
|--------|-----|------|---------|
| `dim-timeout` | 3min | 维度 Agent 超时 | brainstorm |
| `converge-timeout` | 5min | 收敛者 Agent 超时 | brainstorm |
| `search-timeout` | 5min | Phase A 搜索 Agent 超时 | scan |
| `extract-timeout` | 10min | Phase B 提取 Agent 超时 | scan |
| `research-timeout` | 15min | 能力研究 Agent 超时 | capability-research |
| `briefing-timeout` | 5min | Briefing 组装 Agent 超时 | briefing-assemble |
| `assemble-timeout` | 8min | 命题组装 Agent 超时 | assemble |
| `ladder-timeout` | 5min | 学习阶梯 Agent 超时 | learning-ladder |

## 业务参数

| 参数名 | 值 | 说明 | 使用步骤 |
|--------|-----|------|---------|
| `cap-group-cap` | 5 | 能力分组每组上限 | capability-research |
| `min-content-length` | 2000 | 能力主文件最少字数 | capability-research |
| `community-threshold` | 8 | 社区检测触发节点数 | partition |
| `url-batch-size` | 30-50 | URL 分批每批条数 | scan |
| `fanout-threshold` | 30% | 扇出度筛选阈值 | capability-research |
