import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agents/client";
import {
  GENERATIVE_CURATOR_SYSTEM,
  generativeCuratorPrompt,
} from "@/lib/agents/prompts";
import type { IntakeAnswers, ThemeRecommendation } from "@/lib/types";
import { allPacks, savePack, type PackRecord } from "@/lib/db/packs";
import { appendHistory, updateSession } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 180;

function extractJson(raw: string): any {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) raw = fenceMatch[1];
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace < 0) throw new Error("no JSON object found");
  return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
}

function hexOk(v: any): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v);
}

function sessionPackId(sessionId: string, kind: string, index: number) {
  return `gen_${sessionId.replace(/[^a-z0-9]/gi, "")}_${kind}_${index}_${Date.now().toString(36).slice(-4)}`;
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

    const sessionId = body.sessionId || `anon_${Date.now().toString(36)}`;

    if (body.sessionId) {
      await updateSession(body.sessionId, { intake: body.intake });
      await appendHistory(body.sessionId, {
        role: "user",
        stage: "curate",
        text: `Intake: ${body.intake.businessName} — ${body.intake.businessDescription}`,
      });
    }

    // Load existing icon library (icons are chosen, not generated)
    const iconLibrary = await allPacks("icon");

    const raw = await runAgent({
      system: GENERATIVE_CURATOR_SYSTEM,
      prompt: generativeCuratorPrompt(
        body.intake,
        iconLibrary.map((p) => ({ id: p.id, name: p.name, mood: p.mood }))
      ),
      maxTokens: 4000,
    });

    const parsed = extractJson(raw);

    const savedPacks: PackRecord[] = [];
    const recommendation: ThemeRecommendation = {
      color: [],
      font: [],
      button: [],
      icon: [],
      shape: [],
      overallReasoning: String(parsed.overallReasoning || ""),
    };

    // Color packs
    if (Array.isArray(parsed.color)) {
      for (let i = 0; i < Math.min(parsed.color.length, 3); i++) {
        const c = parsed.color[i];
        if (
          !hexOk(c.bg) ||
          !hexOk(c.ink) ||
          !hexOk(c.accent)
        )
          continue;
        const id = sessionPackId(sessionId, "c", i);
        const pack: PackRecord = {
          id,
          kind: "color",
          name: String(c.name || `Custom ${i + 1}`),
          mood: String(c.mood || ""),
          source: "generated",
          sessionId,
          data: {
            bg: c.bg,
            surface: hexOk(c.surface) ? c.surface : c.bg,
            ink: c.ink,
            muted: hexOk(c.muted) ? c.muted : c.ink,
            accent: c.accent,
            accentAlt: hexOk(c.accentAlt) ? c.accentAlt : c.accent,
          },
        };
        await savePack(pack);
        savedPacks.push(pack);
        recommendation.color.push({ id, reason: String(c.reason || "") });
      }
    }

    // Font packs
    if (Array.isArray(parsed.font)) {
      for (let i = 0; i < Math.min(parsed.font.length, 3); i++) {
        const f = parsed.font[i];
        if (!f.display || !f.body || !f.googleHref) continue;
        const id = sessionPackId(sessionId, "f", i);
        const pack: PackRecord = {
          id,
          kind: "font",
          name: String(f.name || `Custom ${i + 1}`),
          mood: String(f.mood || ""),
          source: "generated",
          sessionId,
          data: {
            display: String(f.display),
            body: String(f.body),
            googleHref: String(f.googleHref),
            sampleDisplay: String(f.sampleDisplay || "Headline sample"),
            sampleBody: String(f.sampleBody || "Supporting body copy."),
          },
        };
        await savePack(pack);
        savedPacks.push(pack);
        recommendation.font.push({ id, reason: String(f.reason || "") });
      }
    }

    // Button packs
    if (Array.isArray(parsed.button)) {
      for (let i = 0; i < Math.min(parsed.button.length, 2); i++) {
        const b = parsed.button[i];
        if (!b.css || typeof b.css !== "string") continue;
        const id = sessionPackId(sessionId, "b", i);
        const pack: PackRecord = {
          id,
          kind: "button",
          name: String(b.name || `Custom ${i + 1}`),
          mood: String(b.mood || ""),
          source: "generated",
          sessionId,
          data: {
            css: String(b.css),
            sampleLabel: String(b.sampleLabel || "Click"),
          },
        };
        await savePack(pack);
        savedPacks.push(pack);
        recommendation.button.push({ id, reason: String(b.reason || "") });
      }
    }

    // Shape packs
    if (Array.isArray(parsed.shape)) {
      for (let i = 0; i < Math.min(parsed.shape.length, 2); i++) {
        const s = parsed.shape[i];
        if (!s.css || typeof s.css !== "string") continue;
        const id = sessionPackId(sessionId, "s", i);
        const pack: PackRecord = {
          id,
          kind: "shape",
          name: String(s.name || `Custom ${i + 1}`),
          mood: String(s.mood || ""),
          source: "generated",
          sessionId,
          data: { css: String(s.css) },
        };
        await savePack(pack);
        savedPacks.push(pack);
        recommendation.shape.push({
          id,
          reason: String(s.reason || ""),
        });
      }
    }

    // Icon packs (picked from library)
    const iconIds = new Set(iconLibrary.map((p) => p.id));
    if (Array.isArray(parsed.icon)) {
      for (const ic of parsed.icon.slice(0, 2)) {
        if (ic.id && iconIds.has(ic.id)) {
          recommendation.icon.push({
            id: ic.id,
            reason: String(ic.reason || ""),
          });
        }
      }
    }

    // Fallback if generation failed any category — use first curated packs
    const fallback = async (
      kind: "color" | "font" | "button" | "icon" | "shape",
      limit: number
    ) => {
      const arr = await allPacks(kind);
      return arr
        .filter((p) => p.source === "curated")
        .slice(0, limit)
        .map((p) => ({ id: p.id, reason: p.mood }));
    };
    if (recommendation.color.length === 0)
      recommendation.color = await fallback("color", 3);
    if (recommendation.font.length === 0)
      recommendation.font = await fallback("font", 3);
    if (recommendation.button.length === 0)
      recommendation.button = await fallback("button", 2);
    if (recommendation.icon.length === 0)
      recommendation.icon = await fallback("icon", 2);
    if (recommendation.shape.length === 0)
      recommendation.shape = await fallback("shape", 2);

    if (body.sessionId) {
      await updateSession(body.sessionId, { themeRecommendation: recommendation });
      await appendHistory(body.sessionId, {
        role: "assistant",
        stage: "curate",
        text: `Generated ${savedPacks.length} bespoke packs. Reasoning: ${recommendation.overallReasoning.slice(0, 200)}`,
      });
    }

    return NextResponse.json({
      recommendation,
      generatedCount: savedPacks.length,
    });
  } catch (err: any) {
    console.error("curate error", err);
    return NextResponse.json(
      { error: err?.message || "curation failed" },
      { status: 500 }
    );
  }
}
