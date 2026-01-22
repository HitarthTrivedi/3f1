import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";


interface DebateMessageProps {
  agentName: string;
  agentEmoji: string;
  round: number;
  totalRounds: number;
  message: string;
  agentColor: "blue" | "green" | "orange";
  index: number;
}

const agentNumbers: Record<string, number> = {
  "Agent 1": 1,
  "Agent 2": 2,
  "Agent 3": 3,
};

const colorClasses = {
  blue: "bg-primary/5 border-primary/20",
  green: "bg-secondary/5 border-secondary/20",
  orange: "bg-accent/5 border-accent/20",
};

const badgeColors = {
  blue: "bg-primary/10 border-primary/30 text-primary",
  green: "bg-secondary/10 border-secondary/30 text-secondary-foreground",
  orange: "bg-accent/10 border-accent/30 text-accent-foreground",
};

export default function DebateMessage({
  agentName,
  agentEmoji,
  round,
  totalRounds,
  message,
  agentColor,
  index,
}: DebateMessageProps) {
  const agentNum = agentNumbers[agentName] || 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        className={`p-6 ${colorClasses[agentColor]} border hover-elevate`}
        data-testid={`message-${agentName.toLowerCase().replace(/\s+/g, '-')}-${round}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${badgeColors[agentColor]} border flex items-center justify-center font-bold`}>
                {agentNum}
              </div>
              <div>
                <h4 className="font-bold text-base" data-testid={`text-agent-name-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
                  {agentName}
                </h4>
                <span className="text-xs text-muted-foreground" data-testid={`text-round-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
                  Round {round} of {totalRounds}
                </span>
              </div>
            </div>
          </div>
          <div className="prose prose-lg prose-stone dark:prose-invert max-w-none font-serif leading-loose markdown-content" data-testid={`text-message-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
            <ReactMarkdown>
              {(message || "").replace(/^Re:\s*(\*\*)?/gm, '$1')}
            </ReactMarkdown>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
