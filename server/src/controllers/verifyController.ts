import { Request, Response } from 'express';
import { runVerification } from '../services/verificationEngine';
import { VerificationInput } from '../types/verification';
import { recordVerification } from '../routes/history';
import { isUrl } from '../utils/normalization';

export async function verifyController(req: Request, res: Response): Promise<void> {
  const body = req.body as Partial<VerificationInput> | undefined;
  const type = body?.type;
  const value = body?.value;

  if (typeof type !== 'string' || typeof value !== 'string' || !type || !value.trim()) {
    res.status(400).json({ error: 'type and value are required' });
    return;
  }

  if (!['url', 'text'].includes(type)) {
    res.status(400).json({ error: 'type must be url or text' });
    return;
  }

  if (value.length > 10000) {
    res.status(400).json({ error: 'Input too large' });
    return;
  }

  if (type === 'url') {
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
        throw new Error('unsupported protocol');
      }
      if (parsed.hostname === 'localhost' || parsed.hostname.endsWith('.localhost')) {
        throw new Error('local host');
      }
    } catch {
      res.status(400).json({ error: 'value must be a valid public http(s) URL' });
      return;
    }
  }

  try {
    const result = await runVerification({ type: type as VerificationInput['type'], value });
    recordVerification({
      verificationId: result.verificationId,
      decision: result.decision.action,
      score: result.decision.score,
      type,
      createdAt: new Date().toISOString(),
    });
    res.json(result);
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed', details: (err as Error).message });
  }
}
