#!/usr/bin/env node
// 用法：node scripts/export.mjs [--out <目录>] [--name 账号名] [--id 小红书号] [--page <自己的 html>]
// 把 assets/avatar-starter.html（或 --page 指定的同结构页面）里的每款头像导出成 1080×1080 PNG，外加一张预览图。
// 默认输出到当前目录下的 avatar-export/。页面约定：?a=avatarX 显示一款头像，?a=preview 显示预览；加载完把 document.title 设成 ready。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { withPage, withTimeout } from './chrome.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const opt = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const outDir = resolve(opt('out', 'avatar-export'));
const page = pathToFileURL(resolve(opt('page', join(here, '..', 'assets', 'avatar-starter.html')))).href;
const extra = '&name=' + encodeURIComponent(opt('name', '你的账号名')) + '&id=' + encodeURIComponent(opt('id', 'YourID'));

await withPage({ width: 1080, height: 1080, url: 'about:blank', label: 'about:blank' }, async (s) => {
  const ev = async (expr) => (await s('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
  const load = async (a, w, h) => {
    await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await s('Page.navigate', { url: page + '?a=' + a + extra });
    await withTimeout((async () => { while ((await ev('document.readyState + document.title').catch(() => '')) !== 'completeready') await new Promise((r) => setTimeout(r, 100)); })(), 60000, a + ' 加载超时（字体没加载完？）');
  };
  await load('preview', 1200, 1600);
  const keys = await ev('Object.keys(ART)');
  mkdirSync(outDir, { recursive: true });
  for (const k of keys) {
    await load('avatar' + k, 1080, 1080);
    const shot = await s('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1080, height: 1080, scale: 1 } });
    const file = join(outDir, `avatar-${k}.png`);
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log(`avatar${k} → ${relative(process.cwd(), file)}`);
  }
  await load('preview', 1200, 1600);
  const H = await ev('document.getElementById("root").scrollHeight');
  await s('Emulation.setDeviceMetricsOverride', { width: 1200, height: H, deviceScaleFactor: 1, mobile: false });
  const shot = await s('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1200, height: H, scale: 1 } });
  const file = join(outDir, 'preview.png');
  writeFileSync(file, Buffer.from(shot.data, 'base64'));
  console.log(`preview → ${relative(process.cwd(), file)}`);
});
