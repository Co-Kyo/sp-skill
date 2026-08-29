import type { SkillSourceModel } from '@co-kyo/skillpack-types';
import { createSkillFromModel } from '@co-kyo/skillpack';
import { contracts } from './src/contracts.js';
import { TAIL_SESSION_FLOW } from './src/domain/session.js';
import { policies } from './src/policies.js';
import { steps } from './src/steps/index.js';

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
    phases: [
      { name: '初始化', stepIds: ['initialize'], description: '确认 workDir（交互步骤），各步骤按需加载公共规则并写入 init.json' },
      { name: '意图锚定', stepIds: ['intent-anchor'], description: '解析指令并生成共享骨架' },
      { name: '头脑风暴', stepIds: ['brainstorm'], description: '条件触发，生成需求网' },
      { name: '依赖分区', stepIds: ['partition'], description: '拆分 session 与扫描批次' },
      { name: '前处理', stepIds: ['scan', 'capability-graph', 'evaluate-pool'], description: '串行扫描、建图、评估入池' },
      { name: '后处理', stepIds: [...TAIL_SESSION_FLOW], description: '串行研究、Briefing、组装、学习阶梯' },
    ],
    initStepId: 'initialize',
    flowOverview: `初始化 → 意图锚定 → 头脑风暴 → 依赖分区 → 前处理 → 后处理
         (00)      (01)      (02)      (03-05)   (06-10)`,
  },
  contracts,
  policies,
  steps,
};

export const skill = createSkillFromModel(model);
