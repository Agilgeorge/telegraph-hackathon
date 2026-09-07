export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

export function isUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}
