import { describe, it, expect } from 'vitest';
import { extractKeywords, findLinks, type Note } from './notes.js';

describe('extractKeywords', () => {
  it('ranks frequent non-stopwords first', () => {
    const kw = extractKeywords('release release release the and todo todo');
    expect(kw[0]).toBe('release');
    expect(kw).toContain('todo');
    expect(kw).not.toContain('the');
  });
});

describe('findLinks', () => {
  it('links notes that share keywords, not unrelated ones', () => {
    const notes: Note[] = [
      { file: 'a.md', title: 'A', content: 'kubernetes deploy pipeline kubernetes deploy' },
      { file: 'b.md', title: 'B', content: 'kubernetes deploy rollback kubernetes deploy' },
      { file: 'c.md', title: 'C', content: 'cooking recipe pasta tomato basil' },
    ];
    const links = findLinks(notes, 2);
    expect(links.get('a.md')).toContain('b.md');
    expect(links.get('a.md')).not.toContain('c.md');
  });
});
