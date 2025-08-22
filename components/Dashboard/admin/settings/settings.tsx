"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailConfiguration } from "./emailconfiguration/email-configuration";
// import { GeneralSettings } from "./general/general-settings";
import { ChatBotSettings } from "./chatBot/Bot";
import { useEffect, useState } from "react";

export const Settings = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("general");

  // Get tab from URL path
  useEffect(() => {
    if (pathname === "/dashboard/settings" || pathname === "/dashboard/settings/general") {
      setActiveTab("general");
    } else {
      const pathSegments = pathname.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];

      if (
        lastSegment === "email-configuration"   || 
        lastSegment === "chatbot"
      ) {
        setActiveTab(lastSegment);
      } else {
        setActiveTab("general");
      }
    }
  }, [pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Navigate to the appropriate URL
    if (value === "general") {
      router.push("/dashboard/settings/general");
    } else {
      router.push(`/dashboard/settings/${value}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          {/* <TabsTrigger value="general">General</TabsTrigger> */}
          <TabsTrigger value="email-configuration">
            Email Configuration
          </TabsTrigger>
        
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
        </TabsList>

        {/* <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent> */}

        <TabsContent value="email-configuration" className="mt-6">
          <EmailConfiguration />
        </TabsContent>

        <TabsContent value="chatbot" className="mt-6">
          <ChatBotSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
