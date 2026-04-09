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

RULES:
- Return a COMPLETE html document starting with <!doctype html> and ending with </html>.
- Use ONLY inline <style> tags inside <head>. No external CSS files.
- Google Fonts are allowed via the exact href provided in the FONT PACK.
- Use the exact color hex values, fonts, and button CSS from the design packs.
- The button CSS may define ".btn" — use that class on buttons.
- Layout should be editorial, considered, and reflect the business brief.
- Include: hero, one value-prop section, a features/services block, a proof section (testimonial/stats), a CTA band, and a footer.
- No external JS. No frameworks. Pure HTML + inline CSS.
- Use <img> with placeholder URLs https://placehold.co/800x600/{bg-hex}/{ink-hex}/png?text=... only when photos were not provided.
- Every section must have a unique class name for targeting.
- Do NOT include commentary — output the raw HTML only.
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
      `You are the PRESENTER subagent. Add tasteful CSS-only entrance animations (fade + slide-up with keyframes) to hero and sections, ensure the final document is polished and ready to publish. Return the complete updated HTML only.

CURRENT HTML:
${html}`,
  },
];

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
