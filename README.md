# slidev-export-notes

Export [Slidev](https://sli.dev) presentations as a PDF with speaker notes. Each page contains two slides stacked vertically with their rendered speaker notes alongside, similar to PowerPoint's "Notes Page" view.

## Installation

```bash
npm install --save-dev slidev-export-notes
```

## Usage

Run from within a Slidev project directory:

```bash
npx slidev-export-notes
```

This will parse your `slides.md`, start a Slidev dev server, screenshot each slide, and produce a `slides-notes.pdf` in the project root.

## CLI Options

| Option | Description | Default |
|---|---|---|
| `-s, --slides <file>` | Path to slides markdown file | `slides.md` |
| `-o, --output <file>` | Output PDF filename | `slides-notes.pdf` |
| `-p, --port <number>` | Port for Slidev dev server | `3030` |
| `-h, --help` | Display help | |

## Output

The generated PDF is Letter-sized (8.5" x 11") with two slides per page. Each slide is shown with its screenshot on the left and speaker notes (rendered from Markdown) on the right.

## License

MIT
