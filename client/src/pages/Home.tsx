import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentConfigCard from "@/components/AgentConfigCard";
import DebateTopicInput from "@/components/DebateTopicInput";
import DebateFeed, { type Message } from "@/components/DebateFeed";
import DownloadSection from "@/components/DownloadSection";
import { useToast } from "@/hooks/use-toast";

interface AgentConfig {
  provider: string;
  model: string;
  apiKey: string;
}

export default function Home() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [debateComplete, setDebateComplete] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

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

  const handleStartDebate = async () => {
    if (!agent1.provider || !agent2.provider || !agent3.provider) {
      toast({
        title: "Configuration incomplete",
        description: "Please configure all three agents before starting the debate.",
        variant: "destructive",
      });
      return;
    }

    if (!agent1.model || !agent2.model || !agent3.model) {
      toast({
        title: "Model selection required",
        description: "Please specify a model for each agent.",
        variant: "destructive",
      });
      return;
    }

    if (!agent1.apiKey || !agent2.apiKey || !agent3.apiKey) {
      toast({
        title: "API keys required",
        description: "All agents need API keys to participate in the debate.",
        variant: "destructive",
      });
      return;
    }

    setIsDebating(true);
    setDebateComplete(false);
    setMessages([]);

    const agentColorMap = ["blue", "green", "orange"] as const;

    try {
      const response = await fetch("/api/debate/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          agents: [
            {
              name: "Agent 1",
              provider: agent1.provider,
              model: agent1.model,
              apiKey: agent1.apiKey,
            },
            {
              name: "Agent 2",
              provider: agent2.provider,
              model: agent2.model,
              apiKey: agent2.apiKey,
            },
            {
              name: "Agent 3",
              provider: agent3.provider,
              model: agent3.model,
              apiKey: agent3.apiKey,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start debate");
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
    } catch (error) {
      console.error("Debate error:", error);
      setIsDebating(false);
      toast({
        title: "Debate failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please check your API keys and try again.",
        variant: "destructive",
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
                onProviderChange={(val) => setAgent1({ ...agent1, provider: val })}
                onModelChange={(val) => setAgent1({ ...agent1, model: val })}
                onApiKeyChange={(val) => setAgent1({ ...agent1, apiKey: val })}
              />
              <AgentConfigCard
                agentNumber={2}
                emoji="🦉"
                provider={agent2.provider}
                model={agent2.model}
                apiKey={agent2.apiKey}
                onProviderChange={(val) => setAgent2({ ...agent2, provider: val })}
                onModelChange={(val) => setAgent2({ ...agent2, model: val })}
                onApiKeyChange={(val) => setAgent2({ ...agent2, apiKey: val })}
              />
              <AgentConfigCard
                agentNumber={3}
                emoji="🦊"
                provider={agent3.provider}
                model={agent3.model}
                apiKey={agent3.apiKey}
                onProviderChange={(val) => setAgent3({ ...agent3, provider: val })}
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
            />
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
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DownloadSection
                onDownloadJson={handleDownloadJson}
                onDownloadText={handleDownloadText}
              />
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
}
