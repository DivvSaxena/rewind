import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GOOGLE_TAG_ID = "G-4HV105TQHP";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rewind - DevTools for AI memory",
  description: "Memory debugger for Cognee-backed AI agents.",
  icons: {
    icon: [
      { url: "/assets/rewind-favicon/favicon.ico" },
      { url: "/assets/rewind-favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/rewind-favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/assets/rewind-favicon/apple-touch-icon.png",
  },
  manifest: "/assets/rewind-favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
        strategy="beforeInteractive"
      />
      <Script id="google-tag-config" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_TAG_ID}');
        `}
      </Script>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
