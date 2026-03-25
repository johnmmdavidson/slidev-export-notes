# slidev-export-notes

Export [Slidev](https://sli.dev) presentations as a PDF with speaker notes — like PowerPoint's "Notes Page" view.

Each page of the PDF contains two slides stacked vertically, each with its rendered speaker notes alongside.

![Example output](docs/example-output.png)

## Why

Slidev's built-in `export-notes` command exports notes as text only — this tool gives you the slide images alongside your notes for a complete rehearsal document. Useful for:

- Reviewing your talk with notes visible
- Sharing a presentation with collaborators who need the context
- Printing a rehearsal copy

## Install

```bash
npm install --save-dev slidev-export-notes
```

Or run directly:

```bash
npx slidev-export-notes
```

## Usage

Run from inside any Slidev project directory (where your `slides.md` lives):

```bash
npx slidev-export-notes
```

This will:
1. Start the Slidev dev server automatically
2. Screenshot each slide
3. Render your speaker notes as formatted HTML
4. Produce a PDF with two slides per page, notes alongside each
5. Shut down the server

Output: `slides-notes.pdf` in your project directory.

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --slides <file>` | Path to slides markdown file | `slides.md` |
| `-o, --output <file>` | Output PDF filename | `slides-notes.pdf` |
| `-p, --port <number>` | Port for Slidev dev server | `3030` |
| `-z, --size <size>` | Page size: `letter` or `a4` | `letter` |
| `-V, --version` | Show version | |
| `-h, --help` | Show help | |

## Speaker Notes

Both of Slidev's note syntaxes are supported:

**HTML comment syntax:**
```markdown
## My Slide

Content here

<!--
Speaker notes go here.
They support **markdown** formatting.
-->
```

**Triple-colon syntax:**
```markdown
## My Slide

Content here

:::
Speaker notes go here.
They support **markdown** formatting.
:::
```

## Requirements

- Node.js 18+
- A Slidev project with `slidev` as a dependency

## How It Works

The tool parses your `slides.md` to extract note blocks, launches Playwright to screenshot each rendered slide from the dev server, composes an HTML layout with the slide images and rendered notes, then prints it to PDF. Notes text is auto-fitted to the available space.

## License

MIT
