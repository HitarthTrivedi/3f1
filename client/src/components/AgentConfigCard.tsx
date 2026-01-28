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
  "bg-primary/10 border-primary/20",
  "bg-secondary/10 border-secondary/20",
  "bg-accent/10 border-accent/20"
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
    <Card className="p-6 hover-elevate" data-testid={`card-agent-${agentNumber}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center border`}>
            <span className="text-lg font-bold">{agentNumber}</span>
          </div>
          <h3 className="text-xl font-bold" data-testid={`text-agent-${agentNumber}`}>
            Agent {agentNumber}
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`provider-${agentNumber}`}>Provider</Label>
          <Select value={provider} onValueChange={onProviderChange}>
            <SelectTrigger id={`provider-${agentNumber}`} data-testid={`select-provider-${agentNumber}`}>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="builtin">Built-in AI (Uses Credits)</SelectItem>
              <SelectItem value="huggingface">Uncensored (Uses Credits)</SelectItem>
              <SelectItem value="openai">ChatGPT</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="perplexity">Perplexity</SelectItem>
              <SelectItem value="custom">Custom API</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`model-${agentNumber}`}>Model</Label>
          <Input
            id={`model-${agentNumber}`}
            placeholder="e.g., gpt-4o"
            value={provider === "builtin" ? "gemini-2.0-flash" : provider === "huggingface" ? "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated:featherless-ai" : model}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={provider === "builtin" || provider === "huggingface"}
            data-testid={`input-model-${agentNumber}`}
          />
        </div>

        {provider !== "builtin" && provider !== "huggingface" ? (
          <div className="space-y-2">
            <Label htmlFor={`api-key-${agentNumber}`}>API Key</Label>
            <Input
              id={`api-key-${agentNumber}`}
              type="password"
              placeholder="Enter API key"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              data-testid={`input-apikey-${agentNumber}`}
            />
          </div>
        ) : (
          <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground border">
            Using built-in credits. No API key required.
          </div>
        )}
      </div>
    </Card>
  );
}
