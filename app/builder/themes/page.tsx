"use client";

import { useProject } from "@/lib/store";
import {
  BUTTON_PACKS,
  COLOR_PACKS,
  FONT_PACKS,
  ICON_PACKS,
} from "@/lib/theme-packs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as Lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { ThemeRecommendation } from "@/lib/types";

export default function ThemesPage() {
  const { state, hydrated, update, patchTheme } = useProject();
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [curating, setCurating] = useState(false);
  const [curateError, setCurateError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.themeRecommendation && !curating) {
      void curate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function curate() {
    setCurating(true);
    setCurateError(null);
    try {
      const res = await fetch("/api/agent/curate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          intake: state.intake,
          sessionId: state.sessionId,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        recommendation: ThemeRecommendation;
      };
      update({ themeRecommendation: data.recommendation });

      // Auto-select the top recommendation in each category as the default
      patchTheme({
        colorPackId:
          state.theme.colorPackId || data.recommendation.color[0]?.id,
        fontPackId: state.theme.fontPackId || data.recommendation.font[0]?.id,
        buttonPackId:
          state.theme.buttonPackId || data.recommendation.button[0]?.id,
        iconPackId: state.theme.iconPackId || data.recommendation.icon[0]?.id,
      });
    } catch (err: any) {
      setCurateError(err?.message || "curation failed");
    } finally {
      setCurating(false);
    }
  }

  const rec = state.themeRecommendation;

  // Recommended-first ordering
  const orderedColors = useMemo(() => {
    if (!rec || showAll) return COLOR_PACKS;
    const ids = new Set(rec.color.map((c) => c.id));
    return COLOR_PACKS.filter((p) => ids.has(p.id));
  }, [rec, showAll]);

  const orderedFonts = useMemo(() => {
    if (!rec || showAll) return FONT_PACKS;
    const ids = new Set(rec.font.map((c) => c.id));
    return FONT_PACKS.filter((p) => ids.has(p.id));
  }, [rec, showAll]);

  const orderedButtons = useMemo(() => {
    if (!rec || showAll) return BUTTON_PACKS;
    const ids = new Set(rec.button.map((c) => c.id));
    return BUTTON_PACKS.filter((p) => ids.has(p.id));
  }, [rec, showAll]);

  const orderedIcons = useMemo(() => {
    if (!rec || showAll) return ICON_PACKS;
    const ids = new Set(rec.icon.map((c) => c.id));
    return ICON_PACKS.filter((p) => ids.has(p.id));
  }, [rec, showAll]);

  if (!hydrated) return null;

  const { theme } = state;
  const ready =
    theme.colorPackId && theme.fontPackId && theme.buttonPackId && theme.iconPackId;

  const reasonFor = (
    list: Array<{ id: string; reason: string }> | undefined,
    id: string
  ) => list?.find((r) => r.id === id)?.reason;

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
          {curating ? (
            <>
              Reading your
              <span className="italic"> brief</span>
              <span style={{ color: "var(--violet)" }}>…</span>
            </>
          ) : (
            <>
              Picked for
              <span className="italic"> {state.intake.businessName || "you"}</span>
              <span style={{ color: "var(--violet)" }}>.</span>
            </>
          )}
        </h2>

        {curating && (
          <div className="my-10 flex items-center gap-4">
            <div className="shimmer h-[2px] w-60" />
            <p className="mono-label">▸ curating design packs from your answers</p>
          </div>
        )}

        {curateError && (
          <div
            className="my-8 p-5 border-l-2 text-sm"
            style={{
              borderColor: "var(--danger)",
              background: "rgba(255, 91, 91, 0.05)",
            }}
          >
            <p className="mono-label mb-2" style={{ color: "var(--danger)" }}>
              ▸ curation error
            </p>
            <p>{curateError}</p>
            <button className="btn-ghost mt-3" onClick={curate}>
              retry
            </button>
          </div>
        )}

        {rec && !curating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 border-l-2 pl-5 py-2"
            style={{ borderColor: "var(--violet)" }}
          >
            <p className="mono-label mb-2">※ art director's note</p>
            <p
              className="font-display italic text-xl leading-snug opacity-90"
              style={{ fontWeight: 300, maxWidth: "62ch" }}
            >
              {rec.overallReasoning}
            </p>
          </motion.div>
        )}

        {rec && (
          <div className="flex items-center gap-4 mb-8">
            <button
              className="btn-outline"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "show only recommended" : "show all packs"}
            </button>
            <button className="btn-ghost" onClick={curate}>
              re-curate
            </button>
          </div>
        )}

        {/* Color packs */}
        <PackSection title="01 · color" total={orderedColors.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderedColors.map((p) => {
              const reason = reasonFor(rec?.color, p.id);
              return (
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
                    {reason && !showAll && (
                      <p
                        className="mono-label"
                        style={{ color: "var(--violet)" }}
                      >
                        ★ picked
                      </p>
                    )}
                  </div>
                  <p className="text-xs opacity-60 mb-5">
                    {reason || p.mood}
                  </p>
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
              );
            })}
          </div>
        </PackSection>

        {/* Font packs */}
        <PackSection title="02 · typography" total={orderedFonts.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderedFonts.map((p) => {
              const reason = reasonFor(rec?.font, p.id);
              return (
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
                    {reason && !showAll && (
                      <p
                        className="mono-label"
                        style={{ color: "var(--violet)" }}
                      >
                        ★ picked
                      </p>
                    )}
                  </div>
                  <p className="text-xs opacity-60 mb-5">{reason || p.mood}</p>
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
              );
            })}
          </div>
        </PackSection>

        {/* Button packs */}
        <PackSection title="03 · buttons" total={orderedButtons.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orderedButtons.map((p) => {
              const reason = reasonFor(rec?.button, p.id);
              return (
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
                    {reason && !showAll && (
                      <p
                        className="mono-label"
                        style={{ color: "var(--violet)" }}
                      >
                        ★ picked
                      </p>
                    )}
                  </div>
                  <p className="text-xs opacity-60 mb-6">{reason || p.mood}</p>
                  <ButtonPreview pack={p} />
                </button>
              );
            })}
          </div>
        </PackSection>

        {/* Icon packs */}
        <PackSection title="04 · iconography" total={orderedIcons.length}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orderedIcons.map((p) => {
              const reason = reasonFor(rec?.icon, p.id);
              return (
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
                    {reason && !showAll && (
                      <p
                        className="mono-label"
                        style={{ color: "var(--violet)" }}
                      >
                        ★ picked
                      </p>
                    )}
                  </div>
                  <p className="text-xs opacity-60 mb-6">{reason || p.mood}</p>
                  <div className="grid grid-cols-6 gap-3 items-center">
                    {p.icons.map((name) => {
                      const Icon = (
                        Lucide as unknown as Record<string, LucideIcon>
                      )[name];
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
              );
            })}
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
  return (
    <div
      className="p-6 bg-[var(--ink-950)] border border-[var(--ink-700)] flex items-center justify-center"
      style={
        {
          "--ink": "#f6f4ee",
          "--bg": "#08080e",
          "--accent": "#7c5cff",
          "--body": "Instrument Sans, sans-serif",
        } as React.CSSProperties
      }
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
