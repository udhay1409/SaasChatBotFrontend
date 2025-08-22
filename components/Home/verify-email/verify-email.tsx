"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";

export default function VerifyEmailComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        
        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link");
          return;
        }

        const response = await axiosInstance.post('/api/auth/verify-email', { token });
        const data = response.data;

        if (data.success) {
          setStatus("success");
          setMessage("Email verified successfully! You can now sign in.");
        } else {
          setStatus("error");
          setMessage(data.error || "Email verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Email"}
            {status === "success" && "Email Verified"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-4xl">✓</div>
              <Button asChild className="w-full">
                <Link href="/signin">Go to Sign In</Link>
              </Button>
            </div>
          )}
          
          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="text-red-600 text-4xl">✗</div>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signin">Back to Sign In</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Need help? Contact support or try registering again.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
