"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Bot, Activity, ClipboardList } from "lucide-react";
import { Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";

interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  subscription?: string;
  chatbotsLimit?: number;
}

interface UserDashboardProps {
  user?: User;
}

interface UserChatBot {
  id: string;
  companyName: string;
  companyCategory: string;
  chatEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  uploadedDocuments: Array<{
    name: string;
    size: number;
  }>;
}

interface DashboardStats {
  totalChatbots: number;
  enabledChatbots: number;
  totalDocuments: number;
  chatbotsLimit: number;
  recentChatbots: UserChatBot[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalChatbots: 0,
    enabledChatbots: 0,
    totalDocuments: 0,
    chatbotsLimit: 1,
    recentChatbots: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch user's chatbots
      const chatbotsResponse = await axiosInstance.get(
        "/api/dashboard/user/chatbot"
      );

      const chatbots = chatbotsResponse.data.data || [];
      const enabledChatbots = chatbots.filter(
        (bot: UserChatBot) => bot.chatEnabled
      ).length;

      // Calculate total documents across all chatbots
      const totalDocuments = chatbots.reduce(
        (total: number, bot: UserChatBot) => {
          return total + (bot.uploadedDocuments?.length || 0);
        },
        0
      );

      // Get recent chatbots (last 5)
      const recentChatbots = chatbots.slice(0, 5);

      setStats({
        totalChatbots: chatbots.length,
        enabledChatbots,
        totalDocuments,
        chatbotsLimit: user?.chatbotsLimit || 1,
        recentChatbots,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.chatbotsLimit]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  const getSubscriptionBadge = () => {
    const subscription = user?.subscription || "free";
    const colors = {
      free: "bg-gray-100 text-gray-800",
      pro: "bg-blue-100 text-blue-800",
      enterprise: "bg-purple-100 text-purple-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[subscription as keyof typeof colors] || colors.free
        }`}
      >
        {subscription.charAt(0).toUpperCase() + subscription.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user?.name || "User"}!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              Here&apos;s your dashboard overview
            </p>
            {getSubscriptionBadge()}
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">My Chatbots</CardTitle>
            <Bot className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChatbots}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalChatbots} of {stats.chatbotsLimit} used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Active Chatbots
            </CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enabledChatbots}</div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Uploaded files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Account Status
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.subscription === "free" ? "Free" : "Premium"}
            </div>
            <p className="text-xs text-muted-foreground">Current plan</p>
          </CardContent>
        </Card>
      </div>

      {/* My Chatbots */}
      <Card>
        <CardHeader>
          <CardTitle>My Chatbots</CardTitle>
          <CardDescription>Your recent chatbot configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {stats.recentChatbots.map((chatbot) => (
              <div
                key={chatbot.id}
                className="flex items-center gap-4 p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Bot
                    className={`h-4 w-4 ${
                      chatbot.chatEnabled ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{chatbot.companyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {chatbot.companyCategory} •
                      {chatbot.chatEnabled ? " Enabled" : " Disabled"} •
                      {chatbot.uploadedDocuments?.length || 0} documents
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTimeAgo(chatbot.updatedAt)}
                </div>
              </div>
            ))}

            {stats.recentChatbots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No chatbots yet</p>
                <p className="text-sm">
                  Create your first chatbot to get started
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
