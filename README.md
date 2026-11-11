# VENTUREX — Frontend design preview

A standalone Next.js frontend focused on premium visual design. **No backend, database, Docker, or environment variables are required.**

## Run

From this project folder:

```bash
npm install
npm run dev
```

Open the Local URL printed by Next.js (normally **http://localhost:3000**; the current preview uses **http://localhost:3001**).

```bash
npm run build     # Production frontend build
npm start         # Serve the production build
npm run typecheck # Frontend TypeScript
npm run lint      # Frontend lint
npm run format    # Prettier
```

## Explore

- `/` — landing page with an interactive, dynamically loaded Three.js globe
- `/marketplace` — search, filters, sorting, pagination, comparison, saved startups
- `/startups/lumina-ai` — startup story and illustrative fundraising profile
- `/investor/dashboard` — simulated portfolio and charts
- `/founder/dashboard` — fundraising design preview
- `/projects/dashboard` — browser-local project previews
- `/matching`, `/messages`, `/meetings`, `/settings` — interactive frontend screens

Use the **Demo investor** or **Demo founder** buttons on `/login` to switch preview personas. No real authentication occurs; no passwords or tokens are stored. Registration is a persona preview.

All startups, funding figures, conversations, and portfolio returns are fictional. UI changes are stored only in browser localStorage under `venturex-preview:*`. No data is sent to a server. Browser storage is not secure document storage. Contact, messaging, verification, and funding actions are preview interactions only.

## Structure

`apps/web` contains the active frontend; `packages/shared` contains demo data and explainable compatibility scoring. Backend scaffolding in `apps/api` and Docker files were created before the scope changed to frontend-only and are preserved but are not used by the root dev/build commands.

The design uses Next.js App Router, React, TypeScript, Tailwind CSS, Radix/shadcn-style component primitives, Three.js, React Three Fiber, Drei, Motion, Recharts, and Lucide. Globe animation respects reduced motion and has a non-WebGL fallback.

## Visual system and motion

The interface uses graphite, ivory, copper-orange, and sage. `apps/web/app/future.css` contains the visual refinements. `components/signal-room.tsx` provides the interactive sector radar and opportunity ticker; `components/motion-system.tsx` provides scroll reveals, perspective cards, and shared motion preferences.

Use the pause button in the public navigation to pause ambient motion. Device reduced-motion settings are respected automatically. All animated counters are derived from the fictional startup dataset.

Run `npm run test:e2e` for browser checks. It starts a dedicated frontend preview on port 3100; set `PREVIEW_URL=http://localhost:3001` to test an existing preview.
