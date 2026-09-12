import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpeakClip Arena — train speaking, ship clips",
  description: "AI speaking gym → shareable 60s clips + duo invites",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
