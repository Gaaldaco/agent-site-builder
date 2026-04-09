"use client";

import { useProject } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SubagentName, SubagentStatus } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const SUBAGENT_ORDER: {
  name: SubagentName;
  title: string;
  role: string;
}[] = [
  {
    name: "designer",
    title: "Designer",
    role: "Polishes hierarchy, spacing, typographic rhythm",
  },
  {
    name: "layout",
    title: "Layout",
    role: "Fixes structure, adds responsive rules",
  },
  {
    name: "backend",
    title: "Backend",
    role: "Scaffolds forms, commerce hooks, data-actions",
  },
  {
    name: "tester",
    title: "Tester",
    role: "Validates semantics and accessibility",
  },
  {
    name: "debugger",
    title: "Debugger",
    role: "Repairs markup and style bugs",
  },
  {
    name: "presenter",
    title: "Presenter",
    role: "Final polish + entrance motion",
  },
];

export default function RefinePage() {
  const { state, hydrated, update } = useProject();
  const router = useRouter();
  const [statuses, setStatuses] = useState<SubagentStatus[]>(
    SUBAGENT_ORDER.map((s) => ({ name: s.name, state: "pending", log: [] }))
  );
  const [running, setRunning] = useState(false);
  const [finalHtml, setFinalHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || startedRef.current) return;
    if (!state.chosenDraftId) {
      router.push("/builder/drafts");
      return;
    }
    startedRef.current = true;
    void runOrchestrator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function runOrchestrator() {
    const chosen = state.drafts.find((d) => d.id === state.chosenDraftId);
    if (!chosen) return;
    setRunning(true);
    setError(null);

    try {
      const res = await fetch("/api/agent/refine", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          html: chosen.html,
          intake: state.intake,
          theme: state.theme,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const raw of events) {
          const lines = raw.trim().split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;
          const event = eventLine.slice(6).trim();
          const data = JSON.parse(dataLine.slice(5).trim());

          if (event === "subagent:start") {
            setStatuses((prev) =>
              prev.map((s) =>
                s.name === data.name ? { ...s, state: "running" } : s
              )
            );
          } else if (event === "subagent:done") {
            setStatuses((prev) =>
              prev.map((s) =>
                s.name === data.name
                  ? { ...s, state: "done", log: [...s.log, data.message] }
                  : s
              )
            );
          } else if (event === "subagent:error") {
            setStatuses((prev) =>
              prev.map((s) =>
                s.name === data.name
                  ? { ...s, state: "error", log: [...s.log, data.message] }
                  : s
              )
            );
          } else if (event === "final") {
            setFinalHtml(data.html);
            update({ finalHtml: data.html });
          } else if (event === "error") {
            setError(data.message);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || "orchestrator failed");
    } finally {
      setRunning(false);
    }
  }

  if (!hydrated) return null;

  const allDone = statuses.every((s) => s.state === "done" || s.state === "error");

  return (
    <section className="relative min-h-[calc(100vh-80px)] px-10 py-16">
      <div
        className="absolute -left-8 top-6 chapter-numeral pointer-events-none select-none"
        aria-hidden
      >
        04
      </div>

      <div className="relative z-10 max-w-7xl ml-auto mr-[4vw]">
        <p className="mono-label-lg mb-6">▸ chapter 04 / subagents</p>
        <h2
          className="font-display leading-[0.95] mb-12"
          style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 300 }}
        >
          Six agents,
          <span className="italic"> working </span>
          in sequence
          <span style={{ color: "var(--violet)" }}>.</span>
        </h2>

        <div className="grid grid-cols-12 gap-8">
          {/* Left: subagent log */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            {SUBAGENT_ORDER.map((s, i) => {
              const status = statuses.find((st) => st.name === s.name)!;
              return (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="border-l-2 pl-5 py-3"
                  style={{
                    borderColor:
                      status.state === "done"
                        ? "var(--signal)"
                        : status.state === "running"
                        ? "var(--violet)"
                        : status.state === "error"
                        ? "var(--danger)"
                        : "var(--ink-700)",
                  }}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-3">
                      <span className="mono-label">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="font-display text-2xl"
                        style={{ fontWeight: 400 }}
                      >
                        {s.title}
                      </span>
                    </div>
                    <StatusPill state={status.state} />
                  </div>
                  <p className="text-xs opacity-60">{s.role}</p>
                  {status.log.length > 0 && (
                    <div className="mt-2 text-[10px] font-mono opacity-60">
                      {status.log.map((l, li) => (
                        <div key={li}>▸ {l}</div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {error && (
              <div
                className="p-4 border-l-2 text-sm"
                style={{
                  borderColor: "var(--danger)",
                  background: "rgba(255, 91, 91, 0.05)",
                }}
              >
                <p
                  className="mono-label mb-1"
                  style={{ color: "var(--danger)" }}
                >
                  ▸ orchestrator error
                </p>
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Right: live preview */}
          <div className="col-span-12 lg:col-span-7">
            <div className="border border-[var(--ink-700)] bg-[var(--paper)] aspect-[16/10] relative overflow-hidden">
              {finalHtml ? (
                <iframe
                  srcDoc={finalHtml}
                  title="live-preview"
                  sandbox="allow-same-origin"
                  className="w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="shimmer h-1 w-40 mb-4" />
                  <p className="mono-label text-[var(--paper-ink)] opacity-60">
                    ◌ subagents working
                  </p>
                  <p className="font-display italic text-2xl mt-2 text-[var(--paper-ink)] opacity-90">
                    the page is being drafted…
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="mono-label">
                ※ iterating with {SUBAGENT_ORDER.length} subagents
              </p>
              {running && (
                <p className="mono-label" style={{ color: "var(--violet)" }}>
                  ● live
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-16 pt-10 border-t border-[var(--ink-700)]">
          <button
            className="btn-ghost"
            onClick={() => router.push("/builder/drafts")}
          >
            ◂ back to drafts
          </button>
          <button
            className="btn-primary"
            disabled={!allDone || !finalHtml}
            onClick={() => router.push("/builder/editor")}
          >
            open the editor ▸
          </button>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ state }: { state: SubagentStatus["state"] }) {
  const map = {
    pending: { label: "pending", color: "var(--ink-400)" },
    running: { label: "● running", color: "var(--violet)" },
    done: { label: "✓ done", color: "var(--signal)" },
    error: { label: "✕ error", color: "var(--danger)" },
  } as const;
  const cfg = map[state];
  return (
    <span
      className="mono-label"
      style={{ color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
