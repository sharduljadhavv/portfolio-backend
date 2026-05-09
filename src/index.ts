import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/chat', chatRouter);

// Health check — useful for Render to verify the server is alive
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Shardul RAG API is running' });
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});