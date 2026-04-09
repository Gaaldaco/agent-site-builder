# agent-site-builder

An editorial, agent-driven website builder. Conversational intake, curated design packs, six subagents, selectable-element live editing, and a one-click standalone export. Built with Next.js 15 and the Anthropic API.

## How it flows

```
00  preface           →  /builder
01  intake            →  /builder/intake        7-question wizard
02  design packs      →  /builder/themes        color + type + buttons + icons
03  drafts            →  /builder/drafts        4 AI-authored variants
04  subagents         →  /builder/refine        designer → layout → backend → tester → debugger → presenter
05  editor            →  /builder/editor        click-to-select refinement
06  export            →  /builder/export        standalone zip, Railway, GitHub
```

## Local dev

```bash
npm install
cp .env.example .env.local
# put your Anthropic key in .env.local
npm run dev
```

Visit http://localhost:3000.

## Environment variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes | — | Your Anthropic key |
| `ANTHROPIC_MODEL` | no | `claude-sonnet-4-6` | Any available Claude model id |
| `PORT` | no | `3000` | Set automatically by Railway |

## Deploy to Railway

```bash
# One-time: create the project
railway init --name "agent-site-builder"

# Set the API key
railway variable set ANTHROPIC_API_KEY=sk-ant-...

# Deploy from this directory
railway up

# Get a public URL
railway domain
```

Railway uses the included `Dockerfile` (multi-stage, Next.js standalone output) and `railway.json`.

## Deploy via GitHub auto-deploy

```bash
gh repo create Gaaldaco/agent-site-builder --public --source . --push
railway add --repo "Gaaldaco/agent-site-builder"
railway variable set ANTHROPIC_API_KEY=sk-ant-...
# Every push to main now auto-deploys
```

## Architecture

- **Next.js 15 App Router** — all routes live in `app/`.
- **Client state** — `lib/store.ts` persists the full project state (intake, theme, drafts, final HTML, subagent progress) to `localStorage`. No database required for the intake flow.
- **Agent backend** — `lib/agents/client.ts` wraps the `@anthropic-ai/sdk` messages API. `lib/agents/prompts.ts` centralizes all prompts.
- **SSE orchestration** — `app/api/agent/refine/route.ts` streams Server-Sent Events while six subagents run sequentially, each handed the HTML output of the previous.
- **Selectable editor** — `app/builder/editor/page.tsx` injects a click-capture layer into the iframe, computes a CSS selector for any clicked element, and sends `{selector, outerHTML, userRequest}` to `/api/agent/edit` so the agent only touches what the user targeted.
- **Export** — `app/api/export/route.ts` packages the final HTML + any uploaded photos into a zip via JSZip.

## Design system

- **Typography**: Fraunces (display, italic-forward), Instrument Sans (body), JetBrains Mono (metadata).
- **Palette**: deep ink `#08080e`, warm paper `#f6f4ee`, violet ink accent `#7c5cff`, lime signal `#c4f24b`.
- **Motifs**: oversized italic chapter numerals, hairline grammar, mono marginalia, film-grain overlay, crosshair cursor inside the editor canvas.

## License

MIT — do whatever you want with what you build.
