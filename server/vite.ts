import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer, InlineConfig } from "vite";
import { Server } from "http";
import { IncomingMessage, ServerResponse } from 'http';
import { ViteDevServer } from "vite";
import { createLogger } from "vite";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const serverOptions: InlineConfig = {
  server: {
    middlewareMode: true,
    hmr: {
      port: 3000,
    },
    allowedHosts: ["localhost", "127.0.0.1"],
  },
};

export async function setupVite(app: any): Promise<Server> {
  const vite = await createServer(serverOptions);
  
  app.use(vite.middlewares);
  
  return app;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
