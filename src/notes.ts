import { readdir, readFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const NOTE_EXTS = ['.md', '.markdown', '.txt'];
const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'your', 'you', 'are', 'was', 'but',
  'not', 'have', 'has', 'will', 'can', 'der', 'die', 'das', 'und', 'mit', 'für', 'von',
  'den', 'ist', 'ein', 'eine', 'auf', 'zu', 'dem', 'des', 'nicht', 'auch', 'sich',
]);

export interface Note {
  file: string;
  title: string;
  content: string;
}

export async function loadNotes(dir: string): Promise<Note[]> {
  const files = (await readdir(dir)).filter((f) => NOTE_EXTS.includes(extname(f).toLowerCase())).sort();
  const notes: Note[] = [];
  for (const file of files) {
    const content = await readFile(join(dir, file), 'utf8');
    notes.push({ file, title: titleOf(content, file), content });
  }
  return notes;
}

function titleOf(content: string, file: string): string {
  const heading = content.split('\n').find((l) => l.startsWith('# '));
  return heading ? heading.replace(/^#\s+/, '').trim() : basename(file, extname(file));
}

export function extractKeywords(text: string, n = 8): string[] {
  const freq = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[a-zäöüß0-9][a-zäöüß0-9-]{2,}/g) ?? []) {
    if (STOPWORDS.has(word)) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

export function suggestTags(text: string, n = 3): string[] {
  return extractKeywords(text, n);
}

/** Link notes that share at least `minShared` keywords. */
export function findLinks(notes: Note[], minShared = 2): Map<string, string[]> {
  const keywords = new Map(notes.map((note) => [note.file, new Set(extractKeywords(note.content, 10))]));
  const links = new Map<string, string[]>();
  for (const a of notes) {
    const related: string[] = [];
    for (const b of notes) {
      if (a.file === b.file) continue;
      const setA = keywords.get(a.file) as Set<string>;
      const setB = keywords.get(b.file) as Set<string>;
      const shared = [...setA].filter((w) => setB.has(w));
      if (shared.length >= minShared) related.push(b.file);
    }
    links.set(a.file, related);
  }
  return links;
}
