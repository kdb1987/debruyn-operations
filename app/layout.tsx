import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeBruyn Operations",
  description: "Operative Werkzeuge für Organisation und Koordination.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
