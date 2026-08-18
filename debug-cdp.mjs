import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321', { waitUntil: 'networkidle0', timeout: 30000 });

// Use CDP to get ALL matched rules for the image element
const cdpSession = await page.createCDPSession();
await cdpSession.send('DOM.enable');
await cdpSession.send('CSS.enable');

const doc = await cdpSession.send('DOM.getDocument');
const nodeResult = await cdpSession.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '.brand__logo' });
const matchedRules = await cdpSession.send('CSS.getMatchedStylesForNode', { nodeId: nodeResult.nodeId });

console.log('=== MATCHED CSS RULES FOR .brand__logo ===');
console.log('\n--- Normal rules (in order) ---');
for (const rule of matchedRules.matchedCSSRules) {
  const sel = rule.rule.selectorList?.selectors?.map(s => s.text).join(', ') || '???';
  const props = rule.rule.style.cssProperties?.map(p => `${p.name}: ${p.value}${p.important ? ' !important' : ''}`).join('; ') || '';
  if (props) {
    console.log(`  ${sel} { ${props} }`);
  }
}

console.log('\n--- Inherited rules ---');
for (const rule of matchedRules.inherited) {
  const sel = rule.matchedCSSRules?.map(r => r.rule.selectorList?.selectors?.map(s => s.text).join(', ')).join(', ') || '???';
  const props = rule.matchedCSSRules?.map(r => r.rule.style.cssProperties?.filter(p => p.name.startsWith('overflow') || p.name === 'height' || p.name === 'display' || p.name === 'line-height' || p.name === 'max-height' || p.name === 'max-width' || p.name === 'object-fit' || p.name === 'padding' || p.name === 'margin' || p.name === 'vertical-align').map(p => `${p.name}: ${p.value}`).join('; ')).filter(Boolean).join(' | ') || '';
  if (props) {
    console.log(`  [inherited from ${sel}]: ${props}`);
  }
}

// Check the UA stylesheet rules
if (matchedRules.userAgentStyle) {
  console.log('\n--- User-agent styles ---');
  for (const rule of matchedRules.userAgentStyle.cssProperties || []) {
    console.log(`  ${rule.name}: ${rule.value}`);
  }
}

// Now let's also check what CSS would happen if we override overflow
console.log('\n=== TESTING: What happens with overflow:visible? ===');
await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  img.style.overflow = 'visible';
});
await new Promise(r => setTimeout(r, 200));
const overflowTest = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  const cs = getComputedStyle(img);
  const rect = img.getBoundingClientRect();
  return {
    overflow: cs.overflow,
    rect: { y: rect.y, height: rect.height, width: rect.width },
  };
});
console.log('After overflow:visible:', JSON.stringify(overflowTest));
// Reset
await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  img.style.overflow = '';
});

// Check if removing height:auto from preflight matters
console.log('\n=== TESTING: Remove img {height:auto} override ===');
await page.evaluate(() => {
  // Add a stylesheet that removes height:auto from the img rule
  const style = document.createElement('style');
  style.textContent = 'img { height: unset !important; }';
  document.head.appendChild(style);
});
await new Promise(r => setTimeout(r, 200));
const heightTest = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  const cs = getComputedStyle(img);
  const rect = img.getBoundingClientRect();
  return {
    height: cs.height,
    width: cs.width,
    rect: { y: rect.y, height: rect.height, width: rect.width },
  };
});
console.log('After height:unset:', JSON.stringify(heightTest));
await page.evaluate(() => {
  document.querySelector('style:last-child')?.remove();
});

// Check the SVG logo to compare
console.log('\n=== SVG LOGO MARK COMPARISON ===');
const svgAnalysis = await page.evaluate(() => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Find first and last non-transparent rows
      let firstRow = -1, lastRow = -1;
      for (let y = 0; y < img.naturalHeight; y++) {
        const row = ctx.getImageData(0, y, img.naturalWidth, 1).data;
        let hasContent = false;
        for (let x = 3; x < row.length; x += 4) {
          if (row[x] > 0) { hasContent = true; break; }
        }
        if (hasContent) {
          if (firstRow === -1) firstRow = y;
          lastRow = y;
        }
      }
      
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        firstContentRow: firstRow,
        lastContentRow: lastRow,
        topPadding: firstRow,
        bottomPadding: img.naturalHeight - 1 - lastRow,
      });
    };
    img.src = '/images/finova-mark.svg';
  });
});
console.log('SVG mark:', JSON.stringify(svgAnalysis, null, 2));

const pngAnalysis = await page.evaluate(() => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      let firstRow = -1, lastRow = -1;
      for (let y = 0; y < img.naturalHeight; y++) {
        const row = ctx.getImageData(0, y, img.naturalWidth, 1).data;
        let hasContent = false;
        for (let x = 3; x < row.length; x += 4) {
          if (row[x] > 0) { hasContent = true; break; }
        }
        if (hasContent) {
          if (firstRow === -1) firstRow = y;
          lastRow = y;
        }
      }
      
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        firstContentRow: firstRow,
        lastContentRow: lastRow,
        topPadding: firstRow,
        bottomPadding: img.naturalHeight - 1 - lastRow,
      });
    };
    img.src = '/images/finova-header.png';
  });
});
console.log('PNG header:', JSON.stringify(pngAnalysis, null, 2));

// Check what the logo looks like on a calculator page (different context)
console.log('\n=== MOBILE VIEW CHECK ===');
await page.setViewport({ width: 375, height: 812 });
await page.goto('http://localhost:4321', { waitUntil: 'networkidle0' });
const mobileHeader = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  const brand = img?.closest('.brand');
  const header = document.querySelector('.site-header__inner');
  return {
    img: img ? { rect: img.getBoundingClientRect(), cs: getComputedStyle(img).height } : null,
    brand: brand ? { rect: brand.getBoundingClientRect(), cs: getComputedStyle(brand) } : null,
    header: header ? { rect: header.getBoundingClientRect(), cs: getComputedStyle(header).minHeight } : null,
  };
});
console.log('Mobile header:', JSON.stringify({
  img: mobileHeader.img,
  brand: mobileHeader.brand ? { rect: mobileHeader.brand.rect, padding: mobileHeader.brand.cs.padding, minH: mobileHeader.brand.cs.minHeight } : null,
  header: mobileHeader.header ? { rect: mobileHeader.header.rect, minH: mobileHeader.header.cs.minHeight } : null,
}, null, 2));

// Take mobile screenshot
const mobileHeaderEl = await page.$('.site-header');
if (mobileHeaderEl) await mobileHeaderEl.screenshot({ path: 'debug-header-mobile.png' });

// Take mobile footer screenshot
const mobileFooterEl = await page.$('.site-footer');
if (mobileFooterEl) await mobileFooterEl.screenshot({ path: 'debug-footer-mobile.png' });

await browser.close();
console.log('\nDone! Check screenshots.');
