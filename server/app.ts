import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

export async function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();
        const path = req.path;
        let capturedJsonResponse: Record<string, any> | undefined = undefined;

        const originalResJson = res.json;
        res.json = function (bodyJson: unknown) {
            capturedJsonResponse = bodyJson as Record<string, any>;
            return originalResJson.call(res, bodyJson);
        };

        res.on("finish", () => {
            const duration = Date.now() - start;
            if (path.startsWith("/api")) {
                let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
                if (capturedJsonResponse) {
                    logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
                }

                if (logLine.length > 80) {
                    logLine = logLine.slice(0, 79) + "…";
                }

                console.log(logLine);
            }
        });

        next();
    });

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        console.error("Server Error:", err);
    });

    return { app, server };
}
