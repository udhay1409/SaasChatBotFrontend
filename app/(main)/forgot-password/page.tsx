"use client";
import ForgotPasswordComponent from "@/components/Home/forgotpassword/forgot-password";
import { Suspense } from "react";
import { AIBotLoading } from "@/components/ui/ai-bot-loading";
export default function ForgotPassword() {
  return (
    <Suspense fallback={<div className="p-6 text-center"> <AIBotLoading /></div>}>
      <ForgotPasswordComponent />
    </Suspense>
  ) 

  
}