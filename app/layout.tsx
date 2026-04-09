import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "agent-site-builder — build with an agent, not a template",
  description:
    "An editorial AI website builder. Conversational intake, curated design packs, and subagents that craft a deployable site.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
