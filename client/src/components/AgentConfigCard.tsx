import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgentConfigCardProps {
  agentNumber: number;
  emoji: string;
  provider: string;
  model: string;
  apiKey: string;
  onProviderChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
}

const agentColors = [
  "bg-primary text-primary-foreground border-primary",
  "bg-foreground text-background border-foreground",
  "bg-muted text-muted-foreground border-border"
];

export default function AgentConfigCard({
  agentNumber,
  emoji,
  provider,
  model,
  apiKey,
  onProviderChange,
  onModelChange,
  onApiKeyChange,
}: AgentConfigCardProps) {
  const colorClass = agentColors[agentNumber - 1] || agentColors[0];

  return (
    <Card className="relative p-8 rounded-none border-2 border-foreground bg-background shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,102,0,0.2)] transition-all overflow-hidden group" data-testid={`card-agent-${agentNumber}`}>
      {/* Tech Backdrop Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05] bg-[linear-gradient(rgba(255,102,0,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
      <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary opacity-20 dark:opacity-30" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary opacity-20 dark:opacity-30" />


      <div className="space-y-8">
        <div className="flex items-center gap-5 mb-4">
          <div className={`w-14 h-14 rounded-none ${colorClass} flex items-center justify-center border-2 font-black text-2xl relative`}>
            {agentNumber}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-background border-t-2 border-l-2 border-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none" data-testid={`text-agent-${agentNumber}`}>
              Agent <span className="text-primary">{agentNumber}</span>
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2.5">
            <Label htmlFor={`provider-${agentNumber}`} className="text-[9px] uppercase font-black tracking-[0.2em] opacity-50">Intelligence Provider</Label>
            <Select value={provider} onValueChange={onProviderChange}>
              <SelectTrigger id={`provider-${agentNumber}`} className="rounded-none border-foreground/10 h-12 font-bold focus:ring-0 focus:border-primary transition-colors text-xs" data-testid={`select-provider-${agentNumber}`}>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <SelectItem value="builtin">Built-in Gemma (Credits)</SelectItem>
                <SelectItem value="builtin_grok">Built-in Grok (Credits)</SelectItem>
                <SelectItem value="huggingface" disabled>Uncensored (Soon)</SelectItem>
                <SelectItem value="openai">ChatGPT</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="grok">Grok</SelectItem>
                <SelectItem value="perplexity">Perplexity</SelectItem>
                <SelectItem value="custom">Custom API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor={`model-${agentNumber}`} className="text-[9px] uppercase font-black tracking-[0.2em] opacity-50">Neural Model</Label>
            <Input
              id={`model-${agentNumber}`}
              className="rounded-none border-foreground/10 h-12 font-bold focus:ring-0 focus:border-primary transition-colors text-xs placeholder:opacity-20"
              placeholder="e.g., gpt-4o"
              value={
                provider === "builtin" ? "gemma-4-31b-it" :
                  provider === "builtin_grok" ? "grok-4-latest" :
                    provider === "huggingface" ? "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated:featherless-ai" :
                      model
              }
              onChange={(e) => onModelChange(e.target.value)}
              disabled={provider === "builtin" || provider === "builtin_grok" || provider === "huggingface"}
              data-testid={`input-model-${agentNumber}`}
            />
          </div>

          {provider !== "builtin" && provider !== "builtin_grok" && provider !== "huggingface" ? (
            <div className="space-y-2.5">
              <Label htmlFor={`api-key-${agentNumber}`} className="text-[9px] uppercase font-black tracking-[0.2em] opacity-50">Access Secret (API Key)</Label>
              <Input
                id={`api-key-${agentNumber}`}
                type="password"
                className="rounded-none border-foreground/10 h-12 font-mono text-xs focus:ring-0 focus:border-primary transition-colors"
                placeholder="••••••••••••••••••••••••"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                data-testid={`input-apikey-${agentNumber}`}
              />
            </div>
          ) : (
            <div className="p-4 bg-muted/20 border border-dashed border-foreground/10 rounded-none">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 italic">Hybrid Tunnel Protocol Active</span>
              </div>
              <p className="text-[8px] uppercase tracking-widest opacity-30 mt-1 font-bold">No external key required</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
