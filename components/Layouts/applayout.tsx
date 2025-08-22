"use client";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Home/navbar/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ChatBot } from "@/components/Home/chatbot";
import { Cookies } from "@/components/Home/coockies/cookies";
import { DisabledAccountToast } from "@/components/auth/DisabledAccountToast";
import axiosInstance from "@/lib/axios";
import SplashCursor from "@/components/ui/splash-cursor";
 

interface AppLayoutProps {
  children: React.ReactNode;
}

interface ChatBotConfig {
  id: string;
  companyName: string;
  companyCategory?: string;
  instructions?: string;
  exampleConversation?: string;
  chatEnabled: boolean;
  uploadedDocuments?: Array<{
    name: string;
    filename: string;
    size: number;
    type: string;
    path: string;
    uploadedAt: string;
  }>;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [chatBotEnabled, setChatBotEnabled] = useState<boolean>(false);
  const [chatBotConfig, setChatBotConfig] = useState<ChatBotConfig | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chatbot configuration to check if it's enabled
  useEffect(() => {
    const fetchChatBotConfig = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/dashboard/settings/chat-bot"
        );

        if (response.data.success && response.data.data.length > 0) {
          const config = response.data.data[0]; // Get first configuration
          setChatBotConfig(config);
          setChatBotEnabled(config.chatEnabled || false);
        } else {
          // No configuration found, disable chatbot
          setChatBotEnabled(false);
        }
      } catch (error) {
        console.error("Error fetching chatbot configuration:", error);
        // On error, disable chatbot
        setChatBotEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatBotConfig();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Toaster
          position="top-center"
          toastOptions={{
            className: "border-2 border-border shadow-xl rounded-lg text-base",
            duration: 4000,
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
              padding: "16px 20px",
              minWidth: "350px",
              maxWidth: "500px",
            },
          }}
          richColors
          expand
          gap={12}
        />

        <SplashCursor />

        {/* Conditionally render ChatBot only if enabled and not loading */}
        {!isLoading && chatBotEnabled && chatBotConfig && (
          <ChatBot
            configId={chatBotConfig.id}
            companyName={chatBotConfig.companyName}
          />
        )}

        <Cookies />

        {/* Disabled Account Toast Handler */}
        <DisabledAccountToast />
      </div>
    </ErrorBoundary>
  );
}
