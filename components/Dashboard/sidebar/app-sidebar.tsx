"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronsUpDown,
  Home,
  LogOut,
  Settings,
  Mail,
  Bot,
  Building2,
  Shield,
  Crown,
  TrendingUp,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@/types/auth";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// Add enhanced CSS animations for progress bar
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  @keyframes upgradeGlow {
    0%, 100% { 
      box-shadow: 0 0 5px rgba(168, 85, 247, 0.4), 0 0 10px rgba(236, 72, 153, 0.3);
    }
    50% { 
      box-shadow: 0 0 10px rgba(168, 85, 247, 0.6), 0 0 20px rgba(236, 72, 153, 0.5);
    }
  }
  
  @keyframes buttonPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  @keyframes progressShine {
    0% { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(200%) skewX(-15deg); }
  }
  
  @keyframes progressGlow {
    0%, 100% { 
      box-shadow: 0 0 4px rgba(168, 85, 247, 0.3), 0 0 8px rgba(236, 72, 153, 0.2);
    }
    50% { 
      box-shadow: 0 0 8px rgba(168, 85, 247, 0.5), 0 0 16px rgba(236, 72, 153, 0.4);
    }
  }
  
  @keyframes progressPulse {
    0%, 100% { 
      transform: scaleY(1);
      opacity: 1;
    }
    50% { 
      transform: scaleY(1.1);
      opacity: 0.9;
    }
  }
  
  @keyframes progressWave {
    0% { 
      background-position: 0% 50%;
    }
    50% { 
      background-position: 100% 50%;
    }
    100% { 
      background-position: 0% 50%;
    }
  }
  
  @keyframes progressFill {
    0% { 
      width: 0%;
      opacity: 0.7;
    }
    100% { 
      opacity: 1;
    }
  }
  
  @keyframes sparkle {
    0%, 100% { 
      opacity: 0;
      transform: scale(0.5) rotate(0deg);
    }
    50% { 
      opacity: 1;
      transform: scale(1) rotate(180deg);
    }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  .animate-glow {
    animation: glow 2s infinite;
  }
  
  .animate-upgrade-glow {
    animation: upgradeGlow 2s infinite;
  }
  
  .animate-button-pulse {
    animation: buttonPulse 2s infinite;
  }
  
  .animate-progress-shine {
    animation: progressShine 3s infinite;
  }
  
  .animate-progress-glow {
    animation: progressGlow 2s infinite;
  }
  
  .animate-progress-pulse {
    animation: progressPulse 1.5s infinite;
  }
  
  .animate-progress-wave {
    animation: progressWave 4s infinite;
    background-size: 200% 200%;
  }
  
  .animate-progress-fill {
    animation: progressFill 1s ease-out;
  }
  
  .animate-sparkle {
    animation: sparkle 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerKeyframes;
  document.head.appendChild(styleSheet);
}

// Admin Navigation
const ADMIN_NAVIGATION = [
  {
    section: "Admin Panel",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      {
        title: "Organizations",
        url: "/dashboard/organizations",
        icon: Building2,
      },
    ],
  },
];

// User Navigation
const USER_NAVIGATION = [
  {
    section: "Platform",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Chat Bot", url: "/chat-bot", icon: Bot },
    ],
  },
];

// Admin Settings Navigation
const ADMIN_SETTINGS = [
  // { title: "General", url: "/dashboard/settings/general", icon: Settings },
  {
    title: "Email Configuration",
    url: "/dashboard/settings/email-configuration",
    icon: Mail,
  },
];

// User Settings Navigation
const USER_SETTINGS = [
  { title: "General", url: "/settings/general", icon: Settings },
];

// Navigation interfaces
interface NavigationItem { 
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface NavigationSection {
  section: string;
  items: NavigationItem[];
}

interface TeamData {
  name: string;
  logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subtitle: string;
}

interface NavigationConfig {
  sections: NavigationSection[];
  teamData: TeamData;
}

// Role-based navigation function
const getNavigationByRole = (user: User | null): NavigationConfig => {
  // Check if user is admin
  if (user?.role === "admin" || user?.userType === "admin") {
    return {
      sections: ADMIN_NAVIGATION,
      teamData: {
        name: "System Admin",
        logo: Shield,
        subtitle: "Administrator",
      },
    };
  }
  // Regular user
  else {
    return {
      sections: USER_NAVIGATION,
      teamData: {
        name: "User Dashboard",
        logo: Building2,
        subtitle: "User Dashboard",
      },
    };
  }
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);
  const [navigation, setNavigation] = React.useState<NavigationConfig | null>(
    null
  );
  const [chatbotUsage, setChatbotUsage] = React.useState({
    current: 0,
    limit: 1,
    loading: true,
  });

  React.useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
 
        // Set navigation based on user role
        const nav = getNavigationByRole(parsedUser);
        setNavigation(nav);

        // Load chatbot usage for non-admin users
        if (parsedUser.role !== "admin") {
          loadChatbotUsage();
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Listen for chatbot changes and refresh usage
  React.useEffect(() => {
    const handleChatbotChange = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.role !== "admin") {
            console.log("🔄 Refreshing chatbot usage due to chatbot change");
            loadChatbotUsage();
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };

    // Listen for custom events
    window.addEventListener('chatbotCreated', handleChatbotChange);
    window.addEventListener('chatbotDeleted', handleChatbotChange);
    window.addEventListener('chatbotUpdated', handleChatbotChange);

    // Listen for storage changes (in case user data is updated)
    window.addEventListener('storage', handleChatbotChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('chatbotCreated', handleChatbotChange);
      window.removeEventListener('chatbotDeleted', handleChatbotChange);
      window.removeEventListener('chatbotUpdated', handleChatbotChange);
      window.removeEventListener('storage', handleChatbotChange);
    };
  }, []);

  // Auto-refresh chatbot usage every 30 seconds for real-time updates
  React.useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== "admin") {
          const interval = setInterval(() => {
            console.log("🔄 Auto-refreshing chatbot usage");
            loadChatbotUsage();
          }, 30000); // 30 seconds

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [user]);

  const loadChatbotUsage = async () => {
    try {
      setChatbotUsage((prev) => ({ ...prev, loading: true }));

      const response = await axiosInstance.get("/api/dashboard/user/chatbot");

      if (response.data.success) {
        const chatbots = response.data.data;
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;

        // Determine limit based on organization or user
        let limit = 1; // Default for individual users
        
        if (user?.organizationId) {
          // For organization users, get organization limits
          try {
            const orgResponse = await axiosInstance.get(`/api/dashboard/admin/organization/getorganizationbyid/${user.organizationId}`);
            if (orgResponse.data.success) {
              limit = orgResponse.data.data.chatbotsLimit || 2; // Default 2 for organizations
            }
          } catch (orgError) {
            console.warn("Could not fetch organization limits, using user limit");
            limit = user?.chatbotsLimit || 1;
          }
        } else {
          // Individual user
          limit = user?.chatbotsLimit || 1;
        }

        setChatbotUsage({
          current: chatbots.length,
          limit: limit,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error loading chatbot usage:", error);
      setChatbotUsage((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/signin");
  };

  // Helper function to check if a path is active
  const isActive = (url: string): boolean => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  // Helper function to check if settings section is active
  const isSettingsActive = () => {
    return (
      pathname.startsWith("/settings") ||
      pathname.startsWith("/dashboard/settings")
    );
  };

  const getSettingsMenu = (userRole: string | undefined) => {
    return userRole === "admin" ? ADMIN_SETTINGS : USER_SETTINGS;
  };

  const handleUpgrade = () => {
    toast.info("Upgrade feature coming soon!");
    // TODO: Implement upgrade functionality
  };

  const getUsageColor = () => {
    const percentage = (chatbotUsage.current / chatbotUsage.limit) * 100;
    if (percentage >= 100) return "text-red-500";
    if (percentage >= 80) return "text-yellow-500";
    return "text-green-500";
  };

  // Use consistent purple-pink gradient for both progress bar and upgrade button
  const getPurplePinkGradient = () => {
    return {
      gradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
      hoverGradient: "linear-gradient(135deg, #9333ea 0%, #db2777 100%)",
      shadowColor: "rgba(168, 85, 247, 0.4)"
    };
  };

  const CustomProgressBar = ({ value }: { value: number }) => {
    const gradientStyle = getPurplePinkGradient();
    const percentage = (chatbotUsage.current / chatbotUsage.limit) * 100;
    
    return (
      <div className="relative group">
        {/* Custom progress bar with enhanced animations */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full relative overflow-hidden animate-progress-fill animate-progress-glow"
            style={{
              width: `${Math.min(value, 100)}%`,
              background: `linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #a855f7 100%)`,
              backgroundSize: '200% 100%',
              animation: 'progressFill 1s ease-out, progressGlow 2s infinite, progressWave 4s infinite'
            }}
          >
            {/* Primary shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-progress-shine" />
            
            {/* Secondary shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/30 to-transparent animate-shimmer" 
                 style={{ animationDelay: '1s' }} />
            
            {/* Pulse effect when at high usage */}
            {percentage >= 80 && (
              <div className="absolute inset-0 bg-white/10 animate-progress-pulse" />
            )}
            
            {/* Sparkle effects for full progress */}
            {percentage >= 100 && (
              <>
                <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-sparkle" 
                     style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-0 right-1/3 w-1 h-1 bg-white rounded-full animate-sparkle" 
                     style={{ animationDelay: '1.5s' }} />
                <div className="absolute bottom-0 left-2/3 w-1 h-1 bg-white rounded-full animate-sparkle" 
                     style={{ animationDelay: '2.5s' }} />
              </>
            )}
          </div>
        </div>
        
        {/* Enhanced progress indicator dots */}
        {chatbotUsage.limit > 1 && (
          <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2">
            {Array.from({ length: chatbotUsage.limit }, (_, i) => (
              <div
                key={i}
                className={`absolute top-0 w-1 h-1 rounded-full transform -translate-y-1/2 transition-all duration-300 ${
                  i < chatbotUsage.current 
                    ? 'bg-white shadow-sm animate-glow' 
                    : 'bg-gray-400/60 hover:bg-gray-300/80'
                }`}
                style={{
                  left: `${((i + 1) / chatbotUsage.limit) * 100}%`,
                  marginLeft: '-2px',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
             style={{
               background: `radial-gradient(ellipse at center, ${gradientStyle.shadowColor} 0%, transparent 70%)`,
               filter: 'blur(4px)'
             }} />
      </div>
    );
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {navigation?.teamData?.logo && (
                      <navigation.teamData.logo className="size-4" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {navigation?.teamData?.name || "Loading..."}
                    </span>
                    <span className="truncate text-xs">
                      {navigation?.teamData?.subtitle || ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navigation?.sections?.map(
          (section: NavigationSection, index: number) => (
            <SidebarGroup key={index}>
              <SidebarGroupLabel>{section.section}</SidebarGroupLabel>
              <SidebarMenu>
                {section.items.map((item: NavigationItem) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Chatbot Usage Card - Only for non-admin users */}
          {user?.role !== "admin" && (
            <SidebarMenuItem>
              {/* Full card for expanded sidebar */}
              <div className="group-data-[collapsible=icon]:hidden">
                <Card className="mx-2 mb-2">
                  <CardContent className="p-3 space-y-2">
                    {/* Header with Bot Icon */}
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-md">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">Chatbots</span>
                          <span
                            className={`text-xs font-bold ${getUsageColor()}`}
                          >
                            {chatbotUsage.loading
                              ? "..."
                              : `${chatbotUsage.current}/${chatbotUsage.limit}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Custom Progress Bar */}
                    {!chatbotUsage.loading && (
                      <div className="space-y-2">
                        <CustomProgressBar 
                          value={(chatbotUsage.current / chatbotUsage.limit) * 100} 
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {chatbotUsage.current === chatbotUsage.limit
                              ? "Limit reached"
                              : `${
                                  chatbotUsage.limit - chatbotUsage.current
                                } remaining`}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0.5"
                          >
                            Free
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                     
                      {/* Upgrade Button - Always show for non-admin users */}
                      {!chatbotUsage.loading && (
                        <Button
                          onClick={handleUpgrade}
                          size="sm"
                          className="w-full h-8 text-white border-0 shadow-sm relative overflow-hidden animate-button-pulse"
                          style={{
                            background: getPurplePinkGradient().gradient,
                            boxShadow: `0 0 10px ${getPurplePinkGradient().shadowColor}`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = getPurplePinkGradient().hoverGradient;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = getPurplePinkGradient().gradient;
                          }}
                        >
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                          
                          <Crown className="mr-1.5 h-3 w-3 relative z-10" />
                          <span className="text-xs font-medium relative z-10">
                            {user?.organizationId ? "Contact Admin" : "Upgrade Plan"}
                          </span>
                          <TrendingUp className="ml-1.5 h-3 w-3 relative z-10" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Compact version for collapsed sidebar */}
              <div className="hidden group-data-[collapsible=icon]:block">
                <SidebarMenuButton
                  tooltip={`Chatbots: ${chatbotUsage.loading ? "..." : `${chatbotUsage.current}/${chatbotUsage.limit}`}`}
                  className="relative"
                >
                  <div className="relative">
                    <Bot className="h-4 w-4" />
                    {!chatbotUsage.loading && (
                      <Badge 
                        variant="secondary" 
                        className={`absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center ${getUsageColor()}`}
                      >
                        {chatbotUsage.current}
                      </Badge>
                    )}
                  </div>
                </SidebarMenuButton>
              </div>
            </SidebarMenuItem>
          )}

          {/* Settings Dropdown */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip="Settings"
                  isActive={isSettingsActive()}
                >
                  <Settings />
                  <span>Settings</span>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {getSettingsMenu(user?.role).map((item) => (
                    <DropdownMenuItem
                      key={item.url}
                      className="cursor-pointer"
                      asChild
                    >
                      <Link href={item.url}>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          {/* User Profile Dropdown */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name || "Loading..."}
                    </span>
                    <span className="truncate text-xs">
                      {user?.role === "admin"
                        ? "Administrator"
                        : user?.email || ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.image} alt={user?.name} />
                      <AvatarFallback className="rounded-lg">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name || "Loading..."}
                      </span>
                      <span className="truncate text-xs">
                        {user?.email || ""}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
