"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { AddOrganization } from "./Addorganization";

// Type guard for axios error responses
const isAxiosError = (
  error: unknown
): error is {
  response?: {
    status?: number;
    data?: {
      error?: string;
      errorType?: string;
      userEmail?: string;
    };
  };
} => {
  return typeof error === "object" && error !== null && "response" in error;
};

export const SignIn = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          setIsCheckingAuth(false);
          return;
        }

        // Validate token expiry
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;

          if (payload.exp <= currentTime) {
            // Token expired - clear and stay on signin
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsCheckingAuth(false);
            return;
          }
        } catch (tokenError) {
          // Invalid token - clear and stay on signin
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsCheckingAuth(false);
          return;
        }

        // Verify with server that session is still valid
        try {
          await axiosInstance.get("/api/auth/me");
          // If we get here, user is authenticated - redirect to dashboard
          router.replace("/dashboard");
        } catch (error: unknown) {
          // Session invalid - clear and stay on signin
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsCheckingAuth(false);
        }
      } catch (error) {
        // Any error - stay on signin page
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing, but don't reset verification state
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));

      // Only hide resend verification if user is typing in email field
      // and the error was about email verification
      if (name === "email" && showResendVerification) {
        setShowResendVerification(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post("/api/auth/login", formData);

        if (response.data.success) {
          // Store token and user data
          localStorage.setItem("token", response.data.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.data.user));

          // Redirect to dashboard
          router.replace("/dashboard");
        } else {
          const errorMessage = response.data.error || "Login failed";

          // Check if it's an email verification error
          if (errorMessage.includes("verify your email")) {
            setErrors((prev) => ({
              ...prev,
              email: errorMessage,
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              password: errorMessage,
            }));
          }
        }
      } catch (error: unknown) {
        if (!isAxiosError(error)) {
          console.error("Sign in error:", error);
          setErrors((prev) => ({
            ...prev,
            password: "Network error. Please try again.",
          }));
          return;
        }

        const errorData = error.response?.data;
        const errorMessage =
          errorData?.error || "Network error. Please try again.";

        // Handle disabled account error (don't log to console)
        if (
          error.response?.status === 403 &&
          errorData?.errorType === "ACCOUNT_DISABLED"
        ) {
          // Don't log this error - it's handled by the DisabledAccountToast component
          // Just clear the form and let the toast handle the user notification
          setErrors((prev) => ({
            ...prev,
            password: "", // Clear any password errors
          }));
          return; // Exit early, don't show additional error messages
        }

        // Handle email not verified error
        if (errorData?.errorType === "EMAIL_NOT_VERIFIED") {
          // Don't log email verification errors to console
          setUserEmail(errorData.userEmail || formData.email);
          setShowResendVerification(true);

          // Show toast for 5 seconds
          toast.error("Email Not Verified", {
            description:
              "Please verify your email address before signing in. Check your inbox for the verification link.",
            duration: 5000, // Show for 5 seconds
            action: {
              label: "Resend Email",
              onClick: () => handleResendVerification(),
            },
          });

          setErrors((prev) => ({
            ...prev, 
            email: "Please verify your email address",
          }));
        } else {
          // Only log unexpected errors to console
          console.error("Sign in error:", error);
          setShowResendVerification(false);
          setErrors((prev) => ({
            ...prev,
            password: errorMessage,
          }));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Simple redirect to backend Google OAuth
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
    } catch (error) {
      console.error("Google sign in error:", error);
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const emailToUse = userEmail || formData.email;

    if (!emailToUse) {
      toast.error("Email required", {
        description: "Please enter your email address first",
      });
      return;
    }

    setIsResendingVerification(true);
    try {
      const response = await axiosInstance.post(
        "/api/auth/resend-verification",
        {
          email: emailToUse,
        }
      );

      if (response.data.success) {
        // Dismiss the previous error toast
        toast.dismiss();

        // Show success toast
        toast.success("Verification email sent!", {
          description: `Please check your inbox at ${emailToUse} for the verification link.`,
          duration: 5000,
        });

        setErrors((prev) => ({
          ...prev,
          email: "",
        }));
        setShowResendVerification(false);
      } else {
        toast.error("Failed to send email", {
          description:
            response.data.error || "Failed to send verification email",
        });
      }
    } catch (error: unknown) {
      console.error("Resend verification error:", error);
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.error || "Network error. Please try again."
        : "Network error. Please try again.";

      toast.error("Failed to send email", {
        description: errorMessage,
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleCreateOrganization = async (organizationData: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    try {
      const response = await axiosInstance.post(
        "/api/dashboard/admin/organization/register",
        organizationData
      );

      if (response.data.success) {
        toast.success("Organization created successfully!", {
          description: "Your organization has been created. Please verify your email first after signing in.",
          duration: 7000,
        });
        setShowCreateAccountModal(false);
      } else {
        toast.error("Failed to create organization", {
          description: response.data.error || "Failed to create organization",
        });
      }
    } catch (error: unknown) {
      console.error("Create organization error:", error);
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.error || "Network error. Please try again."
        : "Network error. Please try again.";

      toast.error("Failed to create organization", {
        description: errorMessage,
      });
    }
  };

  const handleCreateAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCreateAccountModal(true);
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Checking authentication...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign In Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                aria-invalid={!!errors.email}
                disabled={isLoading || isGoogleLoading}
              />
              {errors.email && (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{errors.email}</p>
                  {showResendVerification && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={
                        isResendingVerification || isLoading || isGoogleLoading
                      }
                      className="w-full"
                    >
                      {isResendingVerification ? (
                        <>
                          <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                          Sending...
                        </>
                      ) : (
                        "Resend Verification Email"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                aria-invalid={!!errors.password}
                disabled={isLoading || isGoogleLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Create Account Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </span>
            <button
              onClick={handleCreateAccountClick}
              className="text-primary hover:underline font-medium bg-transparent border-none cursor-pointer"
              disabled={isLoading || isGoogleLoading}
            >
              Create an account
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Add Organization Modal */}
      <AddOrganization
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        onSubmit={handleCreateOrganization}
      />
    </div>
  );
};
