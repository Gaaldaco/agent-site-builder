import { NextRequest, NextResponse } from "next/server";
import { runAgent, extractHtml } from "@/lib/agents/client";
import { editorPrompt } from "@/lib/agents/prompts";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      html: string;
      selector: string;
      elementOuterHtml: string;
      request: string;
    };

    if (!body?.html || !body?.selector || !body?.request) {
      return NextResponse.json(
        { error: "html, selector, and request are required" },
        { status: 400 }
      );
    }

    const raw = await runAgent({
      system:
        "You are a precise HTML editor. Modify ONLY the element the user targeted. Return the FULL updated HTML document.",
      prompt: editorPrompt(
        body.html,
        body.selector,
        body.elementOuterHtml,
        body.request
      ),
      maxTokens: 8000,
    });

    const updated = extractHtml(raw);
    return NextResponse.json({ html: updated });
  } catch (err: any) {
    console.error("edit error", err);
    return NextResponse.json(
      { error: err?.message || "edit failed" },
      { status: 500 }
    );
  }
}
