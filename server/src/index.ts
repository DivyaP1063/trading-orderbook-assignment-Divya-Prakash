import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { MarketSimulator } from "./simulator";

const PORT = Number(process.env.PORT) || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
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
});
