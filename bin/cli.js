#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { program } from 'commander';
import { exportNotes } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

program
  .name('slidev-export-notes')
  .description('Export Slidev slides with speaker notes as PDF')
  .version(pkg.version)
  .option('-s, --slides <file>', 'Path to slides markdown file', 'slides.md')
  .option('-o, --output <file>', 'Output PDF filename', 'slides-notes.pdf')
  .option('-p, --port <number>', 'Port for Slidev dev server', '3030')
  .option('-z, --size <size>', 'Page size: "letter" or "a4"', 'letter')
  .action(async (opts) => {
    const size = opts.size.toLowerCase();
    if (size !== 'letter' && size !== 'a4') {
      console.error(`Invalid page size: "${opts.size}". Use "letter" or "a4".`);
      process.exit(1);
    }
    try {
      await exportNotes({
        slidesFile: opts.slides,
        output: opts.output,
        port: parseInt(opts.port, 10),
        size,
      });
    } catch (err) {
      console.error('Export failed:', err.message);
      process.exit(1);
    }
  });

program.parse();
