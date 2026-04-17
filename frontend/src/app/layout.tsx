

if (typeof String.prototype.repeat === 'function') {
  const orig = String.prototype.repeat;
  (String.prototype as any).repeat = function (count: number) {
    if (typeof count !== 'number' || !isFinite(count) || count < 0) {
      return '';
    }
    return orig.call(this, count);
  };
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { ThemeProvider } from "next-themes";
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider";
import { siteConfig } from "@/config/site";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} - Global Artist Community`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Poppins:wght@300;400;500;600;700&family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-artistic-pattern`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <ServiceWorkerProvider>
              <div className="flex flex-col min-h-screen">
                <Layout>
                  {children}
                </Layout>
              </div>
            </ServiceWorkerProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
