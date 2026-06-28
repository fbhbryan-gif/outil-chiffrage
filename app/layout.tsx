import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LCB BAT — Outil de chiffrage",
  description: "Module de chiffrage bureau d'étude LCB BAT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <header className="border-b border-marine-50 bg-marine-900 text-creme">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-semibold tracking-wide">LCB BAT</span>
              <span className="text-sm text-or">Outil de chiffrage</span>
            </div>
            <span className="text-xs text-creme/60">Indexation IDF Q2 2026</span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
