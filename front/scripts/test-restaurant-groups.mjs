#!/usr/bin/env node
/**
 * Puppeteer smoke: Settings → Restaurant group (#283 / docs/0054-restaurant-groups.md).
 * Logs in as owner/admin, opens Settings, clicks the Restaurant group tab, and asserts
 * the section is visible with either create/join UI or member/leave UI.
 *
 * Usage (from repo root):
 *   npm run test:restaurant-groups --prefix front
 *   BASE_URL=http://127.0.0.1:4202 npm run test:restaurant-groups --prefix front
 *
 * Env:
 *   BASE_URL       App URL (default: auto-detect 4203, 4202, 4200)
 *   LOGIN_EMAIL    Override (or DEMO_LOGIN_EMAIL / ADMIN_EMAIL from .env)
 *   LOGIN_PASSWORD Override (or DEMO_LOGIN_PASSWORD / ADMIN_PASSWORD from .env)
 *   TENANT_ID      Tenant for login (default 1)
 *   HEADLESS       Default headless; set 0, false, or no for a visible browser.
 */

import { isHeadless } from './puppeteer-headless.mjs';
import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const repoRoot = resolve(__dirname, '..', '..');

function loadEnv() {
  const envPath = join(repoRoot, '.env');
  if (!existsSync(envPath)) return;
  try {
    readFileSync(envPath, 'utf8')
      .split('\n')
      .forEach((line) => {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m && !process.env[m[1].trim()]) {
          process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
        }
      });
  } catch (_) {}
}
loadEnv();

const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function main() {
  const baseUrl = await resolveBaseUrl();
  const headless = isHeadless();
  const tenantId = process.env.TENANT_ID || process.env.LOGIN_TENANT_ID || '1';
  const loginEmail =
    process.env.LOGIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.DEMO_LOGIN_EMAIL;
  const loginPassword =
    process.env.LOGIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    process.env.DEMO_LOGIN_PASSWORD;

  console.log('test-restaurant-groups (Puppeteer)');
  console.log('BASE_URL:', baseUrl);
  console.log('TENANT_ID:', tenantId);
  console.log('Headless:', headless);
  if (!loginEmail || !loginPassword) {
    console.error(
      'Credentials required: set LOGIN_EMAIL/LOGIN_PASSWORD or DEMO_LOGIN_EMAIL/DEMO_LOGIN_PASSWORD in .env (owner/admin).',
    );
    process.exit(1);
  }
  console.log('Login as:', loginEmail);
  console.log('---');

  const hardFails = [];
  const pageErrors = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
    console.log('[pageerror]', err.message);
  });

  try {
    console.log('1. Logging in (tenant=' + tenantId + ')...');
    await page.goto(new URL('/login?tenant=' + tenantId, baseUrl).href, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', loginEmail);
    await page.type('input[type="password"]', loginPassword);
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
        submitBtn.click(),
      ]);
    }
    await sleep(2000);
    if (page.url().includes('/login')) {
      hardFails.push('Still on login page (check credentials, tenant, and owner/admin role)');
    } else {
      console.log('   Logged in, URL:', page.url());
    }

    if (!hardFails.length) {
      console.log('2. Opening Settings...');
      await page.goto(new URL('/settings', baseUrl).href, {
        waitUntil: 'networkidle2',
        timeout: 20000,
      });
      if (!page.url().includes('/settings')) {
        hardFails.push('Not on /settings after navigation');
      } else {
        await sleep(2000);
        console.log('   On /settings');
      }
    }

    if (!hardFails.length) {
      console.log('3. Clicking Restaurant group tab...');
      let groupTab = await page.$('[data-testid="settings-restaurant-group-tab"]');
      if (!groupTab) {
        const tabs = await page.$$('button.tab');
        for (const tab of tabs) {
          const text = await page.evaluate((el) => el.textContent || '', tab);
          if (/Restaurant group|Grupo de restaurantes|Restaurantgruppe|Grup de restaurants/i.test(text)) {
            groupTab = tab;
            break;
          }
        }
      }
      if (!groupTab) {
        hardFails.push(
          'Restaurant group tab not found (owner/admin only; data-testid="settings-restaurant-group-tab")',
        );
      } else {
        await groupTab.click();
        await sleep(2000);
        console.log('   Tab clicked');
      }
    }

    if (!hardFails.length) {
      console.log('4. Asserting Restaurant group section...');
      const section = await page
        .waitForSelector('[data-testid="settings-restaurant-group-section"]', { timeout: 10000 })
        .catch(() => null);
      if (!section) {
        hardFails.push('Section data-testid="settings-restaurant-group-section" not found');
      } else {
        const uiState = await page.evaluate(() => {
          const root = document.querySelector('[data-testid="settings-restaurant-group-section"]');
          if (!root) return { ok: false, mode: 'missing' };
          const text = root.innerText || '';
          if (/SETTINGS\.RESTAURANT_GROUP_/i.test(text)) {
            return { ok: false, mode: 'raw-keys' };
          }
          const hasCreate =
            /create group|grupo|gruppe|crear|erstellen|créer/i.test(text) &&
            !!root.querySelector('input[type="text"]');
          const hasJoin = /join group|unirse|beitreten|unir-se|rejoindre/i.test(text);
          const hasLeave = /leave group|salir|verlassen|sortir|quitter/i.test(text);
          const hasMembers = /member|miembro|mitglied|membre/i.test(text);
          if (hasCreate || hasJoin) return { ok: true, mode: 'create-or-join' };
          if (hasLeave || hasMembers) return { ok: true, mode: 'member' };
          // Still loading or unexpected empty body
          if (/loading|cargando|laden|chargement/i.test(text)) {
            return { ok: false, mode: 'loading' };
          }
          return { ok: false, mode: 'unknown', sample: text.slice(0, 160) };
        });
        if (!uiState.ok) {
          hardFails.push(
            `Restaurant group UI not ready (mode=${uiState.mode}${
              uiState.sample ? `; sample=${JSON.stringify(uiState.sample)}` : ''
            })`,
          );
        } else {
          console.log('   Section OK, mode:', uiState.mode);
        }
      }
    }

    if (pageErrors.length) {
      hardFails.push(`Page errors: ${pageErrors.slice(0, 3).join(' | ')}`);
    }

    await browser.close();

    console.log('\n---');
    if (hardFails.length) {
      for (const f of hardFails) console.error('FAIL:', f);
      console.log('\n>>> RESULT: Restaurant groups smoke FAILED');
      process.exit(1);
    }
    console.log('>>> RESULT: Restaurant groups smoke OK');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await browser.close().catch(() => {});
    process.exit(1);
  }
}

main();
