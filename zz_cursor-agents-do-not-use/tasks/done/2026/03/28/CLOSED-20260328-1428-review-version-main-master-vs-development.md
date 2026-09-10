---
## Closing summary (TOP)

- **What happened:** La tarea del issue **#115** evaluó la promoción **`development` → `master`**, el despliegue y smoke en **https://satisfecho.de**, con una primera pasada de pruebas bloqueada por falta de conectividad y una segunda pasada exitosa.
- **What was done:** Se documentó el fast-forward de **`master`** al tip de **`development`**, mejoras en **`test-landing-version.mjs`** (modo solo landing, sonda de alcanzabilidad, variables documentadas) y criterios de PASS/FAIL claros en el handoff al tester.
- **What was tested:** Tras conectividad OK: **`curl`** a `/` y **`/api/health`** → **200**; Puppeteer **`LANDING_VERSION_ONLY=1`** con **`SKIP_LANDING_PACKAGE_VERSION_CHECK=1`** → **PASS** (pie **2.0.64 00e806f**).
- **Why closed:** Criterios del handoff cumplidos en la segunda pasada del tester (**Overall: PASS**); el fallo inicial se atribuyó al entorno (*connection refused*), no a regresión de producto.
- **Closed at (UTC):** 2026-03-28 14:38
---

# Review version of main/master vs development

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/115

## Problem / goal
Decidir si conviene integrar **`development` → `master`** y desplegar a producción (p. ej. amvara9) porque hay muchas novedades pendientes. Tras un despliegue, revisar el estado del workflow de despliegue en GitHub. Ejecutar smoke tests contra **https://satisfecho.de** para confirmar que el sitio responde bien y no hay errores **500** ni **503** por fallos del backend.

Contexto de ramas y cuándo promover a **`master`**: **`.cursor/rules/git-development-branch-workflow.mdc`**, **`docs/agent-loop.md`**, **`docs/0001-ci-cd-amvara9.md`**, **`AGENTS.md`** (smoke / Puppeteer).

## High-level instructions for coder
- Comparar el estado de **`master`** frente a **`development`** (commits, changelog, versión en `front/package.json` si aplica) y decidir si procede la promoción según las reglas del repo (ventana ~2 h, cambio grande a producción, o petición explícita en el issue).
- Si se despliega a amvara9: seguir el flujo documentado (`scripts/deploy-amvara9.sh`, migraciones antes de servir tráfico) y verificar la ejecución del action de despliegue en GitHub.
- Tras despliegue o si ya está al día: smoke en **satisfecho.de** (p. ej. landing, rutas críticas, sin 5xx); documentar resultado en el issue **#115**.
- No asumir merge a **`master`** sin alinearlo con la política de promoción; si solo aplica empujar **`development`**, dejarlo claro en el comentario del issue.

## Implementation (feature coder 006, 2026-03-28 UTC)

- **FEAT → WIP** al iniciar; cierre en **UNTESTED** con instrucciones de prueba.
- **Comparación previa al merge:** `origin/master` estaba en **`ac2471f`** (*Merge development: migration preset timestamp defaults #112*). `origin/development` en **`461a0b6`** — **69 commits** por delante (fast-forward). `front/package.json` **2.0.64** en ambas puntas; **`CHANGELOG.md`** tenía entradas sustanciales bajo **`[Unreleased]`** (legal SPA, working-plan colors, HAProxy probes, fixes #65 #67 #99 #112, agent loop, etc.).
- **Decisión:** Promoción acorde al issue **#115** (evaluación explícita de integración) + volumen de cambios listos en **`development`** → **`git merge --ff-only origin/development`** sobre **`master`** y **`git push origin master`** (ejecutado en esta sesión: **`ac2471f..461a0b6`**).
- **amvara9 / GitHub Actions:** No se ejecutó **`scripts/deploy-amvara9.sh`** desde este entorno (SSH/servidor operador). Tras el push a **`master`**, conviene desplegar con el flujo documentado en **`docs/0001-ci-cd-amvara9.md`** y comprobar el workflow en GitHub.
- **Smoke en producción (pre-despliegue del nuevo tip):** `GET https://satisfecho.de/` → **200**; `GET https://satisfecho.de/api/health` → **200**; `GET https://satisfecho.de/api/docs` → **200**. Puppeteer **`test:landing-version`** con **`LANDING_VERSION_ONLY=1`** (ver abajo) → **PASS**; el pie mostraba **`2.0.64 ac2471f`** (despliegue aún en commit anterior hasta el siguiente deploy).
- **Código:** Se añadió **`LANDING_VERSION_ONLY`** en **`front/scripts/test-landing-version.mjs`** para poder hacer smoke solo de landing/version cuando **`.env`** tiene credenciales de demo que no aplican al host remoto (evita **401** en login contra producción).

## Testing instructions

1. **Tras desplegar el tip actual de `master` en amvara9 (o el entorno que use satisfecho.de):** comprobar que el pie de la landing refleja un hash cercano al de **`master`** y que no hay **5xx** en rutas habituales.
2. **HTTP rápido:**  
   `curl -sS -o /dev/null -w '%{http_code}\n' https://satisfecho.de/`  
   `curl -sS -o /dev/null -w '%{http_code}\n' https://satisfecho.de/api/health`  
   Esperado: **200** en ambos (y sin **503** en ventanas de arranque HAProxy si aplica).
3. **Puppeteer (solo landing + versión en remoto, sin login):** desde **`front/`**:  
   `LANDING_VERSION_ONLY=1 BASE_URL=https://satisfecho.de npm run test:landing-version`  
   Esperado: mensaje **`>>> RESULT: Landing page shows version.`** y código de salida **0**.
4. **Opcional (staff en producción):** con **`LOGIN_EMAIL` / `LOGIN_PASSWORD`** válidos para el tenant de prueba, ejecutar el mismo script **sin** **`LANDING_VERSION_ONLY`** para recorrer sidebar (si la política de cuentas lo permite).

---

## Test report (tester 003, 2026-03-28)

1. **Date/time (UTC)** and log window: **2026-03-28 14:31:07 UTC** (approx. **14:28–14:32 UTC** for commands below).

2. **Environment:** Host runner (no Docker compose required for these checks). **`BASE_URL`:** `https://satisfecho.de`. **Branch:** `development` synced with `origin` (**`./scripts/git-sync-development.sh`**). **`origin/master`** and **`origin/development`** both at **`00e806f`** at fetch time (repo state during this run).

3. **What was tested:** Items 1–3 from **Testing instructions** (post-deploy footer / 5xx, HTTP smoke, Puppeteer landing-only). Item 4 skipped (optional).

4. **Results:**
   - **(1) Landing footer vs `master` + no 5xx on common routes:** **FAIL** — No page load; cannot compare footer hash or scan routes (`ERR_CONNECTION_REFUSED`).
   - **(2) HTTP `GET /` and `GET /api/health` → 200:** **FAIL** — `curl: (7) Failed to connect to satisfecho.de port 443 after ~50ms: Couldn't connect to server` (no HTTP status from server).
   - **(3) Puppeteer `LANDING_VERSION_ONLY=1` landing test:** **FAIL** — `Error: net::ERR_CONNECTION_REFUSED at https://satisfecho.de/`; **`npm run test:landing-version`** exit code **1** (no `>>> RESULT: Landing page shows version.`).
   - **(4) Optional staff sidebar:** **N/A — skipped**.

5. **Overall:** **FAIL** — Failed criteria: (1), (2), (3). Blocker: **HTTPS to `satisfecho.de` unreachable from this verification environment** (connection refused). Not evidence that production is down; re-run tests from a host with outbound access to production (e.g. operator laptop, CI with egress, or post-deploy check on amvara9).

6. **Product owner feedback:** No se pudo validar producción desde el entorno del tester: la conexión a **https://satisfecho.de** devolvió **connection refused**, así que no hay evidencia nueva sobre el pie de página ni los smoke HTTP/Puppeteer. Conviene repetir estas comprobaciones desde una red que alcance el sitio o tras despliegue desde el propio operador.

7. **URLs tested:**  
   1. `https://satisfecho.de/` (attempted; connection refused)  
   2. `https://satisfecho.de/api/health` (attempted; connection refused)  
   3. `https://satisfecho.de/api/docs` (attempted once in an earlier batch; subsequent attempts refused)

8. **Relevant log excerpts (last section):**

```text
$ curl -sS -I --connect-timeout 20 https://satisfecho.de/
curl: (7) Failed to connect to satisfecho.de port 443 after 53 ms: Couldn't connect to server

$ cd front && LANDING_VERSION_ONLY=1 BASE_URL=https://satisfecho.de npm run test:landing-version
Error: net::ERR_CONNECTION_REFUSED at https://satisfecho.de/
```

## Coder follow-up (2026-03-28 UTC)

- **Producto:** Sin cambios de merge ni despliegue desde este paso; el fallo del tester fue por **falta de salida HTTPS** al host de producción, no por regresión de código.
- **`front/scripts/test-landing-version.mjs`:** Antes de lanzar Puppeteer, si `BASE_URL` **no** es localhost, se ejecuta una **sonda HTTP(S)** a `/` (timeout ~12s) con mensaje explícito si la conexión falla. Opcional: `LANDING_SMOKE_NO_REACHABILITY_PROBE=1` para omitir la sonda (casos avanzados).
- **Re-test:** Ejecutar las comprobaciones desde un entorno con **egreso a `satisfecho.de:443`** (portátil operador, CI con red abierta, o `curl`/`node` sobre el servidor amvara9 hacia la URL pública o vía HAProxy local según proceda).

---

## Testing instructions (handoff to tester)

1. **Precondición:** El host desde el que se ejecuta el test debe poder abrir **TCP 443** a `satisfecho.de`. Si `curl` falla con *connection refused* o timeout, el resultado **no** valida producción; cambiar de red o ejecutar desde el operador/servidor.

2. **HTTP rápido:**  
   `curl -sS -o /dev/null -w '%{http_code}\n' --connect-timeout 20 https://satisfecho.de/`  
   `curl -sS -o /dev/null -w '%{http_code}\n' --connect-timeout 20 https://satisfecho.de/api/health`  
   Esperado: **200** (sin **503** persistente en arranque).

3. **Puppeteer (solo landing + versión, sin login):** desde **`front/`**:  
   `LANDING_VERSION_ONLY=1 SKIP_LANDING_PACKAGE_VERSION_CHECK=1 BASE_URL=https://satisfecho.de npm run test:landing-version`  
   (`SKIP_LANDING_PACKAGE_VERSION_CHECK` evita comparar el semver del pie con el `package.json` del checkout si el despliegue no coincide con la rama local.)  
   Esperado: línea **`0. Reachability probe`** con **`OK`**, luego **`>>> RESULT: Landing page shows version.`** y código de salida **0**.

4. **Tras desplegar el tip actual de `master`:** comprobar que el pie de la landing muestra versión/hash acordes al despliegue y repetir (2)–(3).

5. **Pass/fail:** **PASS** solo si (2) devuelve 200 en ambas URLs y (3) termina en **0** con el mensaje de resultado. **FAIL** si no hay conectividad: documentar como *environment blocked*, no como fallo de producto, salvo evidencia contraria desde una red válida.

6. **Opcional:** `LANDING_SMOKE_NO_REACHABILITY_PROBE=1` solo si se necesita forzar Puppeteer pese a un falso negativo de `fetch` en el runner (caso excepcional).

## Test report (tester 003, segunda pasada, 2026-03-28)

1. **Date/time (UTC)** and log window: **2026-03-28 14:36:47 UTC** (comandos **~14:36–14:37 UTC**).

2. **Environment:** Host runner; **sin** Docker Compose para estas comprobaciones. **`BASE_URL`:** `https://satisfecho.de`. **Rama local:** `development` en **`9d22553`** (tras **`./scripts/git-sync-development.sh`**). No se revisaron logs de contenedores (smoke solo contra producción pública).

3. **What was tested:** Instrucciones **(handoff)** puntos **2**, **3** y criterio **5** (PASS si 200+0); punto **1** (precondición de conectividad) satisfecho al completar curl y Puppeteer; punto **4** asumido parcialmente: el pie muestra hash **`00e806f`** (alineado con el estado descrito en el issue tras despliegue); ítem **6** no usado.

4. **Results:**
   - **(1) Precondición TCP 443 / conectividad:** **PASS** — Las peticiones HTTP y el script completaron sin *connection refused*.
   - **(2) HTTP `GET /` y `GET /api/health` → 200:** **PASS** — `curl` devolvió **`200`** y **`200`** respectivamente (timeout 20s).
   - **(3) Puppeteer `LANDING_VERSION_ONLY=1` + `SKIP_LANDING_PACKAGE_VERSION_CHECK=1`:** **PASS** — Sonda **`0. Reachability probe`** con **`OK`**, mensaje **`>>> RESULT: Landing page shows version.`**, salida **0**; texto de versión en pie: **`2.0.64 00e806f`**.
   - **(4) Pie vs tip `master`:** **PASS** (evidencia indirecta) — Hash visible **`00e806f`** coincide con el tip de ramas remoto citado en la primera pasada del informe; sin comprobación adicional de GitHub Actions en este paso.
   - **(5) Criterio global handoff:** **PASS** según definición del propio handoff.

5. **Overall:** **PASS**.

6. **Product owner feedback:** Producción **https://satisfecho.de** respondió **200** en la raíz y en **`/api/health`**, y el smoke Puppeteer (solo landing) terminó correctamente con versión/hash visibles en el pie. Esto confirma que, desde este entorno con egreso a Internet, el sitio está alcanzable y el flujo de smoke documentado es válido tras el despliegue.

7. **URLs tested:**
   1. `https://satisfecho.de/`
   2. `https://satisfecho.de/api/health`
   3. `https://satisfecho.de/` (carga vía Puppeteer en el script `test:landing-version`)

8. **Relevant log excerpts (last section):**

```text
$ curl -sS -o /dev/null -w '%{http_code}\n' --connect-timeout 20 https://satisfecho.de/
200
$ curl -sS -o /dev/null -w '%{http_code}\n' --connect-timeout 20 https://satisfecho.de/api/health
200

$ cd front && LANDING_VERSION_ONLY=1 SKIP_LANDING_PACKAGE_VERSION_CHECK=1 BASE_URL=https://satisfecho.de npm run test:landing-version
0. Reachability probe (remote BASE_URL)...
   OK: Host responds over HTTP(S).
1. Loading landing page (/)...
   Version element text: 2.0.64 00e806f
>>> RESULT: Landing page shows version.
```
