import { Router, Request, Response } from 'express';

const router = Router();

// In-memory store for MVP — swap for DB later
const history: unknown[] = [];

export function recordVerification(result: unknown): void {
  history.unshift(result);
  if (history.length > 100) history.pop();
}

router.get('/', (_req: Request, res: Response) => {
  res.json(history.slice(0, 20));
});

export default router;
