# notemind

**Local-first automation for your markdown notes.** Point notemind at a notes folder and
it summarizes each note, tags it by keywords, links related notes together, and rolls it
all into a daily digest — so your "second brain" maintains itself.

[![CI](https://github.com/niklasmarderx/notemind/actions/workflows/ci.yml/badge.svg)](https://github.com/niklasmarderx/notemind/actions/workflows/ci.yml)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](#license)

## What it does

- **Summaries** — a one-sentence summary per note (LLM).
- **Tags** — keyword tags extracted locally (no network needed).
- **Links** — notes that share enough keywords are cross-linked automatically.
- **Digest** — one markdown file tying the day's notes together, with an LLM overview.

Everything stays on your machine. The tagging and linking are deterministic and run
offline; only the summaries use an LLM, and there's an offline stub when no key is set.

## Install

```sh
npm install -g notemind     # or: git clone … && npm install && npm run build
```

## Use

```sh
notemind digest --dir ~/notes                 # print a digest of the folder
notemind digest --dir ~/notes --out digest.md # …or write it to a file
notemind tag ~/notes/meeting.md --dir ~/notes # summary + tags for one note
notemind watch --dir ~/notes --out digest.md  # regenerate the digest on every change
```

## LLM backend

Without a key, notemind uses a deterministic stub for summaries. To use a real model:

```sh
export ANTHROPIC_API_KEY=sk-ant-...
export ANTHROPIC_MODEL=claude-opus-5-5   # optional; override for a gateway's model
export ANTHROPIC_BASE_URL=https://…      # optional; point at a proxy/gateway
```

Tags and links never call the network — they work the same with or without a key.

## How linking works

Each note's top keywords (stopwords removed, English + German) form its fingerprint. Two
notes are linked when they share at least two keywords. It's simple, explainable, and
needs no embeddings — a good default you can later swap for semantic similarity.

## Roadmap

- Semantic linking via embeddings (optional, alongside the keyword default).
- Honor existing `[[wikilinks]]` and backlinks.
- Per-note frontmatter (write tags back into the files).
- Weekly/monthly rollups.

## License

Licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or
[MIT license](LICENSE-MIT) at your option.
