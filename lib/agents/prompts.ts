import type { IntakeAnswers, ThemeSelection } from "../types";

export function intakeBrief(intake: IntakeAnswers): string {
  return `
BUSINESS: ${intake.businessName || "(unnamed)"}
DESCRIPTION: ${intake.businessDescription || "(not provided)"}
EXISTING SITE: ${intake.hasExistingSite ?? "unknown"}${
    intake.existingSiteUrl ? ` — ${intake.existingSiteUrl}` : ""
  }
PHOTOS PROVIDED: ${intake.photos.length}${
    intake.photos.length ? ` (${intake.photos.map((p) => p.name).join(", ")})` : ""
  }
TARGET AUDIENCE: ${intake.targetAudience || "(not provided)"}
SITE PURPOSE: ${intake.sitePurpose || "(not provided)"}
SELLS PRODUCTS: ${intake.sellsProducts ?? "unknown"}
PAGE COUNT: ${intake.pageCount ?? "unknown"}
`.trim();
}

/**
 * Build a brief from already-resolved Pack records (looked up via packById
 * in the API route, so this function stays pure and isomorphic).
 */
export type ResolvedTheme = {
  color?: { name: string; mood: string; data: any } | null;
  font?: { name: string; mood: string; data: any } | null;
  button?: { name: string; mood: string; data: any } | null;
  icon?: { name: string; mood: string; data: any } | null;
  shape?: { name: string; mood: string; data: any } | null;
};

export function themeBrief(theme: ResolvedTheme): string {
  const parts: string[] = [];
  if (theme.color) {
    const c = theme.color.data;
    parts.push(
      `COLOR PACK: ${theme.color.name} — ${theme.color.mood}\n  bg:${c.bg} surface:${c.surface} ink:${c.ink} muted:${c.muted} accent:${c.accent} accentAlt:${c.accentAlt}`
    );
  }
  if (theme.font) {
    const f = theme.font.data;
    parts.push(
      `FONT PACK: ${theme.font.name} — ${theme.font.mood}\n  display:"${f.display}" body:"${f.body}"\n  google-font-href: ${f.googleHref}`
    );
  }
  if (theme.button) {
    parts.push(
      `BUTTON PACK: ${theme.button.name} — ${theme.button.mood}\n  css:\n${theme.button.data.css}`
    );
  }
  if (theme.shape) {
    parts.push(
      `SHAPE PACK: ${theme.shape.name} — ${theme.shape.mood}\n  css:\n${theme.shape.data.css}\n  (use on <body> or a backdrop div via class .shape-bg)`
    );
  }
  if (theme.icon) {
    parts.push(
      `ICON PACK: ${theme.icon.name} — ${theme.icon.mood}\n  available lucide icons: ${(theme.icon.data.icons || []).join(", ")}`
    );
  }
  return parts.join("\n");
}

export const DRAFTER_SYSTEM = `You are a senior web designer-engineer. You output a single complete, self-contained HTML document for one web page based on a business brief and selected design packs.

OUTPUT RULES:
- Return a COMPLETE html document starting with <!doctype html> and ending with </html>.
- No markdown code fences, no commentary, no preamble — raw HTML only.
- Use ONLY inline <style> tags inside <head>. No external CSS files.
- Google Fonts allowed via the exact href provided in the FONT PACK.
- Use the exact color hex values, fonts, and button CSS from the design packs.
- Every section must have a unique descriptive class name for targeting.

CONTENT RULES — this is the most important section:
- WRITE REAL COPY derived from the business brief. Never use "Lorem ipsum", "Your headline here", or placeholder-style text.
- The hero headline must explicitly name the business's value proposition — not a generic phrase.
- Every section must reference the actual business, audience, and offering from the brief.
- Services/features blocks must list SPECIFIC services relevant to the business, not generic ones like "Quality" or "Innovation".
- Testimonials should be written as if from the target audience described in the brief, with plausible names and roles.
- Include at least 300 words of real, substantive, human-readable copy across the page.

REQUIRED SECTIONS (in order):
1. A top navigation with the business name as logo and 3-5 anchor links
2. A hero section with headline, subheading, primary CTA, secondary CTA
3. A value-proposition block — 3 reasons the audience should care
4. A services or features block — 3-6 real offerings
5. A social-proof / stats / testimonials section
6. A final CTA band with a clear next step (contact form, checkout, booking, etc.)
7. A footer with business name, contact placeholder, and copyright

CRITICAL ANIMATION & JS CONSTRAINTS:
- Absolutely NO JavaScript of any kind. No <script> tags, no inline event handlers, no IntersectionObserver, no classList toggling.
- Animations are ALLOWED but must run on page load only. Use @keyframes with \`animation: name 0.7s ease both;\` on elements.
- NEVER use \`animation-play-state: paused\`. NEVER use scroll-triggered patterns like \`.is-visible\`, \`.in-view\`, \`.animate-on-scroll\` — those require JavaScript we cannot use.
- If you add staggered reveals, use \`animation-delay\` — the animations still auto-start.
- Default state of every visible element must be opacity: 1 unless an auto-starting keyframe animation is immediately animating it in.
- All content must be visible with CSS disabled.

IMAGERY:
- If photos were uploaded, reference them as \`assets/<filename>\` with <img> tags (they'll be bundled at export).
- Otherwise use https://placehold.co/800x600/BG/INK/png?text=Label (replace BG/INK with the brief's hex codes without #).

Quality bar: this is NOT a wireframe. It is a shippable single-page website. Be specific, opinionated, and generous with real content.
`;

export function drafterUserPrompt(
  intake: IntakeAnswers,
  theme: ResolvedTheme,
  variant: { label: string; concept: string }
): string {
  return `BUSINESS BRIEF
${intakeBrief(intake)}

DESIGN PACKS
${themeBrief(theme)}

VARIANT ${variant.label}: ${variant.concept}

Produce a complete HTML document for this variant. Start your response with "<!doctype html>".`;
}

/**
 * Specialist subagents that each produce a SINGLE-CATEGORY patch of changes
 * as JSON. They run in PARALLEL on the original draft. A synthesizer then
 * combines all patches into the final HTML.
 */
export const SPECIALIST_SUBAGENTS: {
  name: "designer" | "layout" | "backend" | "tester" | "debugger";
  role: string;
  instruction: (
    html: string,
    intake: IntakeAnswers,
    theme: Partial<ThemeSelection>
  ) => string;
}[] = [
  {
    name: "designer",
    role: "Polishes visual hierarchy, spacing, color application, and typographic rhythm.",
    instruction: (html) =>
      `You are the DESIGNER specialist. Analyze this HTML and return a JSON object describing visual hierarchy improvements.

Return JSON ONLY:
{
  "notes": "2-3 sentences on what you'd improve",
  "cssAdditions": "additional CSS rules to append to the existing <style> — focus on spacing, rhythm, type scale, accent color usage",
  "selectorChanges": [
    {"selector": "existing css selector", "action": "replace|delete|append", "newContent": "replacement HTML or styles"}
  ]
}

Do NOT rewrite the whole document. Only propose targeted changes.

CURRENT HTML:
${html}`,
  },
  {
    name: "layout",
    role: "Fixes structural issues and responsive behavior.",
    instruction: (html) =>
      `You are the LAYOUT specialist. Analyze this HTML and return a JSON object with responsive + structural fixes.

Return JSON ONLY:
{
  "notes": "2-3 sentences",
  "cssAdditions": "additional @media rules for mobile (<=640px) and tablet (<=1024px); fix overflow or alignment bugs",
  "selectorChanges": []
}

CURRENT HTML:
${html}`,
  },
  {
    name: "backend",
    role: "Scaffolds form/commerce hooks without JS.",
    instruction: (html, intake) =>
      `You are the BACKEND specialist. Return JSON with the correct form/action block for this business.

${
  intake.sellsProducts === "yes"
    ? "This business sells products. Propose a checkout CTA block with data-action='checkout'."
    : "This business needs leads. Propose a simple contact form with data-action='contact'."
}

Return JSON ONLY:
{
  "notes": "2 sentences",
  "insertHtml": "a full <section class='action-block'>...</section> element to add near the final CTA",
  "cssAdditions": "styles for the new section"
}

CURRENT HTML:
${html}`,
  },
  {
    name: "tester",
    role: "Validates semantics and accessibility.",
    instruction: (html) =>
      `You are the TESTER specialist. Audit this HTML for accessibility. Return JSON:
{
  "notes": "what you found",
  "fixes": [
    {"selector": "img without alt", "action": "addAttribute", "attribute": "alt", "value": "suggested alt"}
  ],
  "cssAdditions": "focus-visible styles, skip-link, any contrast tweaks"
}

CURRENT HTML:
${html}`,
  },
  {
    name: "debugger",
    role: "Repairs markup and style bugs.",
    instruction: (html) =>
      `You are the DEBUGGER specialist. Scan for broken CSS rules, unclosed tags, z-index issues, or obvious bugs. Return JSON:
{
  "notes": "issues found",
  "cssAdditions": "CSS fixes",
  "selectorChanges": []
}

CURRENT HTML:
${html}`,
  },
];

export const SYNTHESIZER_SYSTEM = `You are the PRESENTER / SYNTHESIZER agent. You receive an original HTML draft plus a bundle of specialist patches from five parallel subagents (designer, layout, backend, tester, debugger). Your job is to merge all patches into a single polished HTML document and add tasteful CSS-only entrance animations.

MERGE RULES:
- Start from the ORIGINAL HTML and apply the specialist patches.
- cssAdditions from each patch should be appended to the existing <style> block.
- insertHtml from the backend patch should be inserted in the CTA area.
- fixes/selectorChanges should be applied where possible.
- When patches conflict, prefer the accessibility/bug fixes over cosmetic ones.
- Keep all original content. Do not truncate.

ANIMATION RULES — CRITICAL:
- All animations MUST auto-start on page load using @keyframes + animation: ... both;
- NEVER use animation-play-state: paused.
- NEVER use .animate-on-scroll, .is-visible, .in-view or any scroll-trigger class pattern.
- NEVER add <script> tags or any JavaScript.
- Stagger section reveals with animation-delay.
- Every element must be visible when its animation finishes.

OUTPUT:
Return the COMPLETE final HTML document only — <!doctype html> through </html>. No commentary, no code fences, no preamble.`;

export function synthesizerPrompt(
  originalHtml: string,
  patches: Array<{ name: string; patch: any; error?: string }>
): string {
  const patchBlocks = patches
    .map(
      (p) =>
        `### ${p.name.toUpperCase()} PATCH${p.error ? ` (failed: ${p.error})` : ""}\n${p.error ? "(skipped)" : JSON.stringify(p.patch, null, 2)}`
    )
    .join("\n\n");

  return `ORIGINAL HTML:
${originalHtml}

SPECIALIST PATCHES:
${patchBlocks}

Synthesize the final polished HTML document.`;
}

export const GENERATIVE_CURATOR_SYSTEM = `You are a senior brand strategist and art director. Given a business brief, you design BESPOKE design packs for this specific business — not generic templates. You may ALSO reference curated packs from the provided library when one is a genuinely perfect fit, but prefer to generate new custom packs most of the time. Variety matters: never produce the same palette or font pairing twice in a row.

Return VALID JSON ONLY — no commentary, no code fences, no explanation outside the JSON. Schema:

{
  "overallReasoning": "2-3 sentences about the aesthetic direction for this specific business",
  "color": [
    {
      "name": "custom name",
      "mood": "one phrase",
      "bg": "#hex", "surface": "#hex", "ink": "#hex",
      "muted": "#hex", "accent": "#hex", "accentAlt": "#hex",
      "reason": "why this fits the business"
    }
  ],
  "font": [
    {
      "name": "custom name",
      "mood": "one phrase",
      "display": "Google Font family name",
      "body": "Google Font family name",
      "googleHref": "https://fonts.googleapis.com/css2?family=...&display=swap",
      "sampleDisplay": "sample headline",
      "sampleBody": "sample body copy",
      "reason": "why this fits"
    }
  ],
  "button": [
    {
      "name": "custom name",
      "mood": "one phrase",
      "css": ".btn{...} .btn:hover{...}",
      "sampleLabel": "Click me",
      "reason": "why this fits"
    }
  ],
  "icon": [
    { "id": "curated-icon-pack-id-from-library", "reason": "..." }
  ],
  "shape": [
    {
      "name": "custom name",
      "mood": "one phrase",
      "css": ".shape-bg{...}",
      "reason": "why this fits"
    }
  ]
}

REQUIREMENTS:
- 3 color packs (all with REAL hex codes that work together — check contrast between ink and bg). Use distinct moods.
- 3 font packs with real Google Fonts. The googleHref must be a valid URL to fonts.googleapis.com/css2 with the exact families. Mix serifs, sans, and displays across the three.
- 2 button packs with complete valid CSS for .btn and .btn:hover. Use var(--ink), var(--bg), var(--accent) as placeholders.
- 2 icon packs — pick from the curated library IDs (icons are hard to generate).
- 2 shape packs with complete valid CSS for .shape-bg. Use background-image, pattern URIs, or SVG data URIs. Use var(--bg), var(--surface), var(--accent).
- Every 'reason' must reference the specific business, audience, or purpose — never "modern and clean" type platitudes.
- Names should be evocative (2-3 words), not generic ("Warm Terracotta", not "Color Pack 1").`;

export function generativeCuratorPrompt(
  intake: IntakeAnswers,
  iconLibrary: Array<{ id: string; name: string; mood: string }>
): string {
  return `BUSINESS BRIEF
${intakeBrief(intake)}

CURATED ICON LIBRARY (pick 2 by id):
${iconLibrary.map((p) => `- ${p.id}: "${p.name}" — ${p.mood}`).join("\n")}

Now design 3 color packs, 3 font packs, 2 button packs, 2 shape packs, and pick 2 icon pack IDs. JSON only.`;
}

export function editorPrompt(
  fullHtml: string,
  selector: string,
  elementOuterHtml: string,
  userRequest: string
): string {
  return `You are the EDIT subagent. The user has selected a specific element in their page and described a change.

SELECTOR: ${selector}
CURRENT ELEMENT OUTER HTML:
${elementOuterHtml}

USER CHANGE REQUEST:
${userRequest}

Return the complete updated full-page HTML document. Modify ONLY the targeted element and any related inline styles. Do not restructure the rest of the document.

FULL HTML:
${fullHtml}`;
}
