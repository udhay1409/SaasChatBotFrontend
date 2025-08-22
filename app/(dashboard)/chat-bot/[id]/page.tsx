import { ChatBot } from "@/components/Dashboard/chatBot/CreateAndEditBot";

export default function EditChatBotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Chatbot</h1>
        <p className="text-muted-foreground">
          Update your chatbot configuration and settings
        </p>
      </div>
      <ChatBot />
    </div>
  );
}