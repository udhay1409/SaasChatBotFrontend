"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Sparkles,
  Volume2,
} from "lucide-react";
import axiosInstance from "@/lib/axios";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  sources?: Array<{
    source: string;
    content: string;
  }>;
}

interface ChatBotConfig {
  id: string;
  companyName: string;
  companyCategory?: string;
  instructions?: string;
  exampleConversation?: string;
  chatEnabled?: boolean;
  uploadedDocuments?: Array<{
    name: string;
    filename: string;
    size: number;
    type: string;
    path: string;
    uploadedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface ChatBotProps {
  configId?: string;
  companyName?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ configId, companyName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "online" | "connecting" | "offline"
  >("online");
  const [chatConfig, setChatConfig] = useState<ChatBotConfig | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatbot = useCallback(async () => {
    try {
      setConnectionStatus("connecting");

      // Always try to fetch chatbot configurations
      const response = await axiosInstance.get<ApiResponse<ChatBotConfig[]>>(
        `/api/dashboard/settings/chat-bot`
      );
      if (response.data.success && response.data.data.length > 0) {
        // Use specific config if configId provided, otherwise use the first available
        const config = configId
          ? response.data.data.find((c: ChatBotConfig) => c.id === configId) ||
            response.data.data[0]
          : response.data.data[0];

        setChatConfig(config);

        // Set welcome message based on config
        const welcomeMessage: Message = {
          id: "welcome",
          text: `Hello! 👋 I'm your friendly ${
            config.companyName || companyName || "AI"
          } assistant. I'm here to help you with any questions about our company, policies, or services. 😊`,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);

        // Load initial smart suggestions
      } else {
        // No configurations found, set a basic config
        setChatConfig({
          id: "default",
          companyName: companyName || "AI Assistant",
        });
        const welcomeMessage: Message = {
          id: "welcome",
          text: `Hello! 👋 I'm your friendly ${
            companyName || "AI"
          } assistant. I'm here to help you with any questions about our company, policies, or services. Feel free to ask me anything in your preferred language! 😊`,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }

      setConnectionStatus("online");
    } catch (error) {
      console.error("Error initializing chatbot:", error);
      setConnectionStatus("offline");

      // Set basic config for error case
      setChatConfig({
        id: "default",
        companyName: companyName || "AI Assistant",
      });
      const welcomeMessage: Message = {
        id: "welcome",
        text: `Hello! 👋 I'm your friendly ${
          companyName || "AI"
        } assistant. I'm currently experiencing some connectivity issues, but I'll do my best to help you with any questions! 😊`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [configId, companyName]);

  // Initialize chatbot when opened
  useEffect(() => {
    if (isOpen && !chatConfig) {
      initializeChatbot();
    }
  }, [isOpen, chatConfig, initializeChatbot]);

  const getBotResponse = async (
    userInput: string
  ): Promise<{
    response: string;
    sources?: Array<{ source: string; content: string }>;
  }> => {
    setConnectionStatus("connecting");

    try {
      // Configure axios with a longer timeout and abort controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout for vector search

      const response = await axiosInstance.post(
        "/api/chat",
        {
          message: userInput,
          sessionId: sessionId || undefined,
          configId: chatConfig?.id || "default",
        },
        {
          signal: controller.signal,
          timeout: 90000, // 90 seconds for vector processing
          timeoutErrorMessage:
            "Request took too long to complete. Please try again.",
        }
      );

      // Clear the timeout since request completed
      clearTimeout(timeoutId);

      if (response.data.success) {
        // Set session ID if it's the first message
        if (!sessionId) {
          setSessionId(response.data.data.sessionId);
        }

        setConnectionStatus("online");
        console.log(
          `✅ AI response received with ${
            response.data.data.sources?.length || 0
          } sources`
        );
        return {
          response: response.data.data.response,
          sources: response.data.data.sources,
        };
      } else {
        throw new Error(response.data.message || "Failed to get AI response");
      }
    } catch (error: unknown) {
      console.error("Error getting AI response:", error);
      setConnectionStatus("offline");

      // Handle different types of errors
      if (error && typeof error === "object") {
        if ("code" in error && error.code === "ECONNABORTED") {
          return {
            response:
              "The request took too long to complete. This might happen with complex queries or when analyzing documents. Please try asking a simpler question or try again later.",
          };
        } else if ("name" in error && error.name === "AbortError") {
          return {
            response:
              "The request was cancelled due to timeout. Please try again with a simpler question.",
          };
        }
      }

      return {
        response:
          "I'm sorry, I'm currently experiencing technical difficulties. Please try again in a moment, or contact support if the issue persists.",
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    let timeoutWarning: NodeJS.Timeout | undefined;

    try {
      // Set a warning message if the request takes longer than 15 seconds
      timeoutWarning = setTimeout(() => {
        const warningMessage: Message = {
          id: "processing-" + Date.now().toString(),
          text: "I'm still processing your request. This might take a moment for complex queries...",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, warningMessage]);
      }, 15000);

      const aiResponse = await getBotResponse(currentInput);

      // Clear the warning message if it exists
      setMessages((prev) =>
        prev.filter((msg) => !msg.id.startsWith("processing-"))
      );

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        sender: "bot",
        timestamp: new Date(),
        sources: aiResponse.sources,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      clearTimeout(timeoutWarning);
      setIsTyping(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "online":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500 animate-pulse";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "online":
        return "Online";
      case "connecting":
        return "Connecting...";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const clearConversation = async () => {
    if (!sessionId) return;

    try {
      await axiosInstance.delete(`/api/chat/session/${sessionId}`);
      setSessionId("");

      // Reset to welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        text: `Hello! 👋 I'm the ${
          chatConfig?.companyName || companyName || "AI"
        } assistant. I'm here to help you with any questions you might have. What would you like to know?`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <div className="relative group">
            <Button
              onClick={() => setIsOpen(true)}
              className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 group border-2 border-white/20"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 sm:h-7 sm:w-7 text-white group-hover:scale-125 transition-all duration-300" />
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 flex items-center justify-center">
                <div className="relative">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-pulse" />
                  <div className="absolute inset-0 h-4 w-4 sm:h-5 sm:w-5 bg-yellow-300 rounded-full animate-ping opacity-30"></div>
                </div>
              </div>
            </Button>

            {/* Tooltip - Hidden on mobile */}
            <div className="hidden sm:block absolute bottom-20 right-0 bg-black/90 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap backdrop-blur-sm border border-white/10">
              Chat with AI Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={`fixed transition-all duration-500 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 shadow-2xl border-2 border-white/10 gap-0 p-0
            ${
              isMinimized
                ? "h-16 bottom-4 right-4 sm:bottom-6 sm:right-6 w-80 sm:w-[28rem]"
                : "inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[28rem] sm:h-[40rem] h-[calc(100vh-2rem)]"
            }`}
        >
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white rounded-t-lg">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0 ">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/30 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-white/20 to-white/10 text-white backdrop-blur-sm">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 animate-pulse" />
                    <div className="absolute inset-0 h-3 w-3 sm:h-4 sm:w-4 bg-yellow-300 rounded-full animate-ping opacity-30"></div>
                  </div>
                </div>
                {/* Status indicator */}
                <div
                  className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${getStatusColor()}`}
                ></div>
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-base font-semibold truncate">
                  AI Assistant
                </CardTitle>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  >
                    {getStatusText()}
                  </Badge>
                  <span className="text-xs text-white/80 hidden sm:inline truncate">
                    Always here to help
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {sessionId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white hover:bg-white/20 rounded-full transition-all duration-200"
                  title="Clear conversation"
                >
                  <svg
                    className="h-3 w-3 sm:h-4 sm:w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white hover:bg-white/20 rounded-full transition-all duration-200"
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white hover:bg-white/20 rounded-full transition-all duration-200"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-[calc(100vh-8rem)] sm:h-[35rem]">
              {/* Messages Area */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
                <div className="space-y-4 sm:space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      } group`}
                    >
                      <div
                        className={`flex items-start space-x-2  max-w-[90%] sm:max-w-[85%] ${
                          message.sender === "user"
                            ? "flex-row-reverse space-x-reverse  "
                            : ""
                        }`}
                      >
                        <Avatar
                          className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 shadow-md ${
                            message.sender === "user"
                              ? "ring-1 sm:ring-2 ring-blue-200"
                              : "ring-1 sm:ring-2 ring-purple-200"
                          }`}
                        >
                          <AvatarFallback
                            className={`text-xs sm:text-sm font-medium ${
                              message.sender === "user"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                            }`}
                          >
                            {message.sender === "user" ? (
                              <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <div
                            className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
                              message.sender === "user"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                              {message.text}
                            </p>

                            {/* Sources removed - no longer displayed */}
                          </div>
                          <div
                            className={`flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 ${
                              message.sender === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {message.sender === "bot" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => {
                                  // Text-to-speech functionality would be implemented here
                                  console.log("Read message aloud");
                                }}
                              >
                                <Volume2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Enhanced Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <Avatar className="w-6 h-6 sm:w-8 sm:h-8 shadow-md ring-1 sm:ring-2 ring-purple-200">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                            <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce"></div>
                              <div
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              AI is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Input Area */}
              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="pr-3 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 shadow-sm text-sm"
                      disabled={isTyping}
                    />
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-2 sm:mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    AI Assistant • Powered by your system
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
};

export default ChatBot;
