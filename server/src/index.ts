import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { MarketSimulator } from "./simulator";

const PORT = Number(process.env.PORT) || 5000;

/** Local Vite + deployed Vercel — both can call this API / Socket.io. */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173", // vite preview
  "http://127.0.0.1:4173",
  "https://trading-orderbook-assignment-divya.vercel.app",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // curl / same-origin / health checks
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Vercel preview deployments: https://*.vercel.app
  try {
    const host = new URL(origin).hostname;
    return host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    callback(null, isOriginAllowed(origin));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
});

const simulator = new MarketSimulator();
let activeConnections = 0;

app.get("/", (_req, res) => {
  res.json({
    service: "market-depth-backend",
    status: simulator.isRunning() ? "running" : "idle",
    connections: activeConnections,
  });
});

/** Starts the in-memory market simulator. */
app.post("/start-market", (_req, res) => {
  simulator.start();
  res.json({ status: "running" });
});

const marketbook = io.of("/marketbook");

marketbook.on("connection", (socket) => {
  activeConnections += 1;
  console.log(
    `[marketbook] client connected (${socket.id}) — active: ${activeConnections}`
  );

  // Ensure simulator is running when someone connects
  simulator.start();

  // Immediately send the current book
  socket.emit("book-update", simulator.getBook());

  const unsubscribe = simulator.onUpdate((book) => {
    socket.emit("book-update", book);
  });

  socket.on("disconnect", () => {
    unsubscribe();
    activeConnections = Math.max(0, activeConnections - 1);
    console.log(
      `[marketbook] client disconnected (${socket.id}) — active: ${activeConnections}`
    );
    // Graceful stop when no clients remain
    simulator.stopIfIdle(activeConnections);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket namespace: /marketbook`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
