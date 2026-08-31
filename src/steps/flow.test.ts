// flow.test.ts —— 8.9 裁定：守卫可删，闸门 2 开。
//
// 原守卫职责（链自洽互证）已由 skillnomad 构建期校验完整承接：
// - validateStepChain()：链连续 / 断链 / 多前驱多后继 / 成环
// - validateDependencyRefs()：dependsOn 引用完整性
// - validatePhaseCoverage()：阶段覆盖自洽
// - deriveFlowOverview() / deriveChainNext()：顺序副产物由框架派生
//
// D8-3（顺序恰好 00-10）的检查对象随手工副本删除消失——迁移后顺序的唯一事实是
// dependsOn 声明（单值），不再有第二副本可漂移。此文件保留为空壳以记录裁定，
// 若后续引入新的与链顺序相关的业务断言，应在 8.9 的框架承接之外另行登记。
