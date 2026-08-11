import { step } from '@co-kyo/skillpack-types';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const intentAnchor = step('intent-anchor', '意图锚定')
  .target('生成 8-15 个锚点并注入策略元数据')
  .summary('解析用户指令，推断年限，生成共享骨架')
  .dependsOn('initialize')
  .reads(
    { path: 'assets/00-intent-anchor/schemas.md', description: 'anchors 格式', required: true },
    refs.yearRules,
    refs.skipRules,
    refs.strategyLevel,
  )
  .writes(refs.anchors)
  .inputs('raw_input')
  .action('parse', 'intent-extract', '轻量提取', '提取 topic、tech_stack 和显式年限参数。')
  .action('infer', 'intent-year', '年限推断', '按优先级链推断 target_level 并记录 year_inference_trace。')
  .action('validate', 'intent-skip', '跳过判断', '判断是否跳过头脑风暴。')
  .action('generate', 'intent-anchor-write', '生成骨架', '生成锚点并注入 strategy 元数据。')
  .outputs('{workDir}/.meta/brainstorm/anchors.json')
  .detail(`年限推断优先级：

1. 显式参数 --year
2. 显式数字，例如 3-5 年
3. 隐式信号，例如 高级、架构师、面试准备
4. 无信号默认 L2

锚点生成要求：

- 数量 8-15 个
- 每个锚点包含 id、name、provisional_level、provisional_role、reasoning、description、type、tags
- role 与 level 强制约束：core=target_level、premise=target_level-1、outlook=target_level+1`)
  .section('跳过判断', `跳过头脑风暴需要同时满足：

- topic 明确，tech_stack 都是具体工具/框架名
- 年限推断置信度高
- 无场景化拦截词，例如 面试、场景、分析、复杂

否则进入 {{step:brainstorm}}。`)
  .contractRefs(
    { path: 'assets/00-intent-anchor/schemas.md', description: 'anchors 格式' },
    refs.yearRules,
    refs.skipRules,
    refs.strategyLevel,
  )
  .taskTemplate(
    '锚点生成',
    `提取 8-15 个核心技术关键词。
为每个关键词标注 provisional_level 和 provisional_role。
从 strategy-level 注入 core_label、premise_label、outlook_label 和 ratios。
写入 anchors.json。`,
  )
  .verify(
    verify.count('锚点数量为 8-15 个'),
    verify.field('provisional_level', '每个锚点包含 provisional_level'),
    verify.field('provisional_role', '每个锚点包含 provisional_role'),
  )
  .onFail(
    fail.checkpoint('年限推断置信度低', '默认 L2，并在初始化 Barrier 请用户确认'),
    fail.halt('锚点不足 8 个', '提示用户补充信息或降低核心锚点门槛'),
  )
  .checkpoint(
    barrier(
      ['锚点数量', '年限推断依据', '跳过判断结果'],
      '请确认意图锚定结果、年限推断和跳过判断。',
    ),
  )
  .next('brainstorm')
  .display({
    pattern: 'title_fold',
    primary_unit: 'anchor',
    max_visible: 7,
    badge: 'difficulty',
    legend: true,
    selection: 'multi',
  })
  .build();
