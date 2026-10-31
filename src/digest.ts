import type { Note } from './notes.js';
import { suggestTags, findLinks } from './notes.js';
import type { LlmProvider } from './llm.js';

export async function summarizeNote(provider: LlmProvider, note: Note): Promise<string> {
  const prompt = `Summarize this note in one sentence.\n\nTitle: ${note.title}\n\n${note.content}`;
  return (await provider.complete(prompt)).trim();
}

export async function buildDigest(notes: Note[], provider: LlmProvider, date: string): Promise<string> {
  const links = findLinks(notes);
  const lines: string[] = [`# Note digest — ${date}`, '', `${notes.length} note(s).`, ''];
  const summaries: string[] = [];

  for (const note of notes) {
    const summary = await summarizeNote(provider, note);
    summaries.push(`- ${note.title}: ${summary}`);
    const tags = suggestTags(note.content);
    const related = links.get(note.file) ?? [];
    lines.push(`## ${note.title}  \`${note.file}\``);
    lines.push(summary);
    lines.push(`**Tags:** ${tags.join(', ') || '—'}`);
    lines.push(`**Related:** ${related.join(', ') || '—'}`);
    lines.push('');
  }

  const overview = (await provider.complete(
    `Give a two-sentence overview tying together these notes:\n${summaries.join('\n')}`,
  )).trim();
  lines.splice(4, 0, '## Overview', overview, '');
  return lines.join('\n');
}
