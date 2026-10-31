import { describe, it, expect } from 'vitest';
import { buildDigest } from './digest.js';
import { StubProvider } from './llm.js';
import type { Note } from './notes.js';

describe('buildDigest', () => {
  it('includes titles, tags, links and stub summaries', async () => {
    const notes: Note[] = [
      { file: 'a.md', title: 'Alpha', content: '# Alpha\nrelease plan release plan deploy' },
      { file: 'b.md', title: 'Beta', content: '# Beta\nrelease notes release notes deploy' },
    ];
    const md = await buildDigest(notes, new StubProvider(), '2026-10-31');
    expect(md).toContain('Note digest — 2026-10-31');
    expect(md).toContain('## Alpha');
    expect(md).toContain('**Tags:**');
    expect(md).toContain('stub summary');
    expect(md).toContain('b.md'); // Alpha links to Beta (shared keywords)
  });
});
