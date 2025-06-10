"use client";

import type { Metadata } from "next";
import localFont from "next/font/local";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <main className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
      isCollapsed ? 'ml-20' : 'ml-72'
    }`}>
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        {children}
      </div>
    </main>
  );
}

function PublicContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 min-h-screen">
      {children}
    </main>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  
  // Rutas públicas que no necesitan sidebar
  const publicRoutes = ['/auth/login', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  if (loading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }
  
  if (isPublicRoute) {
    return <PublicContent>{children}</PublicContent>;
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
