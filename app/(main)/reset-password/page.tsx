"use client";
import ResetPasswordComponent from "@/components/Home/reset-password/reset-password";
import {Suspense} from "react";
import { AIBotLoading } from "@/components/ui/ai-bot-loading";
export default function ResetPassword() {
  return (
  <div>
      <Suspense fallback={<div className="p-6 text-center"> <AIBotLoading /></div>}>
  <ResetPasswordComponent />;
    </Suspense>;

  </div>
  )
  

}