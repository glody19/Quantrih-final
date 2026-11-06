import { createApp } from "../server-app.js";

// Vercel serverless entry: every /api/* request is routed here (see vercel.json).
// Long-running features of server.ts (WebSocket relay, daily asset build) do not run on Vercel.
export default createApp();
