import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

let _client: Anthropic | null = null;

function client() {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your .env.local or Railway variables."
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

export async function runAgent({
  system,
  prompt,
  maxTokens = 8000,
}: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const text = res.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return text.trim();
}

export async function runAgentStream({
  system,
  prompt,
  maxTokens = 8000,
  onDelta,
}: {
  system: string;
  prompt: string;
  maxTokens?: number;
  onDelta?: (delta: string) => void;
}): Promise<string> {
  const stream = await client().messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  let full = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      full += event.delta.text;
      onDelta?.(event.delta.text);
    }
  }

  return full.trim();
}

export function extractHtml(raw: string): string {
  // Strip possible code fences or commentary.
  const fenceMatch = raw.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (fenceMatch) raw = fenceMatch[1];

  const lower = raw.toLowerCase();
  const doctypeIdx = lower.indexOf("<!doctype");
  if (doctypeIdx >= 0) {
    const closeIdx = lower.lastIndexOf("</html>");
    if (closeIdx > doctypeIdx) return raw.slice(doctypeIdx, closeIdx + 7).trim();
    return raw.slice(doctypeIdx).trim();
  }

  const htmlIdx = lower.indexOf("<html");
  if (htmlIdx >= 0) {
    const closeIdx = lower.lastIndexOf("</html>");
    if (closeIdx > htmlIdx)
      return "<!doctype html>\n" + raw.slice(htmlIdx, closeIdx + 7).trim();
    return "<!doctype html>\n" + raw.slice(htmlIdx).trim();
  }

  return raw.trim();
}

/**
 * Quick sanity check: does this string look like a complete HTML document
 * that would actually render something visible?
 */
export function isRenderableHtml(html: string): boolean {
  if (!html || html.length < 200) return false;
  const lower = html.toLowerCase();
  if (!lower.includes("<html")) return false;
  if (!lower.includes("</html>")) return false;
  if (!lower.includes("<body")) return false;
  // Reject documents that suspend all content behind paused animations
  // without any JS to resume them (our "nothing rendered" bug).
  if (
    lower.includes("animation-play-state: paused") ||
    lower.includes("animation-play-state:paused")
  ) {
    if (!lower.includes("<script")) return false;
  }
  return true;
}
