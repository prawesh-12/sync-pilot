import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-137px)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
        {children}
      </main>
      <SiteFooter />
    </ClerkProvider>
  );
}

