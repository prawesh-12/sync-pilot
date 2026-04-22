import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Navbar />
      {children}
      <footer className="border-t border-[#A089E6]/10 bg-[#07070f]/90 py-3 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} SyncPilot AI
      </footer>
    </ClerkProvider>
  );
}
