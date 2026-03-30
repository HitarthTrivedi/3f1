import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentConfigCard from "@/components/AgentConfigCard";
import DebateTopicInput from "@/components/DebateTopicInput";
import DebateFeed, { type Message } from "@/components/DebateFeed";
import DownloadSection from "@/components/DownloadSection";
import ListenUpButton from "@/components/ListenUpButton";
import PaymentModal from "@/components/PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

interface AgentConfig {
  provider: string;
  model: string;
  apiKey: string;
}

export default function Home() {
  const { toast } = useToast();
  const { user, signOut, getIdToken, isLoading } = useAuth();
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
  const usesCredits = agents.some(a => a.provider === "builtin" || a.provider === "builtin_grok" || a.provider === "huggingface");

  // Check for active debate on mount
  useEffect(() => {
    const fetchActiveDebate = async () => {
      if (!user) return; // Only for logged in users

      try {
        const token = await getIdToken();
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch("/api/debate/active", { headers });
        if (!response.ok) return;

        const data = await response.json();

        if (data.hasActiveDebate && data.debate) {
          const activeDebate = data.debate;

          setTopic(activeDebate.topic);
          setMessages(activeDebate.messages);
          setDebateComplete(true);

          if (activeDebate.agents && activeDebate.agents.length === 3) {
            setAgent1({
              provider: activeDebate.agents[0].provider || "builtin",
              model: activeDebate.agents[0].model || "gemini-2.5-flash",
              apiKey: activeDebate.agents[0].apiKey || "",
            });
            setAgent2({
              provider: activeDebate.agents[1].provider || "builtin",
              model: activeDebate.agents[1].model || "gemini-2.5-flash",
              apiKey: activeDebate.agents[1].apiKey || "",
            });
            setAgent3({
              provider: activeDebate.agents[2].provider || "builtin",
              model: activeDebate.agents[2].model || "gemini-2.5-flash",
              apiKey: activeDebate.agents[2].apiKey || "",
            });
          }

          toast({
            title: "Session Restored",
            description: "Your previous debate synthesis has been restored.",
          });
        }
      } catch (error) {
        console.error("Failed to fetch active debate:", error);
      }
    };

    fetchActiveDebate();
  }, [user]);

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
      if (agent.provider === "builtin_grok") return "grok-4-latest";
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

    // Check keys for non-builtin agents
    if (agents.some(a => a.provider !== "builtin" && a.provider !== "builtin_grok" && a.provider !== "huggingface" && !a.apiKey)) {
      toast({
        title: "API keys required",
        description: "Please provide API keys for external providers, or use Built-in Agents.",
        variant: "destructive",
      });
      return;
    }

    // Check Credit Requirements ONLY if using Built-in
    if (usesCredits) {
      if (user) {
        const cost = 10;
        const free = user.freePrompts > 0;
        if (!free && user.credits < cost) {
          toast({
            title: "Insufficient Credits",
            description: "You need 10 credits to use Built-in Agents. Please buy more or use your own keys.",
            variant: "destructive"
          });
          return;
        }
      }
    }

    setIsDebating(true);
    setDebateComplete(false);
    setMessages([]);
    const agentColorMap = ["blue", "green", "orange"] as const;

    try {
      const token = await getIdToken();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/debate/start", {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic,
          agents: [
            { name: "Agent 1", provider: agent1.provider, model: model1, apiKey: agent1.apiKey },
            { name: "Agent 2", provider: agent2.provider, model: model2, apiKey: agent2.apiKey },
            { name: "Agent 3", provider: agent3.provider, model: model3, apiKey: agent3.apiKey },
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
      if (!reader) throw new Error("No response stream available");

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
      description: "Your debate synthesis is being downloaded as JSON.",
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground relative">
      <header className="border-b border-foreground/10 bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-none border-foreground/20 hover:border-foreground transition-all group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Logo className="text-2xl" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-none border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-3 h-8">
                  {user.credits} units
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentModal(true)}
                  className="h-8 px-3 rounded-none border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Buy
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-y-0 left-1/4 w-px bg-foreground" />
        <div className="absolute inset-y-0 left-2/4 w-px bg-foreground" />
        <div className="absolute inset-y-0 left-3/4 w-px bg-foreground" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex flex-col gap-2"
          >
            <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
              Operational <span className="italic">Unit</span> <span className="w-12 h-px bg-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              Neural <br /><span className="text-stroke text-primary">Workspace</span>
            </h2>
          </motion.div>
        </div>

        <div className="space-y-20 md:space-y-40">
          {/* SECTION 1: CONFIGURATION */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >


            <div className="flex flex-col mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                Step <span className="italic">01</span> <span className="w-12 h-px bg-primary" />
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                Configure <br /><span className="text-stroke">Your Agents</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-foreground/5 p-1 border border-foreground/10">
              <AgentConfigCard
                agentNumber={1}
                emoji="🤖"
                provider={agent1.provider}
                model={agent1.model}
                apiKey={agent1.apiKey}
                onProviderChange={(val) => setAgent1({ ...agent1, provider: val, model: val === "builtin" ? "gemini-2.0-flash" : val === "builtin_grok" ? "grok-4-latest" : val === "huggingface" ? "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated:featherless-ai" : agent1.model })}
                onModelChange={(val) => setAgent1({ ...agent1, model: val })}
                onApiKeyChange={(val) => setAgent1({ ...agent1, apiKey: val })}
              />
              <AgentConfigCard
                agentNumber={2}
                emoji="🦉"
                provider={agent2.provider}
                model={agent2.model}
                apiKey={agent2.apiKey}
                onProviderChange={(val) => setAgent2({ ...agent2, provider: val, model: val === "builtin" ? "gemini-2.0-flash" : val === "builtin_grok" ? "grok-4-latest" : val === "huggingface" ? "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated:featherless-ai" : agent2.model })}
                onModelChange={(val) => setAgent2({ ...agent2, model: val })}
                onApiKeyChange={(val) => setAgent2({ ...agent2, apiKey: val })}
              />
              <AgentConfigCard
                agentNumber={3}
                emoji="🦊"
                provider={agent3.provider}
                model={agent3.model}
                apiKey={agent3.apiKey}
                onProviderChange={(val) => setAgent3({ ...agent3, provider: val, model: val === "builtin" ? "gemini-2.0-flash" : val === "builtin_grok" ? "grok-4-latest" : val === "huggingface" ? "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated:featherless-ai" : agent3.model })}
                onModelChange={(val) => setAgent3({ ...agent3, model: val })}
                onApiKeyChange={(val) => setAgent3({ ...agent3, apiKey: val })}
              />
            </div>
          </motion.section>

          {/* SECTION 2: TOPIC INPUT */}
          <motion.section
            className="max-w-4xl mx-auto w-full relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >

            <div className="flex items-center gap-4 mb-12">
              <div className="h-px w-20 bg-primary/30" />
              <span className="text-[10px] uppercase tracking-[0.5em] font-black text-primary opacity-60 whitespace-nowrap">Input Transmission</span>
              <div className="h-px flex-1 bg-foreground/10" />
            </div>

            <div className="p-8 md:p-16 border-2 border-foreground bg-background shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,102,0,0.2)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] md:dark:shadow-[20px_20px_0px_0px_rgba(255,102,0,0.2)] relative overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05] bg-[linear-gradient(rgba(255,102,0,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary opacity-30 dark:opacity-40" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary opacity-30 dark:opacity-40" />

              <DebateTopicInput
                topic={topic}
                onTopicChange={setTopic}
                onStartDebate={handleStartDebate}
                isDebating={isDebating}
                startButtonText={
                  !usesCredits
                    ? "Initialize Debate —"
                    : !user
                      ? "Initialize Debate (1 Free) —"
                      : user.freePrompts > 0
                        ? `Initialize Debate (${user.freePrompts} Free) —`
                        : "Initialize Debate (10 Credits) —"
                }
                isStartDisabled={
                  !!(usesCredits && user && user.freePrompts <= 0 && user.credits < 10)
                }
              />
            </div>
          </motion.section>

          {/* SECTION 3: FEED */}
          {messages.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-20"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex items-center gap-4 w-full max-w-md">
                  <div className="h-px flex-1 bg-primary/20" />
                  <Badge variant="outline" className="rounded-none border-primary text-primary px-6 py-2 uppercase text-[10px] tracking-[0.5em] font-black bg-primary/5">Debate Active</Badge>
                  <div className="h-px flex-1 bg-primary/20" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
                  Intelligence <br /><span className="italic">Synthesis Feed</span>
                </h2>
              </div>
              <div className="p-1 bg-foreground/5 border border-foreground/10">
                <DebateFeed messages={messages} totalRounds={5} />
              </div>
            </motion.section>
          )}

          {/* SECTION 4: COMPLETION & DOWNLOAD */}
          {debateComplete && (
            <motion.section
              className="max-w-4xl mx-auto space-y-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-16 border-2 border-foreground/10 bg-muted/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                  <CreditCard size={200} />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                  <div className="text-[10px] uppercase tracking-[0.5em] font-black opacity-40">
                    {messages.length < 15 ? "Process Interrupted - Partial Data Recovered" : "Process Completed Successfully"}
                  </div>
                  <DownloadSection
                    onDownloadJson={handleDownloadJson}
                    onDownloadText={handleDownloadText}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-10 px-4 sm:px-0">
                <ListenUpButton messages={messages} />
                <Button
                  variant="outline"
                  className="rounded-none h-14 md:h-20 px-8 md:px-16 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-black uppercase text-sm md:text-base tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-4px] translate-y-[-4px] md:translate-x-[-8px] md:translate-y-[-8px] hover:translate-x-0 hover:translate-y-0 w-full md:w-auto"
                  onClick={async () => {
                    if (!user) {
                      toast({
                        title: "Registration Required",
                        description: "Please register to continue synthesising.",
                      });
                      setLocation("/auth");
                      return;
                    }

                    // Clear active debate from server
                    try {
                      const token = await getIdToken();
                      const headers: HeadersInit = {};
                      if (token) headers["Authorization"] = `Bearer ${token}`;

                      await fetch("/api/debate/active", {
                        method: "DELETE",
                        headers
                      });
                    } catch (error) {
                      console.error("Failed to clear active debate:", error);
                    }

                    if (usesCredits) {
                      window.location.reload();
                    } else {
                      setDebateComplete(false);
                      setMessages([]);
                      setIsDebating(false);
                      setTopic(""); // Clear topic as well for a fresh start
                    }
                  }}
                >
                  New Instance —
                </Button>
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />

      {/* Payment Modal */}
      <PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} />

    </div>
  );
}
