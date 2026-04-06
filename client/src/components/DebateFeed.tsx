import DebateMessage from "./DebateMessage";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export interface Message {
  id: string;
  agentName: string;
  round: number;
  message: string;
  thinking?: string;
  agentColor: "blue" | "green" | "orange";
}

interface DebateFeedProps {
  messages: Message[];
  totalRounds: number;
  isDebating: boolean;
}

export default function DebateFeed({ messages, totalRounds, isDebating }: DebateFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScroll, setShowScroll] = useState(false);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      setShowScroll(true);
      // Only auto-scroll when a new message arrives during an active debate.
      // Do NOT scroll when restoring a stored debate on page load.
      if (isDebating) {
        setTimeout(scrollToBottom, 100);
      }
    } else {
      setShowScroll(false);
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 relative" data-testid="container-debate-feed">
      <div className="space-y-12 pb-24">
        {messages.map((msg, index) => (
          <DebateMessage
            key={msg.id}
            agentName={msg.agentName}
            agentEmoji=""
            round={msg.round}
            totalRounds={totalRounds}
            message={msg.message}
            thinking={msg.thinking}
            agentColor={msg.agentColor}
            index={index}
          />
        ))}
        {/* Invisible element to scroll to */}
        <div ref={bottomRef} className="h-1" />
      </div>

      {showScroll && (
        <div className="fixed bottom-4 right-4 md:bottom-12 md:right-12 z-50">
          <Button
            onClick={scrollToBottom}
            size="icon"
            className="w-10 h-10 md:w-14 md:h-14 rounded-none bg-primary text-primary-foreground hover:bg-foreground hover:text-background border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
            title="Scroll to Newest Message"
          >
            <ArrowDown className="w-4 h-4 md:w-6 md:h-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
