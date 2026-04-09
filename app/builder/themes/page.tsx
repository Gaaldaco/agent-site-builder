"use client";

import { useProject } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as Lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Pack, PackKind, ThemeRecommendation } from "@/lib/types";

type PacksByKind = Record<PackKind, Pack[]>;

export default function ThemesPage() {
  const { state, hydrated, update, patchTheme } = useProject();
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [curating, setCurating] = useState(false);
  const [curateError, setCurateError] = useState<string | null>(null);
  const [packs, setPacks] = useState<PacksByKind | null>(null);

  const loadPacks = useCallback(async () => {
    try {
      const url = state.sessionId
        ? `/api/packs?sessionId=${encodeURIComponent(state.sessionId)}`
        : "/api/packs";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as PacksByKind;
      setPacks(data);
    } catch {
      // non-fatal
    }
  }, [state.sessionId]);

  useEffect(() => {
    if (!hydrated) return;
    void loadPacks();
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

      // reload packs so newly-generated ones appear
      await loadPacks();

      // auto-select top recommendation in each category
      patchTheme({
        colorPackId:
          state.theme.colorPackId || data.recommendation.color[0]?.id,
        fontPackId: state.theme.fontPackId || data.recommendation.font[0]?.id,
        buttonPackId:
          state.theme.buttonPackId || data.recommendation.button[0]?.id,
        iconPackId: state.theme.iconPackId || data.recommendation.icon[0]?.id,
        shapePackId:
          state.theme.shapePackId || data.recommendation.shape?.[0]?.id,
      });
    } catch (err: any) {
      setCurateError(err?.message || "curation failed");
    } finally {
      setCurating(false);
    }
  }

  const rec = state.themeRecommendation;

  const filterPacks = useCallback(
    (kind: PackKind) => {
      if (!packs) return [] as Pack[];
      const all = packs[kind] || [];
      if (showAll) return all;
      if (!rec) return all;
      const recIds = new Set(
        (rec[kind] || []).map((r: { id: string }) => r.id)
      );
      // Keep recommended first, plus generated ones from this session
      return all.filter((p) => recIds.has(p.id) || p.source === "generated");
    },
    [packs, showAll, rec]
  );

  const orderedColors = useMemo(() => filterPacks("color"), [filterPacks]);
  const orderedFonts = useMemo(() => filterPacks("font"), [filterPacks]);
  const orderedButtons = useMemo(() => filterPacks("button"), [filterPacks]);
  const orderedIcons = useMemo(() => filterPacks("icon"), [filterPacks]);
  const orderedShapes = useMemo(() => filterPacks("shape"), [filterPacks]);

  if (!hydrated) return null;

  const { theme } = state;
  const ready =
    theme.colorPackId &&
    theme.fontPackId &&
    theme.buttonPackId &&
    theme.iconPackId &&
    theme.shapePackId;

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
              Designing for
              <span className="italic"> {state.intake.businessName || "you"}</span>
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
            <p className="mono-label">
              ▸ art director generating bespoke packs from your brief
            </p>
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

        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button
            className="btn-outline"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "show only bespoke + picked" : "show full library"}
          </button>
          <button className="btn-ghost" onClick={curate} disabled={curating}>
            {curating ? "generating…" : "generate new packs"}
          </button>
        </div>

        <PackSection title="01 · color" total={orderedColors.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderedColors.map((p) => (
              <ColorCard
                key={p.id}
                pack={p}
                selected={theme.colorPackId === p.id}
                reason={reasonFor(rec?.color, p.id)}
                onClick={() => patchTheme({ colorPackId: p.id })}
              />
            ))}
          </div>
        </PackSection>

        <PackSection title="02 · typography" total={orderedFonts.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderedFonts.map((p) => (
              <FontCard
                key={p.id}
                pack={p}
                selected={theme.fontPackId === p.id}
                reason={reasonFor(rec?.font, p.id)}
                onClick={() => patchTheme({ fontPackId: p.id })}
              />
            ))}
          </div>
        </PackSection>

        <PackSection title="03 · buttons" total={orderedButtons.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orderedButtons.map((p) => (
              <ButtonCard
                key={p.id}
                pack={p}
                selected={theme.buttonPackId === p.id}
                reason={reasonFor(rec?.button, p.id)}
                onClick={() => patchTheme({ buttonPackId: p.id })}
              />
            ))}
          </div>
        </PackSection>

        <PackSection title="04 · shapes" total={orderedShapes.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderedShapes.map((p) => (
              <ShapeCard
                key={p.id}
                pack={p}
                selected={theme.shapePackId === p.id}
                reason={reasonFor(rec?.shape, p.id)}
                onClick={() => patchTheme({ shapePackId: p.id })}
              />
            ))}
          </div>
        </PackSection>

        <PackSection title="05 · iconography" total={orderedIcons.length}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orderedIcons.map((p) => (
              <IconCard
                key={p.id}
                pack={p}
                selected={theme.iconPackId === p.id}
                reason={reasonFor(rec?.icon, p.id)}
                onClick={() => patchTheme({ iconPackId: p.id })}
              />
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
              select one pack in every dimension to continue
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

function PackHeader({
  pack,
  reason,
}: {
  pack: Pack;
  reason?: string;
}) {
  return (
    <>
      <div className="flex items-baseline justify-between mb-4">
        <p className="font-display text-2xl" style={{ fontWeight: 400 }}>
          {pack.name}
        </p>
        {pack.source === "generated" && (
          <p className="mono-label" style={{ color: "var(--violet)" }}>
            ★ bespoke
          </p>
        )}
      </div>
      <p className="text-xs opacity-60 mb-5">{reason || pack.mood}</p>
    </>
  );
}

function ColorCard({
  pack,
  selected,
  reason,
  onClick,
}: {
  pack: Pack;
  selected: boolean;
  reason?: string;
  onClick: () => void;
}) {
  const c = pack.data;
  return (
    <button
      onClick={onClick}
      className={`card-rect text-left ${selected ? "is-selected" : ""}`}
    >
      <PackHeader pack={pack} reason={reason} />
      <div
        className="h-24 grid grid-cols-6 gap-0"
        style={{ borderTop: "1px solid var(--ink-700)" }}
      >
        {[c.bg, c.surface, c.ink, c.muted, c.accent, c.accentAlt].map(
          (col, i) => (
            <div key={i} style={{ background: col }} />
          )
        )}
      </div>
      <div
        className="mt-5 p-4 border"
        style={{
          background: c.bg,
          color: c.ink,
          borderColor: "var(--ink-700)",
        }}
      >
        <p className="text-2xl mb-1 font-display" style={{ fontWeight: 400 }}>
          Sample copy.
        </p>
        <p className="text-xs" style={{ color: c.muted }}>
          Supporting line lorem ipsum.
        </p>
      </div>
    </button>
  );
}

function FontCard({
  pack,
  selected,
  reason,
  onClick,
}: {
  pack: Pack;
  selected: boolean;
  reason?: string;
  onClick: () => void;
}) {
  const f = pack.data;
  return (
    <button
      onClick={onClick}
      className={`card-rect text-left ${selected ? "is-selected" : ""}`}
    >
      <link rel="stylesheet" href={f.googleHref} />
      <PackHeader pack={pack} reason={reason} />
      <p
        className="text-3xl leading-tight mb-2"
        style={{ fontFamily: `"${f.display}", serif` }}
      >
        {f.sampleDisplay}
      </p>
      <p
        className="text-sm opacity-80"
        style={{ fontFamily: `"${f.body}", sans-serif` }}
      >
        {f.sampleBody}
      </p>
      <div className="mt-5 flex gap-3 text-[10px] font-mono opacity-50">
        <span>▸ {f.display}</span>
        <span>+</span>
        <span>{f.body}</span>
      </div>
    </button>
  );
}

function ButtonCard({
  pack,
  selected,
  reason,
  onClick,
}: {
  pack: Pack;
  selected: boolean;
  reason?: string;
  onClick: () => void;
}) {
  const b = pack.data;
  // Scope the css by rewriting .btn → .btn-<id>
  const safeId = pack.id.replace(/[^a-z0-9]/gi, "");
  const scopedCss = String(b.css || "").replace(/\.btn\b/g, `.btn-${safeId}`);
  return (
    <button
      onClick={onClick}
      className={`card-rect text-left ${selected ? "is-selected" : ""}`}
    >
      <PackHeader pack={pack} reason={reason} />
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
        <style>{scopedCss}</style>
        <button
          className={`btn-${safeId}`}
          type="button"
          onClick={(e) => e.preventDefault()}
        >
          {b.sampleLabel || "Click"}
        </button>
      </div>
    </button>
  );
}

function ShapeCard({
  pack,
  selected,
  reason,
  onClick,
}: {
  pack: Pack;
  selected: boolean;
  reason?: string;
  onClick: () => void;
}) {
  const s = pack.data;
  const safeId = pack.id.replace(/[^a-z0-9]/gi, "");
  const scopedCss = String(s.css || "").replace(
    /\.shape-bg\b/g,
    `.shape-bg-${safeId}`
  );
  return (
    <button
      onClick={onClick}
      className={`card-rect text-left ${selected ? "is-selected" : ""}`}
    >
      <PackHeader pack={pack} reason={reason} />
      <style>{scopedCss}</style>
      <div
        className={`shape-bg-${safeId} h-32 border border-[var(--ink-700)]`}
        style={
          {
            "--bg": "#08080e",
            "--surface": "#181824",
            "--muted": "#6b6b7b",
            "--accent": "#7c5cff",
            "--accentAlt": "#c4f24b",
          } as React.CSSProperties
        }
      />
    </button>
  );
}

function IconCard({
  pack,
  selected,
  reason,
  onClick,
}: {
  pack: Pack;
  selected: boolean;
  reason?: string;
  onClick: () => void;
}) {
  const icons = (pack.data.icons || []) as string[];
  return (
    <button
      onClick={onClick}
      className={`card-rect text-left ${selected ? "is-selected" : ""}`}
    >
      <PackHeader pack={pack} reason={reason} />
      <div className="grid grid-cols-6 gap-3 items-center">
        {icons.map((name) => {
          const Icon = (Lucide as unknown as Record<string, LucideIcon>)[name];
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
}
