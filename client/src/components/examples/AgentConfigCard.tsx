import { useState } from 'react';
import AgentConfigCard from '../AgentConfigCard';

export default function AgentConfigCardExample() {
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AgentConfigCard
        agentNumber={1}
        emoji=""
        provider={provider}
        model={model}
        apiKey={apiKey}
        onProviderChange={setProvider}
        onModelChange={setModel}
        onApiKeyChange={setApiKey}
      />
    </div>
  );
}
