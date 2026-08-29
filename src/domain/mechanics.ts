// 步骤机制层工厂:消除步骤定义中的机械重复。
// 约束:所有工厂的输出必须与手写字面量等价(渲染字节不变)。
import type { SourceVerifyRule } from '@co-kyo/skillpack-types';
import { fail as failKit, verify as verifyKit } from '../verify.js';

/** 同一产物的成对校验:先查存在、再查可解析 */
export function verifyPair(ref: string, existsDesc: string, parseDesc: string): SourceVerifyRule[] {
  return [verifyKit.file(ref, existsDesc), verifyKit.json(ref, parseDesc)];
}

/** 共享 display 配置(intent-anchor/brainstorm/capability-graph 三处逐字相同) */
export const DISPLAY_FOLD_MULTI = {
  pattern: 'title_fold',
  max_visible: 7,
  badge: 'difficulty',
  selection: 'multi',
};

/** 共享 display 配置(partition/scan 两处 max_visible:3) */
export const DISPLAY_FOLD_MULTI_3 = {
  pattern: 'title_fold',
  max_visible: 3,
  badge: 'difficulty',
  selection: 'multi',
};

// re-export 便于步骤文件单一导入点
export { failKit as fail, verifyKit as verify };
