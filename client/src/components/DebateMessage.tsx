import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const words = message?.split(" ") || [];
  const isLongMessage = words.length > 50;

  const displayMessage = isExpanded || !isLongMessage
    ? message
    : words.slice(0, 50).join(" ") + "...";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        className={`p-4 sm:p-6 md:p-8 rounded-none ${colorClasses[agentColor]} border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] md:dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]`}
        data-testid={`message-${agentName.toLowerCase().replace(/\s+/g, '-')}-${round}`}
      >
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4 border-b border-foreground/5 pb-4 relative">
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
              <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-none ${badgeColors[agentColor]} border flex items-center justify-center font-black italic relative overflow-hidden`}>
                {agentNum}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-background/20" />
              </div>
              <div className="min-w-0">
                <h4 className="font-sans font-black text-base md:text-lg uppercase tracking-tighter leading-none truncate" data-testid={`text-agent-name-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
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

            <div className="hidden md:block absolute top-0 right-0 text-[7px] font-black opacity-10 tracking-[0.2em] select-none">
              SEQ: {round}X-0{index}
            </div>
          </div>
          <div className="font-sans text-[15px] md:text-base max-w-none font-medium leading-[1.8] text-foreground/90 markdown-content selection:bg-primary selection:text-primary-foreground space-y-4" data-testid={`text-message-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-foreground/50" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 marker:text-foreground/50" {...props} />,
                li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-4 mt-8 text-foreground" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 mt-6 text-foreground" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2 mt-5 text-foreground" {...props} />,
                h4: ({ node, ...props }) => <h4 className="text-base font-bold mb-2 mt-4 text-foreground" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/40 pl-4 py-1 italic mb-4 bg-foreground/[0.02]" {...props} />,
                code: ({ node, inline, ...props }: any) => inline
                  ? <code className="bg-foreground/5 px-1.5 py-0.5 rounded text-[11px] md:text-sm relative -top-px font-mono text-primary" {...props} />
                  : <code className="block bg-foreground/5 p-3 md:p-4 rounded text-[10px] md:text-sm my-4 font-mono overflow-x-auto" {...props} />
              }}
            >
              {(displayMessage || "").replace(/^Re:\s*(\*\*)?/gm, '$1')}
            </ReactMarkdown>

            {isLongMessage && (
              <div className="mt-4 flex justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-none h-8 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-foreground/5 text-primary"
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Show Less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Read More</>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="pt-3 md:pt-4 border-t border-foreground/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-green-500/50" />
              <span className="text-[8px] uppercase font-black tracking-[0.3em] opacity-20">Neural_Transcription // OK</span>
            </div>
            <div className="text-[8px] uppercase font-black tracking-[0.2em] opacity-10">
              Processed via <span className="font-logo">3F1</span>.CORE
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
