import DebateMessage from "./DebateMessage";

export interface Message {
  id: string;
  agentName: string;
  round: number;
  message: string;
  agentColor: "blue" | "green" | "orange";
}

interface DebateFeedProps {
  messages: Message[];
  totalRounds: number;
}

export default function DebateFeed({ messages, totalRounds }: DebateFeedProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12" data-testid="container-debate-feed">
      <div className="space-y-12">
        {messages.map((msg, index) => (
          <DebateMessage
            key={msg.id}
            agentName={msg.agentName}
            agentEmoji=""
            round={msg.round}
            totalRounds={totalRounds}
            message={msg.message}
            agentColor={msg.agentColor}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
