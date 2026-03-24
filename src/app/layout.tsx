import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "psy.market — Psytrance Fashion & Culture Marketplace",
    template: "%s | psy.market",
  },
  description: "Buy and sell festival fashion, jewelry, art, and music gear from the global psytrance community.",
  metadataBase: new URL("https://psy.market"),
  openGraph: {
    type: "website",
    siteName: "psy.market",
    title: "psy.market — Psytrance Fashion & Culture Marketplace",
    description: "Buy and sell festival fashion, jewelry, art, and music gear from the global psytrance community.",
    images: [{ url: "/logo_web.png", width: 800, height: 400, alt: "psy.market" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "psy.market",
    description: "Buy and sell festival fashion, jewelry, art, and music gear from the global psytrance community.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
