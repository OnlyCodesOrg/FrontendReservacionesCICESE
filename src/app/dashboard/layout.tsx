import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
