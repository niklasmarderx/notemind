#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { loadNotes, suggestTags } from './notes.js';
import { buildDigest, summarizeNote } from './digest.js';
import { createProvider } from './llm.js';

const [command, ...rest] = process.argv.slice(2);

function flag(name: string, fallback: string): string {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 && rest[i + 1] ? rest[i + 1] : fallback;
}

const today = (): string => new Date().toISOString().slice(0, 10);

async function makeDigest(dir: string, out: string | null): Promise<void> {
  const notes = await loadNotes(dir);
  const provider = createProvider();
  const md = await buildDigest(notes, provider, today());
  if (out) {
    await writeFile(out, md, 'utf8');
    console.error(`wrote ${out} (${notes.length} notes, ${provider.name} backend)`);
  } else {
    console.log(md);
  }
}

async function main(): Promise<void> {
  const dir = flag('dir', '.');
  const out = flag('out', '') || null;

  switch (command) {
    case 'digest':
      await makeDigest(dir, out);
      break;
    case 'tag': {
      const file = rest[0];
      if (!file) {
        console.error('usage: notemind tag <file> [--dir path]');
        process.exit(1);
      }
      const note = (await loadNotes(dir)).find((n) => n.file === file);
      if (!note) {
        console.error(`note not found: ${file}`);
        process.exit(1);
      }
      const provider = createProvider();
      console.log('Summary:', await summarizeNote(provider, note));
      console.log('Tags:', suggestTags(note.content).join(', '));
      break;
    }
    case 'watch': {
      console.error(`watching ${dir} … Ctrl-C to stop`);
      let timer: NodeJS.Timeout | null = null;
      const regen = (): void => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => void makeDigest(dir, out).catch((e) => console.error(e)), 500);
      };
      watch(dir, regen);
      regen();
      break;
    }
    default:
      console.log('notemind <digest|tag <file>|watch> [--dir path] [--out file]');
      if (command && command !== 'help') process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
