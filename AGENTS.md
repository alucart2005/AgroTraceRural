# AGENTS.md

AgroTrace Rural: traceability MVP for egg batches from Finca Guarumo. Two independent apps — `frontend/` (Next.js 14, App Router) and `backend/` (FastAPI). UI and domain terms are Spanish (Colombia): *lote, cubeta, finca*. There is no root package manager; run commands inside the relevant subdir.

## Commands

Frontend (`frontend/`):
- `npm install`
- `npm run dev` → http://localhost:3000
- `npm run lint`
- `npm run build` — this is also the TypeScript check; there is no separate typecheck script. Then `npm run start`.
- No frontend test runner is configured; verify with lint + build.

Backend (`backend/`, run from that dir so `app.*` imports resolve):
- Setup: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- `.venv/bin/python -m pytest -q` — 11 tests, all mocked, no network or DB needed
- `uvicorn app.main:app --reload` — API on :8000
- `python -m scripts.anchor_demo` — real Testnet anchor + verify (needs `STELLAR_SECRET_KEY`)
- `python -m scripts.stellar_account create|show`
- Requires Python ≥3.10 (PEP 604 `X | None`); README says 3.11+.

## Architecture and integration gaps (read before touching the API)
- Backend exposes only `GET /api/health` and `POST /api/verify` (`backend/app/main.py`). `frontend/lib/api.ts` additionally calls `/api/lotes`, `/api/lotes/{codigo}`, `/api/lotes/{codigo}/eventos` — these do **not exist yet**. With `NEXT_PUBLIC_API_URL` set they 404 and the failure is caught silently, falling back to demo, so a working UI does not prove the backend path works.
- **Demo mode is the default.** With no `NEXT_PUBLIC_API_URL`, data comes from `frontend/lib/demoStore.ts` (localStorage key `agrotrace.demo.lotes.v2`) and the Stellar tx hash is fabricated in the browser.
- Two independent canonical-JSON/SHA-256 implementations exist and are **not verified to agree**: `frontend/lib/hash.ts` (hashes `evidencias: [{nombre,tamano}]`) vs `backend/app/services/sha256.py` (`hash_lote` adds a sorted `_fotos` field). Changing one requires checking the other.
- The UI verifier (`frontend/components/VerificarIntegridad.tsx`) recomputes the hash client-side via `lib/api.ts:verificarLote` and compares to `lote.hash_sha256`; it does not call backend `/api/verify`.
- No database exists yet despite the README's PostgreSQL diagram: no ORM, models, migrations, or `DATABASE_URL`. The `postgres` MCP in `.opencode/opencode.json` is intentionally disabled.

## Stellar anchoring (`backend/app/services/stellar.py`)
- Only the 32-byte SHA-256 hash travels on-chain, as a transaction **Memo Hash**; files/photos never do.
- `anchor_hash` submits a 1-unit payment to the same account; `ensure_funded` uses Friendbot to create/fund Testnet accounts. Network passphrase is hardcoded Testnet.
- Needs `STELLAR_SECRET_KEY` (raises `StellarError` otherwise); `hash_hex` must decode to exactly 32 bytes.
- Horizon returns hash memos base64-encoded; `verify_anchor` decodes before comparing.

## Env
- `backend/.env` (gitignored; template `backend/.env.example`): `STELLAR_NETWORK`, `HORIZON_URL`, `STELLAR_PUBLIC_KEY`, `STELLAR_SECRET_KEY`, `FRONTEND_URL`.
- `frontend/.env.local` (template `frontend/.env.example`): `NEXT_PUBLIC_API_URL` (enables the real backend), `NEXT_PUBLIC_SITE_URL` (QR base URL), `BACKEND_URL` (Vercel `/api/*` rewrite target in `frontend/vercel.json`).

## Conventions and repo shape
- HUs map to routes: HU-01 registro `/productor/nuevo`, HU-02/03/05 público `/lote/[id]`, HU-04 etiqueta `/lote/[id]/etiqueta`. Acceptance criteria live in `docs/backlog/IssuesListos.md`; the backlog Kanban is `docs/semana2/KanbanBacklog.md`.
- Weekly deliverables live under `docs/semanaN/` as per-student Markdown; `NombreApellido1.md` files are empty template placeholders — preserve the rubric structure.
- Commit messages are short and prefixed (`feat:`, `docs:`).
- Deployment: Vercel project `frontend` (Root Directory `frontend`, Next.js auto-detected). Push to `main` → production; PRs → preview. Remote: `github.com/alucart2005/AgroTraceRural`.
- The repo-specific skill `agrotrace-mvp` covers full-stack/HU/env/deploy details in depth; `.opencode/opencode.json` holds the project MCPs (context7, playwright, vercel, cloudflare, github).
