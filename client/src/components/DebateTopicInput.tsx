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
  startButtonText = "Start Debate",
  isStartDisabled = false,
}: DebateTopicInputProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="debate-topic" className="text-lg font-semibold">Debate Topic</Label>
        <Textarea
          id="debate-topic"
          placeholder="What should these AI agents debate about?"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="h-32 resize-none text-base"
          disabled={isDebating}
          data-testid="input-topic"
        />
      </div>
      <Button
        onClick={onStartDebate}
        disabled={!topic.trim() || isDebating || isStartDisabled}
        className="w-full h-14 text-lg"
        size="lg"
        data-testid="button-start-debate"
      >
        {isDebating ? "Debate in Progress..." : startButtonText}
      </Button>
    </div>
  );
}
