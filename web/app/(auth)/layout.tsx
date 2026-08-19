import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { SiteBackdrop } from "@/components/site-backdrop";
import { SiteFooter } from "@/components/site-footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <Navbar />
      {/* Same glow and dot grid as every other route, so signing in does not
          drop the reader onto a flat black page. */}
      <main className="relative flex min-h-[calc(100vh-137px)] flex-1 items-center justify-center py-12">
        <SiteBackdrop />
        <div className="sp-container relative z-10 flex justify-center">
          {children}
        </div>
      </main>
      <SiteFooter />
    </SessionProvider>
  );
}

