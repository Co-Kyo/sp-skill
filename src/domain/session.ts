// 学习域:学习会话聚合。
// Phase II(D8 扩展):前处理七步的会话顺序,与后四步合成 11 步全序。
// 阶段 2 Step A 后:后四步的顺序已下沉为步骤自身的 dependsOn 声明,
// EDGES 查表(prevStep/nextStep)已删除;本文件仅保留前处理七步的会话顺序。
export const HEAD_SESSION_FLOW = [
  'initialize',
  'intent-anchor',
  'brainstorm',
  'partition',
  'scan',
  'capability-graph',
  'evaluate-pool',
] as const;

export type HeadSessionStage = (typeof HEAD_SESSION_FLOW)[number];
