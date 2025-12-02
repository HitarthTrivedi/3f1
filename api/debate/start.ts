import type { VercelRequest, VercelResponse } from '@vercel/node';
import { debateConfigSchema } from '../../shared/schema';
import { runDebate } from '../../server/lib/debateOrchestrator';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedConfig = debateConfigSchema.parse(req.body);

    // Set headers for Server-Sent Events
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
    res.status(400).json({ 
      error: 'Invalid debate configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### Step 4: Commit the file
1. Scroll down to the bottom
2. In "Commit new file" section:
   - Add commit message: `Create API endpoint for Vercel`
3. Click **"Commit new file"** button (green button)

---

## Visual Guide:
```
Click "Add file" → "Create new file"
                     ↓
Type in name box: api/debate/start.ts
                     ↓
Paste the code above
                     ↓
Scroll down and click "Commit new file"
```

---

## After creating this file:

Your folder structure should look like:
```
3f1/
├── api/           ← NEW!
│   └── debate/    ← NEW!
│       └── start.ts  ← NEW!
├── client/
├── server/
├── shared/
└── package.json
