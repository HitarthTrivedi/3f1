import { useState } from 'react';
import DebateTopicInput from '../DebateTopicInput';

export default function DebateTopicInputExample() {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);

  const handleStart = () => {
    console.log('Start debate:', topic);
    setIsDebating(true);
    setTimeout(() => setIsDebating(false), 3000);
  };

  return (
    <DebateTopicInput
      topic={topic}
      onTopicChange={setTopic}
      onStartDebate={handleStart}
      isDebating={isDebating}
    />
  );
}
