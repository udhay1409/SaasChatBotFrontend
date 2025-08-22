"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import AdminDashboard from "@/components/Dashboard/admin/dashboard/Dashboard";
import UserDashboard from "@/components/Dashboard/dashboard/Dashboard";
import { AIBotLoading } from "@/components/ui/ai-bot-loading";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from localStorage to determine role
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role || parsedUser.userType);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <AIBotLoading />
          </div>
        </div>
      </div>
    );
  }

  // Show admin dashboard if user is admin
  if (userRole === "admin") {
    return (
      <div className="p-6">
        <AdminDashboard user={user ?? undefined} />
      </div>
    );
  }

  // Show user dashboard for regular users
  return (
    <div className="p-6">
      <UserDashboard user={user ?? undefined} />
    </div>
  );
}
