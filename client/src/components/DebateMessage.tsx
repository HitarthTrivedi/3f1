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
  blue: "bg-background border-primary",
  green: "bg-background border-foreground",
  orange: "bg-background border-muted-foreground/30",
};

const badgeColors = {
  blue: "bg-primary text-primary-foreground border-primary",
  green: "bg-foreground text-background border-foreground",
  orange: "bg-muted text-muted-foreground border-border",
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
        className={`p-8 rounded-none ${colorClasses[agentColor]} border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]`}
        data-testid={`message-${agentName.toLowerCase().replace(/\s+/g, '-')}-${round}`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-foreground/5 pb-4 relative">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-none ${badgeColors[agentColor]} border flex items-center justify-center font-black italic relative overflow-hidden`}>
                {agentNum}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-background/20" />
              </div>
              <div>
                <h4 className="font-black text-lg uppercase tracking-tighter leading-none" data-testid={`text-agent-name-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
                  {agentName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-primary uppercase font-bold tracking-widest" data-testid={`text-round-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
                    Round {round} / {totalRounds}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-foreground/20" />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Neural Response</span>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 text-[7px] font-black opacity-10 tracking-[0.2em] select-none">
              SEQ: {round}X-0{index}
            </div>
          </div>
          <div className="prose prose-lg prose-stone dark:prose-invert max-w-none font-medium leading-relaxed markdown-content selection:bg-primary selection:text-primary-foreground" data-testid={`text-message-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
            <ReactMarkdown>
              {(message || "").replace(/^Re:\s*(\*\*)?/gm, '$1')}
            </ReactMarkdown>
          </div>

          <div className="pt-4 border-t border-foreground/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-green-500/50" />
              <span className="text-[8px] uppercase font-black tracking-[0.3em] opacity-20">Neural_Transcription // OK</span>
            </div>
            <div className="text-[8px] uppercase font-black tracking-[0.2em] opacity-10">
              Processed via 3F1.CORE
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
