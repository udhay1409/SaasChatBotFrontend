"use client";

import { useState, useEffect } from "react";
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
import { Upload, FileText, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import axiosInstance from "@/lib/axios";

interface DocumentMetadata {
  name: string; 
  size: number;
  type: string;
  uploadedAt: string;
}

interface ChatBotConfig {
  id?: string;
  companyName: string;
  companyCategory: string;
  instructions: string;
  exampleConversation: string;
  chatEnabled: boolean;
  uploadedDocuments: (File | DocumentMetadata)[];
}

export const ChatBotSettings = () => {
  const [config, setConfig] = useState<ChatBotConfig>({
    companyName: "",
    companyCategory: "",
    instructions: "",
    exampleConversation: "",
    chatEnabled: true,
    uploadedDocuments: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, setExistingConfigs] = useState<ChatBotConfig[]>([]);

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

  // Generate embed script for the chatbot
  const generateEmbedScript = (configId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://saaschatbotbackend.onrender.com";
    
    return `<!-- AI Chatbot Embed Script - Exact React Component -->
<script 
  src="${baseUrl}/public/chatbot-widget.js"
  data-config-id="${configId}"
  data-base-url="${baseUrl}"
  async>
</script>`;
  }

  // Fetch existing configurations on component mount
  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/api/dashboard/settings/chat-bot"
      );

      if (response.data.success && response.data.data.length > 0) {
        setExistingConfigs(response.data.data);
        // Load the first configuration if exists
        const firstConfig = response.data.data[0];
        setConfig({
          id: firstConfig.id,
          companyName: firstConfig.companyName,
          companyCategory: firstConfig.companyCategory,
          instructions: firstConfig.instructions,
          exampleConversation: firstConfig.exampleConversation,
          chatEnabled: firstConfig.chatEnabled,
          uploadedDocuments: firstConfig.uploadedDocuments || [],
        });
      }
    } catch (error) {
      console.error("Error fetching configurations:", error);
      toast.error("Failed to load chatbot configurations");
    } finally {
      setLoading(false);
    }
  };

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

  const removeDocument = async (index: number) => {
    const documentToRemove = config.uploadedDocuments[index];

    // If it's a File object (newly uploaded), just remove from local state
    if (documentToRemove instanceof File) {
      setConfig((prev) => ({
        ...prev,
        uploadedDocuments: prev.uploadedDocuments.filter((_, i) => i !== index),
      }));
      return;
    }

    // If it's an existing document from database, update the backend
    if (config.id) {
      try {
        const updatedDocuments = config.uploadedDocuments.filter(
          (_, i) => i !== index
        );

        // Prepare FormData with updated document list
        const formData = new FormData();
        formData.append("companyName", config.companyName);
        formData.append("companyCategory", config.companyCategory);
        formData.append("instructions", config.instructions);
        formData.append("exampleConversation", config.exampleConversation);
        formData.append("chatEnabled", config.chatEnabled.toString());

        // Add remaining documents as JSON (for existing ones)
        formData.append(
          "existingDocuments",
          JSON.stringify(
            updatedDocuments.filter((doc) => !(doc instanceof File))
          )
        );

        const response = await axiosInstance.put(
          `/api/dashboard/settings/chat-bot/${config.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          setConfig((prev) => ({
            ...prev,
            uploadedDocuments: response.data.data.uploadedDocuments || [],
          }));
          toast.success("Document removed successfully");
        }
      } catch (error) {
        console.error("Error removing document:", error);
        toast.error("Failed to remove document");
      }
    } else {
      // If no config ID, just remove from local state
      setConfig((prev) => ({
        ...prev,
        uploadedDocuments: prev.uploadedDocuments.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (
        !config.companyName ||
        !config.companyCategory ||
        !config.instructions
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append("companyName", config.companyName);
      formData.append("companyCategory", config.companyCategory);
      formData.append("instructions", config.instructions);
      formData.append("exampleConversation", config.exampleConversation);
      formData.append("chatEnabled", config.chatEnabled.toString());

      // Add files to FormData
      config.uploadedDocuments.forEach((doc) => {
        if (doc instanceof File) {
          formData.append("documents", doc);
        }
      });

      let response;
      if (config.id) {
        // Update existing configuration
        response = await axiosInstance.put(
          `/api/dashboard/settings/chat-bot/${config.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create new configuration
        response = await axiosInstance.post(
          "/api/dashboard/settings/chat-bot",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(
          response.data.message || "Configuration saved successfully"
        );
        // Update the config with the returned data
        setConfig((prev) => ({
          ...prev,
          id: response.data.data.id,
          uploadedDocuments: response.data.data.uploadedDocuments || [],
        }));
        // Refresh configurations
        await fetchConfigurations();
      }
    } catch (error: unknown) {
      console.error("Error saving configuration:", error);
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data)
          ? String(error.response.data.message)
          : "Failed to save configuration";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading chatbot configuration...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Chatbot Configuration
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
          Configure your chatbot settings and behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
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
              <Label htmlFor="company-category">Company Category</Label>
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
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
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

        {/* Example Conversation */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="example-conversation">Example Conversation</Label>
            <Textarea
              id="example-conversation"
              placeholder="User: Hello, what services do you offer?&#10;Bot: Hi! We offer a wide range of services including...&#10;User: Can you tell me more about pricing?&#10;Bot: Of course! Our pricing structure is..."
              className="min-h-[120px]"
              value={config.exampleConversation}
              onChange={(e) =>
                handleInputChange("exampleConversation", e.target.value)
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
                onClick={() => document.getElementById("file-upload")?.click()}
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

        {/* Embed Script Section */}
        {config.id && (
          <div className="space-y-4">
            <div className="border-t pt-6">
              <Label className="text-base font-semibold">Embed Script</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Copy and paste this script into any website to embed your chatbot
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    HTML Embed Code
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const embedCode = generateEmbedScript(config.id!);
                      navigator.clipboard.writeText(embedCode);
                      toast.success("Embed code copied to clipboard!");
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
                <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
                  <code>{generateEmbedScript(config.id!)}</code>
                </pre>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  How to use:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Copy the embed code above</li>
                  <li>• Paste it before the closing &lt;/body&gt; tag of your website</li>
                  <li>• The chatbot will appear on the bottom-right corner</li>
                  <li>• Customize appearance using the data attributes in the script</li>
                </ul>
              </div>
            </div>
          </div>
        )}

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
  );
};
 