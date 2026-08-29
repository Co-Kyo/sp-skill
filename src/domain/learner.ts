// 学习域:学习者模型。
// Phase R(行为保持重构):校准签名就位但为恒等;按 level 的校准规则属
// Phase I(登记差异后生效),实现位置收敛在此。
export type Level = 'L1' | 'L2' | 'L3' | 'L4';

export const LEVELS: readonly Level[] = ['L1', 'L2', 'L3', 'L4'];

export interface LearnerProfile {
  level: Level;
  /** 本次学习会话的时间盒(分钟),运行时由 anchors/init 提供 */
  timeBoxMinutes?: number;
  goal?: string;
}

/**
 * 判据难度校准。Phase R 恒等:判据文本与流程版逐字一致;
 * Phase I 在此实现按 level 的校准规则。
 */
export function calibrateJudgment(criteria: string, _level: Level): string {
  return criteria;
}
