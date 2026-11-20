# CLAUDE.md — Véritas frontend

Context for AI coding agents (and humans) working on this repository. Read this first.

@AGENTS.md

## Product

Véritas is a portfolio-grade luxury menswear and lifestyle e-commerce platform (tailoring, footwear, watches, accessories, fragrances), with an editorial aesthetic comparable to Mr Porter. All code, commits, docs and UI copy are in **English**. Single currency (USD), no i18n.

This repo is the storefront. The API is a separate repo (`LuxuryStore-Backend`, ASP.NET Core on .NET 10, PostgreSQL on Supabase, deployed to Render as a Docker image).

Stack: Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS 4 · TanStack Query for interactive server data · Zustand for client-only UI state · React Hook Form + Zod for forms · Vitest + Testing Library · Playwright (E2E, planned) · deployed on Vercel.

## Current state

Done: project scaffold, /api rewrite to the backend, security headers, Prettier, Vitest, CI workflow, Dependabot · design foundation: tokens in `globals.css` (paper/ink/stone/line/mist/oxblood, Bodoni Moda + Jost), header with mobile menu, footer, editorial home (department index, new arrivals and brands from the API, streamed behind Suspense).

Design rules: no gradients, no shadows, no rounded corners; hairlines and whitespace give structure; uppercase tracked labels at 11–12px; Bodoni for display only, Jost for everything functional; the oxblood accent only for Outlet/sale and errors; copy is specific and restrained (no "elevate your style"). Placeholder product images (placehold.co) render as a brand-initial tile until real photography exists (`product-image.tsx`).

Roadmap, in order:

1. Real product photography (licensed or generated stills) uploaded to Supabase Storage.
2. API layer: TypeScript types generated from the backend's OpenAPI document; a typed fetch client.
3. Catalog: category page (filters, sort, paging from `GET /api/v1/products` and `/products/filters`), product page (gallery, variant picker, related products), with metadata for SEO and link previews.
4. Deploy to Vercel (`API_URL` env var); backend cookies move to `SameSite=Lax` once same-origin.
5. Auth pages → cart → checkout (Stripe) → account/order history.
6. Playwright E2E in CI, Lighthouse scores in the README.

## Commands

```
npm run dev            # http://localhost:3000 (backend expected at API_URL, default http://localhost:5152)
npm run lint
npm run format         # Prettier (with Tailwind class sorting)
npm run typecheck      # next typegen + tsc
npm test               # Vitest, once
npm run build
```

## Definition of done

A change is finished only when `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test` and `npm run build` all pass. Say which commands you ran and their result. For UI changes, also look at the page in a browser.

## Conventions — follow these

- The browser only calls this site's own `/api/*` (proxied to the backend by the rewrite in `next.config.ts`). Never call the backend's URL directly from client code: cookies would become cross-site.
- Server Components by default; add `"use client"` only to the components that need interactivity or browser APIs, as low in the tree as possible.
- Server data in client components goes through TanStack Query; Zustand only holds UI state that the server doesn't know about. Never copy server data into Zustand.
- Prices are formatted only through `formatPrice` (`src/lib/format.ts`). The server computes every total — the client never sends prices.
- Pages that should be indexed (catalog, product) export `metadata` / `generateMetadata`.
- Accessibility is part of done: semantic HTML, labelled controls, visible focus, alt text from the API.
- Tests live next to the code as `*.test.ts(x)` and are named as sentences.
- Git flow: feature branch → PR into `developer` (CI must pass) → `developer` into `main`. The repository owner makes all commits and pushes: propose a commit message (Conventional Commits, English), never commit or push on your own.
