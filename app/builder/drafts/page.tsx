"use client";

import { useProject } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Draft } from "@/lib/types";
import { motion } from "framer-motion";

export default function DraftsPage() {
  const { state, hydrated, update } = useProject();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failures, setFailures] = useState<{ label: string; error: string }[]>(
    []
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    state.chosenDraftId
  );

  useEffect(() => {
    if (!hydrated) return;
    if (state.drafts.length === 0 && !loading) {
      void generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function generate() {
    setLoading(true);
    setError(null);
    setFailures([]);
    try {
      const res = await fetch("/api/agent/drafts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          intake: state.intake,
          theme: state.theme,
          sessionId: state.sessionId,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (j.failures) setFailures(j.failures);
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        drafts: Draft[];
        failures?: { label: string; error: string }[];
      };
      update({ drafts: data.drafts });
      setFailures(data.failures || []);
    } catch (err: any) {
      setError(err?.message || "Failed to generate drafts.");
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) return null;

  return (
    <section className="relative min-h-[calc(100vh-80px)] px-10 py-16">
      <div
        className="absolute -left-8 top-6 chapter-numeral pointer-events-none select-none"
        aria-hidden
      >
        03
      </div>

      <div className="relative z-10 max-w-7xl ml-auto mr-[4vw]">
        <p className="mono-label-lg mb-6">▸ chapter 03 / four drafts</p>
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <h2
            className="font-display leading-[0.95]"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 300 }}
          >
            Four directions.
            <span className="italic" style={{ color: "var(--violet)" }}>
              {" "}
              One choice.
            </span>
          </h2>
          <button
            className="btn-outline"
            onClick={generate}
            disabled={loading}
          >
            {loading ? "drafting…" : "regenerate"}
          </button>
        </div>

        {error && (
          <div
            className="mb-8 p-5 border-l-2 text-sm"
            style={{
              borderColor: "var(--danger)",
              background: "rgba(255, 91, 91, 0.05)",
            }}
          >
            <p className="mono-label mb-2" style={{ color: "var(--danger)" }}>
              ▸ error
            </p>
            <p>{error}</p>
            <p className="mt-3 opacity-60 text-xs">
              Check ANTHROPIC_API_KEY in your env, then retry.
            </p>
          </div>
        )}

        {failures.length > 0 && !loading && (
          <div
            className="mb-8 p-5 border-l-2 text-sm"
            style={{
              borderColor: "#ffb940",
              background: "rgba(255, 185, 64, 0.05)",
            }}
          >
            <p className="mono-label mb-2" style={{ color: "#ffb940" }}>
              ▸ partial result — {failures.length} of 4 variants failed
            </p>
            <div className="space-y-1 text-xs opacity-80">
              {failures.map((f) => (
                <p key={f.label}>
                  variant {f.label}: {f.error}
                </p>
              ))}
            </div>
            <button
              className="btn-ghost mt-3"
              onClick={generate}
            >
              retry all
            </button>
          </div>
        )}

        {loading && state.drafts.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["A", "B", "C", "D"].map((l) => (
              <div
                key={l}
                className="border border-[var(--ink-700)] aspect-[4/3] flex flex-col"
              >
                <div className="flex items-baseline justify-between p-4 border-b border-[var(--ink-700)]">
                  <span
                    className="font-display italic text-4xl"
                    style={{ fontWeight: 300 }}
                  >
                    {l}
                  </span>
                  <span className="mono-label">drafting…</span>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  <div className="shimmer absolute inset-0 opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="mono-label">◌ agent composing</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {state.drafts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {state.drafts.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="border border-[var(--ink-700)] flex flex-col group cursor-pointer transition-colors"
                style={{
                  borderColor:
                    selectedId === d.id ? "var(--violet)" : undefined,
                  boxShadow:
                    selectedId === d.id
                      ? "inset 3px 0 0 0 var(--violet)"
                      : undefined,
                }}
                onClick={() => setSelectedId(d.id)}
              >
                <div className="flex items-baseline justify-between p-4 border-b border-[var(--ink-700)]">
                  <div className="flex items-baseline gap-4">
                    <span
                      className="font-display italic text-4xl leading-none"
                      style={{ fontWeight: 300 }}
                    >
                      {d.label}
                    </span>
                    <span className="mono-label">variant {d.label}</span>
                  </div>
                  {selectedId === d.id && (
                    <span
                      className="mono-label"
                      style={{ color: "var(--violet)" }}
                    >
                      ● chosen
                    </span>
                  )}
                </div>
                <div className="p-4 border-b border-[var(--ink-700)]">
                  <p className="text-xs opacity-70 font-display italic">
                    {d.concept}
                  </p>
                </div>
                <div className="relative aspect-[16/10] bg-[var(--paper)] overflow-hidden">
                  <iframe
                    srcDoc={d.html}
                    title={`draft-${d.label}`}
                    sandbox="allow-same-origin"
                    className="w-full h-full pointer-events-none"
                    style={{
                      transform: "scale(0.5)",
                      transformOrigin: "top left",
                      width: "200%",
                      height: "200%",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 mt-16 pt-10 border-t border-[var(--ink-700)]">
          <button
            className="btn-ghost"
            onClick={() => router.push("/builder/themes")}
          >
            ◂ back to packs
          </button>
          <button
            className="btn-primary"
            disabled={!selectedId}
            onClick={() => {
              update({ chosenDraftId: selectedId });
              router.push("/builder/refine");
            }}
          >
            hand off to subagents ▸
          </button>
          {selectedId && (
            <span className="mono-label opacity-60">
              variant {state.drafts.find((d) => d.id === selectedId)?.label} selected
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
