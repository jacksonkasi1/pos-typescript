#!/usr/bin/env node
/**
 * Puppeteer smoke: staff Talk to POS (#344).
 * Login → /talk → type "kitchen" → expect navigation to /kitchen.
 *
 * Usage (from repo root):
 *   BASE_URL=http://127.0.0.1:4202 LOGIN_EMAIL=… LOGIN_PASSWORD=… npm run test:talk --prefix front
 *
 * Env:
 *   LOGIN_EMAIL / LOGIN_PASSWORD  Required staff credentials (order/kitchen access preferred)
 *   BASE_URL   App URL (default: auto-detect 4203/4202/4200)
 *   HEADLESS   Default on; 0 / false / no for visible browser
 */

import { isHeadless } from './puppeteer-headless.mjs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');

const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function resolveBaseUrl() {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');
  for (const port of [4203, 4202, 4200]) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`, {
        method: 'head',
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok || res.status < 500) return `http://127.0.0.1:${port}`;
    } catch (_) {}
  }
  return 'http://127.0.0.1:4202';
}

async function login(page, baseUrl, email, password) {
  await page.goto(new URL('/login', baseUrl).href, { waitUntil: 'networkidle2', timeout: 20000 });
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password);
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await new Promise((r) => setTimeout(r, 2500));
  if (page.url().includes('/login')) {
    throw new Error('Login failed (still on /login). Check credentials.');
  }
}

async function main() {
  const baseUrl = await resolveBaseUrl();
  const email = process.env.LOGIN_EMAIL || process.env.DEMO_LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD || process.env.DEMO_LOGIN_PASSWORD;
  if (!email || !password) {
    console.error('Required: LOGIN_EMAIL and LOGIN_PASSWORD (or DEMO_LOGIN_*).');
    process.exit(1);
  }

  const headless = isHeadless();
  console.log('BASE_URL:', baseUrl);
  console.log('Headless:', headless);
  console.log('---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless,
    defaultViewport: headless ? { width: 1280, height: 720 } : null,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  try {
    console.log('1. Login...');
    await login(page, baseUrl, email, password);

    console.log('2. Open /talk...');
    const talkUrl = new URL('/talk', baseUrl).href;
    const res = await page.goto(talkUrl, { waitUntil: 'networkidle2', timeout: 20000 });
    if (!res || res.status() >= 400) {
      console.error('FAIL: HTTP status for /talk:', res?.status());
      process.exit(1);
    }
    await page.waitForSelector('[data-testid="talk-page"]', { timeout: 15000 });
    const path = new URL(page.url()).pathname;
    if (path !== '/talk') {
      console.error('FAIL: Expected /talk, got:', page.url());
      process.exit(1);
    }

    console.log('3. Type kitchen command...');
    await page.waitForSelector('[data-testid="talk-command-input"]', { timeout: 10000 });
    await page.click('[data-testid="talk-command-input"]', { clickCount: 3 });
    await page.type('[data-testid="talk-command-input"]', 'kitchen');
    await page.click('[data-testid="talk-go"]');

    console.log('4. Expect /kitchen...');
    await page.waitForFunction(() => location.pathname.includes('/kitchen'), { timeout: 15000 });
    const after = new URL(page.url()).pathname;
    if (!after.includes('/kitchen')) {
      console.error('FAIL: Expected /kitchen, got:', page.url());
      process.exit(1);
    }

    if (pageErrors.length) {
      console.error('FAIL: page errors:', pageErrors);
      process.exit(1);
    }

    console.log('OK: Talk typed navigation kitchen → /kitchen');
    process.exit(0);
  } catch (err) {
    console.error('FAIL:', err?.message || err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
