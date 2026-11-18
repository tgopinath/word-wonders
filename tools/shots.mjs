// Captures the portfolio screenshots from the live site: node tools/shots.mjs
// Phone shots: 600-wide JPEGs in prototype/shots. Desktop: prototype/web.jpg (1440x900, for the card's browser window).
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const SHOTS = path.join(ROOT, 'prototype', 'shots');
const LIVE = process.env.LIVE || 'https://word-wonders.vercel.app';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(ROOT, '.shots-'));
const dbg = 9300 + Math.floor(Math.random() * 300);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio', `--remote-debugging-port=${dbg}`, `--user-data-dir=${tmp}/profile`, 'about:blank'], { stdio: 'ignore' });
try {
  let ws;
  for (let i = 0; i < 160 && !ws; i++) {
    try { const p = (await (await fetch(`http://127.0.0.1:${dbg}/json`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {}
    if (!ws) await sleep(250);
  }
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const phone = () => send('Emulation.setDeviceMetricsOverride', { width: 390, height: 849, deviceScaleFactor: 2, mobile: true });
  const capture = async (out, width) => {
    const s = await send('Page.captureScreenshot', { format: 'png' });
    const png = path.join(tmp, 'shot.png');
    fs.writeFileSync(png, Buffer.from(s.result.data, 'base64'));
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '84', '--resampleWidth', String(width), png, '--out', out], { stdio: 'pipe' });
  };
  const grab = async (hash, file, { wait = 3500, js } = {}) => {
    await send('Page.navigate', { url: `${LIVE}/?shot=${file}${hash}` }); await sleep(wait);
    if (js) { await send('Runtime.evaluate', { expression: js, awaitPromise: true }); await sleep(2500); }
    await capture(path.join(SHOTS, file + '.jpg'), 600);
  };
  await phone();
  await grab('#/', 'home');
  // Tap the animated apple to reveal the word, meaning and picture story.
  await grab('#/word/fruits-apple', 'word', { js: "(document.querySelector('[aria-label*=\"Tap\" i], button[aria-label*=\"apple\" i]') || [...document.querySelectorAll('button')].find(b => /tap me/i.test(b.textContent)))?.click()" });
  await grab('#/category/animals', 'category');
  await grab('#/play/find/fruits-L1', 'game', { wait: 4500 });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${LIVE}/?shot=desktop#/` }); await sleep(3500);
  await capture(path.join(ROOT, 'prototype', 'web.jpg'), 1440);
  console.log('captured', fs.readdirSync(SHOTS).join(', '), '+ web.jpg');
  ws.close();
} finally {
  const exited = new Promise(r => chrome.once('exit', r));
  chrome.kill();
  await Promise.race([exited, sleep(5000)]);
  fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
