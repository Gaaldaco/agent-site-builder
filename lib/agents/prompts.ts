import type { IntakeAnswers, ThemeSelection } from "../types";
import {
  BUTTON_PACKS,
  COLOR_PACKS,
  FONT_PACKS,
  ICON_PACKS,
} from "../theme-packs";

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

export function themeBrief(theme: Partial<ThemeSelection>): string {
  const color = COLOR_PACKS.find((p) => p.id === theme.colorPackId);
  const font = FONT_PACKS.find((p) => p.id === theme.fontPackId);
  const button = BUTTON_PACKS.find((p) => p.id === theme.buttonPackId);
  const icon = ICON_PACKS.find((p) => p.id === theme.iconPackId);

  return `
COLOR PACK: ${color?.name} — ${color?.mood}
  bg:${color?.colors.bg} surface:${color?.colors.surface} ink:${color?.colors.ink} muted:${color?.colors.muted} accent:${color?.colors.accent} accentAlt:${color?.colors.accentAlt}
FONT PACK: ${font?.name} — ${font?.mood}
  display:"${font?.display}" body:"${font?.body}"
  google-font-href: ${font?.googleHref}
BUTTON PACK: ${button?.name} — ${button?.mood}
  css:
${button?.css}
ICON PACK: ${icon?.name} — ${icon?.mood}
  available lucide icons: ${icon?.icons.join(", ")}
`.trim();
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
  theme: Partial<ThemeSelection>,
  variant: { label: string; concept: string }
): string {
  return `BUSINESS BRIEF
${intakeBrief(intake)}

DESIGN PACKS
${themeBrief(theme)}

VARIANT ${variant.label}: ${variant.concept}

Produce a complete HTML document for this variant. Start your response with "<!doctype html>".`;
}

export const SUBAGENT_DEFINITIONS: {
  name: string;
  role: string;
  instruction: (html: string, intake: IntakeAnswers, theme: Partial<ThemeSelection>) => string;
}[] = [
  {
    name: "designer",
    role: "Polishes visual hierarchy, spacing, color application, and typographic rhythm.",
    instruction: (html) =>
      `You are the DESIGNER subagent. Refine the visual hierarchy of this HTML: spacing, typographic rhythm, color application. Do NOT restructure the document. Return the complete updated HTML only.

CURRENT HTML:
${html}`,
  },
  {
    name: "layout",
    role: "Fixes structural issues and responsive behavior.",
    instruction: (html) =>
      `You are the LAYOUT subagent. Add responsive @media rules (mobile at 640px), fix any structural issues, and ensure nothing overflows. Return the complete updated HTML only.

CURRENT HTML:
${html}`,
  },
  {
    name: "backend",
    role: "Scaffolds API placeholders or commerce hooks if needed.",
    instruction: (html, intake) =>
      `You are the BACKEND subagent. ${
        intake.sellsProducts === "yes"
          ? "Add a clear checkout/buy CTA block with data-action hooks (data-action='checkout') for future wiring."
          : "Add a simple contact form with data-action='contact' to the CTA section."
      } Do not add JS. Return the complete updated HTML only.

CURRENT HTML:
${html}`,
  },
  {
    name: "tester",
    role: "Validates semantics and accessibility.",
    instruction: (html) =>
      `You are the TESTER subagent. Check the HTML for accessibility issues: missing alt attributes, improper heading order, contrast concerns, missing aria labels. Fix what you find. Return the complete updated HTML only.

CURRENT HTML:
${html}`,
  },
  {
    name: "debugger",
    role: "Repairs markup and style bugs.",
    instruction: (html) =>
      `You are the DEBUGGER subagent. Find any unclosed tags, broken CSS rules, or obvious bugs and fix them. Return the complete updated HTML only.

CURRENT HTML:
${html}`,
  },
  {
    name: "presenter",
    role: "Final polish pass + adds subtle entrance animations.",
    instruction: (html) =>
      `You are the PRESENTER subagent. Add tasteful CSS-only entrance animations (fade + slide-up with keyframes) to the hero and major sections, ensure the final document is polished and ready to publish.

CRITICAL: All animations MUST auto-start on page load. You are forbidden from using:
- animation-play-state: paused (breaks the page — there is no JS to unpause)
- class names like .animate-on-scroll, .is-visible, .in-view (same reason)
- IntersectionObserver, script tags, or any JavaScript at all
- data-aos, data-scroll, or any attributes expecting JS

Use only: @keyframes + animation: ... both; + animation-delay for staggering. Every element must be visible by the time its animation finishes. Audit the current HTML: if you find any animation-play-state:paused or scroll-trigger class, REMOVE the pause and remove the class so the animation runs on load.

Return the complete updated HTML only.

CURRENT HTML:
${html}`,
  },
];

export const CURATOR_SYSTEM = `You are a senior brand strategist and art director. Given a business brief and a curated library of design packs, recommend the 3 best color packs, 3 best font packs, 2 best button packs, and 2 best icon packs for this specific business.

You must return VALID JSON only — no commentary, no code fences, no explanation outside the JSON.

Schema:
{
  "color": [{"id": "pack-id", "reason": "one concrete sentence explaining the fit"}],
  "font": [{"id": "pack-id", "reason": "one concrete sentence explaining the fit"}],
  "button": [{"id": "pack-id", "reason": "one concrete sentence explaining the fit"}],
  "icon": [{"id": "pack-id", "reason": "one concrete sentence explaining the fit"}],
  "overallReasoning": "2-3 sentences explaining the overall aesthetic direction and why it fits the business, audience, and purpose"
}

Return recommendations in ranked order (best first). Use only pack IDs from the library provided. Reasoning must reference the business, audience, or purpose — not generic platitudes.`;

export function curatorUserPrompt(intake: IntakeAnswers): string {
  return `BUSINESS BRIEF
${intakeBrief(intake)}

AVAILABLE COLOR PACKS
${COLOR_PACKS.map((p) => `- ${p.id}: "${p.name}" — ${p.mood}. bg:${p.colors.bg}, accent:${p.colors.accent}`).join("\n")}

AVAILABLE FONT PACKS
${FONT_PACKS.map((p) => `- ${p.id}: "${p.name}" — ${p.mood}. display:${p.display}, body:${p.body}`).join("\n")}

AVAILABLE BUTTON PACKS
${BUTTON_PACKS.map((p) => `- ${p.id}: "${p.name}" — ${p.mood}`).join("\n")}

AVAILABLE ICON PACKS
${ICON_PACKS.map((p) => `- ${p.id}: "${p.name}" — ${p.mood}`).join("\n")}

Recommend 3 color packs, 3 font packs, 2 button packs, and 2 icon packs. JSON only.`;
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
