# 子 agent 窗口预算与输入压缩

## 窗口预算

- 单次 subagent 调用窗口数上限：4
- 滚动窗口同一时刻并发上限：3 个 Task Group
- Step 09 每命题占用 2 个槽位时，同一时刻最多 2 个命题
- 拓扑分批每批最多 3 个 Task Group
- 批量并行最多 4 个 Task Group

超出上限时必须分批，不得一次性创建大量隔离窗口。

## 输入压缩

- 每个 task 的输入正文摘要不超过 6K tokens
- 每条素材正文摘要不超过 500 tokens，禁止直接复制全文
- 引用共享文件时只写文件路径，不把文件内容复制进 task
- 同一文件被多个 agent 使用时，主线程先写共享摘要文件，agent 只读共享摘要

## 运行记录

每次 spawn 后向 `{workDir}/.meta/run/subagent-window.jsonl` 追加：

```json
{
  "ts": "ISO时间",
  "batch_id": "B1",
  "window_count": 3,
  "input_tokens_estimate": 5200,
  "read_paths": []
}
```

该记录用于后续 ROI 复验：窗口数、输入 token 估算和重复读取路径必须可追溯。
