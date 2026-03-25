import fs from 'node:fs';
import path from 'node:path';
import { parseSlides } from './parse-slides.js';
import { startServer } from './server.js';
import { screenshotSlides } from './screenshot.js';
import { compose } from './compose.js';
import { renderPdf } from './render-pdf.js';

export async function exportNotes(options = {}) {
  const {
    slidesFile = 'slides.md',
    output = 'slides-notes.pdf',
    port = 3030,
    projectDir = process.cwd(),
  } = options;

  // 1. Parse slides
  const slidesPath = path.resolve(projectDir, slidesFile);
  if (!fs.existsSync(slidesPath)) {
    throw new Error(`Slides file not found: ${slidesPath}`);
  }
  const slides = parseSlides(fs.readFileSync(slidesPath, 'utf-8'));
  console.log(`Found ${slides.length} slides`);

  // 2. Start server
  console.log('Starting Slidev dev server...');
  const server = await startServer(projectDir, port, slidesFile);
  console.log(`Server ready on port ${server.port}`);

  try {
    // 3. Screenshot slides
    console.log('Capturing slides...');
    const screenshots = await screenshotSlides(server.port, slides.length);

    // 4. Compose HTML
    console.log('Composing layout...');
    const html = compose(slides, screenshots);

    // 5. Render PDF
    const outputPath = path.resolve(projectDir, output);
    console.log('Rendering PDF...');
    await renderPdf(html, outputPath);

    console.log(`Done — exported to ${outputPath}`);
  } finally {
    await server.stop();
  }
}
