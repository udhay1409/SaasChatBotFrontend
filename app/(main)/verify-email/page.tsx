"use client";
import VerifyEmailComponent from "@/components/Home/verify-email/verify-email";
import { Suspense } from "react";
import { AIBotLoading } from "@/components/ui/ai-bot-loading";

export default function VerifyEmail() {
  return  (
   
  <Suspense fallback={<div className="p-6 text-center"> <AIBotLoading /></div>}>
      <VerifyEmailComponent />  
    </Suspense>
  );

}