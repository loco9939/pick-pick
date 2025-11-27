import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { UserProvider } from "@/context/UserContext";

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
    <html lang="en" className="dark">
      <body
        className={`antialiased min-h-screen flex flex-col`}
      >
        <UserProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
