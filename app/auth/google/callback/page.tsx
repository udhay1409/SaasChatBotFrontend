"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AIBotLoading } from "@/components/ui/ai-bot-loading";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const token = searchParams.get("token");
        const user = searchParams.get("user");
        const error = searchParams.get("error");
        const email = searchParams.get("email");

        // Handle different error types
        if (error) {
          switch (error) {
            case 'email_not_verified':
              setStatus(`Email verification required! We've sent a verification email to ${email}. Please check your inbox and verify your email before signing in.`);
              setTimeout(() => router.push("/signin"), 5000);
              break;
            case 'account_disabled':
              setStatus("Your account has been disabled. Please contact support for assistance.");
              setTimeout(() => router.push("/signin"), 3000);
              break;
            case 'auth_failed':
            default:
              setStatus("Authentication failed. Please try again.");
              setTimeout(() => router.push("/signin"), 3000);
              break;
          }
          return;
        }

        // Check if we have token and user data
        if (!token || !user) {
          setStatus("Missing authentication data. Redirecting to sign in...");
          setTimeout(() => router.push("/signin"), 2000);
          return;
        }

        setStatus("Saving authentication data...");

        try {
          // Parse user data
          const userData = JSON.parse(decodeURIComponent(user));
          
          // Store token and user data in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userData));

          setStatus("Success! Redirecting to dashboard...");
          setTimeout(() => router.push("/dashboard"), 1000);

        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          setStatus("Error processing authentication data. Please try again.");
          setTimeout(() => router.push("/signin"), 3000);
        }

      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("An unexpected error occurred. Please try again.");
        setTimeout(() => router.push("/signin"), 3000);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <AIBotLoading />
          <p className="text-sm text-muted-foreground mt-4">{status}</p>
        </div>
      </div>
    </div>
  );
}