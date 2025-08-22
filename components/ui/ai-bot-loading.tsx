"use client";

import { Bot, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AIBotLoadingProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  showProgress?: boolean;
  duration?: number;
}

export function AIBotLoading({
  size = "md",
  message = "AI is thinking...",
  className,
  showProgress = true,
  duration = 3000,
}: AIBotLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (!showProgress) return;

    const messages = [
      "AI is thinking...",
      "Processing your request...",
      "Analyzing data...",
      "Almost ready...",
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (duration / 100);
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, [duration, showProgress]);

  const sizeClasses = {
    sm: {
      container: "h-32",
      bot: "h-8 w-8",
      loader: "h-4 w-4",
      sparkle: "h-3 w-3",
      text: "text-sm",
      dots: "text-lg",
    },
    md: {
      container: "h-48",
      bot: "h-12 w-12",
      loader: "h-6 w-6",
      sparkle: "h-4 w-4",
      text: "text-base",
      dots: "text-xl",
    },
    lg: {
      container: "h-64",
      bot: "h-16 w-16",
      loader: "h-8 w-8",
      sparkle: "h-6 w-6",
      text: "text-lg",
      dots: "text-2xl",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-6 p-6",
        currentSize.container,
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Enhanced Bot Icon with Floating Sparkles */}
      <div className="relative">
        {/* Floating Sparkles */}
        <div className="absolute inset-0 animate-pulse">
          <Sparkles
            className={cn(
              "absolute -top-2 -left-2 text-primary/60 animate-bounce",
              currentSize.sparkle
            )}
            style={{ animationDelay: "0.5s", animationDuration: "2s" }}
          />
          <Sparkles
            className={cn(
              "absolute -top-2 -right-2 text-primary/40 animate-bounce",
              currentSize.sparkle
            )}
            style={{ animationDelay: "1s", animationDuration: "2.5s" }}
          />
          <Sparkles
            className={cn(
              "absolute -bottom-2 -left-2 text-primary/50 animate-bounce",
              currentSize.sparkle
            )}
            style={{ animationDelay: "1.5s", animationDuration: "2.2s" }}
          />
        </div>

        {/* Main Bot Container */}
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-primary/10 to-primary/20 p-4",
            "ring-4 ring-primary/20 ring-offset-2 ring-offset-background",
            "shadow-lg backdrop-blur-sm",
            "animate-pulse hover:scale-105 transition-transform duration-300"
          )}
        >
          <Bot
            className={cn(
              "text-primary animate-bounce drop-shadow-sm",
              currentSize.bot
            )}
            style={{ animationDuration: "1.5s" }}
          />
        </div>

        {/* Enhanced Spinning Loader */}
        <div className="absolute -top-1 -right-1">
          <div className="rounded-full bg-background p-1 shadow-md border border-primary/20">
            <Loader2
              className={cn("animate-spin text-primary", currentSize.loader)}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Loading Message */}
      <div className="text-center space-y-3">
        <p
          className={cn(
            "font-medium text-foreground transition-all duration-500",
            currentSize.text
          )}
        >
          {showProgress ? currentMessage : message}
        </p>

        {/* Enhanced Animated Dots */}
        <div
          className={cn(
            "flex items-center justify-center space-x-1 text-primary/70",
            currentSize.dots
          )}
        >
          {[0, 150, 300].map((delay, index) => (
            <span
              key={index}
              className="animate-bounce inline-block"
              style={{
                animationDelay: `${delay}ms`,
                animationDuration: "1.4s",
              }}
            >
              •
            </span>
          ))}
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-xs space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

// Enhanced Card variant with better styling
export function AIBotLoadingCard({
  title = "Processing...",
  description = "AI is analyzing your request",
  className,
  showProgress = true,
  duration = 4000,
}: {
  title?: string;
  description?: string;
  className?: string;
  showProgress?: boolean;
  duration?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br from-card to-card/50",
        "text-card-foreground shadow-lg backdrop-blur-sm",
        "hover:shadow-xl transition-all duration-300",
        "border-primary/10 p-8",
        className
      )}
    >
      <AIBotLoading
        size="md"
        message={title}
        showProgress={showProgress}
        duration={duration}
      />
      <p className="text-center text-sm text-muted-foreground mt-4 font-medium">
        {description}
      </p>
    </div>
  );
}

// Enhanced Full screen loading variant
export function AIBotLoadingScreen({
  message = "Loading your dashboard...",
  className,
  showProgress = true,
  duration = 5000,
}: {
  message?: string;
  className?: string;
  showProgress?: boolean;
  duration?: number;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/90 backdrop-blur-md z-50",
        "flex items-center justify-center p-4",
        "animate-in fade-in duration-300",
        className
      )}
    >
      <div
        className={cn(
          "bg-card/95 rounded-2xl border border-primary/20 shadow-2xl",
          "backdrop-blur-sm p-12 max-w-md w-full",
          "animate-in zoom-in-95 duration-500"
        )}
      >
        <AIBotLoading
          size="lg"
          message={message}
          showProgress={showProgress}
          duration={duration}
        />
      </div>
    </div>
  );
}

// Enhanced Inline loading variant
export function AIBotLoadingInline({
  message = "Loading...",
  className,
  showSparkles = false,
}: {
  message?: string;
  className?: string;
  showSparkles?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center space-x-3 p-4 rounded-lg",
        "bg-muted/30 border border-primary/10",
        "hover:bg-muted/50 transition-colors duration-200",
        className
      )}
    >
      <div className="relative">
        {showSparkles && (
          <Sparkles className="absolute -top-1 -left-1 h-3 w-3 text-primary/60 animate-pulse" />
        )}
        <div className="rounded-full bg-primary/10 p-2">
          <Bot className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <Loader2 className="absolute -top-1 -right-1 h-3 w-3 animate-spin text-primary bg-background rounded-full" />
      </div>
      <span className="text-sm font-medium text-foreground">{message}</span>
      <div className="flex space-x-1 ml-auto">
        {[0, 150, 300].map((delay, index) => (
          <span
            key={index}
            className="animate-bounce text-primary text-xs"
            style={{
              animationDelay: `${delay}ms`,
              animationDuration: "1.2s",
            }}
          >
            •
          </span>
        ))}
      </div>
    </div>
  );
}

// Compact button-style loading variant
export function AIBotLoadingButton({
  message = "Processing...",
  className,
  variant = "default",
}: {
  message?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
}) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "bg-transparent hover:bg-muted text-foreground",
    outline:
      "border border-primary bg-transparent hover:bg-primary/10 text-primary",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center space-x-2 px-4 py-2 rounded-md",
        "transition-colors duration-200 cursor-not-allowed",
        variantClasses[variant],
        className
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// Minimal dot loading variant
export function AIBotLoadingDots({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-1 text-primary",
        sizeClasses[size],
        className
      )}
    >
      {[0, 200, 400].map((delay, index) => (
        <span
          key={index}
          className="animate-bounce inline-block"
          style={{
            animationDelay: `${delay}ms`,
            animationDuration: "1.4s",
          }}
        >
          •
        </span>
      ))}
    </div>
  );
}
