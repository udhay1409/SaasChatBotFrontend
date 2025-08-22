"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
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

interface DocumentMetadata {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  filename?: string;
  path?: string; 
}

interface ChatBotConfig {
  id?: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyCategory: string;
  instructions: string;
  chatEnabled: boolean;
  uploadedDocuments: (File | DocumentMetadata)[];
}

export const ChatBot = () => {
  const router = useRouter();
  const params = useParams();
  const isEditMode = !!params?.id;

  const [config, setConfig] = useState<ChatBotConfig>({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyCategory: "",
    instructions: "",
    chatEnabled: true,
    uploadedDocuments: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [userLimit, setUserLimit] = useState(1);
  const [currentCount, setCurrentCount] = useState(0);

  const companyCategories = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Consulting",
    "Real Estate",
    "Food & Beverage",
    "Other",
  ];

  // Check user limit and load data on component mount
  useEffect(() => {
    const checkLimitAndLoadData = async () => {
      setLoading(true);
      
      try {
        // Get user data from localStorage
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
        
        setUserLimit(limit);

        // Get current chatbot count
        const chatbotsResponse = await axiosInstance.get("/api/dashboard/user/chatbot");
        const currentChatbots = chatbotsResponse.data.success ? chatbotsResponse.data.data : [];
        setCurrentCount(currentChatbots.length);

        // Check if limit is reached for new chatbot creation
        if (!isEditMode && currentChatbots.length >= limit) {
          setLimitReached(true);
          setLoading(false);
          return;
        }

        // Load existing chatbot data if in edit mode
        if (isEditMode && params?.id) {
          try {
            const response = await axiosInstance.get(
              `/api/dashboard/user/chatbot/${params.id}`
            );
            if (response.data.success) {
              const chatbot = response.data.data;
              setConfig({
                id: chatbot.id,
                companyName: chatbot.companyName,
                companyEmail: chatbot.companyEmail,
                companyPhone: chatbot.companyPhone,
                companyAddress: chatbot.companyAddress,
                companyCategory: chatbot.companyCategory,
                instructions: chatbot.instructions,
                chatEnabled: chatbot.chatEnabled,
                uploadedDocuments: chatbot.uploadedDocuments || [],
              });
            } else {
              toast.error("Chatbot not found");
              router.push("/chat-bot");
            }
          } catch (error) {
            console.error("Error loading chatbot:", error);
            toast.error("Failed to load chatbot");
            router.push("/chat-bot");
          }
        }
      } catch (error) {
        console.error("Error checking limit:", error);
        toast.error("Failed to load chatbot data");
      } finally {
        setLoading(false);
      }
    };

    checkLimitAndLoadData();
  }, [isEditMode, params?.id, router]);

  const handleInputChange = (
    field: keyof ChatBotConfig,
    value: string | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).filter(
        (file) =>
          file.type === "application/pdf" ||
          file.type === "text/plain" ||
          file.type === "application/msword" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      if (newFiles.length === 0) {
        toast.error("Please select valid file types (PDF, DOC, DOCX, TXT)");
        return;
      }

      setConfig((prev) => ({
        ...prev,
        uploadedDocuments: [...prev.uploadedDocuments, ...newFiles] as (
          | File
          | DocumentMetadata
        )[],
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeDocument = (index: number) => {
    // Simply remove from local state (no API call)
    setConfig((prev) => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.filter((_, i) => i !== index),
    }));
    toast.success("Document removed successfully");
  };

  const handleSave = async () => {
    // Validate required fields
    if (
      !config.companyName ||
      !config.companyEmail ||
      !config.companyPhone ||
      !config.companyAddress ||
      !config.companyCategory ||
      !config.instructions
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.companyEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        companyName: config.companyName,
        companyEmail: config.companyEmail,
        companyPhone: config.companyPhone,
        companyAddress: config.companyAddress,
        companyCategory: config.companyCategory,
        instructions: config.instructions,
        chatEnabled: config.chatEnabled,
      };

      let response;
      if (config.id) {
        // Update existing configuration
        response = await axiosInstance.put(
          `/api/dashboard/user/chatbot/${config.id}`,
          payload
        );
        toast.success("Chatbot updated successfully");
      } else {
        // Create new configuration
        response = await axiosInstance.post(
          "/api/dashboard/user/chatbot",
          payload
        );
        const newChatbot = response.data.data;
        setConfig((prev) => ({
          ...prev,
          id: newChatbot.id,
        }));
        toast.success("Chatbot created successfully");

        // Handle file uploads if there are any new files
        const newFiles = config.uploadedDocuments.filter(
          (doc) => doc instanceof File
        );
        if (newFiles.length > 0) {
          await handleFileUploads(newChatbot.id, newFiles as File[]);
        }

        // Redirect to chatbot list after creation
        setTimeout(() => {
          router.push("/chat-bot");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving chatbot:", error);
      const errorMessage =
        (error as AxiosError).response?.data?.message || "Failed to save chatbot";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUploads = async (chatbotId: string, files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("documents", file);
      });

      await axiosInstance.post(
        `/api/dashboard/user/chatbot/${chatbotId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(`${files.length} document(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading files:", error);
      const errorMessage =
        (error as AxiosError).response?.data?.message || "Failed to upload documents";
      toast.error(errorMessage);
    }
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

  // Show limit reached message for new chatbot creation
  if (limitReached && !isEditMode) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-6">
            {/* Limit Reached Icon */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-8V7m0 0V5m0 2h2m-2 0H8" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Chatbot Limit Reached</h2>
              <div className="space-y-2">
                <p className="text-gray-600 max-w-md">
                  You&apos;ve reached your chatbot limit of <span className="font-semibold">{userLimit}</span> chatbot{userLimit > 1 ? 's' : ''}.
                </p>
                <p className="text-sm text-gray-500">
                  Currently using: <span className="font-medium">{currentCount}/{userLimit}</span>
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Usage</span>
                <span>{Math.round((currentCount / userLimit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((currentCount / userLimit) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => {
                  // TODO: Implement upgrade functionality
                  toast.info("Upgrade feature coming soon!");
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                Upgrade Plan
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push("/chat-bot")}
                className="px-6"
              >
                View My Chatbots
              </Button>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-gray-200 max-w-md">
              <p className="text-xs text-gray-500">
                To create more chatbots, upgrade your plan or delete an existing chatbot to free up space.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {isEditMode ? "Edit Chatbot Configuration" : "Create New Chatbot"}
            <div className="flex items-center space-x-2">
              <Label htmlFor="chat-enabled">
                {config.chatEnabled ? "Enabled" : "Disabled"}
              </Label>
              <Switch
                id="chat-enabled"
                checked={config.chatEnabled}
                onCheckedChange={(checked) =>
                  handleInputChange("chatEnabled", checked)
                }
              />
            </div>
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update your chatbot settings and behavior"
              : "Configure your new chatbot settings and behavior"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  placeholder="Enter your company name"
                  value={config.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-email">Company Email *</Label>
                <Input
                  id="company-email"
                  type="email"
                  placeholder="Enter your company email"
                  value={config.companyEmail}
                  onChange={(e) =>
                    handleInputChange("companyEmail", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-phone">Company Phone *</Label>
                <Input
                  id="company-phone"
                  type="tel"
                  placeholder="Enter your company phone number"
                  value={config.companyPhone}
                  onChange={(e) =>
                    handleInputChange("companyPhone", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-category">Company Category *</Label>
                <Select
                  value={config.companyCategory}
                  onValueChange={(value) =>
                    handleInputChange("companyCategory", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your company category" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-address">Company Address *</Label>
              <Textarea
                id="company-address"
                placeholder="Enter your company address"
                className="min-h-[80px]"
                value={config.companyAddress}
                onChange={(e) =>
                  handleInputChange("companyAddress", e.target.value)
                }
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions *</Label>
              <Textarea
                id="instructions"
                placeholder="Enter detailed instructions for your chatbot behavior, tone, and response style..."
                className="min-h-[120px]"
                value={config.instructions}
                onChange={(e) =>
                  handleInputChange("instructions", e.target.value)
                }
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOC, DOCX, and TXT files
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Uploaded Documents List */}
            {Array.isArray(config.uploadedDocuments) &&
              config.uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Documents</Label>
                  <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.uploadedDocuments.map(
                      (file: File | DocumentMetadata, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {file.name || "Unknown file"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {file.size
                                  ? (file.size / 1024 / 1024).toFixed(2) + " MB"
                                  : "Size unknown"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center space-x-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>
                {saving
                  ? config.id
                    ? "Updating..."
                    : "Saving..."
                  : config.id
                  ? "Update Configuration"
                  : "Save Configuration"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
