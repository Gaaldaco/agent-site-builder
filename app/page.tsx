import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="paper-canvas min-h-screen relative overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-10 py-8 border-b">
        <div className="flex items-center gap-4">
          <span className="mono-label">§ agent-site-builder</span>
          <span className="mono-label opacity-50">v0.1 / draft</span>
        </div>
        <nav className="flex items-center gap-8">
          <span className="mono-label">01 — craft</span>
          <span className="mono-label opacity-50">02 — export</span>
          <span className="mono-label opacity-50">03 — deploy</span>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-10 pt-24 pb-32 relative">
        <div className="mono-label-lg mb-8 stagger">
          <span>▸ chapter 00 / prologue</span>
        </div>

        <h1
          className="font-display leading-[0.86] tracking-tight stagger"
          style={{ fontSize: "clamp(3.5rem, 11vw, 11rem)", fontWeight: 300 }}
        >
          <span className="block">Build with an</span>
          <span className="block italic" style={{ fontWeight: 400 }}>
            agent<span style={{ color: "var(--violet)" }}>.</span>
          </span>
          <span className="block">Not a template.</span>
        </h1>

        <div className="hairline hairline-draw my-16" />

        <div className="grid grid-cols-12 gap-8 stagger">
          <div className="col-span-12 md:col-span-4">
            <p className="mono-label mb-3">▸ what it is</p>
            <p className="text-base leading-relaxed opacity-80">
              A conversational intake, curated design packs, and a team of
              subagents that craft, test, and deliver a deployable single-page
              site.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4">
            <p className="mono-label mb-3">▸ how it works</p>
            <p className="text-base leading-relaxed opacity-80">
              Answer seven questions. Pick a pack. Choose from four AI drafts.
              Refine by clicking any element on the canvas.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4">
            <p className="mono-label mb-3">▸ where it goes</p>
            <p className="text-base leading-relaxed opacity-80">
              Export as a standalone bundle or push directly to GitHub and
              deploy on Railway. No lock-in. You own the files.
            </p>
          </div>
        </div>

        <div className="mt-16 flex items-center gap-8 stagger">
          <Link href="/builder" className="btn-primary !bg-[var(--paper-ink)] !text-[var(--paper)]">
            begin intake
            <span>▸</span>
          </Link>
          <Link href="#process" className="btn-ghost !text-[var(--paper-ink)]">
            see the process
          </Link>
        </div>
      </section>

      {/* Process section */}
      <section id="process" className="px-10 py-24 border-t">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <p className="mono-label-lg mb-6">§ the process</p>
            <p
              className="font-display italic text-3xl leading-tight opacity-70"
              style={{ fontWeight: 300 }}
            >
              Seven chapters from a blank page to a live site.
            </p>
          </div>

          <div className="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              [
                "01",
                "Intake",
                "Seven questions. Business, audience, purpose, commerce. The agent remembers everything.",
              ],
              [
                "02",
                "Packs",
                "Curated themes, typography pairings, button systems, icon sets. Or compose your own.",
              ],
              [
                "03",
                "Drafts",
                "Four distinct AI-authored drafts of your page. Not variations — different points of view.",
              ],
              [
                "04",
                "Subagents",
                "Designer, layout, backend, tester, debugger, presenter. Each polishes a specific layer.",
              ],
              [
                "05",
                "Refine",
                "Click any element on the canvas. Describe the change. The agent touches only what you asked.",
              ],
              [
                "06",
                "Export",
                "Standalone HTML bundle or direct GitHub push, queued for Railway deploy.",
              ],
            ].map(([num, title, body]) => (
              <div key={num} className="border-t pt-6">
                <div className="flex items-baseline justify-between mb-3">
                  <span
                    className="font-display italic"
                    style={{ fontSize: "3.2rem", fontWeight: 300, lineHeight: 0.9 }}
                  >
                    {num}
                  </span>
                  <span className="mono-label">chapter {num}</span>
                </div>
                <h3 className="font-display text-2xl mb-2" style={{ fontWeight: 400 }}>
                  {title}
                </h3>
                <p className="opacity-70 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-10 border-t flex items-center justify-between">
        <span className="mono-label">▸ made with claude agent sdk</span>
        <span className="mono-label opacity-50">
          deployable · railway · github
        </span>
      </footer>
    </main>
  );
}
