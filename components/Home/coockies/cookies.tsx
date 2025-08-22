"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Cookie,
  Shield,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function Cookies() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show on all paths in appLayout
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem("cookies-accepted");
    if (!cookiesAccepted) {
      setIsOpen(true);
    }
  }, []);

  const getBrowserInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      url: window.location.href,
      referrer: document.referrer || "direct",
    };
  };

  const handleAccept = () => {
    // Save acceptance to localStorage and cookies with comprehensive data
    const acceptanceData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: "1.0",
      browserInfo: getBrowserInfo(),
      sessionId: `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    localStorage.setItem("cookies-accepted", JSON.stringify(acceptanceData));
    localStorage.setItem(
      "user-session",
      JSON.stringify({
        sessionId: acceptanceData.sessionId,
        startTime: acceptanceData.timestamp,
        browserInfo: acceptanceData.browserInfo,
      })
    );

    // Also save to document cookies
    document.cookie = `cookies-accepted=${JSON.stringify(
      acceptanceData
    )}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year

    // Save session info separately in cookies
    document.cookie = `user-session=${JSON.stringify({
      sessionId: acceptanceData.sessionId,
      accepted: true,
      timestamp: acceptanceData.timestamp,
    })}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year

    setIsOpen(false);
  };

  const handleDecline = () => {
    // Save decline to localStorage with comprehensive data
    const declineData = {
      accepted: false,
      timestamp: new Date().toISOString(),
      version: "1.0",
      browserInfo: getBrowserInfo(),
      sessionId: `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    localStorage.setItem("cookies-accepted", JSON.stringify(declineData));
    localStorage.setItem(
      "user-session",
      JSON.stringify({
        sessionId: declineData.sessionId,
        startTime: declineData.timestamp,
        browserInfo: declineData.browserInfo,
      })
    );

    document.cookie = `cookies-accepted=${JSON.stringify(
      declineData
    )}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days

    // Save session info separately in cookies
    document.cookie = `user-session=${JSON.stringify({
      sessionId: declineData.sessionId,
      accepted: false,
      timestamp: declineData.timestamp,
    })}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-lg border-2 shadow-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mb-2">
            <Cookie className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Cookie Preferences
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-muted-foreground">
            We use cookies to enhance your browsing experience and provide
            personalized content. Choose your preference below to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-300">
                  Essential Cookies
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Required for basic site functionality and security
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                  Analytics Cookies
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Help us understand how you interact with our site
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-800 dark:text-purple-300">
                  Preference Cookies
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Remember your settings and personalize your experience
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/50 rounded-lg">
            <p>
              Your privacy matters to us. You can change these settings anytime
              in your browser preferences.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="w-full sm:w-auto group hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 transition-all duration-200"
          >
            <XCircle className="w-4 h-4 mr-2 group-hover:text-red-500 transition-colors" />
            Decline All
          </Button>
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Accept All Cookies
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
