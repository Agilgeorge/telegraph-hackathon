'use client';

import { useState } from 'react';
import { VerificationResult } from '../types/verification';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useVerify() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(value: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    const type = value.startsWith('http://') || value.startsWith('https://') ? 'url' : 'text';

    try {
      const res = await fetch(`${API_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value }),
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
          ? await res.json() as { error?: string }
          : null;
        throw new Error(data?.error || `Verification failed (${res.status})`);
      }

      const data: VerificationResult = await res.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return { verify, result, loading, error };
}
