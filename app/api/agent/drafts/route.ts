import { NextRequest, NextResponse } from "next/server";
import { runAgent, extractHtml, isRenderableHtml } from "@/lib/agents/client";
import {
  DRAFTER_SYSTEM,
  drafterUserPrompt,
  type ResolvedTheme,
} from "@/lib/agents/prompts";
import type { IntakeAnswers, ThemeSelection } from "@/lib/types";
import {
  appendHistory,
  getSession,
  historyDigest,
  updateSession,
} from "@/lib/session";
import { packById } from "@/lib/db/packs";

export const runtime = "nodejs";
export const maxDuration = 600;

const VARIANTS = [
  {
    label: "A",
    concept:
      "Editorial. Big display type, generous whitespace, magazine-style grid, restrained color. Calm confidence.",
  },
  {
    label: "B",
    concept:
      "Bold. Maximal hero, confident CTAs, strong color blocks, gestural shapes, big display numerals.",
  },
  {
    label: "C",
    concept:
      "Minimal. Single-column flow, hairline dividers, tiny accent touches only, short punchy copy.",
  },
  {
    label: "D",
    concept:
      "Modular. Card-based sections, structured grid, systematic and technical feel with strong hierarchy.",
  },
];

const MAX_ATTEMPTS = 2;

async function resolveTheme(
  theme: Partial<ThemeSelection>
): Promise<ResolvedTheme> {
  const [color, font, button, icon, shape] = await Promise.all([
    theme.colorPackId ? packById(theme.colorPackId) : Promise.resolve(null),
    theme.fontPackId ? packById(theme.fontPackId) : Promise.resolve(null),
    theme.buttonPackId ? packById(theme.buttonPackId) : Promise.resolve(null),
    theme.iconPackId ? packById(theme.iconPackId) : Promise.resolve(null),
    theme.shapePackId ? packById(theme.shapePackId) : Promise.resolve(null),
  ]);
  return {
    color: color
      ? { name: color.name, mood: color.mood, data: color.data }
      : null,
    font: font ? { name: font.name, mood: font.mood, data: font.data } : null,
    button: button
      ? { name: button.name, mood: button.mood, data: button.data }
      : null,
    icon: icon ? { name: icon.name, mood: icon.mood, data: icon.data } : null,
    shape: shape
      ? { name: shape.name, mood: shape.mood, data: shape.data }
      : null,
  };
}

async function draftOne(
  variant: (typeof VARIANTS)[number],
  intake: IntakeAnswers,
  resolved: ResolvedTheme,
  memoryContext: string
) {
  let lastErr: unknown = null;
  const system = memoryContext
    ? `${DRAFTER_SYSTEM}\n\nPRIOR SESSION CONTEXT (for continuity, do not repeat verbatim):\n${memoryContext}`
    : DRAFTER_SYSTEM;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const raw = await runAgent({
        system,
        prompt: drafterUserPrompt(intake, resolved, variant),
        maxTokens: 16000,
      });
      const html = extractHtml(raw);
      if (isRenderableHtml(html)) {
        return { ok: true as const, variant, html };
      }
      lastErr = new Error(
        `variant ${variant.label} attempt ${attempt} returned un-renderable HTML`
      );
    } catch (err) {
      lastErr = err;
    }
  }
  return {
    ok: false as const,
    variant,
    error: (lastErr as Error)?.message || "unknown drafter error",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      intake: IntakeAnswers;
      theme: Partial<ThemeSelection>;
      sessionId?: string;
    };

    if (!body?.intake || !body?.theme) {
      return NextResponse.json(
        { error: "intake and theme required" },
        { status: 400 }
      );
    }

    let memoryContext = "";
    if (body.sessionId) {
      const session = await getSession(body.sessionId);
      memoryContext = historyDigest(session);
      await updateSession(body.sessionId, {
        intake: body.intake,
        theme: body.theme,
      });
      await appendHistory(body.sessionId, {
        role: "user",
        stage: "drafts",
        text: `Requested 4 drafts with theme: color=${body.theme.colorPackId} font=${body.theme.fontPackId} button=${body.theme.buttonPackId} icon=${body.theme.iconPackId}`,
      });
    }

    const resolved = await resolveTheme(body.theme);

    const settled = await Promise.all(
      VARIANTS.map((v) => draftOne(v, body.intake, resolved, memoryContext))
    );

    const drafts = settled
      .filter((r) => r.ok)
      .map((r) => ({
        id: r.variant.label.toLowerCase(),
        label: r.variant.label,
        concept: r.variant.concept,
        html: (r as any).html as string,
      }));

    const failures = settled
      .filter((r) => !r.ok)
      .map((r) => ({ label: r.variant.label, error: (r as any).error }));

    if (drafts.length === 0) {
      return NextResponse.json(
        { error: "all drafters failed", failures },
        { status: 500 }
      );
    }

    if (body.sessionId) {
      await updateSession(body.sessionId, { drafts });
      await appendHistory(body.sessionId, {
        role: "assistant",
        stage: "drafts",
        text: `Produced ${drafts.length} draft variants: ${drafts.map((d) => d.label).join(", ")}${failures.length ? `. Failures: ${failures.map((f) => f.label).join(", ")}` : ""}`,
      });
    }

    return NextResponse.json({ drafts, failures });
  } catch (err: any) {
    console.error("drafts error", err);
    return NextResponse.json(
      { error: err?.message || "draft generation failed" },
      { status: 500 }
    );
  }
}
