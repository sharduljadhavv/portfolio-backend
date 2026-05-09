import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { KNOWLEDGE_BASE } from '../data/knowledge';
import { generateEmbedding } from '../services/geminiService';

interface EmbeddedChunk {
  id: string;
  content: string;
  category: string;
  source: string;
  embedding: number[];
}

const OUTPUT_PATH = path.join(__dirname, '../../embeddings.json');

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ingest() {
  console.log('Starting ingestion...');
  console.log(`Found ${KNOWLEDGE_BASE.length} chunks to embed\n`);

  const embedded: EmbeddedChunk[] = [];
  let failed = 0;

  for (let i = 0; i < KNOWLEDGE_BASE.length; i++) {
    const doc = KNOWLEDGE_BASE[i];
    const label = `[${i + 1}/${KNOWLEDGE_BASE.length}] ${doc.source}`;

    try {
      process.stdout.write(`Embedding ${label}...`);
      const embedding = await generateEmbedding(doc.content);

      embedded.push({
        id:       `${doc.category}-${doc.source}`,
        content:  doc.content,
        category: doc.category,
        source:   doc.source,
        embedding,
      });

      process.stdout.write(` done\n`);

      // Small delay to avoid Gemini rate limits
      if (i < KNOWLEDGE_BASE.length - 1) await sleep(300);

    } catch (err: any) {
      process.stdout.write(` FAILED: ${err.message}\n`);
      failed++;
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(embedded, null, 2));

  console.log('\n--------------------------------');
  console.log(`Done — ${embedded.length} chunks embedded`);
  if (failed > 0) console.log(`${failed} chunks failed — re-run to retry`);
  console.log(`Saved to: embeddings.json`);
  console.log('--------------------------------');
  console.log('\nCommit embeddings.json to your repo.');
  console.log('Re-run only when you update knowledge.ts\n');
}

ingest().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});