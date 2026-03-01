import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface DebateTopicInputProps {
  topic: string;
  onTopicChange: (value: string) => void;
  onStartDebate: () => void;
  isDebating: boolean;
  startButtonText?: string;
  isStartDisabled?: boolean;
}

export default function DebateTopicInput({
  topic,
  onTopicChange,
  onStartDebate,
  isDebating,
  startButtonText = "Start Debate —",
  isStartDisabled = false,
}: DebateTopicInputProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="debate-topic" className="text-[10px] uppercase font-black tracking-[0.4em] opacity-60">The Thesis Topic</Label>
        <Textarea
          id="debate-topic"
          placeholder="What should these AI agents debate about?"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="h-48 resize-none text-lg font-medium rounded-none border-2 border-foreground/10 focus:border-foreground transition-colors bg-background placeholder:opacity-30"
          disabled={isDebating}
          data-testid="input-topic"
        />
      </div>
      <Button
        onClick={onStartDebate}
        disabled={!topic.trim() || isDebating || isStartDisabled}
        className="w-full h-16 text-sm font-black uppercase tracking-widest rounded-none bg-primary text-primary-foreground hover:bg-foreground hover:text-background transition-all border-2 border-transparent hover:border-foreground"
        size="lg"
        data-testid="button-start-debate"
      >
        {isDebating ? "Intelligence Loading..." : startButtonText}
      </Button>
    </div>
  );
}
