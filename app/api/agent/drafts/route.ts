import { NextRequest, NextResponse } from "next/server";
import { runAgent, extractHtml } from "@/lib/agents/client";
import { DRAFTER_SYSTEM, drafterUserPrompt } from "@/lib/agents/prompts";
import type { IntakeAnswers, ThemeSelection } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const VARIANTS = [
  {
    label: "A",
    concept:
      "Editorial. Big display type, generous whitespace, magazine-style grid, restrained color.",
  },
  {
    label: "B",
    concept:
      "Bold. Maximal hero, confident CTAs, strong color blocks, gestural shapes.",
  },
  {
    label: "C",
    concept:
      "Minimal. Single-column flow, hairline dividers, tiny accent touches only.",
  },
  {
    label: "D",
    concept:
      "Modular. Card-based sections, structured grid, systematic and technical.",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      intake: IntakeAnswers;
      theme: Partial<ThemeSelection>;
    };

    if (!body?.intake || !body?.theme) {
      return NextResponse.json(
        { error: "intake and theme required" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      VARIANTS.map(async (variant) => {
        const raw = await runAgent({
          system: DRAFTER_SYSTEM,
          prompt: drafterUserPrompt(body.intake, body.theme, variant),
          maxTokens: 8000,
        });
        return {
          id: variant.label.toLowerCase(),
          label: variant.label,
          concept: variant.concept,
          html: extractHtml(raw),
        };
      })
    );

    return NextResponse.json({ drafts: results });
  } catch (err: any) {
    console.error("drafts error", err);
    return NextResponse.json(
      { error: err?.message || "draft generation failed" },
      { status: 500 }
    );
  }
}
