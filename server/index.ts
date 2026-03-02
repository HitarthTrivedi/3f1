import "dotenv/config";
import { log } from "./vite";
import { createApp } from "./app";
import { setupVite, serveStatic } from "./vite";

(async () => {
  const { app, server } = await createApp();

  // Setup Vite only in development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);

  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      // ANSI styles
      const blue = "\x1b[34m";
      const cyan = "\x1b[36m";
      const bold = "\x1b[1m";
      const reset = "\x1b[0m";

      const localUrl = `http://localhost:${port}`;
      const networkUrl = `http://0.0.0.0:${port}`;

      log(`${bold}🚀 Server running:${reset}`);
      log(`${cyan}👉 Local:${reset}   ${blue}${localUrl}${reset}`);
      log(`${cyan}👉 Network:${reset} ${blue}${networkUrl}${reset}`);
    }
  );
})();