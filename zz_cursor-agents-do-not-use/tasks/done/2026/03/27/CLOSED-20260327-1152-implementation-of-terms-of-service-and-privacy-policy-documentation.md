---
## Closing summary (TOP)

- **What happened:** La tarea **#113** pedía formalizar **Términos de servicio** y **Política de privacidad** para `satisfecho.de`, con rutas públicas y URLs utilizables en configuración OAuth (“Global Config”), alineadas con GDPR y el branding.
- **What was done:** Se añadieron rutas públicas **`/terms`** y **`/privacy`** en el front (`legal-document`, i18n), y en el back **`_global_terms_url()` / `_global_privacy_url()`** con fallback a `{PUBLIC_APP_BASE_URL}/terms` y `/privacy` cuando las env explícitas van vacías; tests en **`tests/test_guest_feedback.py`** y documentación de **`config.env.example`**.
- **What was tested:** **PASS** — HTTP **200** en `/terms` y `/privacy`, comprobación UI (título, secciones, enlaces cruzados, volver al inicio), **`GET /api/public/legal-urls`** según entorno, **pytest** `10 passed`, smoke **`test:landing-version`**, logs del contenedor **front** sin errores de compilación.
- **Why closed:** El informe del tester da **Overall: PASS** y se cumplen los criterios de aceptación descritos en la tarea.
- **Closed at (UTC):** 2026-03-27 12:30
---

# feat: implementation of Terms of Service and Privacy Policy documentation

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/113

## Problem / goal
Formalizar documentación legal para cumplir requisitos de APIs externas (p. ej. TikTok Login Kit): redactar **Términos de servicio (ToS)** y **Política de privacidad** para `satisfecho.de`, publicarlas en rutas públicas accesibles y usables como URLs oficiales en configuración OAuth (“Global Config”). El contenido debe ser coherente con GDPR/transparencia y con el branding actual; responsive en móvil.

## High-level instructions for coder
- Revisar si ya existen rutas o contenido legal en el front (p. ej. `/terms`, `/privacy`, componentes legales, `legal-urls`) y alinear con el issue sin duplicar trabajo cerrado en #110 si aplica.
- Implementar o completar páginas públicas que respondan en producción como `https://satisfecho.de/terms` y `https://satisfecho.de/privacy` (sin 404); ver despliegue/nginx/HAProxy según `docs/` si hace falta.
- Asegurar que el texto y la estructura cubran recogida, uso y almacenamiento de datos de usuario de forma razonable para GDPR; coordinar redacción legal con el propietario del producto si el repo no debe contener texto legal definitivo.
- Verificar enlaces desde flujos que requieran ToS/privacidad (registro, reservas, OAuth) y que las URLs configurables apunten a estas páginas tras el despliegue.

## Coder notes (implementation)
- **Front:** Rutas públicas `terms` y `privacy` en `app.routes.ts`; componente `front/src/app/legal/legal-document.component.ts` (selector de documento vía `data.legalDoc`). Texto en `LEGAL.DOC.*` (en/de/es/fr/ca completos; bg/zh-CN/hi reutilizan el cuerpo EN para las mismas claves).
- **Back:** `_global_terms_url()` / `_global_privacy_url()` en `main.py`: si las env explícitas están vacías y `PUBLIC_APP_BASE_URL` es http(s) válida, se devuelve `{base}/terms` y `{base}/privacy`. Misma lógica vía `_legal_urls_effective` para resúmenes de tenant. Tests en `tests/test_guest_feedback.py`.
- **Config:** `config.env.example` — ejemplos `satisfecho.de` y nota de fallback; sin cambios nginx/HAProxy necesarios (SPA ya sirve `index.html` para rutas desconocidas en prod).

---

## Testing instructions

### What to verify
- `/terms` y `/privacy` cargan (200) en el front detrás de HAProxy y muestran título, secciones, enlace cruzado y “volver al inicio”.
- `GET /api/public/legal-urls` (o `/public/legal-urls` según montaje) devuelve URLs https cuando `PUBLIC_APP_BASE_URL` está definida y las env de términos/privacidad están vacías.
- Pytest `test_guest_feedback` pasa (incl. nuevos casos de fallback y override explícito).

### How to test
- Con stack dev: `docker compose -f docker-compose.yml -f docker-compose.dev.yml`
- `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4202/terms` y `…/privacy` → esperado `200`.
- Opcional: `curl -s http://127.0.0.1:4202/api/public/legal-urls` (ajustar host/puerto según `ROOT_PATH`) con `PUBLIC_APP_BASE_URL` en `config.env`.
- `docker compose … exec -T back python3 -m pytest tests/test_guest_feedback.py -q`
- Smoke: `cd front && BASE_URL=http://127.0.0.1:4202 npm run test:landing-version`

### Pass / fail criteria
- **Pass:** Las cuatro comprobaciones anteriores OK; sin errores de compilación en logs del contenedor `front`.
- **Fail:** 404 en `/terms` o `/privacy`, JSON `legal-urls` sin fallback cuando toca, o tests en rojo.

---

## Test report

1. **Date/time (UTC):** 2026-03-27T12:00–12:05 approx. Log window reviewed: `docker compose … logs --tail=80 front` and `--tail=25 front` (no TS/NG errors in grep scan).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL`** `http://127.0.0.1:4202` (HAProxy); branch **`development`** @ `8c013b4`.
3. **What was tested:** Criterios de “What to verify” e instrucciones “How to test”.
4. **Results:**
   - **HTTP `/terms` y `/privacy` (200):** **PASS** — `curl -s -o /dev/null -w "%{http_code}\n"` → `200` / `200`.
   - **Contenido UI (título, secciones, enlace cruzado, volver al inicio):** **PASS** — Puppeteer (`puppeteer-core` + Chrome del host, script temporal en `/tmp`): `/terms` → h1 “Terms of service — Satisfecho”, 6 bloques `.legal-doc-section`, enlace cruzado `href="/privacy"`, `a.legal-doc-back` → `/`; `/privacy` → h1 “Privacy policy — Satisfecho”, 7 secciones, cruce `href="/terms"`, back `/`.
   - **`GET /api/public/legal-urls` con fallback https:** **PASS** — En runtime local sin `PUBLIC_APP_BASE_URL` en `config.env`, `curl` devuelve `{"terms_of_service_url":null,"privacy_policy_url":null}` (esperado). La lógica de fallback a `{base}/terms` y `/privacy` con base https queda cubierta por **`test_public_legal_urls_fallback_to_app_base`** en pytest (ver abajo).
   - **`pytest tests/test_guest_feedback.py`:** **PASS** — `10 passed in 0.93s` (`docker compose … exec -T back python3 -m pytest tests/test_guest_feedback.py -q`).
   - **Smoke `npm run test:landing-version`:** **PASS** — `>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.` (exit 0).
   - **Logs contenedor `front` (compilación):** **PASS** — Últimas líneas muestran `Application bundle generation complete.` sin errores; grep a logs recientes sin coincidencias `error|TS2345|NG8002|bundle generation failed`.
5. **Overall:** **PASS**
6. **Product owner feedback:** Las rutas públicas `/terms` y `/privacy` responden correctamente detrás del puerto de desarrollo y muestran documentos estructurados con enlaces cruzados y retorno al inicio. El API expone URLs legales nulas cuando no hay base pública configurada; en producción, con `PUBLIC_APP_BASE_URL` https y sin overrides, los tests automatizados confirman el fallback a `/terms` y `/privacy`. Conviene validar en satisfecho.de tras despliegue con la misma configuración de env.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/terms`
   2. `http://127.0.0.1:4202/privacy`
   3. `http://127.0.0.1:4202/api/public/legal-urls`
   4. `http://127.0.0.1:4202/` (smoke landing)
   5. `http://127.0.0.1:4202/dashboard` y demás rutas del sidebar (smoke landing)
8. **Relevant log excerpts:**
   - Front: `Application bundle generation complete. [0.009 seconds] - 2026-03-27T11:57:09.080Z`
   - Pytest: `.......... [100%] 10 passed in 0.93s`
   - Smoke: `>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.`

**GitHub:** Comentario añadido en #113 al finalizar verificación. Etiquetas: ajustar según `docs/agent-loop.md` (p. ej. quitar `agent:testing` cuando el closer archive).
