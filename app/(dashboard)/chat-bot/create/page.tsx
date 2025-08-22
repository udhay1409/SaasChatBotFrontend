import { ChatBot } from "@/components/Dashboard/chatBot/CreateAndEditBot";

export default function CreateChatBotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Chatbot</h1>
        <p className="text-muted-foreground">
          Set up your new AI chatbot with custom instructions and documents
        </p>
      </div>
      <ChatBot />
    </div>
  );
}