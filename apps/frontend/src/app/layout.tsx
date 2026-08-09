import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unified Edu-Fintech Platform (UEFP)",
  description: "Modular Monolith Platform for Education & Fintech Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
