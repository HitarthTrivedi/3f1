import DebateFeed from '../DebateFeed';

export default function DebateFeedExample() {
  const mockMessages = [
    {
      id: '1',
      agentName: 'Agent 1',
      round: 1,
      message: 'I believe artificial intelligence will fundamentally transform society in positive ways.',
      agentColor: 'blue' as const,
    },
    {
      id: '2',
      agentName: 'Agent 2',
      round: 1,
      message: 'While Agent 1 makes an optimistic point, we must consider the ethical implications and potential risks.',
      agentColor: 'green' as const,
    },
    {
      id: '3',
      agentName: 'Agent 3',
      round: 1,
      message: 'Both perspectives have merit. I\'d like to expand on Agent 2\'s concern by examining specific case studies.',
      agentColor: 'orange' as const,
    },
  ];

  return <DebateFeed messages={mockMessages} totalRounds={5} />;
}
