import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <Navbar />
      {children}
      <SiteFooter />
    </SessionProvider>
  );
}
