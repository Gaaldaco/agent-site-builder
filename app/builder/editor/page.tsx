"use client";

import { useProject } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Selection = {
  selector: string;
  tag: string;
  outerHtml: string;
  rect: { x: number; y: number; w: number; h: number };
} | null;

export default function EditorPage() {
  const { state, hydrated, update } = useProject();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [editRequest, setEditRequest] = useState("");
  const [editing, setEditing] = useState(false);
  const [editHistory, setEditHistory] = useState<
    { selector: string; request: string; at: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.finalHtml) {
      router.push("/builder/refine");
    }
  }, [hydrated, state.finalHtml, router]);

  const installInteractionLayer = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) return;

    // Inject highlight style
    if (!doc.getElementById("__asb_editor_style")) {
      const style = doc.createElement("style");
      style.id = "__asb_editor_style";
      style.textContent = `
        *,*::before,*::after{cursor:crosshair!important}
        .__asb_hover{outline:1px dashed #7c5cff!important;outline-offset:2px!important}
        .__asb_selected{outline:2px solid #7c5cff!important;outline-offset:2px!important;box-shadow:0 0 0 6px rgba(124,92,255,0.08)!important}
      `;
      doc.head.appendChild(style);
    }

    let lastHover: Element | null = null;

    const computeSelector = (el: Element): string => {
      if (!(el instanceof Element)) return "";
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts: string[] = [];
      let current: Element | null = el;
      while (current && current.nodeType === 1 && parts.length < 6) {
        const self: Element = current;
        let part = self.tagName.toLowerCase();
        const cls = (self.getAttribute("class") || "")
          .split(/\s+/)
          .filter(Boolean)
          .filter((c) => !c.startsWith("__asb"))
          .slice(0, 2);
        if (cls.length) part += "." + cls.map((c) => CSS.escape(c)).join(".");
        const parentEl: Element | null = self.parentElement;
        if (parentEl) {
          const sameTag = Array.from(parentEl.children).filter(
            (c) => c.tagName === self.tagName
          );
          if (sameTag.length > 1) {
            const idx = sameTag.indexOf(self) + 1;
            part += `:nth-of-type(${idx})`;
          }
        }
        parts.unshift(part);
        current = parentEl;
      }
      return parts.join(" > ");
    };

    const onOver = (e: Event) => {
      const target = e.target as Element | null;
      if (!target || target === doc.body || target === doc.documentElement) return;
      if (lastHover && lastHover !== target) {
        lastHover.classList.remove("__asb_hover");
      }
      target.classList.add("__asb_hover");
      lastHover = target;
    };

    const onOut = () => {
      if (lastHover) {
        lastHover.classList.remove("__asb_hover");
        lastHover = null;
      }
    };

    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as Element | null;
      if (!target) return;

      doc.querySelectorAll(".__asb_selected").forEach((el) =>
        el.classList.remove("__asb_selected")
      );
      target.classList.add("__asb_selected");

      const rect = (target as HTMLElement).getBoundingClientRect();
      setSelection({
        selector: computeSelector(target),
        tag: target.tagName.toLowerCase(),
        outerHtml: target.outerHTML.slice(0, 2000),
        rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      });
    };

    doc.addEventListener("mouseover", onOver, true);
    doc.addEventListener("mouseout", onOut, true);
    doc.addEventListener("click", onClick, true);
  };

  const submitEdit = async () => {
    if (!selection || !editRequest.trim() || !state.finalHtml) return;
    setEditing(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          html: state.finalHtml,
          selector: selection.selector,
          elementOuterHtml: selection.outerHtml,
          request: editRequest,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      update({ finalHtml: data.html });
      setEditHistory((h) => [
        {
          selector: selection.selector,
          request: editRequest,
          at: new Date().toLocaleTimeString(),
        },
        ...h,
      ]);
      setEditRequest("");
      setSelection(null);
    } catch (err: any) {
      setError(err?.message || "Edit failed.");
    } finally {
      setEditing(false);
    }
  };

  if (!hydrated || !state.finalHtml) return null;

  return (
    <section className="relative min-h-[calc(100vh-80px)] px-8 py-6">
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-4">
          <span className="mono-label">§ chapter 05 · editor</span>
          <span className="mono-label" style={{ color: "var(--violet)" }}>
            ※ click any element on the canvas
          </span>
        </div>
        <div className="flex items-baseline gap-6">
          <button
            className="btn-ghost"
            onClick={() => router.push("/builder/refine")}
          >
            ◂ subagents
          </button>
          <button
            className="btn-primary"
            onClick={() => router.push("/builder/export")}
          >
            export ▸
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-160px)]">
        {/* Canvas */}
        <div className="col-span-12 lg:col-span-8 border border-[var(--ink-700)] bg-[var(--paper)] relative overflow-hidden">
          <iframe
            ref={iframeRef}
            srcDoc={state.finalHtml}
            title="canvas"
            sandbox="allow-same-origin"
            className="w-full h-full"
            onLoad={installInteractionLayer}
          />
          {/* Corner meta */}
          <div className="absolute top-3 left-3 mono-label bg-[var(--paper)] px-2 py-1 border border-[rgba(10,10,10,0.1)] text-[var(--paper-ink)]">
            ▸ canvas · crosshair mode
          </div>
        </div>

        {/* Edit panel */}
        <aside className="col-span-12 lg:col-span-4 border border-[var(--ink-700)] bg-[var(--ink-900)] flex flex-col">
          <div className="p-5 border-b border-[var(--ink-700)]">
            <p className="mono-label-lg mb-2">§ edit dossier</p>
            <p
              className="font-display italic text-xl opacity-80"
              style={{ fontWeight: 300 }}
            >
              Select an element, describe the change.
            </p>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            {selection ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p className="mono-label mb-2">▸ selected</p>
                <p className="font-mono text-xs break-all mb-4 text-[var(--ink-200)]">
                  {"<"}
                  {selection.tag}
                  {">"} — {selection.selector}
                </p>
                <p className="mono-label mb-2">▸ size</p>
                <p className="font-mono text-[10px] mb-4 opacity-60">
                  {Math.round(selection.rect.w)}×
                  {Math.round(selection.rect.h)}px
                </p>

                <p className="mono-label mb-2">▸ what should change?</p>
                <textarea
                  className="textarea-hairline"
                  rows={5}
                  value={editRequest}
                  onChange={(e) => setEditRequest(e.target.value)}
                  placeholder="e.g. make this heading larger and italic, change copy to 'Our services'…"
                  disabled={editing}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    className="btn-primary"
                    disabled={editing || !editRequest.trim()}
                    onClick={submitEdit}
                  >
                    {editing ? "editing…" : "apply change ▸"}
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      setSelection(null);
                      setEditRequest("");
                    }}
                  >
                    clear
                  </button>
                </div>

                {error && (
                  <div
                    className="mt-4 p-3 text-xs border-l-2"
                    style={{
                      borderColor: "var(--danger)",
                      background: "rgba(255, 91, 91, 0.05)",
                    }}
                  >
                    {error}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="opacity-60">
                <p className="mono-label mb-4">▸ no selection</p>
                <p
                  className="font-display italic text-lg leading-snug"
                  style={{ fontWeight: 300 }}
                >
                  Hover the canvas and click any element — a heading, button,
                  section, image, or paragraph. Everything is selectable.
                </p>
              </div>
            )}

            {editHistory.length > 0 && (
              <div className="mt-10 pt-6 border-t border-[var(--ink-700)]">
                <p className="mono-label mb-3">※ edit history</p>
                <div className="space-y-3">
                  {editHistory.map((h, i) => (
                    <div key={i} className="text-xs">
                      <p className="font-mono opacity-50 mb-1">
                        {h.at} · {h.selector.slice(0, 30)}…
                      </p>
                      <p className="opacity-80">{h.request}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
