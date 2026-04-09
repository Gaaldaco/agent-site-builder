import { NextRequest, NextResponse } from "next/server";
import { runAgent, extractHtml, isRenderableHtml } from "@/lib/agents/client";
import { editorPrompt } from "@/lib/agents/prompts";
import {
  appendHistory,
  getSession,
  historyDigest,
  updateSession,
} from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      html: string;
      selector: string;
      elementOuterHtml: string;
      request: string;
      sessionId?: string;
    };

    if (!body?.html || !body?.selector || !body?.request) {
      return NextResponse.json(
        { error: "html, selector, and request are required" },
        { status: 400 }
      );
    }

    let memoryContext = "";
    if (body.sessionId) {
      const s = await getSession(body.sessionId);
      memoryContext = historyDigest(s);
      await appendHistory(body.sessionId, {
        role: "user",
        stage: "edit",
        text: `Edit request on ${body.selector}: ${body.request}`,
      });
    }

    const raw = await runAgent({
      system:
        "You are a precise HTML editor. Modify ONLY the element the user targeted. Return the FULL updated HTML document. Never add animation-play-state:paused or any JS-dependent pattern — there is no JavaScript runtime." +
        (memoryContext ? `\n\nPRIOR EDIT HISTORY:\n${memoryContext}` : ""),
      prompt: editorPrompt(
        body.html,
        body.selector,
        body.elementOuterHtml,
        body.request
      ),
      maxTokens: 16000,
    });

    const updated = extractHtml(raw);
    if (!isRenderableHtml(updated)) {
      return NextResponse.json(
        { error: "edit returned un-renderable HTML; try rephrasing the change" },
        { status: 422 }
      );
    }

    if (body.sessionId) {
      await updateSession(body.sessionId, { finalHtml: updated });
      await appendHistory(body.sessionId, {
        role: "assistant",
        stage: "edit",
        text: `Applied edit to ${body.selector}`,
      });
    }

    return NextResponse.json({ html: updated });
  } catch (err: any) {
    console.error("edit error", err);
    return NextResponse.json(
      { error: err?.message || "edit failed" },
      { status: 500 }
    );
  }
}
