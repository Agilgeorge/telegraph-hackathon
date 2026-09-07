import axios from 'axios';
import * as cheerio from 'cheerio';
import dns from 'node:dns/promises';
import net from 'node:net';
import { ExtractedContent } from '../types/verification';

function isPrivateAddress(address: string): boolean {
  if (net.isIPv4(address)) {
    const [first, second] = address.split('.').map(Number);
    return first === 10 || first === 127 || first === 0 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168);
  }

  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') ||
      normalized.startsWith('fe8') || normalized.startsWith('fe9') ||
      normalized.startsWith('fea') || normalized.startsWith('feb');
  }

  return true;
}

async function assertPublicUrl(value: string): Promise<void> {
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error('Only public http(s) URLs can be fetched');
  }
  if (parsed.hostname === 'localhost' || parsed.hostname.endsWith('.localhost')) {
    throw new Error('Local URLs cannot be fetched');
  }

  const addresses = net.isIP(parsed.hostname)
    ? [parsed.hostname]
    : (await dns.lookup(parsed.hostname, { all: true })).map((entry) => entry.address);
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new Error('Private or local network URLs cannot be fetched');
  }
}

export async function extractContent(url: string): Promise<ExtractedContent> {
  await assertPublicUrl(url);
  const requestOptions = {
    timeout: 10000,
    headers: { 'User-Agent': 'TrustMesh/1.0 (verification agent)' },
    maxRedirects: 0,
  };
  const response = await axios.get(url, requestOptions);

  const html = typeof response.data === 'string' ? response.data : String(response.data);
  const $ = cheerio.load(html.slice(0, 500000));

  // Remove noise
  $('script, style, nav, footer, header, aside, .ad, .advertisement').remove();

  const title = $('title').text().trim() || $('h1').first().text().trim();

  // Try article body first, fall back to main, then body
  const content =
    $('article').text().trim() ||
    $('main').text().trim() ||
    $('body').text().trim();

  return {
    title,
    content: content.replace(/\s+/g, ' ').slice(0, 3000),
    url,
  };
}
