// B12 守卫:assets/plugins 的步骤编号必须与 canonical 一致,引用路径必须存在。
// 背景:编号曾存在新旧两套体系(processes 含 00-initialize,assets/plugins 散文沿用旧号),
// 独立审计发现 35+ 处漂移。本测试防止再次演化分叉。
// 注:assets/NN-* 目录名保留旧编号(登记项,改名成本高);守卫会排除路径上下文。
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

// 步骤名 → canonical 编号(processes/ 文件序号)
const CANON: Record<string, number> = {
  'intent-anchor': 1,
  意图锚定: 1,
  'brainstorm': 2,
  头脑风暴: 2,
  依赖分区: 3,
  scan: 4,
  'capability-graph': 5,
  'evaluate-pool': 6,
  'capability-research': 7,
  assemble: 9,
  'learning-ladder': 10,
};

function assetTexts(): [string, string][] {
  const out: [string, string][] = [];
  for (const dir of ['assets', 'plugins']) {
    const walk = (p: string) => {
      for (const e of readdirSync(p, { withFileTypes: true })) {
        const full = `${p}/${e.name}`;
        if (e.isDirectory()) walk(full);
        else if (e.name.endsWith('.md')) out.push([full.replace(repoRoot, ''), readFileSync(full, 'utf-8')]);
      }
    };
    walk(dir);
  }
  return out;
}

test('B12:assets/plugins 引用的 processes 路径必须存在(对照构建产物)', (t) => {
  const dist = `${repoRoot}dist/sp-skill/processes`;
  if (!existsSync(dist)) {
    t.skip('需先 npm run build 生成渲染产物(processes/ 为构建输出)');
    return;
  }
  for (const [rel, text] of assetTexts()) {
    for (const m of text.matchAll(/processes\/([A-Za-z0-9-]+\.md)/g)) {
      assert.ok(existsSync(`${dist}/${m[1]}`), `${rel} 引用不存在的步骤文件:${m[1]}`);
    }
  }
});

test('B12:步骤编号与 canonical 一致(旧编号清零)', () => {
  for (const [rel, text] of assetTexts()) {
    for (const [label, canon] of Object.entries(CANON)) {
      const re = new RegExp(`(\\d{1,2})\\s*[-·]?\\s*${label.replace(/[.]/g, '\\.')}`, 'g');
      for (const m of text.matchAll(re)) {
        const i = m.index ?? 0;
        const before = i > 0 ? text[i - 1] : '';
        const after = text[i + m[0].length] ?? '';
        // 排除登记保留的目录名上下文:assets/03-scan 路径、`00-intent-anchor` 目录引用
        if (before === '/' || before === '-' || before === '`') continue;
        if (after === '/' || after === '`') continue;
        assert.equal(Number(m[1]), canon, `${rel}:「${m[0]}」编号错误,canonical 应为 ${canon}`);
      }
    }
  }
});
