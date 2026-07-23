# Server

Express + Socket.io market depth simulator.

See the root [README.md](../README.md) for install, run, and design notes.

```bash
npm install
npm run dev
```

- `POST /start-market` → `{ status: "running" }`
- WebSocket namespace `/marketbook` → `book-update` events
