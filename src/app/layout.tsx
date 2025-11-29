import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { UserProvider } from "@/context/UserContext";

import GoogleAnalytics from "@/components/common/GoogleAnalytics";

export const metadata: Metadata = {
  title: "PickPick - WorldCup Game Platform",
  description: "Create and play your own WorldCup games. Vote for your favorites and see the rankings!",
  openGraph: {
    title: "PickPick - WorldCup Game Platform",
    description: "Create and play your own WorldCup games.",
    type: "website",
    locale: "en_US",
    siteName: "PickPick",
    images: [
      {
        url: '/pick-pick(1200x630).png',
        width: 1200,
        height: 630,
        alt: 'PickPick - WorldCup Game Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "PickPick - WorldCup Game Platform",
    description: "Create and play your own WorldCup games. Vote for your favorites and see the rankings!",
    images: ['/pick-pick(1200x630).png'],
  },
  icons: {
    icon: [
      { url: '/favicon_io/favicon.ico' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon_io/apple-touch-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`antialiased min-h-screen flex flex-col`}
      >
        <GoogleAnalytics />
        <UserProvider>
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center">
            {children}
          </main>
          <Footer />
        </UserProvider>

      </body>
    </html>
  );
}
