// 无头 Chrome 截图的公共部分（render.mjs 用）。
// 不需要 npm 依赖：用 Node 自带的 WebSocket（Node 22+）直连 Chrome DevTools 协议。只连本机 Chrome，不访问其它网络地址。
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
export const CHROME = process.env.CHROME || CANDIDATES.find((p) => existsSync(p)) || CANDIDATES[0];

export const withTimeout = (p, ms, msg) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms).unref())]);

function launchChrome(profile) {
  const proc = spawn(CHROME, [
    '--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
    '--force-color-profile=srgb', 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  const ws = new Promise((res, rej) => {
    let log = '';
    const timer = setTimeout(() => rej(new Error('Chrome 启动超时\n' + log)), 30000);
    proc.stderr.on('data', (d) => {
      log += d;
      const m = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(timer); res(m[1]); }
    });
    proc.on('exit', (code) => { clearTimeout(timer); rej(new Error('Chrome 异常退出（' + code + '）\n' + log)); });
  });
  return { proc, ws };
}
async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('连不上 Chrome DevTools')); });
  let seq = 0;
  const pending = new Map(), waiters = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? p.rej(new Error(msg.error.message)) : p.res(msg.result);
    } else {
      for (const w of waiters.slice()) if (w.method === msg.method && w.sessionId === msg.sessionId) { waiters.splice(waiters.indexOf(w), 1); w.res(msg.params); }
    }
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const id = ++seq;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
  const once = (method, sessionId) => new Promise((res) => waiters.push({ method, sessionId, res }));
  return { send, once, close: () => ws.close() };
}

// 启动 Chrome、按 width×height 打开 url，把页面会话 s(method, params) 交给 fn；结束后关掉 Chrome、删临时用户目录。
export async function withPage({ width, height, url, label }, fn) {
  if (typeof WebSocket === 'undefined') throw new Error('需要 Node.js 22 或更高版本（用到内置 WebSocket）');
  if (!existsSync(CHROME)) throw new Error('找不到 Chrome：' + CHROME + '（可用环境变量 CHROME 指定）');
  const profile = mkdtempSync(join(tmpdir(), 'rednote-render-'));
  const chrome = launchChrome(profile);
  try {
    const cdp = await connect(await chrome.ws);
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    const s = (method, params) => cdp.send(method, params, sessionId);
    await s('Page.enable');
    await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    const loaded = cdp.once('Page.loadEventFired', sessionId);
    await s('Page.navigate', { url });
    await withTimeout(loaded, 30000, '打开 ' + (label || url) + ' 超时');
    const result = await fn(s);
    cdp.close();
    return result;
  } finally {
    chrome.proc.kill();
    await new Promise((res) => { if (chrome.proc.exitCode !== null) res(); else chrome.proc.once('exit', res); setTimeout(res, 3000); });
    rmSync(profile, { recursive: true, force: true });
  }
}

// 给 PNG 写入分辨率（pHYs 块），像素不变；替代 macOS 的 sips，跨平台。
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xFFFFFFFF; for (const b of buf) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
export function setPpi(png, ppi) {
  const ppm = Math.round(ppi / 0.0254);
  const chunks = [png.subarray(0, 8)];
  let i = 8, done = false;
  while (i < png.length) {
    const len = png.readUInt32BE(i), type = png.toString('latin1', i + 4, i + 8), end = i + 12 + len;
    if (type !== 'pHYs') chunks.push(png.subarray(i, end));
    if (type === 'IHDR' && !done) {
      const body = Buffer.alloc(13);
      body.write('pHYs', 0, 'latin1'); body.writeUInt32BE(ppm, 4); body.writeUInt32BE(ppm, 8); body[12] = 1;
      const head = Buffer.alloc(4); head.writeUInt32BE(9);
      const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
      chunks.push(head, body, crc);
      done = true;
    }
    i = end;
  }
  return Buffer.concat(chunks);
}
