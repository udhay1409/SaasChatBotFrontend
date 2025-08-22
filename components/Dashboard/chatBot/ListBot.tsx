"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Bot,
  MoreVertical,
  Edit,
  Trash2,
  Code,
  Eye,
  Calendar,
  FileText,
  Activity,
  Grid3X3,
  List,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AIBotLoading } from "@/components/ui/ai-bot-loading";
import axiosInstance from "@/lib/axios";

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface ChatBotConfig {
  id: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyCategory: string;
  instructions: string;
  chatEnabled: boolean;
  uploadedDocuments: Array<{
    name: string;
    filename: string;
    size: number;
    type: string;
    path: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Dummy data for chatbots - moved outside component to prevent re-creation
const dummyChatbots: ChatBotConfig[] = [
  {
    id: "1",
    companyName: "TechCorp Solutions",
    companyEmail: "contact@techcorp.com",
    companyPhone: "+1 (555) 123-4567",
    companyAddress: "123 Tech Street, Silicon Valley, CA 94000",
    companyCategory: "Technology",
    instructions:
      "You are a helpful AI assistant for TechCorp Solutions. Provide professional and friendly support to customers about our software products and services.",
    chatEnabled: true,
    uploadedDocuments: [
      {
        name: "company-policies.pdf",
        filename: "policies-123.pdf",
        size: 2048000,
        type: "application/pdf",
        path: "/uploads/policies-123.pdf",
        uploadedAt: "2024-01-15T10:30:00Z",
      },
      {
        name: "product-guide.pdf",
        filename: "guide-456.pdf",
        size: 1536000,
        type: "application/pdf",
        path: "/uploads/guide-456.pdf",
        uploadedAt: "2024-01-16T14:20:00Z",
      },
    ],
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-20T16:45:00Z",
  },
  {
    id: "2",
    companyName: "HealthCare Plus",
    companyEmail: "info@healthcareplus.com",
    companyPhone: "+1 (555) 987-6543",
    companyAddress: "456 Medical Center Dr, Health City, NY 10001",
    companyCategory: "Healthcare",
    instructions:
      "You are a medical information assistant for HealthCare Plus. Provide general health information and guide users to appropriate medical resources.",
    chatEnabled: true,
    uploadedDocuments: [
      {
        name: "medical-faq.pdf",
        filename: "faq-789.pdf",
        size: 3072000,
        type: "application/pdf",
        path: "/uploads/faq-789.pdf",
        uploadedAt: "2024-01-12T11:15:00Z",
      },
    ],
    createdAt: "2024-01-08T14:30:00Z",
    updatedAt: "2024-01-18T10:20:00Z",
  },
  {
    id: "3",
    companyName: "EduLearn Academy",
    companyEmail: "support@edulearn.edu",
    companyPhone: "+1 (555) 456-7890",
    companyAddress: "789 Education Blvd, Learning City, TX 75001",
    companyCategory: "Education",
    instructions:
      "You are an educational assistant for EduLearn Academy. Help students and parents with course information, enrollment, and academic support.",
    chatEnabled: false,
    uploadedDocuments: [],
    createdAt: "2024-01-05T08:15:00Z",
    updatedAt: "2024-01-15T13:30:00Z",
  },
];

export const ListBot = () => {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<ChatBotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    // Get saved view mode from localStorage or default to "grid"
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chatbot-view-mode') as "grid" | "table") || "grid";
    }
    return "grid";
  });

  useEffect(() => {
    const loadChatbots = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/dashboard/user/chatbot");
        if (response.data.success) {
          setChatbots(response.data.data);
        } else {
          toast.error("Failed to load chatbots");
        }
      } catch (error) {
        console.error("Error loading chatbots:", error);
        const errorMessage =
          (error as AxiosError).response?.data?.message ||
          "Failed to load chatbots";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadChatbots();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      await axiosInstance.delete(`/api/dashboard/user/chatbot/${id}`);
      setChatbots((prev) => prev.filter((bot) => bot.id !== id));
      toast.success("Chatbot deleted successfully");
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      const errorMessage =
        (error as AxiosError).response?.data?.message ||
        "Failed to delete chatbot";
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const generateEmbedScript = (configId: string) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://harmless-flea-inviting.ngrok-free.app";

    // Advanced obfuscation - use hex encoding which is HTML-safe
    const generateHash = (value: string) => {
      // Convert string to hex encoding (HTML-safe and case-insensitive)
      return Array.from(value)
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
    };

    // Encode only the configuration attributes (src must remain readable for browser)
    const encodedConfigAttr = generateHash("data-enc-config-id");
    const encodedConfigValue = generateHash(generateHash(configId));
    const encodedBaseAttr = generateHash("data-enc-base-url");
    const encodedBaseValue = generateHash(generateHash(baseUrl));
    const encodedIntegrityAttr = generateHash("data-enc-integrity");
    const encodedIntegrityValue = generateHash(
      `sha256-${generateHash(Date.now().toString())}`
    );
    const encodedCrossoriginAttr = generateHash("data-enc-crossorigin");
    const encodedCrossoriginValue = generateHash("anonymous");

    return `<!-- User AI Chatbot Embed Script --> 
<script 
  src="${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js"
  ${encodedConfigAttr}="${encodedConfigValue}"
  ${encodedBaseAttr}="${encodedBaseValue}"
  ${encodedIntegrityAttr}="${encodedIntegrityValue}"
  ${encodedCrossoriginAttr}="${encodedCrossoriginValue}"
  async>
</script>`;
  };

  const copyEmbedCode = (configId: string) => {
    const embedCode = generateEmbedScript(configId);
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard!");
  };

  const previewChatbot = (configId: string) => {
    const previewUrl = `${process.env.NEXT_PUBLIC_API_URL}/embed/user-chatbot?configId=${configId}`;
    window.open(previewUrl, "_blank");
  };

  const previewChatbotWithAppearance = (configId: string) => {
    const previewUrl = `${
      process.env.NEXT_PUBLIC_API_URL ||
      "https://harmless-flea-inviting.ngrok-free.app"
    }/embed/chatbot-appearance?configId=${configId}`;
    window.open(previewUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <AIBotLoading />
          </div>
        </div>
      </div>
    );
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chatbots.map((chatbot) => (
        <Card key={chatbot.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {chatbot.companyName}
                  </CardTitle>
                  <CardDescription>{chatbot.companyCategory}</CardDescription>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(`/chat-bot/${chatbot.id}`)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/chat-bot/${chatbot.id}/embed`)}
                    className="cursor-pointer"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Embed Code
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => copyEmbedCode(chatbot.id)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Copy Embed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => previewChatbot(chatbot.id)}
                    className="cursor-pointer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => previewChatbotWithAppearance(chatbot.id)}
                    className="cursor-pointer"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="13.5" cy="6.5" r=".5" />
                      <circle cx="17.5" cy="10.5" r=".5" />
                      <circle cx="8.5" cy="7.5" r=".5" />
                      <circle cx="6.5" cy="12.5" r=".5" />
                      <circle cx="12" cy="2" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Customize Appearance
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;
                          {chatbot.companyName}&quot;? This action cannot be
                          undone and will remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(chatbot.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleting === chatbot.id}
                        >
                          {deleting === chatbot.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge variant={chatbot.chatEnabled ? "default" : "secondary"}>
                <Activity className="h-3 w-3 mr-1" />
                {chatbot.chatEnabled ? "Active" : "Disabled"}
              </Badge>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {chatbot.uploadedDocuments?.length || 0} docs
                </div>
              </div>
            </div>

            {/* Instructions Preview */}
            <div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {chatbot.instructions || "No instructions provided"}
              </p>
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Created {new Date(chatbot.createdAt).toLocaleDateString()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => router.push(`/chat-bot/${chatbot.id}`)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => copyEmbedCode(chatbot.id)}
              >
                <Code className="h-3 w-3 mr-1" />
                Embed
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chatbot</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chatbots.map((chatbot) => (
            <TableRow key={chatbot.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{chatbot.companyName}</div>
                    <div className="text-sm text-muted-foreground max-w-[300px] truncate">
                      {chatbot.instructions || "No instructions"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{chatbot.companyCategory}</TableCell>
              <TableCell>
                <Badge variant={chatbot.chatEnabled ? "default" : "secondary"}>
                  <Activity className="h-3 w-3 mr-1" />
                  {chatbot.chatEnabled ? "Active" : "Disabled"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {chatbot.uploadedDocuments?.length || 0}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Date(chatbot.createdAt).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/chat-bot/${chatbot.id}`)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/chat-bot/${chatbot.id}/embed`)
                      }
                      className="cursor-pointer"
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Embed Code
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => copyEmbedCode(chatbot.id)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Copy Embed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => previewChatbot(chatbot.id)}
                      className="cursor-pointer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete&quot;
                            {chatbot.companyName}&quot;? This action cannot be
                            undone and will remove all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(chatbot.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleting === chatbot.id}
                          >
                            {deleting === chatbot.id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Chatbots</h1>
          <p className="text-muted-foreground">
            Create and manage your AI chatbots for websites
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("grid");
                localStorage.setItem('chatbot-view-mode', 'grid');
              }}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("table");
                localStorage.setItem('chatbot-view-mode', 'table');
              }}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => router.push("/chat-bot/create")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Chatbot
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Chatbots
            </CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatbots.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Chatbots
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chatbots.filter((bot) => bot.chatEnabled).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chatbots.reduce(
                (acc, bot) => acc + (bot.uploadedDocuments?.length || 0),
                0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chatbots List */}
      {chatbots.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Bot className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No chatbots yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI chatbot to get started with automated
                customer support
              </p>
              <Button
                onClick={() => router.push("/chat-bot/create")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Chatbot
              </Button>
            </div>
          </div>
        </Card>
      ) : viewMode === "grid" ? (
        renderGridView()
      ) : (
        renderTableView()
      )}
    </div>
  );
};
