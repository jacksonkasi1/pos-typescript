---
## Closing summary (TOP)

- **What happened:** El tester dio **PASS** al issue [#114](https://github.com/satisfecho/pos/issues/114): enlaces de Términos y Privacidad junto a las acciones de registro/auth (landing, `/login`, `/register`, portal proveedor).
- **What was done:** Se unificó el pie con `app-legal-links` (modo inline), filas `.auth-actions-foot` en login/registro público, landing en una sola línea con separadores, y pies de `/provider/login` y `/provider/register` con contacto + legales vía **`getPublicLegalUrls()`** e i18n.
- **What was tested:** Landing, login, register, provider login/register, `npm run test:landing-version` y `npm run test:landing-provider-links` — **PASS**; enlaces legales omitidos cuando la API devuelve URLs nulas (esperado).
- **Why closed:** Criterios de aceptación cumplidos según informe de pruebas (**Overall: PASS**); archivo archivado según el bucle de agentes.
- **Closed at (UTC):** 2026-03-27 13:15
---

# Terms and privacy links near registration / auth actions

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/114

## Problem / goal
On the public/auth surface (e.g. login or sign-up flows), **Terms** and **Privacy** links should sit **close to** the other account actions (create account, provider login, register as provider, contact us), not isolated or easy to miss. The issue gives a target ordering example:  
`Don't have an account?` → Create account, Provider login, Register as provider, Contact us, **Terms**, **Privacy**.  
Align with existing tenant/global Terms & Privacy URL behaviour from [#110](https://github.com/satisfecho/pos/issues/110) / related settings docs if needed.

## High-level instructions for coder
- Locate the template(s) for the relevant login / registration / landing footers (Angular) where those links are rendered.
- Adjust layout so Terms and Privacy appear **adjacent** to the listed auth-related actions, consistent with UX on mobile and desktop.
- Reuse the same URL resolution as elsewhere (tenant vs global fallbacks); do not hard-code wrong domains.
- Verify i18n: link labels use translation keys like the rest of the page.
- Run a quick smoke (e.g. open the page in dev, confirm order and links work).

## Implementation notes (coder)
- **`app-legal-links`:** optional **`[inline]="true"`** — host uses `display: contents` and nav flows inline with footer separators.
- **`/login`**, **`/register`:** single **`.auth-actions-foot`** flex row: create account / sign-in, provider links, `mailto:sales@satisfecho.de`, then Terms & Privacy (via existing **`getPublicLegalUrls()`**).
- **Landing:** Terms/Privacy inline after Contact (same `·` separators); removed block wrapper that forced a line break.
- **`/provider/login`**, **`/provider/register`:** same legal URL fetch; provider login footer consolidated with i18n **`PROVIDER_AUTH.*`** + **`TranslateModule`**; register footer adds contact + inline legal links.

## Testing instructions
1. Stack up on dev HAProxy (e.g. `http://127.0.0.1:4202`).
2. **Landing `/`:** Footer reads in one flow: … Contact us · Terms · Privacy (if URLs configured). Provider links still present with testids `landing-provider-login`, `landing-provider-register`.
3. **`/login`:** After the form, order: “Don't have an account?” Create account · Provider login · Register as provider · Contact us · (Terms · Privacy if URLs exist).
4. **`/register`:** Same pattern with “Already have account?” / Sign in first.
5. **`/provider/login`**, **`/provider/register`:** Footer includes contact and legal links when URLs exist; strings respect language picker (provider login).
6. Automated: from `front/`, `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version` and `npm run test:landing-provider-links`.

---

## Test report

1. **Date/time (UTC):** 2026-03-27T12:45–12:52 (approx.). **Log window:** same (Puppeteer + manual footer scrape + compose log tail).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL`** `http://127.0.0.1:4202`; branch **`development`**, commit **`fde7bed`**.
3. **What was tested:** Items 1–6 from **Testing instructions** above (landing, `/login`, `/register`, provider auth footers, automated scripts).
4. **Results:**
   - **Dev stack / HAProxy reachable:** **PASS** — `docker compose ps` shows `pos-haproxy` `0.0.0.0:4202->4202/tcp`.
   - **Landing `/` footer flow + provider testids:** **PASS** — `npm run test:landing-provider-links` OK; footer text (normalized): `Don't have an account?Create account·Provider login·Register as provider·Contact us`. **`GET /api/public/legal-urls`** returned `terms_of_service_url: null`, `privacy_policy_url: null` → Terms/Privacy block correctly omitted per template.
   - **`/login` footer order:** **PASS** — `Don't have an account? Create account · Provider login · Register as provider · Contact us` (no legal links without URLs).
   - **`/register` footer order:** **PASS** — `Already have an account? Sign in · Provider login · Register as provider · Contact us`.
   - **`/provider/login` & `/provider/register`:** **PASS** — Footers include **Contact us** (`mailto:sales@satisfecho.de`); legal links absent when API returns null (expected). Footer copy uses **`translate`** (e.g. `PROVIDER_AUTH.*`, `LANDING.CONTACT_US`). **Note:** No **language picker** on `/provider/login`; with **`localStorage` `pos_language=es`** and reload, footer renders Spanish (`¿No tiene cuenta de proveedor?` … `Contáctenos`) — **PASS** for i18n following stored locale; consider adding picker on provider pages if product wants on-page switching without visiting landing first.
   - **Automated `test:landing-version`:** **PASS** — exit `0`, result line `>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.` (browser console showed WebSocket `1008` token messages during nav; script still completed successfully).
   - **Automated `test:landing-provider-links`:** **PASS** — exit `0`, `>>> RESULT: Landing shows provider login, register, and contact links; register link works.`
5. **Overall:** **PASS** (all criteria met for current env; legal links conditional on configured URLs).
6. **Product owner feedback:** Los enlaces de cuenta y proveedor en landing, login y registro siguen el orden acordado y el contacto queda en la misma línea de acciones. Términos y privacidad solo aparecen cuando el backend expone URLs; en este entorno no estaban configuradas, lo cual es coherente con la plantilla. El pie del portal proveedor respeta el idioma guardado (`pos_language`), aunque la pantalla no incluye selector de idioma propio.
7. **URLs tested (numbered):**
   1. `http://127.0.0.1:4202/`
   2. `http://127.0.0.1:4202/login`
   3. `http://127.0.0.1:4202/register`
   4. `http://127.0.0.1:4202/provider/login`
   5. `http://127.0.0.1:4202/provider/register`
   6. (repeat) `http://127.0.0.1:4202/provider/login` after setting `pos_language=es` via `localStorage` from `/`
8. **Relevant log excerpts:**
   - **Front (tail):** `Application bundle generation complete. [0.010 seconds] - 2026-03-27T12:41:13.012Z` — sin errores de compilación en la ventana.
   - **Back (tail):** `GET /public/legal-urls HTTP/1.1" 200 OK` (varias peticiones durante las cargas).
   - **API (curl vía HAProxy):** `{"terms_of_service_url":null,"privacy_policy_url":null}`
