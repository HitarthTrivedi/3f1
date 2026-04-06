import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Brain } from "lucide-react";

const ROUND_LABELS: Record<number, string> = {
  1: "Opening Statement",
  2: "Rebuttal",
  3: "Deep Analysis",
  4: "Counter-Arguments",
  5: "Closing Statement",
};

/** Strip any residual prompt-echo artifacts before rendering */
function cleanMessageForDisplay(raw: string): string {
  let text = raw;
  // Strip tags
  text = text.replace(/@@@ANSWER_START@@@/g, '');
  text = text.replace(/@@@ANSWER_END@@@/g, '');
  // Strip echoed prompt fields
  text = text.replace(/^\*\*Debate topic:\*\*.*$/gim, '');
  text = text.replace(/^\*\*Round:\*\*.*$/gim, '');
  text = text.replace(/^Round \d+ of \d+.*$/gim, '');
  text = text.replace(/^\*\*Previous arguments:\*\*.*$/gim, '');
  text = text.replace(/^Now respond as .*$/gim, '');
  text = text.replace(/^Format your response.*$/gim, '');
  text = text.replace(/^Start directly with.*$/gim, '');
  text = text.replace(/^Role:.*$/gim, '');
  text = text.replace(/^Topic:.*$/gim, '');
  text = text.replace(/^Goal:.*$/gim, '');
  text = text.replace(/^Output Format:.*$/gim, '');
  text = text.replace(/^Constraints:.*$/gim, '');
  text = text.replace(/^\*?\s*(Formal|Logical|Concise|Bulleted|No "Re:")\??\s*(Yes|No)\.?\s*$/gim, '');
  text = text.replace(/^([-•*]\s*)Re:\s*/gim, '$1');
  text = text.replace(/^([-•*]\s*)Regarding:\s*/gim, '$1');
  text = text.replace(/^---+\s*$/gim, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

interface DebateMessageProps {
  agentName: string;
  agentEmoji: string;
  round: number;
  totalRounds: number;
  message: string;
  thinking?: string;
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

const agentRoles: Record<string, string> = {
  "Agent 1": "The Analyst",
  "Agent 2": "The Critic",
  "Agent 3": "The Synthesizer",
};

export default function DebateMessage({
  agentName,
  agentEmoji,
  round,
  totalRounds,
  message,
  thinking,
  agentColor,
  index,
}: DebateMessageProps) {
  const agentNum = agentNumbers[agentName] || 1;
  const agentRole = agentRoles[agentName] || agentName;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isThinkingOpen, setIsThinkingOpen] = useState(false);
  const roundLabel = ROUND_LABELS[round] || "";

  const cleanedMessage = useMemo(() => cleanMessageForDisplay(message || ""), [message]);
  const words = cleanedMessage.split(" ");
  const isLongMessage = words.length > 80;

  const displayMessage = isExpanded || !isLongMessage
    ? cleanedMessage
    : words.slice(0, 80).join(" ") + "…";

  // Estimate thinking word count for "Thought for Xs" label
  const thinkingWords = thinking ? thinking.trim().split(/\s+/).length : 0;
  const thinkingSeconds = thinking ? Math.max(1, Math.round(thinkingWords / 40)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card
        className={`rounded-none ${colorClasses[agentColor]} border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.04)] md:dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.04)] overflow-hidden`}
        data-testid={`message-${agentName.toLowerCase().replace(/\s+/g, '-')}-${round}`}
      >
        {/* Header bar */}
        <div className={`px-5 py-3 flex items-center justify-between gap-4 border-b border-foreground/8 ${agentColor === 'blue' ? 'bg-primary/5' : agentColor === 'green' ? 'bg-foreground/5' : 'bg-muted/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 shrink-0 rounded-none ${badgeColors[agentColor]} border flex items-center justify-center font-black text-sm relative overflow-hidden`}>
              {agentNum}
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-background/20" />
            </div>
            <div>
              <h4 className="font-sans font-black text-sm uppercase tracking-tighter leading-none" data-testid={`text-agent-name-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
                {agentName} <span className="opacity-40 font-medium normal-case tracking-normal text-xs">— {agentRole}</span>
              </h4>
            </div>
          </div>
          <span className="text-[10px] text-primary uppercase font-bold tracking-widest whitespace-nowrap shrink-0 opacity-80" data-testid={`text-round-${agentName.toLowerCase().replace(/\s+/g, '-')}`}>
            {roundLabel || `Round ${round}`}
          </span>
        </div>

        {/* Thinking section (collapsible) */}
        {thinking && (
          <div className="border-b border-foreground/8 bg-foreground/[0.02]">
            <button
              onClick={() => setIsThinkingOpen(v => !v)}
              className="w-full flex items-center gap-2 px-5 py-2.5 text-left hover:bg-foreground/5 transition-colors group"
            >
              <Brain className="w-3.5 h-3.5 text-primary/60 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/40 group-hover:text-foreground/60 transition-colors">
                Thought for ~{thinkingSeconds}s
              </span>
              <motion.span
                animate={{ rotate: isThinkingOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronDown className="w-3.5 h-3.5 text-foreground/30" />
              </motion.span>
            </button>

            <AnimatePresence>
              {isThinkingOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pt-1 text-[13px] leading-relaxed text-foreground/40 font-normal italic border-l-2 border-primary/20 ml-5 mr-5 mb-2">
                    <pre className="whitespace-pre-wrap font-sans">{thinking.trim()}</pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Message body */}
        <div className="px-6 py-5 md:px-8 md:py-6">
          <div
            className="text-[15px] leading-[1.75] text-foreground/90 selection:bg-primary selection:text-primary-foreground"
            data-testid={`text-message-${agentName.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-lg font-black uppercase tracking-tight mb-4 mt-0 text-foreground border-b border-foreground/10 pb-2" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-base font-black uppercase tracking-tight mb-3 mt-5 text-foreground" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-sm font-black uppercase tracking-tight mb-2 mt-4 text-foreground" {...props} />,
                h4: ({ node, ...props }) => <h4 className="text-sm font-bold mb-2 mt-3 text-foreground" {...props} />,
                p: ({ node, children, ...props }) => (
                  <p className="mb-3 last:mb-0 leading-relaxed" {...props}>{children}</p>
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-black text-foreground" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="not-italic font-bold text-primary/80 text-[13px] uppercase tracking-wide mr-1" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="space-y-3 mb-4 pl-0 list-none" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="space-y-3 mb-4 pl-0 list-none" {...props} />
                ),
                li: ({ node, children, ...props }) => (
                  <li className="flex gap-3 items-start" {...props}>
                    <span className={`mt-[6px] w-1.5 h-1.5 shrink-0 rounded-none ${agentColor === 'blue' ? 'bg-primary' : agentColor === 'green' ? 'bg-foreground' : 'bg-muted-foreground'}`} />
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-primary/40 pl-4 py-1 mb-4 bg-foreground/[0.02] italic" {...props} />
                ),
                code: ({ node, inline, ...props }: any) => inline
                  ? <code className="bg-foreground/8 px-1.5 py-0.5 rounded text-[12px] font-mono text-primary" {...props} />
                  : <code className="block bg-foreground/5 p-3 md:p-4 rounded text-[11px] md:text-sm my-4 font-mono overflow-x-auto" {...props} />,
                hr: () => <hr className="border-foreground/10 my-4" />,
              }}
            >
              {displayMessage}
            </ReactMarkdown>

            {isLongMessage && (
              <div className="mt-4 flex justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-none h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/5 text-primary px-3"
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-3 h-3 mr-1" />Show Less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3 mr-1" />Read More</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
