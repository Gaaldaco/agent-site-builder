"use client";

import { useProject } from "@/lib/store";
import {
  BUTTON_PACKS,
  COLOR_PACKS,
  FONT_PACKS,
  ICON_PACKS,
} from "@/lib/theme-packs";
import { useRouter } from "next/navigation";
import * as Lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function ThemesPage() {
  const { state, hydrated, patchTheme } = useProject();
  const router = useRouter();

  if (!hydrated) return null;

  const { theme } = state;
  const ready =
    theme.colorPackId && theme.fontPackId && theme.buttonPackId && theme.iconPackId;

  return (
    <section className="relative min-h-[calc(100vh-80px)] px-10 py-16">
      <div
        className="absolute -left-8 top-6 chapter-numeral pointer-events-none select-none"
        aria-hidden
      >
        02
      </div>

      <div className="relative z-10 max-w-6xl ml-auto mr-[6vw]">
        <p className="mono-label-lg mb-6">▸ chapter 02 / design packs</p>
        <h2
          className="font-display leading-[0.95] mb-6"
          style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}
        >
          Pick the
          <span className="italic"> atmosphere</span>
          <span style={{ color: "var(--violet)" }}>.</span>
        </h2>
        <p
          className="opacity-70 text-base mb-12 font-display italic"
          style={{ maxWidth: "62ch" }}
        >
          Four decisions, four dimensions. You&apos;re not locked in — the
          agents will interpret these as directions, not constraints.
        </p>

        {/* Color packs */}
        <PackSection title="01 · color" total={COLOR_PACKS.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLOR_PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => patchTheme({ colorPackId: p.id })}
                className={`card-rect text-left ${
                  theme.colorPackId === p.id ? "is-selected" : ""
                }`}
              >
                <div className="flex items-baseline justify-between mb-4">
                  <p className="font-display text-2xl" style={{ fontWeight: 400 }}>
                    {p.name}
                  </p>
                  <p className="mono-label">{p.id.slice(0, 8)}</p>
                </div>
                <p className="text-xs opacity-60 mb-5">{p.mood}</p>
                <div
                  className="h-24 grid grid-cols-6 gap-0"
                  style={{ borderTop: "1px solid var(--ink-700)" }}
                >
                  {[
                    p.colors.bg,
                    p.colors.surface,
                    p.colors.ink,
                    p.colors.muted,
                    p.colors.accent,
                    p.colors.accentAlt,
                  ].map((c, i) => (
                    <div key={i} style={{ background: c }} />
                  ))}
                </div>
                <div
                  className="mt-5 p-4 border"
                  style={{
                    background: p.colors.bg,
                    color: p.colors.ink,
                    borderColor: "var(--ink-700)",
                  }}
                >
                  <p
                    className="text-2xl mb-1 font-display"
                    style={{ fontWeight: 400 }}
                  >
                    Sample copy.
                  </p>
                  <p className="text-xs" style={{ color: p.colors.muted }}>
                    Supporting line lorem ipsum.
                  </p>
                </div>
              </button>
            ))}
          </div>
        </PackSection>

        {/* Font packs */}
        <PackSection title="02 · typography" total={FONT_PACKS.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FONT_PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => patchTheme({ fontPackId: p.id })}
                className={`card-rect text-left ${
                  theme.fontPackId === p.id ? "is-selected" : ""
                }`}
              >
                <link rel="stylesheet" href={p.googleHref} />
                <div className="flex items-baseline justify-between mb-4">
                  <p className="font-display text-2xl" style={{ fontWeight: 400 }}>
                    {p.name}
                  </p>
                  <p className="mono-label">{p.display.slice(0, 10)}</p>
                </div>
                <p className="text-xs opacity-60 mb-5">{p.mood}</p>
                <p
                  className="text-3xl leading-tight mb-2"
                  style={{ fontFamily: `"${p.display}", serif` }}
                >
                  {p.sampleDisplay}
                </p>
                <p
                  className="text-sm opacity-80"
                  style={{ fontFamily: `"${p.body}", sans-serif` }}
                >
                  {p.sampleBody}
                </p>
                <div className="mt-5 flex gap-3 text-[10px] font-mono opacity-50">
                  <span>▸ {p.display}</span>
                  <span>+</span>
                  <span>{p.body}</span>
                </div>
              </button>
            ))}
          </div>
        </PackSection>

        {/* Button packs */}
        <PackSection title="03 · buttons" total={BUTTON_PACKS.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUTTON_PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => patchTheme({ buttonPackId: p.id })}
                className={`card-rect text-left ${
                  theme.buttonPackId === p.id ? "is-selected" : ""
                }`}
              >
                <div className="flex items-baseline justify-between mb-4">
                  <p className="font-display text-2xl" style={{ fontWeight: 400 }}>
                    {p.name}
                  </p>
                  <p className="mono-label">button style</p>
                </div>
                <p className="text-xs opacity-60 mb-6">{p.mood}</p>
                <ButtonPreview pack={p} />
              </button>
            ))}
          </div>
        </PackSection>

        {/* Icon packs */}
        <PackSection title="04 · iconography" total={ICON_PACKS.length}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ICON_PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => patchTheme({ iconPackId: p.id })}
                className={`card-rect text-left ${
                  theme.iconPackId === p.id ? "is-selected" : ""
                }`}
              >
                <div className="flex items-baseline justify-between mb-4">
                  <p className="font-display text-2xl" style={{ fontWeight: 400 }}>
                    {p.name}
                  </p>
                  <p className="mono-label">{p.icons.length} glyphs</p>
                </div>
                <p className="text-xs opacity-60 mb-6">{p.mood}</p>
                <div className="grid grid-cols-6 gap-3 items-center">
                  {p.icons.map((name) => {
                    const Icon = (Lucide as unknown as Record<string, LucideIcon>)[
                      name
                    ];
                    return Icon ? (
                      <Icon
                        key={name}
                        size={22}
                        strokeWidth={1.4}
                        className="opacity-90"
                      />
                    ) : null;
                  })}
                </div>
              </button>
            ))}
          </div>
        </PackSection>

        <div className="flex items-center gap-6 mt-16 pt-10 border-t border-[var(--ink-700)]">
          <button
            className="btn-ghost"
            onClick={() => router.push("/builder/intake")}
          >
            ◂ back to intake
          </button>
          <button
            className="btn-primary"
            disabled={!ready}
            onClick={() => router.push("/builder/drafts")}
          >
            generate {ready ? "four drafts" : "drafts"} ▸
          </button>
          {!ready && (
            <span className="mono-label opacity-50">
              select all four dimensions to continue
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function PackSection({
  title,
  total,
  children,
}: {
  title: string;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-16">
      <div className="flex items-baseline justify-between mb-6 border-t border-[var(--ink-700)] pt-6">
        <p className="mono-label-lg">§ {title}</p>
        <p className="mono-label">{total} packs</p>
      </div>
      {children}
    </div>
  );
}

function ButtonPreview({ pack }: { pack: (typeof BUTTON_PACKS)[number] }) {
  // Inject the preview CSS scoped inside a shadow-esque iframe-free sandbox via inline style
  return (
    <div
      className="p-6 bg-[var(--ink-950)] border border-[var(--ink-700)] flex items-center justify-center"
      style={{
        // Define CSS vars for the preview
        // @ts-ignore - custom property
        "--ink": "#f6f4ee",
        // @ts-ignore
        "--bg": "#08080e",
        // @ts-ignore
        "--accent": "#7c5cff",
        // @ts-ignore
        "--body": "Instrument Sans, sans-serif",
      } as React.CSSProperties}
    >
      <style>{`.pack-${pack.id} ${pack.css.replace(/\.btn/g, ".btn-" + pack.id)}`}</style>
      <div className={`pack-${pack.id}`}>
        <button
          className={`btn-${pack.id}`}
          type="button"
          onClick={(e) => e.preventDefault()}
        >
          {pack.sampleLabel}
        </button>
      </div>
    </div>
  );
}
