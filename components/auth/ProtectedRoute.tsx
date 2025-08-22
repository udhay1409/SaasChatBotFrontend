"use client";

import { useAuth } from "@/hooks/useAuth";
import { AIBotLoading } from "../ui/ai-bot-loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth(requireAuth);

  if (isLoading) {
    return  (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <AIBotLoading message="Authendicating..." />
          </div>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // useAuth will handle redirect
  }

  return <>{children}</>;
}