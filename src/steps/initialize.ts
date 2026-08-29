import { step } from '@co-kyo/skillpack-types';
import { initializeDetail, WORKDIR_NAMING } from '../domain/content/initialize.js';
import { verifyPair } from '../domain/mechanics.js';
import { refs } from '../contracts.js';
import { barrier } from '../policies.js';
import { fail, verify } from '../verify.js';

export const initialize = step('initialize', '初始化')
  .target('确认 workDir 并建立可追溯的初始化记录')
  .summary('确认 workDir（交互步骤），各步骤按需加载公共规则')
  .dependsOn()
  .writes(
    { path: '{workDir}/.meta/init.json', description: '初始化记录', required: true },
    refs.run,
  )
  .inputs('raw_input')
  .action('parse', 'init-parse', '解析输出目录', `解析用户指定目录或默认 ${WORKDIR_NAMING}，确认目录可用。`)
  .action('wait', 'init-confirm', '确认 workDir', '向用户展示输出目录并等待确认；用户可修正路径。')
  .action('validate', 'init-write', '写入初始化记录', '写入 workDir、确认状态和公共规则加载结果。')
  .action('generate', 'init-run-write', '写入运行信封', '创建 {workDir}/.meta/run/run.json，记录 run_id、started_at、workdir、输入摘要和 sp-skill 版本。')
  .outputs('{workDir}/.meta/init.json', '{workDir}/.meta/run/run.json')
  .initRules(
    { title: '确认 workDir', body: `向用户展示将要使用的输出目录并等待确认；如果用户未指定，默认使用 ${WORKDIR_NAMING} 作为 workDir；用户可修正 workDir 路径` },
    { title: '初始化记录', body: 'workDir 确认后写入 {workDir}/.meta/init.json，后续所有步骤的产出路径均基于此目录派生' },
  )
  .detail(initializeDetail())
  .verify(
    ...verifyPair('{workDir}/.meta/init.json', '初始化记录存在', '初始化记录可解析'),
    verify.field('workDir', '初始化记录包含 workDir'),
    verify.field('confirmed', '初始化记录包含确认状态'),
    ...verifyPair('{workDir}/.meta/run/run.json', '运行信封存在', '运行信封可解析'),
  )
  .onFail(
    fail.halt('用户未确认 workDir', '停止并等待用户修正输出目录'),
  )
  .checkpoint(
    barrier(
      ['workDir 已确认', 'init.json 已写入', 'run.json 已创建', '公共规则可加载'],
      '请确认 workDir 与初始化规则。',
    ),
  )
  .next('intent-anchor')
  .display({
    pattern: 'generic',
    primary_unit: 'rule',
    max_visible: 4,
    legend: false,
    selection: 'confirm',
  })
  .build();
