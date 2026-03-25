import { chromium } from 'playwright-chromium';

/**
 * Screenshot each slide from the running Slidev dev server.
 * Returns an array of { index, buffer } with PNG buffers.
 */
export async function screenshotSlides(port, slideCount) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 960, height: 540 });

  const screenshots = [];

  for (let i = 1; i <= slideCount; i++) {
    await page.goto(`http://localhost:${port}/${i}`, {
      waitUntil: 'networkidle',
    });
    // Small delay for CSS transitions to settle
    await page.waitForTimeout(200);

    const buffer = await page.screenshot({ type: 'png' });
    screenshots.push({ index: i - 1, buffer });
  }

  await browser.close();
  return screenshots;
}
