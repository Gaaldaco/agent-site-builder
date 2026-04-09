import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agents/client";
import { CURATOR_SYSTEM, curatorUserPrompt } from "@/lib/agents/prompts";
import type { IntakeAnswers, ThemeRecommendation } from "@/lib/types";
import {
  BUTTON_PACKS,
  COLOR_PACKS,
  FONT_PACKS,
  ICON_PACKS,
} from "@/lib/theme-packs";
import { appendHistory, updateSession } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 120;

function extractJson(raw: string): any {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) raw = fenceMatch[1];
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace < 0) throw new Error("no JSON object found");
  return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
}

function validate(
  rec: any,
  allowedIds: { color: Set<string>; font: Set<string>; button: Set<string>; icon: Set<string> }
): ThemeRecommendation {
  const pick = (arr: any[], allowed: Set<string>, limit: number) =>
    Array.isArray(arr)
      ? arr
          .filter((x) => x && typeof x.id === "string" && allowed.has(x.id))
          .slice(0, limit)
          .map((x) => ({
            id: x.id,
            reason: typeof x.reason === "string" ? x.reason : "",
          }))
      : [];

  return {
    color: pick(rec.color, allowedIds.color, 3),
    font: pick(rec.font, allowedIds.font, 3),
    button: pick(rec.button, allowedIds.button, 2),
    icon: pick(rec.icon, allowedIds.icon, 2),
    overallReasoning:
      typeof rec.overallReasoning === "string" ? rec.overallReasoning : "",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      intake: IntakeAnswers;
      sessionId?: string;
    };

    if (!body?.intake) {
      return NextResponse.json({ error: "intake required" }, { status: 400 });
    }

    if (body.sessionId) {
      await updateSession(body.sessionId, { intake: body.intake });
      await appendHistory(body.sessionId, {
        role: "user",
        stage: "curate",
        text: `Intake: ${body.intake.businessName} — ${body.intake.businessDescription}`,
      });
    }

    const raw = await runAgent({
      system: CURATOR_SYSTEM,
      prompt: curatorUserPrompt(body.intake),
      maxTokens: 2000,
    });

    const parsed = extractJson(raw);

    const allowedIds = {
      color: new Set(COLOR_PACKS.map((p) => p.id)),
      font: new Set(FONT_PACKS.map((p) => p.id)),
      button: new Set(BUTTON_PACKS.map((p) => p.id)),
      icon: new Set(ICON_PACKS.map((p) => p.id)),
    };

    const recommendation = validate(parsed, allowedIds);

    // Fallback: if any category came back empty, pick the first N packs.
    if (recommendation.color.length === 0) {
      recommendation.color = COLOR_PACKS.slice(0, 3).map((p) => ({
        id: p.id,
        reason: p.mood,
      }));
    }
    if (recommendation.font.length === 0) {
      recommendation.font = FONT_PACKS.slice(0, 3).map((p) => ({
        id: p.id,
        reason: p.mood,
      }));
    }
    if (recommendation.button.length === 0) {
      recommendation.button = BUTTON_PACKS.slice(0, 2).map((p) => ({
        id: p.id,
        reason: p.mood,
      }));
    }
    if (recommendation.icon.length === 0) {
      recommendation.icon = ICON_PACKS.slice(0, 2).map((p) => ({
        id: p.id,
        reason: p.mood,
      }));
    }

    if (body.sessionId) {
      await updateSession(body.sessionId, { themeRecommendation: recommendation });
      await appendHistory(body.sessionId, {
        role: "assistant",
        stage: "curate",
        text: `Recommended colors: ${recommendation.color.map((c) => c.id).join(", ")}. Reasoning: ${recommendation.overallReasoning}`,
      });
    }

    return NextResponse.json({ recommendation });
  } catch (err: any) {
    console.error("curate error", err);
    return NextResponse.json(
      { error: err?.message || "curation failed" },
      { status: 500 }
    );
  }
}
