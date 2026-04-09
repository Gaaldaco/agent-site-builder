import { NextRequest } from "next/server";
import { runAgent, extractHtml, isRenderableHtml } from "@/lib/agents/client";
import { SUBAGENT_DEFINITIONS } from "@/lib/agents/prompts";
import type { IntakeAnswers, ThemeSelection } from "@/lib/types";
import { appendHistory, updateSession } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 600;

/**
 * Streams Server-Sent Events while the orchestrator runs six subagents
 * sequentially, each refining the HTML from the previous.
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

      let currentHtml = body.html;

      try {
        for (const sub of SUBAGENT_DEFINITIONS) {
          send("subagent:start", { name: sub.name, role: sub.role });

          try {
            const raw = await runAgent({
              system: `You are one of six subagents in an orchestrated website-polish pipeline. Your only role: ${sub.role}. Return the FULL updated HTML document only, no commentary. NEVER add animation-play-state:paused or scroll-trigger classes — there is no JavaScript available to unpause them.`,
              prompt: sub.instruction(currentHtml, body.intake, body.theme),
              maxTokens: 16000,
            });

            const nextHtml = extractHtml(raw);
            // Only accept the update if it's a complete, renderable document.
            // Otherwise keep the prior-step HTML so we never regress to blank.
            if (isRenderableHtml(nextHtml)) {
              currentHtml = nextHtml;
              send("subagent:done", {
                name: sub.name,
                message: `${sub.name} pass complete`,
              });
            } else {
              send("subagent:done", {
                name: sub.name,
                message: `${sub.name} output rejected, kept prior HTML`,
              });
            }
          } catch (subErr: any) {
            send("subagent:error", {
              name: sub.name,
              message: subErr?.message || "subagent failed",
            });
          }
        }

        if (body.sessionId) {
          await updateSession(body.sessionId, { finalHtml: currentHtml });
          await appendHistory(body.sessionId, {
            role: "assistant",
            stage: "refine",
            text: `Subagent pipeline complete. Final HTML length: ${currentHtml.length}`,
          });
        }

        send("final", { html: currentHtml });
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
