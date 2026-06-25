# Enterprise RAG — Frontend

The web UI for the [Enterprise RAG](https://github.com/awesome-pro/enterprise_rag_backend)
system: a split-view chat that **streams answers** on the left and renders the
**live retrieval pipeline** on the right — RBAC clearances, per-stage latency,
the dense / BM25 / RRF / rerank reordering, cache badges, and grounded citations.

🔗 **Live:** https://enterprise-rag-frontend-pi.vercel.app
&nbsp;·&nbsp; **API:** https://enterpriseragbackend-production.up.railway.app
&nbsp;·&nbsp; **Backend repo:** https://github.com/awesome-pro/enterprise_rag_backend

---

## Features

- **Streaming chat** — answers stream token-by-token over Server-Sent Events
  (read via `fetch` + a manual SSE parser, since `EventSource` is GET-only).
- **Live pipeline dashboard** — every stage of the backend pipeline with its
  latency, the candidate reordering table (vec / bm25 / rrf / rank), and
  cache-hit badges.
- **Role switcher + RBAC badge** — switch between Employee / Engineer / Finance /
  Legal / Executive and watch what's retrievable change in real time.
- **Grounded citations** — inline `[n]` markers with source cards that show each
  document's access level.
- **Backend health dot** — polls the API so a down/wrong backend is obvious.
- **New chat** — resets the conversation and aborts any in-flight request.
- **Contextual help** — hover tooltips explain each part of the pipeline panel.

---

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (Radix primitives)
- `react-markdown` + `remark-gfm` for answer rendering
- TypeScript

---

## Local development

**Prerequisites:** Node 18+ and a running backend (locally on `:8001`, or use
the deployed API).

```bash
git clone https://github.com/awesome-pro/enterprise_rag_frontend
cd enterprise_rag_frontend
npm install

# point the UI at a backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local
# (or use the live API: https://enterpriseragbackend-production.up.railway.app)

npm run dev
```

Open http://localhost:3000.

### Environment

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the RAG backend. Read at build/start time — restart the dev server after changing it. |

---

## Deploy (Vercel)

1. Import the repo; framework **Next.js** is auto-detected.
2. Add `NEXT_PUBLIC_API_URL` pointing at your deployed backend.
3. Deploy.

---

## Project structure

```
app/
  page.tsx        State + SSE wiring; the split-view shell
  layout.tsx      Fonts + root layout
  globals.css     Theme tokens + markdown styles
components/
  ChatPanel       Chat thread, empty state, input
  Message         User/assistant bubbles, citations, badges
  PipelinePanel   Live stage timeline + reorder table
  RoleSwitcher    Role segmented control
  RbacBadge       Clearance hover-card
  HealthDot       Backend liveness indicator
  DemoNotice      Public-demo banner
  Tooltip         Hover tooltips / help affordances
  ui/             shadcn/ui primitives
lib/
  api.ts          fetchRoles + streamQuery (SSE parsing)
  types.ts        Shared types
  ui.ts           Access-level colors, formatting
```

---

## License

[MIT](LICENSE) © Abhinandan ·
[abhinandan@abhinandan.one](mailto:abhinandan@abhinandan.one) ·
[cal.com/abhibuilds/15min](https://cal.com/abhibuilds/15min)
