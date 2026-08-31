import type { SkillSourceModel } from 'skillnomad-types';
import { createSkillFromModel } from 'skillnomad';
import { contracts } from './src/contracts.js';
import { HEAD_SESSION_FLOW } from './src/domain/session.js';
import { policies } from './src/policies.js';
import { steps } from './src/steps/index.js';

// Phase II:阶段→步骤映射唯一数据源(flow.test 守卫其与 steps 全序一致)
// B11-A:单步阶段的 description 以该步 summary 为正本(消除双写漂移)
const summaryOf = (id: string) => steps.find((s) => s.id === id)?.summary ?? '';

export const phaseDefs: { name: string; stepIds: string[]; description: string }[] = [
  { name: '初始化', stepIds: [HEAD_SESSION_FLOW[0]], description: summaryOf('initialize') },
  { name: '意图锚定', stepIds: [HEAD_SESSION_FLOW[1]], description: summaryOf('intent-anchor') },
  { name: '头脑风暴', stepIds: [HEAD_SESSION_FLOW[2]], description: summaryOf('brainstorm') },
  { name: '依赖分区', stepIds: [HEAD_SESSION_FLOW[3]], description: summaryOf('partition') },
  { name: '前处理', stepIds: [...HEAD_SESSION_FLOW.slice(4)], description: '串行扫描、建图、评估入池' },
  { name: '后处理', stepIds: ['capability-research', 'briefing-assemble', 'assemble', 'learning-ladder'], description: '串行研究、Briefing、组装、学习阶梯' },
];

// B10-A:区间标注修正,与 phases 边界一致(6 阶段 6 标注;原 (03-05)/(06-10) 错位已登记修正)
export const flowOverview = `初始化 → 意图锚定 → 头脑风暴 → 依赖分区 → 前处理 → 后处理
         (00)      (01)      (02)      (03)      (04-06)   (07-10)`;

const model: SkillSourceModel = {
  meta: {
    name: 'scenario-pipeline',
    title: 'Scenario Pipeline',
    description: `将前端技术文章转化为三层结构化知识产品：
- **命题研究** → overview + edge-cases + trade-offs + experiment
- **能力知识库** → capabilities/{id}-{name}.md（跨命题原子能力）
- **学习阶梯** → learning-ladder.md（渐进式引导路径）`,
    frontmatterDescription: '前端复合工程场景知识管线。三阶段工作流：意图锚定→头脑风暴→前处理（定向扫描→能力图谱构建→评估入池）+ 后处理（能力研究→Briefing→命题组装→学习阶梯）。通过 /scenario-pipeline 命令显式调用，支持从任意步骤断点续写。',
    callExamples: [
      { label: '完整流程', pattern: '使用 scenario-pipeline，对 <场景描述> 进行完整研究' },
      { label: '仅前处理', pattern: '使用 scenario-pipeline，对 <信息源> 进行前处理' },
      { label: '仅后处理', pattern: '使用 scenario-pipeline，从能力研究开始，处理 <场景>' },
      { label: '断点续写', pattern: '使用 scenario-pipeline，从 Step <N> 继续处理 <场景>' },
    ],
    usageNote: '系统从自然语言自动推断：经验年限、研究深度、目标平台等约束。',
    isolationNote: '每步只读该步文件，严禁提前加载后续步骤，详见 rule-isolation.md。',
    includeBuildFooter: false,
    params: [
      { name: '--year=L1|L2|L3|L4', description: '经验年限，可省略并自动推断' },
      { name: '--source=<url|file>', description: '指定扫描信源，可省略并自动推断' },
    ],
    phases: phaseDefs,
    initStepId: 'initialize',
    flowOverview,
  },
  contracts,
  policies,
  steps,
};

export const skill = createSkillFromModel(model);
