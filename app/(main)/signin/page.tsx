"use client";
import { SignIn } from "@/components/Home/signIn/signIn";
import { Suspense } from "react";
import { AIBotLoading } from "@/components/ui/ai-bot-loading";

export default function SignInPage() {
  return  (
    <Suspense fallback={<div className="p-6 text-center"> <AIBotLoading /></div>}>
   
      <SignIn />
    </Suspense>
  );
}
