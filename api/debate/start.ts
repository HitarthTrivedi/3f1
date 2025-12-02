import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { debateConfigSchema } = await import('../../shared/schema.js');
    const { runDebate } = await import('../../server/lib/debateOrchestrator.js');
    
    const validatedConfig = debateConfigSchema.parse(req.body);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendMessage = (message: any) => {
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    };

    const messages = await runDebate(
      validatedConfig.topic,
      validatedConfig.agents,
      sendMessage
    );

    res.write(`data: ${JSON.stringify({ type: "complete", messages })}\n\n`);
    res.end();
    
  } catch (error) {
    console.error('Debate error:', error);
    
    return res.status(400).json({ 
      error: 'Invalid debate configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
