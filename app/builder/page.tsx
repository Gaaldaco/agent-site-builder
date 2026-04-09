"use client";

import Link from "next/link";
import { useProject, resetProject } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function BuilderEntry() {
  const { state, hydrated } = useProject();
  const router = useRouter();

  if (!hydrated) return null;

  const hasProgress = state.intake.businessName.length > 0;

  return (
    <section className="relative px-10 py-20 min-h-[calc(100vh-80px)]">
      <div
        className="absolute -left-12 top-16 chapter-numeral pointer-events-none select-none"
        style={{ color: "var(--ink-800)" }}
      >
        00
      </div>

      <div className="relative z-10 max-w-3xl ml-auto mr-[8vw] stagger">
        <p className="mono-label-lg mb-6">▸ chapter 00 / preface</p>
        <h1
          className="font-display leading-[0.92] mb-8"
          style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 300 }}
        >
          Let&apos;s make
          <span className="italic"> something</span>
          <span style={{ color: "var(--violet)" }}>.</span>
        </h1>

        <div className="hairline hairline-draw my-10" />

        <p
          className="text-lg opacity-80 leading-relaxed mb-4"
          style={{ maxWidth: "58ch" }}
        >
          Over the next few minutes I&apos;ll ask seven questions about your
          business. Your answers stay local to this browser. No account, no
          tracking, no saved state on any server.
        </p>
        <p
          className="text-lg opacity-60 leading-relaxed mb-16 font-display italic"
          style={{ maxWidth: "58ch" }}
        >
          When we&apos;re done, I&apos;ll hand it all to the agents.
        </p>

        <div className="flex items-center gap-6 flex-wrap">
          <Link href="/builder/intake" className="btn-primary">
            {hasProgress ? "resume intake" : "begin chapter 01"} ▸
          </Link>
          {hasProgress && (
            <button
              className="btn-ghost"
              onClick={() => {
                resetProject();
                router.refresh();
                window.location.reload();
              }}
            >
              reset project
            </button>
          )}
        </div>
      </div>

      {/* Right-side marginalia */}
      <aside className="absolute right-10 top-20 hidden lg:block">
        <div className="mono-label mb-2">※ session notes</div>
        <div className="space-y-1 text-[10px] font-mono text-[var(--ink-400)]">
          <div>intake / 7 questions</div>
          <div>packs / 4 dimensions</div>
          <div>drafts / 4 variants</div>
          <div>subagents / 6 passes</div>
          <div>editor / selectable</div>
          <div>export / standalone</div>
        </div>
      </aside>
    </section>
  );
}
