import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Navbar />
      {children}
      <SiteFooter />
    </ClerkProvider>
  );
}
