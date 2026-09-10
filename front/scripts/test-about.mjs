#!/usr/bin/env node
/**
 * Puppeteer smoke: public /about marketing page + footer About link.
 * Asserts shell, Amvara Consulting S.L. visible, footer link from home, no pageerrors.
 *
 * Usage (from repo root):
 *   BASE_URL=http://127.0.0.1:4202 npm run test:about --prefix front
 *   node front/scripts/test-about.mjs
 *
 * Env:
 *   BASE_URL   App URL (default: auto-detect port 4203, 4202, 4200 or http://127.0.0.1:4202)
 *   HEADLESS   Default headless; set 0, false, or no for a visible browser.
 */

import { isHeadless } from './puppeteer-headless.mjs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');

const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const COMPANY = 'Amvara Consulting S.L.';

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
  const badResponses = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('response', (res) => {
    const u = res.url();
    if (!u.includes('/about') && !u.endsWith('/about')) return;
    if (res.status() >= 400) badResponses.push(`${res.status()} ${u}`);
  });

  try {
    console.log('1. Loading home and checking footer About link...');
    await page.goto(new URL('/', baseUrl).href, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });
    await page.waitForSelector('[data-testid="landing-about"]', { timeout: 15000 });
    await page.waitForSelector('[data-testid="landing-company"]', { timeout: 10000 });

    const footer = await page.evaluate((company) => {
      const about = document.querySelector('[data-testid="landing-about"]');
      const companyEl = document.querySelector('[data-testid="landing-company"]');
      return {
        aboutHref: about?.getAttribute('href') || '',
        companyText: (companyEl?.textContent || '').trim(),
        companyOk: (companyEl?.textContent || '').includes(company),
      };
    }, COMPANY);

    if (!footer.aboutHref.includes('/about')) {
      console.error('FAIL: Footer About href should include /about. Got:', footer.aboutHref);
      process.exit(1);
    }
    if (!footer.companyOk) {
      console.error('FAIL: Footer company line missing', COMPANY, 'Got:', footer.companyText);
      process.exit(1);
    }
    console.log('   Footer About + company attribution: OK');

    console.log('2. Opening /about via footer link...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }),
      page.click('[data-testid="landing-about"]'),
    ]);

    const path = new URL(page.url()).pathname;
    if (path !== '/about' && !path.startsWith('/about/')) {
      console.error('FAIL: Expected path /about, got:', page.url());
      process.exit(1);
    }

    console.log('3. Waiting for about page shell...');
    await page.waitForSelector('[data-testid="about-page"]', { timeout: 15000 });
    await page.waitForSelector('[data-testid="about-title"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="about-company"]', { timeout: 10000 });

    const shell = await page.evaluate((company) => {
      const title = (document.querySelector('[data-testid="about-title"]')?.textContent || '').trim();
      const companySection = (document.querySelector('[data-testid="about-company"]')?.textContent || '').trim();
      const body = document.body?.innerText || '';
      const rawKeyDump =
        title.includes('ABOUT_PAGE.') ||
        body.includes('ABOUT_PAGE.TITLE') ||
        body.includes('LANDING.NAV_ABOUT');
      return {
        title,
        companyNamed: companySection.includes(company) || body.includes(company),
        companySection,
        rawKeyDump,
      };
    }, COMPANY);

    if (!shell.title || shell.rawKeyDump) {
      console.error(
        'FAIL: Hero title missing or untranslated ABOUT_PAGE key. Got:',
        JSON.stringify(shell.title)
      );
      process.exit(1);
    }
    console.log('   Hero title:', shell.title);

    if (!shell.companyNamed) {
      console.error('FAIL: Expected', COMPANY, 'on About page. Section:', shell.companySection);
      process.exit(1);
    }
    console.log('   Company name visible: OK');

    if (badResponses.length) {
      console.error('FAIL: Bad HTTP for /about document:', badResponses);
      process.exit(1);
    }
    if (pageErrors.length) {
      console.error('FAIL: pageerror(s):', pageErrors);
      process.exit(1);
    }

    await browser.close();
    console.log('\n>>> RESULT: /about loads; footer About link works; Amvara Consulting S.L. visible.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await browser.close();
    process.exit(1);
  }
}

main();
