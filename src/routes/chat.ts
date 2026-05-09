import { Router, Request, Response } from 'express';
import { chat } from '../services/ragService';

const router = Router();

// POST /api/chat
// Body: { message: string }
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long — max 1000 characters' });
    }

    const answer = await chat(message.trim());
    return res.json({ answer });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;