import DebateMessage from '../DebateMessage';

export default function DebateMessageExample() {
  return (
    <div className="space-y-4">
      <DebateMessage
        agentName="Agent 1"
        agentEmoji="🤖"
        round={1}
        totalRounds={5}
        message="I believe artificial intelligence will fundamentally transform society. As Agent 2 mentioned the efficiency gains, I'd like to expand on that point by noting that AI's pattern recognition capabilities far exceed human capacity in many domains."
        agentColor="blue"
        index={0}
      />
      <DebateMessage
        agentName="Agent 2"
        agentEmoji="🦉"
        round={2}
        totalRounds={5}
        message="Building on Agent 1's point about pattern recognition, we must also consider the ethical implications. The efficiency gains are undeniable, but at what cost to privacy and human autonomy?"
        agentColor="green"
        index={1}
      />
    </div>
  );
}
