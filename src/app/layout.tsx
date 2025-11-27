import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import { UserProvider } from "@/context/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PickPick - WorldCup Game Platform",
  description: "Create and play your own WorldCup games. Vote for your favorites and see the rankings!",
  openGraph: {
    title: "PickPick - WorldCup Game Platform",
    description: "Create and play your own WorldCup games.",
    type: "website",
    locale: "en_US",
    siteName: "PickPick",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <UserProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  );
}
