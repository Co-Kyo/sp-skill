import { step } from '@co-kyo/skillpack-types';
import { agentAction, doAction } from '../actions.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const brainstorm = step('brainstorm', '头脑风暴')
  .target('收敛出可被 {{step:scan}} 消费的 requirement-web.json')
  .summary('4维度Agent并行分析，产出结构化需求网')
  .dependsOn('intent-anchor')
  .reads(
    refs.anchors,
    refs.agentInit,
    refs.schedulingDetail,
    refs.barrierCheck,
    refs.fallbackProtocol,
    refs.protocolScheduling,
    refs.pipelineParams,
    refs.subagentBudget,
    refs.brainstormSchemas,
  )
  .writes(refs.requirementWeb)
  .inputs('{workDir}/.meta/brainstorm/anchors.json')
  .outputs('{workDir}/.meta/requirement-web.json')
  .detail(`执行步骤：

1. 创建 {workDir}/.meta/brainstorm 目录。
2. 按 agent-init 分发场景、技术、学习、约束 4 个维度 Agent。
3. 轮询等待，轮询间隔 15s，每个 Agent 完成时即时校验文件、JSON、dimension 和 entries。
4. 失败 Agent 最多补发 1 次。
5. 4 个维度全部结束后执行质量门禁。
6. 门禁通过后 spawn 收敛者。
7. 收敛者写入 requirement-web.json。
8. 执行当前步骤的 barrier 检查点。`)
  .section('质量门禁', `检查 4 个维度文件：

- scenario.json 存在且可解析
- technical.json 存在且可解析
- learning.json 存在且可解析
- constraint.json 存在且可解析
- 每个 JSON 包含 dimension 字段和对应 entries

4/4 通过后进入收敛者；存在缺失时停住等待用户决策。`)
  .section('{{step:scan}} 注入', `将 requirement-web.json 作为 {{step:scan}} 输入：

- propositions 列表
- search_guidance 推荐关键词
- scope.exclusions 排除规则
- context 经验年限
- strategy 策略元数据
- level_weight 驱动密度分级`)
  .contractRefs(
    refs.agentInit,
    refs.schedulingDetail,
    refs.barrierCheck,
    refs.fallbackProtocol,
    refs.protocolScheduling,
    refs.pipelineParams,
    refs.brainstormSchemas,
  )
  .taskTemplate(
    '场景维度',
    `你是场景维度分析专家。
基于 anchors.json 列出 ≥5 个候选场景。
按 target_level 过滤：L1 概念级，L2 方案级，L3 决策级，L4 体系级。
每个场景包含 anchor_ref、level_weight、confidence、depth、frequency、granularity_match。
写入 scenario.json。`,
  )
  .taskTemplate(
    '技术维度',
    `你是技术维度分析专家。
拆解原子能力，区分通用与特化能力。
标注 layer、depends_on、covers、level_weight。
检查网络层、工具层、运行时层、安全层，缺失时补充 T_ADD{N}。
写入 technical.json。`,
  )
  .taskTemplate(
    '学习维度',
    `你是学习维度分析专家。
设计从不会到目标水平的渐进学习路径。
每个节点包含 prerequisites、estimated_time、verification、is_strategic。
输出有框架经验和无框架经验两条分支。
写入 learning.json。`,
  )
  .taskTemplate(
    '约束维度',
    `你是约束维度分析专家。
提取显式和隐式约束，明确排除项。
reason_type 只能是 out_of_scope、below_target、deprecated、not_frontend。
加入排除已停止维护方案和经验年限约束。
写入 constraint.json。`,
  )
  .taskTemplate(
    '收敛者',
    `你是头脑风暴的收敛者（Integrator）。你需要执行校验、对齐、收束、去重、补位，最终产出 requirement-web.json。

你必须用 write 工具将文件写入磁盘。

## 你需要读取的文件
1. 共享骨架：{workDir}/.meta/brainstorm/anchors.json
2. 场景维度报告：{workDir}/.meta/brainstorm/scenario.json
3. 技术维度报告：{workDir}/.meta/brainstorm/technical.json
4. 学习维度报告：{workDir}/.meta/brainstorm/learning.json
5. 约束维度报告：{workDir}/.meta/brainstorm/constraint.json
6. 输出格式：assets/01-brainstorm/requirement-web-schema.md

## 你的任务
1. 校验：检查 4 个维度输出中的 level_weight 是否跨维度一致
2. 对齐：不一致时按优先级对齐（约束 > 技术 > 场景 > 学习）
3. 收束：用 anchor_ref 编织跨维度关系图，建立场景与能力映射
4. 去重：同维度内描述重叠则合并；不同维度同锚点则标注不同视角
5. 补位：检测 anchor_coverage 覆盖缺口
6. 图谱构建：产出 capability_web（按能力 ID 组织，含 type/fanout/covers/dependencies）

## 输出格式
严格按 requirement-web-schema.md 格式输出。
额外字段：context.target_level、context.year_source、context.year_inference_trace、strategy、capability_web、qualifier_injection；每个 proposition 附 capability_ids 和 level_weight。

## 写入
将 requirement-web.json 写入 {workDir}/.meta/requirement-web.json。`,
  )
  .verify(
    verify.json('{workDir}/.meta/requirement-web.json', 'requirement-web.json 可解析'),
    verify.field('context', 'context 包含 target_level、year_source、year_inference_trace'),
    verify.field('id', '每个 proposition 包含 id'),
    verify.field('name', '每个 proposition 包含 name'),
    verify.field('depth', '每个 proposition 包含 depth'),
    verify.field('search_keywords', '每个 proposition 包含 search_keywords'),
    verify.field('capability_ids', 'capability_web 与 propositions 的 capability_ids 一致'),
    verify.field('dependencies', 'dependencies 中引用的 id 全部存在'),
    verify.count('scope.exclusions 非空'),
    verify.field('level_weight', '每个 proposition 包含 level_weight'),
    verify.field('strategy', 'strategy 元数据已写入'),
    verify.field('provisional_role', '锚点与 proposition 的 level_weight 一致'),
  )
  .onFail(
    fail.retry('维度 Agent 超时', '检查文件是否已写入；完整保留，不完整补发一次'),
    fail.degrade('3+ 维度缺失', '降级为原始指令扫描，{{step:scan}} 按原始指令执行'),
    fail.retry('收敛者超时', '检查 requirement-web.json 是否完整；不完整重试一次'),
    fail.degrade('收敛者 JSON 解析失败', '执行 fallback-protocol 重建 requirement-web.json'),
  )
  .checkpoint(
    barrier(
      ['命题数量', '能力数量', '依赖关系数', '排除项数'],
      '请确认头脑风暴收敛后的需求网。',
    ),
  )
  .decision({
    gateType: 'human_gate',
    title: '需求网确认',
    confirm: '确认需求网',
    context: {
      current: '需求网确认',
      question: '这些命题、年限锚点与排除边界是否可作为后续分区和扫描的依据？',
      next: '分区确认',
    },
    metrics: [
      { id: 'propositions', label: '命题', value: '10', detail: '全部 L2 core' },
      { id: 'year', label: '年限推断', value: 'L2', detail: '3-5 年' },
      { id: 'exclusions', label: '排除项', value: '20', detail: 'deprecated/越界' },
    ],
    selection: {
      unit: '需求网命题',
      summary: '10/10 命题默认选中，可按命题或分组调整。',
      total: 10,
      selected: 10,
    },
    risks: [
      { code: 'validation', label: 'JSON 转义修复', severity: 'warning', count: 1, detail: '已修复并重新校验通过' },
    ],
    actions: [
      { id: 'confirm', label: '确认需求网', verb: 'confirm', primary: true },
    ],
    barrier_summary: '当前阶段：需求网确认；本次确认：命题/年限/排除边界；下一步：分区确认；命题 10，年限 L2，排除项 20；10/10 已选。',
  })
  .plugins('year-granularity')
  .next('partition')
  .parallel(
    'brainstorm-parallel',
    '4 维度并行分析',
    [
      doAction('generate', 'brainstorm-scenario', '场景维度', '列出候选场景，按 target_level 过滤，写入 scenario.json。', 3),
      doAction('parse', 'brainstorm-technical', '技术维度', '拆解原子能力，标注 layer/depends_on/covers，写入 technical.json。', 3),
      doAction('generate', 'brainstorm-learning', '学习维度', '设计渐进学习路径，写入 learning.json。', 3),
      doAction('validate', 'brainstorm-constraint', '约束维度', '提取显式/隐式约束和排除项，写入 constraint.json。', 3),
    ],
    {
      gate: {
        rule: '4/4 completed or user authorizes degrade',
        onPass: 'converge',
        onFail: 'userChoice',
      },
      converge: agentAction(
        'merge',
        'brainstorm-integrator',
        '收敛者',
        '读取四份维度报告，执行校验、对齐、收束、去重、补位，生成 requirement-web.json。',
        5,
      ),
    },
  )
  .display({
    pattern: 'title_fold',
    primary_unit: 'proposition',
    max_visible: 7,
    badge: 'difficulty',
    legend: true,
    selection: 'multi',
  })
  .build();
