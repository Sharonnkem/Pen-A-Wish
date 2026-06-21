# Pen A Wish

Pen A Wish is a responsive full-stack web application for creating celebration pages, collecting wishes and gifts, moderating content, and turning messages into a visually rich Wish Wall export experience.

## Source of Truth

The canonical documentation pack lives at [docs/source-of-truth/extracted/Pen_A_Wish_Codex_Source_of_Truth_Docs/README.md](/c:/Users/Sharon Nkem/Desktop/Pen-A-Wish/docs/source-of-truth/extracted/Pen_A_Wish_Codex_Source_of_Truth_Docs/README.md).

Read and follow these documents before building features:

1. `01_PROJECT_CONTEXT.md`
2. `02_FEATURE_SPEC.md`
3. `03_SYSTEM_ARCHITECTURE.md`
4. `04_DATABASE_SCHEMA.md`
5. `05_API_CONTRACT.md`
6. `06_AUTOMATION_WORKFLOW.md`
7. `07_DEVELOPMENT_ROADMAP.md`
8. `08_AI_CODING_RULES.md`
9. `09_UI_UX_GUIDELINE.md`

## Workspace Structure

```txt
frontend/   React + TypeScript + Vite + Tailwind CSS
backend/    Node.js + Express + TypeScript API
shared/     Shared TypeScript types for cross-package contracts
docs/       Source-of-truth documentation pack
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment files

Copy the provided examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

On Windows PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
```

### 2a. Supabase option

If you want to use Supabase as the hosted PostgreSQL database for this project, keep the existing backend architecture and update the backend environment values in `backend/.env`.

Use:

```env
DATABASE_URL=your-supabase-postgres-connection-string
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
SUPABASE_URL=https://your-project-ref.supabase.co
```

For this Express backend, prefer the Supabase direct connection string for a long-lived backend server. If your machine/network is IPv4-only and the direct endpoint is not reachable, use the Supabase session pooler connection string instead.
Media uploads continue to use Cloudinary through `/api/uploads/image`, so keep your Cloudinary credentials configured separately in the backend env file.

### 3. Start the backend

```bash
npm run dev:backend
```

Run the database migrations before starting backend flows:

```bash
npm run db:migrate --workspace backend
```

Backend default URL:

```txt
http://localhost:4000
```

Health check endpoint:

```txt
GET /api/health
```

### 4. Start the frontend

In a second terminal:

```bash
npm run dev:frontend
```

Frontend default URL:

```txt
http://localhost:5173
```

## Available Scripts

At the repository root:

```bash
npm run dev:frontend
npm run dev:backend
npm run db:migrate --workspace backend
npm run db:check --workspace backend
npm run build
npm run typecheck
```

## What Is Included Right Now

- React, TypeScript, and Vite frontend scaffold
- Tailwind CSS UI system and shared layout foundations
- Authentication, protected routes, and admin route guards
- Celebration creation and management flows
- Public celebration page with wishes, guestbook, reactions, and gift entry points
- Wallet, withdrawal, and admin review flows
- Wish Wall generation and JPG/PNG/PDF export support
- Express + TypeScript backend with health check, validation, and role-based route protection
- PostgreSQL migrations and shared TypeScript contracts
- Environment variable examples for frontend and backend

## Current Setup Notes

- A local PostgreSQL instance is required for backend startup and full end-to-end testing.
- External integrations such as Cloudinary, Resend, and Paystack require valid environment variables to exercise their live flows.
- If `VITE_API_BASE_URL` is omitted, the frontend falls back to a relative `/api` path so production deployments do not depend on localhost defaults.
