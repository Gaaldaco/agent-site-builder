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
  if (fenceMatch) return fenceMatch[1].trim();

  const doctypeIdx = raw.toLowerCase().indexOf("<!doctype");
  if (doctypeIdx >= 0) return raw.slice(doctypeIdx).trim();

  const htmlIdx = raw.toLowerCase().indexOf("<html");
  if (htmlIdx >= 0) return raw.slice(htmlIdx).trim();

  return raw.trim();
}
