"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Copy, 
  ExternalLink, 
  ArrowLeft, 
  Bot,
  Globe,
  Zap,
  Shield,
  Smartphone
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

interface ChatBotConfig {
  id: string;
  companyName: string;
  companyCategory: string;
  instructions: string;
  chatEnabled: boolean;
  uploadedDocuments: Array<{
    name: string;
    filename: string;
    size: number;
    type: string;
    path: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function EmbedCodePage() {
  const params = useParams();
  const router = useRouter();
  const [chatbot, setChatbot] = useState<ChatBotConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChatbot = async () => {
      if (!params.id) return;
      
      setLoading(true); 
      try {
        const response = await axiosInstance.get(`/api/dashboard/user/chatbot/${params.id}`);
        if (response.data.success) {
          setChatbot(response.data.data);
        } else {
          toast.error("Chatbot not found");
          setChatbot(null);
        }
      } catch (error) {
        console.error("Error loading chatbot:", error);
        const errorMessage = (error as AxiosError).response?.data?.message || "Failed to load chatbot";
        toast.error(errorMessage);
        setChatbot(null);
      } finally {
        setLoading(false);
      }
    };

    loadChatbot();
  }, [params.id]);

  // Generate embed codes for different platforms
  const generateEmbedCodes = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://saaschatbotbackend.onrender.com";
    const configId = params.id;
    const companyName = chatbot?.companyName || "AI Chatbot";
    
    // Keep the existing security encoding for the actual widget
    const generateHash = (value: string) => {
      return Array.from(value)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
    };
    
    const encodedConfigAttr = generateHash('data-enc-config-id');
    const encodedConfigValue = generateHash(generateHash(configId as string));
    const encodedBaseAttr = generateHash('data-enc-base-url');
    const encodedBaseValue = generateHash(generateHash(baseUrl));
    const encodedIntegrityAttr = generateHash('data-enc-integrity');
    const encodedIntegrityValue = generateHash(`sha256-${generateHash(Date.now().toString())}`);
    const encodedCrossoriginAttr = generateHash('data-enc-crossorigin');
    const encodedCrossoriginValue = generateHash('anonymous');
    
    // Simple embed script (keeping security intact)
    const simpleEmbedScript = `<script 
  src="${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js"
  ${encodedConfigAttr}="${encodedConfigValue}"
  ${encodedBaseAttr}="${encodedBaseValue}"
  ${encodedIntegrityAttr}="${encodedIntegrityValue}"
  ${encodedCrossoriginAttr}="${encodedCrossoriginValue}"
  async>
</script>`;
    
   
    return {
      html: `<!-- ${companyName} AI Chatbot - Just copy and paste before </body> -->
${simpleEmbedScript}`,

      react: `// React - Add this component anywhere in your app
import { useEffect } from 'react';

export default function Chatbot() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js';
    script.setAttribute('${encodedConfigAttr}', '${encodedConfigValue}');
    script.setAttribute('${encodedBaseAttr}', '${encodedBaseValue}');
    script.setAttribute('${encodedIntegrityAttr}', '${encodedIntegrityValue}');
    script.setAttribute('${encodedCrossoriginAttr}', '${encodedCrossoriginValue}');
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}

// Then use: <Chatbot />`,

      nextjs: `// Next.js - Using Script component (Recommended)
import Script from 'next/script';

// Method 1: Add to app/layout.tsx (App Router)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Add chatbot script */}
        <Script
          src="${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js"
          strategy="afterInteractive"
          ${encodedConfigAttr}="${encodedConfigValue}"
          ${encodedBaseAttr}="${encodedBaseValue}"
          ${encodedIntegrityAttr}="${encodedIntegrityValue}"
          ${encodedCrossoriginAttr}="${encodedCrossoriginValue}"
        />
      </body>
    </html>
  );
}

// Method 2: Add to pages/_app.js (Pages Router)
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      
      {/* Add chatbot script */}
      <Script
        src="${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js"
        strategy="afterInteractive"
        ${encodedConfigAttr}="${encodedConfigValue}"
        ${encodedBaseAttr}="${encodedBaseValue}"
        ${encodedIntegrityAttr}="${encodedIntegrityValue}"
        ${encodedCrossoriginAttr}="${encodedCrossoriginValue}"
      />
    </>
  );
}

// Method 3: As a separate component
import Script from 'next/script';

export default function ChatbotScript() {
  return (
    <Script
      src="${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js"
      strategy="afterInteractive"
      ${encodedConfigAttr}="${encodedConfigValue}"
      ${encodedBaseAttr}="${encodedBaseValue}"
      ${encodedIntegrityAttr}="${encodedIntegrityValue}"
      ${encodedCrossoriginAttr}="${encodedCrossoriginValue}"
    />
  );
}

// Then use: <ChatbotScript /> in your layout or pages`,

      vue: `// Vue.js - Add to your main component or App.vue
<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = '${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js';
    script.setAttribute('${encodedConfigAttr}', '${encodedConfigValue}');
    script.setAttribute('${encodedBaseAttr}', '${encodedBaseValue}');
    script.setAttribute('${encodedIntegrityAttr}', '${encodedIntegrityValue}');
    script.setAttribute('${encodedCrossoriginAttr}', '${encodedCrossoriginValue}');
    script.async = true;
    document.body.appendChild(script);
  }
};
</script>

// That's it! The chatbot will appear automatically.`,

      angular: `// Angular - Add to app.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  ngOnInit() {
    const script = document.createElement('script');
    script.src = '${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js';
    script.setAttribute('${encodedConfigAttr}', '${encodedConfigValue}');
    script.setAttribute('${encodedBaseAttr}', '${encodedBaseValue}');
    script.setAttribute('${encodedIntegrityAttr}', '${encodedIntegrityValue}');
    script.setAttribute('${encodedCrossoriginAttr}', '${encodedCrossoriginValue}');
    script.async = true;
    document.body.appendChild(script);
  }
}

// That's it! The chatbot will appear automatically.`,

      wordpress: `// WordPress - Add to your theme's functions.php file
<?php
function add_chatbot_widget() {
    ?>
    ${simpleEmbedScript}
    <?php
}
add_action('wp_footer', 'add_chatbot_widget');
?>

// Or paste directly in footer.php before </body>
${simpleEmbedScript}`,

      shopify: `<!-- Shopify Integration -->
<!-- Go to Online Store > Themes > Actions > Edit Code -->
<!-- Open theme.liquid file and add before </body> -->

<script 
  src="${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js"
  ${encodedConfigAttr}="${encodedConfigValue}"
  ${encodedBaseAttr}="${encodedBaseValue}"
  ${encodedIntegrityAttr}="${encodedIntegrityValue}"
  ${encodedCrossoriginAttr}="${encodedCrossoriginValue}"
  async>
</script>

<!-- Or create a new snippet: -->
<!-- 1. Create snippets/chatbot.liquid -->
<!-- 2. Add the script above -->
<!-- 3. Include in theme.liquid: {% include 'chatbot' %} -->`,

      python: `# Python Flask/Django Integration
# For Flask
from flask import Flask, render_template_string

app = Flask(__name__)

@app.route('/')
def index():
    chatbot_script = '''
    <script 
      src="${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js"
      ${encodedConfigAttr}="${encodedConfigValue}"
      ${encodedBaseAttr}="${encodedBaseValue}"
      ${encodedIntegrityAttr}="${encodedIntegrityValue}"
      ${encodedCrossoriginAttr}="${encodedCrossoriginValue}"
      async>
    </script>
    '''
    
    html_template = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>My Website</title>
    </head>
    <body>
        <h1>Welcome to my website</h1>
        <!-- Your content here -->
        
        {{ chatbot_script|safe }}
    </body>
    </html>
    '''
    
    return render_template_string(html_template, chatbot_script=chatbot_script)

# For Django - add to your base template
# {% load static %}
# <script 
#   src="${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js"
#   ${encodedConfigAttr}="${encodedConfigValue}"
#   ${encodedBaseAttr}="${encodedBaseValue}"
#   ${encodedIntegrityAttr}="${encodedIntegrityValue}"
#   ${encodedCrossoriginAttr}="${encodedCrossoriginValue}"
#   async>
# </script>`,

      php: `<?php
// PHP Integration
function render_chatbot_widget() {
    $base_url = '${baseUrl}';
    $encoded_config_attr = '${encodedConfigAttr}';
    $encoded_config_value = '${encodedConfigValue}';
    $encoded_base_attr = '${encodedBaseAttr}';
    $encoded_base_value = '${encodedBaseValue}';
    $encoded_integrity_attr = '${encodedIntegrityAttr}';
    $encoded_integrity_value = '${encodedIntegrityValue}';
    $encoded_crossorigin_attr = '${encodedCrossoriginAttr}';
    $encoded_crossorigin_value = '${encodedCrossoriginValue}';
    
    echo '<script 
            src="' . $base_url . '/public/UserChatBotWidget/userChatBotWidget.js"
            ' . $encoded_config_attr . '="' . $encoded_config_value . '"
            ' . $encoded_base_attr . '="' . $encoded_base_value . '"
            ' . $encoded_integrity_attr . '="' . $encoded_integrity_value . '"
            ' . $encoded_crossorigin_attr . '="' . $encoded_crossorigin_value . '"
            async>
          </script>';
}

// Call this function before closing </body> tag
// render_chatbot_widget();
?>

<!-- Or directly in HTML -->
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome</h1>
    
    <script 
      src="${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js"
      ${encodedConfigAttr}="${encodedConfigValue}"
      ${encodedBaseAttr}="${encodedBaseValue}"
      ${encodedIntegrityAttr}="${encodedIntegrityValue}"
      ${encodedCrossoriginAttr}="${encodedCrossoriginValue}"
      async>
    </script>
</body>
</html>`,

      laravel: `<?php
// Laravel Integration
// Method 1: Add to your Blade layout (resources/views/layouts/app.blade.php)

// In your controller or service provider
class ChatbotService {
    public static function getChatbotScript() {
        return [
            'baseUrl' => '${baseUrl}',
            'encodedConfigAttr' => '${encodedConfigAttr}',
            'encodedConfigValue' => '${encodedConfigValue}',
            'encodedBaseAttr' => '${encodedBaseAttr}',
            'encodedBaseValue' => '${encodedBaseValue}',
            'encodedIntegrityAttr' => '${encodedIntegrityAttr}',
            'encodedIntegrityValue' => '${encodedIntegrityValue}',
            'encodedCrossoriginAttr' => '${encodedCrossoriginAttr}',
            'encodedCrossoriginValue' => '${encodedCrossoriginValue}'
        ];
    }
}

// In your Blade template
@php
    $chatbot = App\\Services\\ChatbotService::getChatbotScript();
@endphp

<script 
  src="{{ $chatbot['baseUrl'] }}/public/UserChatBotWidget/userChatBotWidget.js"
  {{ $chatbot['encodedConfigAttr'] }}="{{ $chatbot['encodedConfigValue'] }}"
  {{ $chatbot['encodedBaseAttr'] }}="{{ $chatbot['encodedBaseValue'] }}"
  {{ $chatbot['encodedIntegrityAttr'] }}="{{ $chatbot['encodedIntegrityValue'] }}"
  {{ $chatbot['encodedCrossoriginAttr'] }}="{{ $chatbot['encodedCrossoriginValue'] }}"
  async>
</script>

// Method 2: Using Laravel Mix/Vite
// In resources/js/app.js
document.addEventListener('DOMContentLoaded', function() {
    const script = document.createElement('script');
    script.src = '${baseUrl}/public/UserChatBotWidget/userChatBotWidget.js';
    script.setAttribute('${encodedConfigAttr}', '${encodedConfigValue}');
    script.setAttribute('${encodedBaseAttr}', '${encodedBaseValue}');
    script.setAttribute('${encodedIntegrityAttr}', '${encodedIntegrityValue}');
    script.setAttribute('${encodedCrossoriginAttr}', '${encodedCrossoriginValue}');
    script.async = true;
    document.body.appendChild(script);
});

// Method 3: Using Laravel Component
// Create: app/View/Components/Chatbot.php
<?php
namespace App\\View\\Components;
use Illuminate\\View\\Component;

class Chatbot extends Component {
    public function render() {
        return view('components.chatbot', [
            'config' => [
                'baseUrl' => '${baseUrl}',
                'encodedConfigAttr' => '${encodedConfigAttr}',
                'encodedConfigValue' => '${encodedConfigValue}',
                'encodedBaseAttr' => '${encodedBaseAttr}',
                'encodedBaseValue' => '${encodedBaseValue}',
                'encodedIntegrityAttr' => '${encodedIntegrityAttr}',
                'encodedIntegrityValue' => '${encodedIntegrityValue}',
                'encodedCrossoriginAttr' => '${encodedCrossoriginAttr}',
                'encodedCrossoriginValue' => '${encodedCrossoriginValue}'
            ]
        ]);
    }
}

// Create: resources/views/components/chatbot.blade.php
<script 
  src="{{ $config['baseUrl'] }}/public/UserChatBotWidget/userChatBotWidget.js"
  {{ $config['encodedConfigAttr'] }}="{{ $config['encodedConfigValue'] }}"
  {{ $config['encodedBaseAttr'] }}="{{ $config['encodedBaseValue'] }}"
  {{ $config['encodedIntegrityAttr'] }}="{{ $config['encodedIntegrityValue'] }}"
  {{ $config['encodedCrossoriginAttr'] }}="{{ $config['encodedCrossoriginValue'] }}"
  async>
</script>

// Usage in any Blade template:
<x-chatbot />`,


    };
  };

  const copyEmbedCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Embed code copied to clipboard!");
  };

  const previewChatbot = () => {
    const previewUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://saaschatbotbackend.onrender.com'}/embed/user-chatbot?configId=${params.id}`;
    window.open(previewUrl, '_blank');
  };

  const customizeAppearance = () => {
    const appearanceUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://saaschatbotbackend.onrender.com'}/embed/chatbot-appearance?configId=${params.id}`;
    window.open(appearanceUrl, '_blank');
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

  if (!chatbot) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Bot className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Chatbot not found</h3>
              <p className="text-muted-foreground">
                The chatbot you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Embed Code</h1>
          <p className="text-muted-foreground">
            Copy and paste this code to embed your chatbot on any website
          </p>
        </div>
      </div>

      {/* Chatbot Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{chatbot.companyName}</CardTitle>
                <p className="text-muted-foreground">{chatbot.companyCategory}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={chatbot.chatEnabled ? "default" : "secondary"}>
                {chatbot.chatEnabled ? "Active" : "Disabled"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={previewChatbot}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={customizeAppearance}
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="13.5" cy="6.5" r=".5"/>
                  <circle cx="17.5" cy="10.5" r=".5"/>
                  <circle cx="8.5" cy="7.5" r=".5"/>
                  <circle cx="6.5" cy="12.5" r=".5"/>
                  <circle cx="12" cy="2" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Customize
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Documents:</span>
              <span className="ml-2 font-medium">{chatbot.uploadedDocuments?.length || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 font-medium">
                {new Date(chatbot.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 font-medium">
                {new Date(chatbot.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Language Embed Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Integration Code Examples
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose your platform and copy the integration code
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="nextjs">Next.js</TabsTrigger>
              <TabsTrigger value="vue">Vue.js</TabsTrigger>
              <TabsTrigger value="angular">Angular</TabsTrigger>
              <TabsTrigger value="wordpress">WordPress</TabsTrigger>
              <TabsTrigger value="shopify">Shopify</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
              <TabsTrigger value="laravel">Laravel</TabsTrigger>
            </TabsList>

            {Object.entries(generateEmbedCodes()).map(([key, code]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {key === 'nextjs' ? 'Next.js' : 
                         key === 'vue' ? 'Vue.js' : 
                         key === 'php' ? 'PHP' : 
                         key === 'html' ? 'HTML' : 
                         key === 'laravel' ? 'Laravel' :
                         key.charAt(0).toUpperCase() + key.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {key === 'html' && 'Basic HTML integration'}
                        {key === 'react' && 'React component integration'}
                        {key === 'nextjs' && 'Next.js with Script component'}
                        {key === 'vue' && 'Vue.js component integration'}
                        {key === 'angular' && 'Angular component integration'}
                        {key === 'wordpress' && 'WordPress theme integration'}
                        {key === 'shopify' && 'Shopify theme integration'}
                        {key === 'python' && 'Flask/Django integration'}
                        {key === 'php' && 'PHP server integration'}
                        {key === 'laravel' && 'Laravel framework integration'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyEmbedCode(code)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </Button>
                  </div>
                  <pre className="text-xs bg-white dark:bg-gray-900 p-4 rounded border overflow-x-auto max-h-96 overflow-y-auto">
                    <code className="language-javascript">{code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Installation Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h4 className="font-semibold">Copy the embed code</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Choose either the basic or advanced embed code above and copy it to your clipboard.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h4 className="font-semibold">Paste in your website</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Paste the code before the closing &lt;/body&gt; tag of your HTML pages.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h4 className="font-semibold">Test the chatbot</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Visit your website and look for the chatbot widget in the bottom-right corner.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <h4 className="font-semibold">You&apos;re all set!</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Your AI chatbot is now live and ready to help your website visitors.
              </p>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">What you get:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm">Secure and reliable hosting</span>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-green-600" />
                <span className="text-sm">Mobile-responsive design</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm">Fast loading and performance</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-sm">Works on any website</span>
              </div>
            </div>
          </div>

          {/* Platform Examples */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Compatible with popular platforms:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-700 dark:text-blue-300">
              <div>• WordPress</div>
              <div>• Shopify</div>
              <div>• Wix</div>
              <div>• Squarespace</div>
              <div>• HTML/CSS</div>
              <div>• React</div>
              <div>• Vue.js</div>
              <div>• And more...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}