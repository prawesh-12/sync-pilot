import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncPilot - AI Agent",
  description: "SyncPilot control dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} dark`}>
      <body className={`${montserrat.className} min-h-screen overflow-x-hidden flex flex-col antialiased`}>
        <ClerkProvider>
          <Navbar />
          {children}
          <footer className="border-t border-[#A089E6]/10 bg-[#07070f]/90 py-3 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} SyncPilot AI
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
