# CLAUDE.md — Véritas frontend

Context for AI coding agents (and humans) working on this repository. Read this first.

@AGENTS.md

## Product

Véritas is a portfolio-grade luxury menswear and lifestyle e-commerce platform (tailoring, footwear, watches, accessories, fragrances), with an editorial aesthetic comparable to Mr Porter. All code, commits, docs and UI copy are in **English**. Single currency (USD), no i18n.

This repo is the storefront. The API is a separate repo (`LuxuryStore-Backend`, ASP.NET Core on .NET 10, PostgreSQL on Supabase, deployed to Render as a Docker image).

Stack: Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS 4 · TanStack Query for interactive server data · Zustand for client-only UI state · Zod for form validation (plain uncontrolled forms; React Hook Form only if a form grows complex) · Vitest + Testing Library · Playwright (E2E, planned) · deployed on Vercel.

## Current state

Done: project scaffold, /api rewrite to the backend, security headers, Prettier, Vitest, CI workflow, Dependabot · design foundation: tokens in `globals.css` (paper/ink/stone/line/mist/oxblood, Bodoni Moda + Jost), header with mobile menu, footer, editorial home · API layer: types generated from the backend's OpenAPI document (`openapi/veritas-api.json` → `src/lib/api/schema.d.ts`), typed client (openapi-fetch), cached catalog reads (`src/lib/api/catalog.ts`) · catalog: `/shop/[slug]` (departments + `new`; designer, size, stock and price filters, sort and paging, all in the URL), `/product/[slug]` (gallery, size picker, related products, metadata and schema.org JSON-LD), `/search`, 404 page · accounts: `/account/login`, `/account/register` (`?next=` return path), `/account` (details, sign out), session in the header and mobile menu, silent token refresh · deploy-ready: `src/proxy.ts` relays the visitor IP to the API with a shared secret, `metadataBase` from `SITE_URL`/Vercel, API calls time out (`VERITAS_API_TIMEOUT_MS`).

Design rules: no gradients, no shadows, no rounded corners; hairlines and whitespace give structure; uppercase tracked labels at 11–12px; Bodoni for display only, Jost for everything functional; the oxblood accent only for Outlet/sale and errors; copy is specific and restrained (no "elevate your style"). Placeholder product images (placehold.co) render as a brand-initial tile until real photography exists (`product-image.tsx`).

Roadmap, in order:

1. Bag (backend first), then checkout (addresses, orders, Stripe), then order history and password reset.
2. Real product photography (licensed or generated stills) uploaded to Supabase Storage.
3. Deploy to Vercel: create the project and set `API_URL` and `STOREFRONT_PROXY_SECRET` (see README > Deployment); `FRONTEND_URL` on the API.
4. Playwright E2E in CI, Lighthouse scores in the README.

## Commands

```
npm run dev            # http://localhost:3000 (backend expected at API_URL, default http://localhost:5152)
npm run lint
npm run format         # Prettier (with Tailwind class sorting)
npm run typecheck      # next typegen + tsc
npm test               # Vitest, once
npm run build
npm run api:sync       # backend running: refresh openapi/veritas-api.json and regenerate the types
```

## Definition of done

A change is finished only when `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test` and `npm run build` all pass. Say which commands you ran and their result. For UI changes, also look at the page in a browser.

## Conventions — follow these

- The browser only calls this site's own `/api/*` (proxied to the backend by the rewrite in `next.config.ts`). Never call the backend's URL directly from client code: cookies would become cross-site.
- Server Components by default; add `"use client"` only to the components that need interactivity or browser APIs, as low in the tree as possible.
- Server data in client components goes through TanStack Query; Zustand only holds UI state that the server doesn't know about. Never copy server data into Zustand.
- API types are generated, never written by hand: `src/lib/api/types.ts` only gives short names to `components["schemas"]` from `schema.d.ts`. After a backend DTO change, run `npm run api:sync` and commit both `openapi/veritas-api.json` and `schema.d.ts` (CI fails if they disagree).
- Server Components read the API through `src/lib/api/catalog.ts` (`"use cache"` + `cacheLife`), never with a bare `fetch`. Reads that must not run at build time (the build has no API) sit behind `searchParams`/`params` inside `<Suspense>`, or call `await connection()` first.
- Listing state (filters, sort, page) lives in the URL and is parsed/serialized only by `src/lib/catalog/shop-query.ts`.
- Client components call the API only through `browserApi` (`src/lib/api/browser.ts`): it renews an expired session once and serializes refreshes (the API revokes every session if a rotated refresh token is reused). Who is signed in comes from `useSession()` (`src/lib/auth/session.ts`), never from local copies. Redirect targets from the URL go through `safeNextPath`.
- Form rules live in Zod schemas (`src/lib/auth/schemas.ts`) that mirror the backend's FluentValidation; API validation errors are mapped to fields with `problemFieldErrors` (`src/lib/api/problem.ts`).
- Prices are formatted only through `formatPrice` (`src/lib/format.ts`). The server computes every total — the client never sends prices.
- Pages that should be indexed (catalog, product) export `metadata` / `generateMetadata`.
- Accessibility is part of done: semantic HTML, labelled controls, visible focus, alt text from the API.
- Tests live next to the code as `*.test.ts(x)` and are named as sentences.
- Git flow: feature branch → PR into `developer` (CI must pass) → `developer` into `main`. The repository owner makes all commits and pushes: propose a commit message (Conventional Commits, English), never commit or push on your own.
