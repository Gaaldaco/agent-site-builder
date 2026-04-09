import { NextRequest } from "next/server";
import { runAgent, extractHtml, isRenderableHtml } from "@/lib/agents/client";
import {
  SPECIALIST_SUBAGENTS,
  SYNTHESIZER_SYSTEM,
  synthesizerPrompt,
} from "@/lib/agents/prompts";
import type { IntakeAnswers, ThemeSelection } from "@/lib/types";
import { appendHistory, updateSession } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 600;

function extractJson(raw: string): any {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) raw = fenceMatch[1];
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace < 0) throw new Error("no JSON object");
  return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
}

/**
 * Streams SSE while the orchestrator:
 *   1) emits subagent:start for all 5 specialists simultaneously
 *   2) runs them in TRUE PARALLEL on the original draft
 *   3) emits subagent:done as each finishes
 *   4) runs the synthesizer (presenter) which merges all 5 patches
 *   5) emits the final HTML
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    html: string;
    intake: IntakeAnswers;
    theme: Partial<ThemeSelection>;
    sessionId?: string;
  };

  if (!body?.html) {
    return new Response(JSON.stringify({ error: "html required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // Kick off all 5 specialists in parallel. Emit :start upfront.
        for (const spec of SPECIALIST_SUBAGENTS) {
          send("subagent:start", { name: spec.name, role: spec.role });
        }

        type PatchResult = {
          name: string;
          patch: any;
          error?: string;
        };

        const specialistPromises: Promise<PatchResult>[] =
          SPECIALIST_SUBAGENTS.map(async (spec) => {
            try {
              const raw = await runAgent({
                system: `You are the ${spec.name} specialist in a parallel orchestration pipeline. Output VALID JSON only, no commentary, no code fences.`,
                prompt: spec.instruction(body.html, body.intake, body.theme),
                maxTokens: 4000,
              });
              const patch = extractJson(raw);
              return { name: spec.name, patch };
            } catch (err: any) {
              return {
                name: spec.name,
                patch: null,
                error: err?.message || "specialist failed",
              };
            }
          });

        // Emit subagent:done as each promise resolves, not at the end of the batch
        specialistPromises.forEach((p, idx) => {
          const spec = SPECIALIST_SUBAGENTS[idx];
          p.then((result) => {
            if (result.error) {
              send("subagent:error", { name: spec.name, message: result.error });
            } else {
              send("subagent:done", {
                name: spec.name,
                message: result.patch?.notes || `${spec.name} patch ready`,
              });
            }
          });
        });

        const patches = await Promise.all(specialistPromises);

        // Now synthesize
        send("subagent:start", {
          name: "presenter",
          role: "Merges all 5 specialist patches into the final HTML",
        });

        const synthRaw = await runAgent({
          system: SYNTHESIZER_SYSTEM,
          prompt: synthesizerPrompt(body.html, patches),
          maxTokens: 16000,
        });

        const finalHtml = extractHtml(synthRaw);

        if (isRenderableHtml(finalHtml)) {
          send("subagent:done", {
            name: "presenter",
            message: "Synthesis complete",
          });

          if (body.sessionId) {
            await updateSession(body.sessionId, { finalHtml });
            await appendHistory(body.sessionId, {
              role: "assistant",
              stage: "refine",
              text: `Parallel orchestrator complete. ${patches.filter((p) => !p.error).length}/5 specialists OK. Final HTML: ${finalHtml.length} chars.`,
            });
          }

          send("final", { html: finalHtml });
        } else {
          send("subagent:error", {
            name: "presenter",
            message:
              "Synthesizer returned un-renderable HTML, keeping original draft",
          });
          send("final", { html: body.html });
        }

        send("complete", { ok: true });
      } catch (err: any) {
        send("error", { message: err?.message || "orchestrator failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
