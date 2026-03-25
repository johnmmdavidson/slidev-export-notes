#!/usr/bin/env node
import { program } from 'commander';
import { exportNotes } from '../src/index.js';

program
  .name('slidev-export-notes')
  .description('Export Slidev slides with speaker notes as PDF')
  .option('-s, --slides <file>', 'Path to slides markdown file', 'slides.md')
  .option('-o, --output <file>', 'Output PDF filename', 'slides-notes.pdf')
  .option('-p, --port <number>', 'Port for Slidev dev server', '3030')
  .action(async (opts) => {
    try {
      await exportNotes({
        slidesFile: opts.slides,
        output: opts.output,
        port: parseInt(opts.port, 10),
      });
    } catch (err) {
      console.error('Export failed:', err.message);
      process.exit(1);
    }
  });

program.parse();
