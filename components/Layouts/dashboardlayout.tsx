"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Dashboard/sidebar/app-sidebar";
import { DashboardNavbar } from "@/components/Dashboard/sidebarNavbar/dashboard-navbar";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.replace("/signin");
      return;
    }

    try {
      // Validate token expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/signin");
        return;
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/signin");
      return;
    }
  }, [router]);

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardNavbar />
           <Toaster 
            position="top-center"
            toastOptions={{
              className: 'border-2 border-border shadow-xl rounded-lg text-lg',
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                padding: '20px 24px',
                minWidth: '400px',
                maxWidth: '600px'
              },
            }}
            richColors
            expand
            gap={12}
           />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
         
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
