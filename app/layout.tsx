import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
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
        {children}
      </body>
    </html>
  );
}

