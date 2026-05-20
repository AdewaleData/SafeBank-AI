<p align="center">
  <img src="docs/logo.svg" alt="SafeBank AI" width="96" />
</p>

<h1 align="center">SafeBank AI</h1>

<p align="center">
  A modern digital banking experience with intelligent fraud awareness, spending insights, and secure transfers — built as a production-style fintech demo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## Overview

**SafeBank AI** is a full-stack banking application that combines a polished customer-facing web app with a secure REST API. Users can register, manage balances, send money, review spending analytics, and freeze accounts in emergencies. Administrators can monitor users, transactions, and fraud signals from a dedicated dashboard.

The project is designed for learning, portfolio demos, and academic presentations — with realistic patterns for authentication, validation, and data modeling without claiming to be a licensed financial institution.

---

## Features

| Area | Capabilities |
|------|----------------|
| **Accounts** | Registration, JWT sign-in, unique 10-digit account numbers, transaction PIN |
| **Banking** | Balance dashboard, peer-to-peer transfers, reference IDs (`SBK-YYYY-XXXXXX`) |
| **Security** | Bcrypt passwords & PINs, emergency freeze / unfreeze, fraud scoring |
| **Insights** | Spending analytics charts, balance trends, activity history |
| **Resilience** | Offline transfer queue with sync when back online |
| **Admin** | User management, transaction oversight, fraud monitoring |

---

## Architecture

```
SafeBank-AI/
├── frontend/          # Next.js 15, React 19, Tailwind CSS, Framer Motion
├── backend/           # Python FastAPI, SQLAlchemy (async)
├── prisma/            # PostgreSQL schema, migrations, seed
├── docs/              # Brand assets (logo)
└── docker-compose.yml # PostgreSQL 16
```

- The **frontend** consumes the **FastAPI** backend over REST with bearer tokens.
- **Prisma** owns schema migrations; the API reads and writes the same PostgreSQL database via SQLAlchemy.

---

## Tech stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS v4, Radix UI, Recharts, Framer Motion
- **Backend:** FastAPI, Uvicorn, Pydantic, python-jose, bcrypt
- **Database:** PostgreSQL 16, Prisma ORM (migrations), SQLAlchemy (runtime)
- **Tooling:** pnpm, Docker Compose, concurrent dev scripts

---

## Quick start

### Prerequisites

- Node.js 20+
- Python 3.11+
- pnpm (`npm install -g pnpm` or use `npx pnpm`)
- Docker (optional, for local PostgreSQL)

### 1. Clone and configure

```bash
git clone https://github.com/AdewaleData/SafeBank-AI.git
cd SafeBank-AI
cp .env.example .env
```

Edit `.env` with your database URL and JWT secret. Copy environment variables to `backend/.env` and `frontend/.env.local` as needed (see `.env.example`).

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Database setup

```bash
pnpm install
pnpm db:push
pnpm db:seed
```

### 4. Run the API

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 5. Run the web app

```bash
cd frontend
pnpm install
pnpm dev
```

Open **http://localhost:3000**

Or from the repo root:

```bash
pnpm dev
```

### Demo admin account

After seeding:

| Field | Value |
|-------|-------|
| Email | `admin@safebank.ai` |
| Password | `Admin@12345` |
| Transaction PIN | `1234` |
| Account number | `5012345678` |

---

## Usage

1. **Register** at `/register` to create a personal account with a unique account number.
2. **Sign in** at `/login` and open the dashboard.
3. **Send money** using the recipient’s account number and your transaction PIN.
4. **Test transfers** by registering a second account (incognito or another browser).
5. **Admin** — sign in with the demo admin to access `/admin`.

Reset all data: `pnpm db:reset`

---

## API documentation

With the backend running, interactive docs are available at:

**http://localhost:8000/docs**

---

## Design system

| Token | Hex |
|-------|-----|
| Background | `#0B1020` |
| Card | `#121A2F` |
| Primary | `#4F8CFF` |
| Success | `#18C29C` |
| Danger | `#EF4444` |

---

## Project scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API and frontend together |
| `pnpm dev:api` | FastAPI only (port 8000) |
| `pnpm dev:web` | Next.js only (port 3000) |
| `pnpm db:push` | Apply Prisma schema to the database |
| `pnpm db:seed` | Seed demo admin account |
| `pnpm db:migrate` | Run Prisma migrations (dev) |
| `pnpm db:reset` | Reset database and re-seed |

---

## Repository structure

| Path | Purpose |
|------|---------|
| `frontend/src/app` | App Router pages (auth, dashboard, admin) |
| `frontend/src/lib` | API client, auth helpers |
| `backend/app/routers` | REST endpoints |
| `backend/app/models` | SQLAlchemy models |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Demo data seed |

---

## Deploy frontend on Vercel

1. **Project Settings → General → Root Directory** → **`frontend`** → Save.
2. **Build & Development Settings** — open **Install Command** and **Build Command**:
   - If you see `cd frontend && pnpm install`, **delete it** and leave the field **empty**, or use only `pnpm install`.
   - Same for Build Command: **empty** or only `pnpm build`.
   - Vercel already runs inside `frontend/` — `cd frontend` causes *No such file or directory*.
3. Save, then redeploy.
4. **Environment variables** → `NEXT_PUBLIC_API_URL` = your live API URL (not `localhost`).
5. **Redeploy**.

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.railway.app` |

---

## Deploy backend on Railway

1. Create a new Railway service from this repo.
2. **Settings → Root Directory** → set to **`backend`** (required).
3. Railway uses **Railpack** — `backend/railpack.json` starts the API with:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add a **PostgreSQL** plugin (or your own Postgres URL).
5. **Variables** on the Railway service:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres URL from Railway (`postgresql://...`) |
| `JWT_SECRET` | Long random secret |
| `FRONTEND_URL` | Your Vercel app URL, e.g. `https://safebank-ai.vercel.app` |
| `PORT` | Set automatically by Railway — do not override |

6. Redeploy. Open `https://<your-service>.up.railway.app/health` — should return `{"status":"ok"}`.
7. **Create database tables** (required once). From your PC, in the repo root:

```bash
# Use the Postgres URL from Railway (Variables → DATABASE_URL). Prisma uses postgresql:// not +asyncpg
set DATABASE_URL=postgresql://USER:PASS@HOST:PORT/railway
npx prisma db push
```

Then check: `https://<your-service>.up.railway.app/health/db` → should show `"database": "connected"`.

Without this step, register/login return **500** because tables do not exist yet.

8. On **Vercel**, set `NEXT_PUBLIC_API_URL` to your Railway URL (no trailing slash), and `FRONTEND_URL` on Railway to your Vercel URL.

If Railpack still says *No start command*, confirm **Root Directory is `backend`**, not the repo root.

---

## Security notes

- Never commit `.env`, `backend/.env`, or `frontend/.env.local`.
- Rotate `JWT_SECRET` and database credentials before any public deployment.
- This project is a **demo** — not certified banking software.

---

## Author

**Adewale** — [GitHub @AdewaleData](https://github.com/AdewaleData)

---

## License

This project is provided for educational and portfolio use. Add a license file if you intend to open-source under a specific terms (e.g. MIT).
