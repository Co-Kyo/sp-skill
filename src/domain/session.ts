// 学习域:学习会话聚合。
// 结尾四步的推进顺序是领域知识,步骤定义通过 prevStep/nextStep 引用,
// 顺序只在此处声明一次(收敛点)。
export const TAIL_SESSION_FLOW = [
  'capability-research',
  'briefing-assemble',
  'assemble',
  'learning-ladder',
] as const;

export type TailSessionStage = (typeof TAIL_SESSION_FLOW)[number];

// Phase II(D8 扩展):前处理七步的会话顺序,与 TAIL_SESSION_FLOW 合成 11 步全序
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

const EDGES: Record<TailSessionStage, { prev: string; next: string }> = {
  'capability-research': { prev: 'evaluate-pool', next: 'briefing-assemble' },
  'briefing-assemble': { prev: 'capability-research', next: 'assemble' },
  assemble: { prev: 'briefing-assemble', next: 'learning-ladder' },
  'learning-ladder': { prev: 'assemble', next: 'done' },
};

export function prevStep(stage: TailSessionStage): string {
  return EDGES[stage].prev;
}

export function nextStep(stage: TailSessionStage): string {
  return EDGES[stage].next;
}
