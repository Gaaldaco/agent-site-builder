"use client";

import { useProject } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ExportPage() {
  const { state, hydrated } = useProject();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  if (!hydrated) return null;
  if (!state.finalHtml) {
    router.push("/builder/refine");
    return null;
  }

  const businessName = state.intake.businessName || "your site";

  const download = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          html: state.finalHtml,
          intake: state.intake,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(businessName)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Export failed. Check the console.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="paper-canvas min-h-[calc(100vh-80px)] relative overflow-hidden">
      <div className="px-10 py-16 max-w-6xl mx-auto">
        <p className="mono-label-lg mb-6">▸ chapter 06 / export</p>
        <h2
          className="font-display leading-[0.92] mb-6"
          style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", fontWeight: 300 }}
        >
          Ready when
          <span className="italic"> you are</span>
          <span style={{ color: "var(--violet)" }}>.</span>
        </h2>
        <p className="text-base opacity-70 mb-14" style={{ maxWidth: "60ch" }}>
          Your site for <strong>{businessName}</strong> is packaged as a single
          standalone HTML bundle with any photos you uploaded. Drop it on any
          static host, or deploy it straight to Railway.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Preview */}
          <div className="border border-[rgba(10,10,10,0.15)] aspect-[4/3] overflow-hidden">
            <iframe
              srcDoc={state.finalHtml}
              title="final"
              sandbox="allow-same-origin"
              className="w-full h-full"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-6">
            <div className="border border-[rgba(10,10,10,0.15)] p-6">
              <p className="mono-label mb-3">▸ download</p>
              <h3
                className="font-display text-3xl mb-3"
                style={{ fontWeight: 400 }}
              >
                Standalone zip
              </h3>
              <p className="text-sm opacity-70 mb-5">
                A single folder with index.html, assets, and a README
                explaining every deploy target.
              </p>
              <button
                className="btn-primary !bg-[var(--paper-ink)] !text-[var(--paper)]"
                onClick={download}
                disabled={downloading}
              >
                {downloading ? "packing…" : "download zip"} ▸
              </button>
            </div>

            <div className="border border-[rgba(10,10,10,0.15)] p-6">
              <p className="mono-label mb-3">▸ deploy to railway</p>
              <h3
                className="font-display text-3xl mb-3"
                style={{ fontWeight: 400 }}
              >
                Via CLI
              </h3>
              <p className="text-sm opacity-70 mb-4">
                Unzip and run these three commands:
              </p>
              <pre
                className="font-mono text-[11px] bg-[rgba(10,10,10,0.04)] p-4 mb-4 leading-relaxed"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {`cd ${slugify(businessName)}
railway init --name "${slugify(businessName)}"
railway up`}
              </pre>
            </div>

            <div className="border border-[rgba(10,10,10,0.15)] p-6">
              <p className="mono-label mb-3">▸ push to github</p>
              <h3
                className="font-display text-3xl mb-3"
                style={{ fontWeight: 400 }}
              >
                Via gh
              </h3>
              <pre
                className="font-mono text-[11px] bg-[rgba(10,10,10,0.04)] p-4 leading-relaxed"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {`cd ${slugify(businessName)}
git init && git add -A && git commit -m "initial site"
gh repo create ${slugify(businessName)} --public --source . --push`}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-10 border-t border-[rgba(10,10,10,0.15)]">
          <button
            className="btn-ghost !text-[var(--paper-ink)]"
            onClick={() => router.push("/builder/editor")}
          >
            ◂ back to editor
          </button>
          <button
            className="btn-ghost !text-[var(--paper-ink)]"
            onClick={() => router.push("/")}
          >
            start a new project
          </button>
        </div>
      </div>
    </section>
  );
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "site"
  );
}
