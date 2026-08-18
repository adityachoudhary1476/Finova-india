import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321', { waitUntil: 'networkidle0', timeout: 30000 });

// Analyze the actual rendered pixels at the top of the logo
const pixelAnalysis = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  if (!img) return 'No image';

  // Draw the image on canvas to check rendered pixels
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // Analyze top 15 rows of the image
  const rows = [];
  for (let y = 0; y < 15; y++) {
    const rowData = ctx.getImageData(0, y, img.naturalWidth, 1).data;
    let nonTransparent = 0;
    let minAlpha = 255;
    let maxAlpha = 0;
    let firstNonTrans = -1;
    let lastNonTrans = -1;
    for (let x = 0; x < img.naturalWidth; x++) {
      const alpha = rowData[x * 4 + 3];
      if (alpha > 0) {
        nonTransparent++;
        if (firstNonTrans === -1) firstNonTrans = x;
        lastNonTrans = x;
        minAlpha = Math.min(minAlpha, alpha);
        maxAlpha = Math.max(maxAlpha, alpha);
      }
    }
    rows.push({ y, nonTransparent, firstCol: firstNonTrans, lastCol: lastNonTrans, minAlpha, maxAlpha });
  }

  // Also analyze the last 15 rows
  const bottomRows = [];
  for (let y = img.naturalHeight - 15; y < img.naturalHeight; y++) {
    const rowData = ctx.getImageData(0, y, img.naturalWidth, 1).data;
    let nonTransparent = 0;
    for (let x = 0; x < img.naturalWidth; x++) {
      if (rowData[x * 4 + 3] > 0) nonTransparent++;
    }
    bottomRows.push({ y, nonTransparent });
  }

  return { topRows: rows, bottomRows, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
});

console.log('=== IMAGE PIXEL ANALYSIS ===');
console.log('Dimensions:', pixelAnalysis.naturalWidth, 'x', pixelAnalysis.naturalHeight);
console.log('\nTop 15 rows:');
for (const r of pixelAnalysis.topRows) {
  const bar = '█'.repeat(Math.ceil(r.nonTransparent / 10));
  console.log(`  Row ${String(r.y).padStart(2)}: ${String(r.nonTransparent).padStart(4)} px | cols ${r.firstCol}-${r.lastCol} | alpha ${r.minAlpha}-${r.maxAlpha} | ${bar}`);
}
console.log('\nBottom 15 rows:');
for (const r of pixelAnalysis.bottomRows) {
  console.log(`  Row ${String(r.y).padStart(3)}: ${String(r.nonTransparent).padStart(4)} px`);
}

// Now take precise screenshots of just the header area
const headerEl = await page.$('.site-header');
if (headerEl) {
  await headerEl.screenshot({ path: 'debug-header-only.png' });
  console.log('\nScreenshot: debug-header-only.png (header only)');
}

// Footer screenshot
const footerEl = await page.$('.site-footer');
if (footerEl) {
  await footerEl.screenshot({ path: 'debug-footer-only.png' });
  console.log('Screenshot: debug-footer-only.png (footer only)');
}

// Full page header+footer area
await page.screenshot({ path: 'debug-fullpage.png', fullPage: true });
console.log('Screenshot: debug-fullpage.png (full page)');

// Also check the favicon/logo mark image for comparison
const markImg = await page.evaluate(() => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const rows = [];
      for (let y = 0; y < 15; y++) {
        const rowData = ctx.getImageData(0, y, img.naturalWidth, 1).data;
        let nonTransparent = 0;
        for (let x = 0; x < img.naturalWidth; x++) {
          if (rowData[x * 4 + 3] > 0) nonTransparent++;
        }
        rows.push({ y, nonTransparent });
      }
      
      const bottomRows = [];
      for (let y = img.naturalHeight - 15; y < img.naturalHeight; y++) {
        const rowData = ctx.getImageData(0, y, img.naturalWidth, 1).data;
        let nonTransparent = 0;
        for (let x = 0; x < img.naturalWidth; x++) {
          if (rowData[x * 4 + 3] > 0) nonTransparent++;
        }
        bottomRows.push({ y, nonTransparent });
      }
      
      resolve({ width: img.naturalWidth, height: img.naturalHeight, topRows: rows, bottomRows });
    };
    img.onerror = () => resolve('failed to load');
    img.src = '/images/finova-mark.svg';
  });
});

console.log('\n=== SVG LOGO MARK PIXEL ANALYSIS ===');
console.log(JSON.stringify(markImg, null, 2));

// Check the SVG mark for dimensions
const markPngAnalysis = await page.evaluate(() => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const rows = [];
      for (let y = 0; y < Math.min(20, img.naturalHeight); y++) {
        const rowData = ctx.getImageData(0, y, img.naturalWidth, 1).data;
        let nonTransparent = 0;
        for (let x = 0; x < img.naturalWidth; x++) {
          if (rowData[x * 4 + 3] > 0) nonTransparent++;
        }
        rows.push({ y, nonTransparent });
      }
      
      resolve({ width: img.naturalWidth, height: img.naturalHeight, topRows: rows });
    };
    img.onerror = () => resolve('failed to load');
    img.src = '/images/finova-mark.png';
  });
});

console.log('\n=== PNG LOGO MARK ANALYSIS ===');
console.log(JSON.stringify(markPngAnalysis, null, 2));

await browser.close();
