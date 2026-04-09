import Link from "next/link";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-10 py-6 border-b border-[var(--ink-700)]">
        <Link href="/" className="flex items-center gap-4 btn-ghost !p-0">
          <span>§ agent-site-builder</span>
        </Link>
        <div className="flex items-center gap-6">
          <span className="mono-label">session · local</span>
          <span className="mono-label" style={{ color: "var(--violet)" }}>
            ● draft
          </span>
        </div>
      </header>
      <main className="flex-1 relative">{children}</main>
    </div>
  );
}
