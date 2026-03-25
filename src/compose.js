import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const PAGE_CONFIG = {
  letter: { cssSize: 'letter', pageHeight: '10in' },
  a4: { cssSize: '210mm 297mm', pageHeight: '270mm' },
};

/**
 * Compose an HTML document with slide images and rendered notes,
 * two slides per page, ready for PDF printing.
 */
export function compose(slides, screenshots, options = {}) {
  const { size = 'letter' } = options;
  const config = PAGE_CONFIG[size];

  const rows = slides.map((slide, i) => {
    const screenshot = screenshots.find((s) => s.index === i);
    const imgSrc = screenshot
      ? `data:image/png;base64,${screenshot.buffer.toString('base64')}`
      : '';
    const renderedNote = slide.note ? md.render(slide.note) : '<p class="empty-note">No notes</p>';

    return `
      <div class="slide-row">
        <div class="slide-image">
          <div class="slide-label">Slide ${i + 1}</div>
          <img src="${imgSrc}" alt="Slide ${i + 1}" />
        </div>
        <div class="slide-notes"><div class="notes-inner">${renderedNote}</div></div>
      </div>`;
  });

  // Group rows into pairs (two per page)
  const pages = [];
  for (let i = 0; i < rows.length; i += 2) {
    const pair = rows.slice(i, i + 2).join('\n');
    pages.push(`<div class="page">${pair}\n</div>`);
  }

  return buildHtml(pages.join('\n'), config);
}

function buildHtml(body, config) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page {
    size: ${config.cssSize};
    margin: 0.5in;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 10pt;
    line-height: 1.4;
    color: #222;
  }

  .page {
    page-break-after: always;
    height: ${config.pageHeight};
    display: flex;
    flex-direction: column;
    gap: 0.25in;
  }

  .page:last-child {
    page-break-after: auto;
  }

  .slide-row {
    display: flex;
    flex: 1;
    gap: 0.2in;
    min-height: 0;
  }

  .slide-image {
    width: 55%;
    display: flex;
    flex-direction: column;
  }

  .slide-label {
    font-size: 8pt;
    color: #999;
    margin-bottom: 2pt;
  }

  .slide-image img {
    width: 100%;
    height: auto;
    border: 1px solid #ccc;
    display: block;
  }

  .slide-notes {
    width: 45%;
    border-left: 2px solid #e0e0e0;
    padding-left: 0.15in;
    position: relative;
    overflow: hidden;
    font-size: 10pt;
    line-height: 1.4;
  }

  .notes-inner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding-left: 0.15in;
  }

  .slide-notes p {
    margin-bottom: 0.5em;
  }

  .slide-notes ul, .slide-notes ol {
    margin-left: 1.2em;
    margin-bottom: 0.5em;
  }

  .slide-notes code {
    font-size: 9pt;
    background: #f5f5f5;
    padding: 1px 3px;
    border-radius: 2px;
  }

  .slide-notes a {
    color: #2563eb;
  }

  .empty-note {
    color: #bbb;
    font-style: italic;
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
