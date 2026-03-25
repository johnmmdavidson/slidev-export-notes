import { chromium } from 'playwright-chromium';

/**
 * Render an HTML string to a PDF file using Playwright.
 * Auto-fits note text by shrinking font size until content fits its container.
 */
export async function renderPdf(html, outputPath, options = {}) {
  const { size = 'letter' } = options;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle' });

  // Auto-fit: measure each .notes-inner against its .slide-notes parent
  // and shrink font until content fits the available height.
  await page.evaluate(() => {
    const MIN_FONT_PT = 6;
    const STEP_PT = 0.5;

    for (const outer of document.querySelectorAll('.slide-notes')) {
      const inner = outer.querySelector('.notes-inner');
      if (!inner) continue;

      let fontPt = 10;
      while (inner.offsetHeight > outer.clientHeight && fontPt > MIN_FONT_PT) {
        fontPt -= STEP_PT;
        inner.style.fontSize = `${fontPt}pt`;
        inner.style.lineHeight = `${1.2 + (fontPt - MIN_FONT_PT) * 0.05}`;
      }
    }
  });

  await page.pdf({
    path: outputPath,
    format: size === 'a4' ? 'A4' : 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();
}
