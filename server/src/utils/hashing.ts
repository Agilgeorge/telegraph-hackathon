import { createHash } from 'crypto';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function shortId(input: string): string {
  return createHash('md5').update(input).digest('hex').slice(0, 8);
}
