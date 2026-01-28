import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentConfigCard from "@/components/AgentConfigCard";
import DebateTopicInput from "@/components/DebateTopicInput";
import DebateFeed, { type Message } from "@/components/DebateFeed";
import DownloadSection from "@/components/DownloadSection";
import PaymentModal from "@/components/PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface AgentConfig {
  provider: string;
  model: string;
  apiKey: string;
}

export default function Home() {
  const { toast } = useToast();
  const { user, signOut, getIdToken } = useAuth();
  const [_, setLocation] = useLocation();
  const [topic, setTopic] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [debateComplete, setDebateComplete] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [agent1, setAgent1] = useState<AgentConfig>({
    provider: "",
    model: "",
    apiKey: "",
  });

  const [agent2, setAgent2] = useState<AgentConfig>({
    provider: "",
    model: "",
    apiKey: "",
  });

  const [agent3, setAgent3] = useState<AgentConfig>({
    provider: "",
    model: "",
    apiKey: "",
  });

  const agents = [agent1, agent2, agent3];
  const usesCredits = agents.some(a => a.provider === "builtin" || a.provider === "huggingface");

  const handleStartDebate = async () => {
    if (!agent1.provider || !agent2.provider || !agent3.provider) {
      toast({
        title: "Configuration incomplete",
        description: "Please configure all three agents before starting the debate.",
        variant: "destructive",
      });
      return;
    }

    const getModel = (agent: AgentConfig) => {
      if (agent.provider === "builtin") return "gemini-2.0-flash";
      if (agent.provider === "huggingface") return "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated:featherless-ai";
      return agent.model;
    };

    const model1 = getModel(agent1);
    const model2 = getModel(agent2);
    const model3 = getModel(agent3);

    if (!model1 || !model2 || !model3) {
      toast({
        title: "Model selection required",
        description: "Please specify a model for each agent.",
        variant: "destructive",
      });
      return;
    }

    // --- Refined Subscription Flow: Built-in vs BYOK ---
    const agents = [agent1, agent2, agent3];
    const usesCredits = agents.some(a => a.provider === "builtin" || a.provider === "huggingface");

    // Check keys for non-builtin agents
    if (agents.some(a => a.provider !== "builtin" && a.provider !== "huggingface" && !a.apiKey)) {
      toast({
        title: "API keys required",
        description: "Please provide API keys for external providers, or use Built-in AI.",
        variant: "destructive",
      });
      return;
    }

    // Check Credit Requirements ONLY if using Built-in
    if (usesCredits) {
      if (user) {
        // Logged In: Check Credits
        const cost = 10;
        const free = user.freePrompts > 0;

        if (!free && user.credits < cost) {
          toast({
            title: "Insufficient Credits",
            description: "You need 10 credits to use Built-in/Uncensored AI. Please buy more or use your own keys.",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Anonymous: Server tracks usage. 
        // We let it proceed. If session limit reached, server returns 401.
      }
    }

    setIsDebating(true);
    setDebateComplete(false);
    setMessages([]);

    const agentColorMap = ["blue", "green", "orange"] as const;

    try {
      // Get Firebase token if user is logged in
      const token = await getIdToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/debate/start", {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic,
          agents: [
            {
              name: "Agent 1",
              provider: agent1.provider,
              model: model1,
              apiKey: agent1.apiKey,
            },
            {
              name: "Agent 2",
              provider: agent2.provider,
              model: model2,
              apiKey: agent2.apiKey,
            },
            {
              name: "Agent 3",
              provider: agent3.provider,
              model: model3,
              apiKey: agent3.apiKey,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = "Failed to start debate";
        let requiresAuth = false;
        try {
          const json = JSON.parse(errText);
          errMsg = json.error || errMsg;
          requiresAuth = json.requiresAuth;
        } catch { }

        if (requiresAuth) {
          toast({
            title: "Free Limit Reached",
            description: "You have used your 1 free anonymous prompt. Please login to continue.",
            variant: "destructive",
            action: <Link href="/auth"><Button variant="outline" size="sm">Login</Button></Link>
          });
          setIsDebating(false);
          return;
        }

        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream available");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "complete") {
                setIsDebating(false);
                setDebateComplete(true);
                toast({
                  title: "Debate Complete",
                  description: "All rounds have finished. You can now download the transcript.",
                });
                // Refresh to show updated credits
                // if (user) setTimeout(() => window.location.reload(), 1500);

              } else if (data.type === "error") {
                throw new Error(data.error);
              } else {
                const message: Message = {
                  id: data.id,
                  agentName: data.agentName,
                  round: data.round,
                  message: data.message,
                  agentColor: agentColorMap[data.agentNumber - 1],
                };
                setMessages(prev => [...prev, message]);
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE message:", line);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Debate error:", error);
      setIsDebating(false);
      toast({
        title: "Debate failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
        action: error.message?.includes("credits") ? (
          <Button size="sm" onClick={() => setShowPaymentModal(true)}>Buy Credits</Button>
        ) : undefined
      });
    }
  };

  const handleDownloadJson = () => {
    const transcript = {
      topic,
      agents: [
        { name: 'Agent 1', provider: agent1.provider, model: agent1.model },
        { name: 'Agent 2', provider: agent2.provider, model: agent2.model },
        { name: 'Agent 3', provider: agent3.provider, model: agent3.model },
      ],
      messages: messages.map(m => ({
        agent: m.agentName,
        round: m.round,
        message: m.message,
      })),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3f1-debate-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your debate transcript is being downloaded as JSON.",
    });
  };

  const handleDownloadText = () => {
    let textContent = `3F1 Debate Transcript\n`;
    textContent += `Topic: ${topic}\n`;
    textContent += `Date: ${new Date().toLocaleString()}\n\n`;
    textContent += `Agents:\n`;
    textContent += `- Agent 1 (${agent1.provider}, ${agent1.model})\n`;
    textContent += `- Agent 2 (${agent2.provider}, ${agent2.model})\n`;
    textContent += `- Agent 3 (${agent3.provider}, ${agent3.model})\n\n`;
    textContent += `Debate:\n\n`;

    messages.forEach(m => {
      textContent += `${m.agentName} (Round ${m.round}):\n`;
      textContent += `${m.message}\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3f1-debate-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your debate transcript is being downloaded as text.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black font-logo" data-testid="text-logo">3F1</h1>
              <p className="text-sm text-muted-foreground">Configure & Debate</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium">Credits: {user.credits}</div>
                  <div className="text-xs text-muted-foreground">Free Prompts: {user.freePrompts}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowPaymentModal(true)}>
                  <CreditCard className="h-4 w-4 mr-1" />
                  Buy Credits
                </Button>
                <Button size="sm" variant="ghost" onClick={signOut}>Logout</Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm">Login / Register</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-12">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8">Configure Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AgentConfigCard
                agentNumber={1}
                emoji="🤖"
                provider={agent1.provider}
                model={agent1.model}
                apiKey={agent1.apiKey}
                onProviderChange={(val) => setAgent1({ ...agent1, provider: val, model: val === "builtin" ? "gemini-2.0-flash" : val === "huggingface" ? "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated:featherless-ai" : agent1.model })}
                onModelChange={(val) => setAgent1({ ...agent1, model: val })}
                onApiKeyChange={(val) => setAgent1({ ...agent1, apiKey: val })}
              />
              <AgentConfigCard
                agentNumber={2}
                emoji="🦉"
                provider={agent2.provider}
                model={agent2.model}
                apiKey={agent2.apiKey}
                onProviderChange={(val) => setAgent2({ ...agent2, provider: val, model: val === "builtin" ? "gemini-2.0-flash" : val === "huggingface" ? "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated:featherless-ai" : agent2.model })}
                onModelChange={(val) => setAgent2({ ...agent2, model: val })}
                onApiKeyChange={(val) => setAgent2({ ...agent2, apiKey: val })}
              />
              <AgentConfigCard
                agentNumber={3}
                emoji="🦊"
                provider={agent3.provider}
                model={agent3.model}
                apiKey={agent3.apiKey}
                onProviderChange={(val) => setAgent3({ ...agent3, provider: val, model: val === "builtin" ? "gemini-2.0-flash" : val === "huggingface" ? "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated:featherless-ai" : agent3.model })}
                onModelChange={(val) => setAgent3({ ...agent3, model: val })}
                onApiKeyChange={(val) => setAgent3({ ...agent3, apiKey: val })}
              />
            </div>
          </motion.section>

          <motion.section
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DebateTopicInput
              topic={topic}
              onTopicChange={setTopic}
              onStartDebate={handleStartDebate}
              isDebating={isDebating}
              startButtonText={
                !usesCredits
                  ? "Start Debate" // No cost for external keys
                  : !user
                    ? "Start Debate (1 Free)"
                    : user.freePrompts > 0
                      ? `Start Debate (${user.freePrompts} Free)`
                      : "Start Debate (10 Credits)"
              }
              isStartDisabled={
                // Disable if user logged in, no free prompts, and insufficient credits ONLY if using credits
                !!(usesCredits && user && user.freePrompts <= 0 && user.credits < 10)
              }
            />
            {/* Adding an overlay or message if credits low, or modifying component. 
                For now, I'll assume I need to modify DebateTopicInput or wrapping it.
                Wait, I can't check DebateTopicInput content easily without reading it. 
                I will read it first to be safe, but typically I should pass props. 
                Let's assume I need to modify DebateTopicInput to accept a custom label/disabled prop.
            */}
          </motion.section>

          {messages.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <DebateFeed messages={messages} totalRounds={5} />
            </motion.section>
          )}

          {debateComplete && (
            <motion.section
              className="max-w-3xl mx-auto space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DownloadSection
                onDownloadJson={handleDownloadJson}
                onDownloadText={handleDownloadText}
              />

              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => {
                    // If user is anonymous, "Another Debate" means they likely used their 1 free prompt.
                    // The requirement says: "when user clicks it, he will get a login or register button"
                    if (!user) {
                      toast({
                        title: "Registration Required",
                        description: "Please register to continue debating.",
                      });
                      setLocation("/auth");
                      return;
                    }

                    // If using credits, we reload to ensure credit balance is updated from server
                    // This satisfies "redirects to the credits" (or refreshes UI) ONLY when clicking this.
                    if (usesCredits) {
                      window.location.reload();
                    } else {
                      // If using external keys, just reset state without reload
                      setDebateComplete(false);
                      setMessages([]);
                      setIsDebating(false);
                    }
                  }}
                >
                  Start Another Debate
                </Button>
              </div>
            </motion.section>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} />
    </div>
  );
}
