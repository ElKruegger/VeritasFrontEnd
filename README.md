# Véritas — Storefront

The storefront of **Véritas**, a luxury menswear and lifestyle e-commerce platform. Built with Next.js (App Router) on top of the [Véritas API](https://github.com/ElKruegger/VeritasBackEnd) (ASP.NET Core, PostgreSQL).

> Work in progress — see the roadmap in [CLAUDE.md](CLAUDE.md).

## Tech stack

| Area         | Choice                                                                      |
| ------------ | --------------------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Cache Components), React 19                         |
| Language     | TypeScript (strict)                                                         |
| Styling      | Tailwind CSS 4                                                              |
| Data         | Server Components for catalog pages, TanStack Query for interactive data    |
| Client state | Zustand                                                                     |
| Forms        | React Hook Form + Zod                                                       |
| Tests        | Vitest + Testing Library (unit/component), Playwright (end-to-end, planned) |
| Hosting      | Vercel                                                                      |

## Architecture

```
Browser ──► Vercel (Next.js) ──/api/* rewrite──► Render (ASP.NET Core API) ──► Supabase (PostgreSQL)
```

The browser only ever talks to the storefront's own domain. Requests to `/api/*` are proxied by Next.js to the API, so for the browser the API is same-origin: the httpOnly auth cookies are first-party and work in every browser, including Safari, which blocks third-party cookies.

## Getting started

Prerequisites: Node.js 24 (see `.nvmrc`) and the backend running locally (`dotnet run --project LuxuryStore-Backend --launch-profile http`, or its `docker compose` setup).

```bash
npm install
cp .env.example .env.local   # adjust API_URL if the backend runs elsewhere
npm run dev                  # http://localhost:3000
```

## Quality checks

| Command                | What it checks                                      |
| ---------------------- | --------------------------------------------------- |
| `npm run lint`         | ESLint (Next.js core web vitals + TypeScript rules) |
| `npm run format:check` | Prettier formatting, Tailwind classes sorted        |
| `npm run typecheck`    | TypeScript, including generated route types         |
| `npm test`             | Unit and component tests                            |
| `npm run build`        | Production build                                    |

All of them run in the [CI workflow](.github/workflows/ci.yml) on every pull request, plus `npm audit` (fails on High/Critical advisories). Dependabot opens weekly update PRs.

## Deployment

Vercel builds every branch: each pull request gets its own preview URL, and `main` is deployed to production. The only required environment variable is `API_URL`, the base URL of the deployed API; the build fails on Vercel when it is missing.
