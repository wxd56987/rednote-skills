#!/usr/bin/env node
// 用法：node scripts/render.mjs <数据.json> [--out <目录>]
// 按 assets/page.html 的版式，用本机 Chrome 无头模式逐页截图，输出 1300×2160（9.6:16）PNG，写 300ppi。
// 默认输出到数据文件旁边的 export/ 目录，文件名取各页 name（「01 热点.png」…）；同名文件会被覆盖。
// 每页打印「系数」（自动字号 0.8–1.3）；有页放不下时退出码为 2。字体走 Google Fonts，需要联网。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CHROME, withPage, withTimeout, setPpi } from './chrome.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const dataArg = args.filter((a, i) => !a.startsWith('--') && !(outIdx >= 0 && i === outIdx + 1))[0];
if (!dataArg || (outIdx >= 0 && !args[outIdx + 1])) {
  console.error('用法：node scripts/render.mjs <数据.json> [--out <目录>]');
  process.exit(1);
}
const dataPath = resolve(dataArg);
if (!existsSync(dataPath)) { console.error('找不到 ' + dataPath); process.exit(1); }
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
if (!Array.isArray(data.pages) || !data.pages.length) { console.error('数据里没有 pages'); process.exit(1); }
const [W, H] = data.size || [1300, 2160];
const outDir = resolve(outIdx >= 0 ? args[outIdx + 1] : join(dirname(dataPath), 'export'));
if (!existsSync(CHROME)) { console.error('找不到 Chrome：' + CHROME + '（可用环境变量 CHROME 指定）'); process.exit(1); }

const report = [];
await withPage({ width: W, height: H, url: pathToFileURL(join(here, '..', 'assets', 'page.html')).href, label: 'assets/page.html' }, async (s) => {
  mkdirSync(outDir, { recursive: true });
  for (let i = 0; i < data.pages.length; i++) {
    const r = await withTimeout(s('Runtime.evaluate', { expression: `renderPage(${JSON.stringify(data)}, ${i})`, awaitPromise: true, returnByValue: true }), 120000, '排版超时（字体一直没加载完？）');
    if (r.exceptionDetails) throw new Error('排版出错：' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    const rep = r.result.value;
    const shot = await s('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
    const file = join(outDir, data.pages[i].name + '.png');
    writeFileSync(file, setPpi(Buffer.from(shot.data, 'base64'), 300));
    report.push(rep);
    console.log(`${rep.name}  系数 ${rep.k.toFixed(2)}${rep.fits ? '' : '（放不下！）'}  余量 ${rep.slack}px  → ${relative(process.cwd(), file)}`);
  }
});

const bad = report.filter((r) => !r.fits);
if (bad.length) { console.error('⚠️ 放不下：' + bad.map((r) => r.name).join('、') + '，请缩短文案后重跑'); process.exit(2); }
