"use client";

import { useEffect, useState } from "react";
import { Settings } from "@/components/Dashboard/admin/settings/settings";
import { Unauthorized } from "@/components/ui/unauthorized";
import { User } from "@/types/auth";
import {AIBotLoading} from "@/components/ui/ai-bot-loading";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    setLoading(false);
  }, []);

  // Show loading state
  if (loading) {
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

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.userType === 'admin';

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Unauthorized 
          title="Admin Access Required"
          description="You need administrator privileges to access the admin settings. Please contact your system administrator if you believe you should have access."
        />
      </div>
    );
  }

  return <Settings />;
}
