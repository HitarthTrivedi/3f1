import { createApp } from '../server/app';

// Cache the app instance for cold start optimization
let appPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
    try {
        if (!appPromise) {
            appPromise = createApp().then(({ app }) => app);
        }

        const app = await appPromise;
        app(req, res);
    } catch (err: any) {
        console.error("Critical Handler Error:", err);
        // Send plain text to ensure visibility even if JSON fails
        res.status(500).send(`CRITICAL SERVER ERROR:\n${err.message}\n\nSTACK:\n${err.stack}`);
    }
}
