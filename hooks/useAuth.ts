"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";
import axiosInstance from "@/lib/axios";

// Type guard for axios error responses
const isAxiosError = (
  error: unknown
): error is {
  response?: { status: number; data?: { errorType?: string } };
} => {
  return typeof error === "object" && error !== null && "response" in error;
};

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Small delay to prevent hydration issues
        await new Promise((resolve) => setTimeout(resolve, 100));

        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        // Don't redirect on root path
        const isRootPath = window.location.pathname === "/";

        if (!token || !userData) {
          if (requireAuth && !isRootPath) {
            router.replace("/signin");
          }
          setIsLoading(false);
          return;
        }

        // Validate token expiry
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;

          if (payload.exp <= currentTime) {
            // Token expired
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (requireAuth) {
              router.replace("/signin");
            }
            setIsLoading(false);
            return;
          }
        } catch (tokenError) {
          // Invalid token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (requireAuth) {
            router.replace("/signin");
          }
          setIsLoading(false);
          return;
        }

        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Verify user is still active with the server and session is valid
          const isCallbackPage =
            window.location.pathname.includes("/callback") ||
            window.location.pathname.includes("/auth/") ||
            window.location.pathname === "/signin" ||
            window.location.pathname === "/signup";

          if (requireAuth && token && !isCallbackPage) {
            try {
              await axiosInstance.get("/api/auth/me");
            } catch (error: unknown) {
              // Handle different error types
              if (
                isAxiosError(error) &&
                error.response?.status === 401 &&
                (error.response?.data?.errorType === "SESSION_EXPIRED" ||
                  error.response?.data?.errorType === "TOKEN_EXPIRED" ||
                  error.response?.data?.errorType === "INVALID_TOKEN")
              ) {
                // Session expired or invalid token - clear and redirect
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                if (requireAuth) {
                  router.replace("/signin");
                }
                return;
              }

              if (
                isAxiosError(error) &&
                error.response?.status === 403 &&
                error.response?.data?.errorType === "ACCOUNT_DISABLED"
              ) {
                // Account disabled - clear and redirect
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                if (requireAuth) {
                  router.replace("/signin");
                }
                return;
              }

              if (
                isAxiosError(error) &&
                error.response?.status === 401 &&
                error.response?.data?.errorType === "EMAIL_NOT_VERIFIED"
              ) {
                // Email not verified - clear and redirect
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                if (requireAuth) {
                  router.replace("/signin");
                }
                return;
              }

              // For other errors, we might want to handle them differently
              // but don't log them to console unless they're unexpected
            }
          }
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (requireAuth) {
            router.replace("/signin");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (requireAuth) {
          router.replace("/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up periodic check for user status (every 30 seconds) - but not for admins
    let statusCheckInterval: NodeJS.Timeout;
    if (requireAuth && typeof window !== "undefined") {
      statusCheckInterval = setInterval(async () => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        // Skip periodic checks on callback/auth pages
        const isCallbackPage =
          window.location.pathname.includes("/callback") ||
          window.location.pathname.includes("/auth/") ||
          window.location.pathname === "/signin" ||
          window.location.pathname === "/signup";

        if (token && isAuthenticated && userData && !isCallbackPage) {
          try {
            const parsedUser = JSON.parse(userData);
            // Skip status check for admin users
            if (parsedUser.role === "admin") {
              return;
            }

            await axiosInstance.get("/api/auth/me");
          } catch (error: unknown) {
            // Handle session expiration and other auth errors
            if (
              isAxiosError(error) &&
              error.response?.status === 401 &&
              (error.response?.data?.errorType === "SESSION_EXPIRED" ||
                error.response?.data?.errorType === "TOKEN_EXPIRED" ||
                error.response?.data?.errorType === "INVALID_TOKEN")
            ) {
              // Session expired - clear and redirect
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
              setIsAuthenticated(false);
              clearInterval(statusCheckInterval);
              router.replace("/signin");
              return;
            }

            if (
              isAxiosError(error) &&
              error.response?.status === 403 &&
              error.response?.data?.errorType === "ACCOUNT_DISABLED"
            ) {
              // Account disabled - clear and redirect
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
              setIsAuthenticated(false);
              clearInterval(statusCheckInterval);
              router.replace("/signin");
              return;
            }

            if (
              isAxiosError(error) &&
              error.response?.status === 401 &&
              error.response?.data?.errorType === "EMAIL_NOT_VERIFIED"
            ) {
              // Email not verified - clear and redirect
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
              setIsAuthenticated(false);
              clearInterval(statusCheckInterval);
              router.replace("/signin");
              return;
            }

            // For other errors, we might want to handle them differently
            // but don't log them to console unless they're unexpected
          }
        }
      }, 30000); // Check every 30 seconds
    }

    // Cleanup interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [router, requireAuth, isAuthenticated]);

  const logout = async () => {
    try {
      // Call backend logout endpoint to clean up session
      const token = localStorage.getItem("token");
      if (token) {
        await axiosInstance.post("/api/auth/logout");
      }
    } catch (error) {
      // Continue with logout even if backend call fails
      console.warn("Failed to logout from backend:", error);
    } finally {
      // Always clean up frontend state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/signin");
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    router.replace("/dashboard");
  };

  const updateUser = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    login,
    updateUser,
  };
};
