import * as fs from 'fs';
import * as path from 'path';
import { generateResponse } from './geminiService';

interface EmbeddedChunk {
  id: string;
  content: string;
  category: string;
  source: string;
  embedding: number[];
}

const EMBEDDINGS_PATH = path.join(__dirname, '../../embeddings.json');
let chunks: EmbeddedChunk[] = [];

function loadEmbeddings(): void {
  try {
    const raw = fs.readFileSync(EMBEDDINGS_PATH, 'utf-8');
    chunks = JSON.parse(raw);
    console.log(`Loaded ${chunks.length} chunks from embeddings.json`);
  } catch (err) {
    console.error('Failed to load embeddings.json');
    process.exit(1);
  }
}

loadEmbeddings();

function isFollowUp(message: string): boolean {
  const signals = [
    'how exactly', 'how did you', 'walk me through',
    'explain more', 'tell me more', 'go deeper',
    'in detail', 'specifically', 'what was the',
    'why did you', 'how does it work',
  ];
  const lower = message.toLowerCase();
  return signals.some(s => lower.includes(s));
}

// Send ALL chunks — no embedding needed at query time
export async function chat(userMessage: string): Promise<string> {
  const allChunks = chunks.map(c => c.content);
  const followUp = isFollowUp(userMessage);
  return generateResponse(userMessage, allChunks, followUp);
}
// import * as fs from 'fs';
// import * as path from 'path';
// import { generateEmbedding, generateResponse } from './geminiService';

// // ── Types ─────────────────────────────────────────────────
// interface EmbeddedChunk {
//   id: string;
//   content: string;
//   category: string;
//   source: string;
//   embedding: number[];
// }

// // ── Load embeddings once on startup ──────────────────────
// const EMBEDDINGS_PATH = path.join(__dirname, '../../embeddings.json');
// let chunks: EmbeddedChunk[] = [];

// function loadEmbeddings(): void {
//   try {
//     const raw = fs.readFileSync(EMBEDDINGS_PATH, 'utf-8');
//     chunks = JSON.parse(raw);
//     console.log(`Loaded ${chunks.length} embedded chunks from embeddings.json`);
//   } catch (err) {
//     console.error('Failed to load embeddings.json — run npm run ingest first');
//     process.exit(1);
//   }
// }

// loadEmbeddings();

// // ── Cosine Similarity ────────────────────────────────────
// function cosineSimilarity(a: number[], b: number[]): number {
//   let dot = 0, normA = 0, normB = 0;
//   for (let i = 0; i < a.length; i++) {
//     dot   += a[i] * b[i];
//     normA += a[i] * a[i];
//     normB += b[i] * b[i];
//   }
//   return dot / (Math.sqrt(normA) * Math.sqrt(normB));
// }

// // ── Similarity Search ────────────────────────────────────
// async function findRelevantChunks(
//   query: string,
//   topK: number = 5
// ): Promise<string[]> {
//   const queryEmbedding = await generateEmbedding(query);

//   const scored = chunks.map(chunk => ({
//     content: chunk.content,
//     score:   cosineSimilarity(queryEmbedding, chunk.embedding),
//   }));

//   return scored
//     .sort((a, b) => b.score - a.score)
//     .slice(0, topK)
//     .map(c => c.content);
// }

// // ── Detect follow-up / deep dive questions ───────────────
// function isFollowUp(message: string): boolean {
//   const followUpSignals = [
//     'how exactly', 'how did you', 'walk me through',
//     'explain more', 'tell me more', 'go deeper',
//     'in detail', 'specifically', 'what was the',
//     'why did you', 'how does it work',
//   ];
//   const lower = message.toLowerCase();
//   return followUpSignals.some(signal => lower.includes(signal));
// }

// // ── Main chat function ───────────────────────────────────
// export async function chat(
//   userMessage: string,
// ): Promise<string> {
//   const relevantChunks = await findRelevantChunks(userMessage);
//   const followUp = isFollowUp(userMessage);
//   return generateResponse(userMessage, relevantChunks, followUp);
// }