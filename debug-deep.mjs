import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321', { waitUntil: 'networkidle0', timeout: 30000 });

// Deep dive into the image overflow:clip
const deepDiag = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  if (!img) return 'No image found';
  
  const results = {};
  
  // Get ALL matched CSS rules for the image
  const matchedRules = [];
  for (const sheet of [...document.styleSheets]) {
    try {
      for (const rule of [...sheet.cssRules]) {
        if (rule.selectorText) {
          try {
            if (img.matches(rule.selectorText)) {
              matchedRules.push({
                selector: rule.selectorText,
                cssText: rule.cssText.substring(0, 300),
                source: sheet.href || 'inline',
                hasOverflow: rule.style.overflow !== '',
              });
            }
          } catch(e) {}
        }
      }
    } catch(e) {}
  }
  results.matchedRules = matchedRules.filter(r => r.hasOverflow);
  
  // Check user-agent styles using CDP
  results.imgComputedStyle = {
    overflow: getComputedStyle(img).overflow,
    overflowX: getComputedStyle(img).overflowX,
    overflowY: getComputedStyle(img).overflowY,
  };
  
  // Check ALL ancestors for overflow
  results.ancestorOverflows = [];
  let el = img;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    if (cs.overflow !== 'visible' && cs.overflow !== 'scroll') {
      results.ancestorOverflows.push({
        tag: el.tagName,
        class: el.className,
        overflow: cs.overflow,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
      });
    }
    el = el.parentElement;
  }
  
  // Check if img has explicit width/height attributes that might interact
  results.imgAttrs = {
    width: img.getAttribute('width'),
    height: img.getAttribute('height'),
    style: img.getAttribute('style'),
    classList: [...img.classList],
  };
  
  // CRITICAL: Check the actual pixel content at the top of the image
  // Create a canvas and draw the image to check actual pixel data
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const topRow = ctx.getImageData(0, 0, img.naturalWidth, 1).data;
  let nonTransparentPixelsTop = 0;
  for (let i = 3; i < topRow.length; i += 4) {
    if (topRow[i] > 0) nonTransparentPixelsTop++;
  }
  results.topRowPixels = {
    total: img.naturalWidth,
    nonTransparent: nonTransparentPixelsTop,
  };
  
  // Check row 1-5 too
  const rowsInfo = [];
  for (let y = 0; y < 10; y++) {
    const row = ctx.getImageData(0, y, img.naturalWidth, 1).data;
    let count = 0;
    for (let i = 3; i < row.length; i += 4) {
      if (row[i] > 0) count++;
    }
    rowsInfo.push({ row: y, nonTransparent: count });
  }
  results.topRows = rowsInfo;

  // Check the container's actual layout dimensions more precisely
  const brand = img.closest('.brand');
  const headerInner = document.querySelector('.site-header__inner');
  const header = document.querySelector('.site-header');
  
  if (brand) {
    const br = brand.getBoundingClientRect();
    const bcs = getComputedStyle(brand);
    results.brand = {
      rect: { top: br.top, height: br.height, bottom: br.bottom },
      display: bcs.display,
      alignItems: bcs.alignItems,
      flexDirection: bcs.flexDirection,
      padding: bcs.padding,
      paddingTop: bcs.paddingTop,
      paddingBottom: bcs.paddingBottom,
    };
  }
  
  if (headerInner) {
    const hr = headerInner.getBoundingClientRect();
    const hcs = getComputedStyle(headerInner);
    results.headerInner = {
      rect: { top: hr.top, height: hr.height, bottom: hr.bottom },
      display: hcs.display,
      alignItems: hcs.alignItems,
      minHeight: hcs.minHeight,
      padding: hcs.padding,
    };
  }

  return results;
});

console.log('=== DEEP DIAGNOSTIC ===');
console.log('\nImage overflow computed:', JSON.stringify(deepDiag.imgComputedStyle));
console.log('\nAncestor overflows:', JSON.stringify(deepDiag.ancestorOverflows, null, 2));
console.log('\nImage attributes:', JSON.stringify(deepDiag.imgAttrs));
console.log('\nMatched rules with overflow:', JSON.stringify(deepDiag.matchedRules, null, 2));
console.log('\nTop 10 rows pixel analysis:', JSON.stringify(deepDiag.topRows, null, 2));
console.log('\nBrand layout:', JSON.stringify(deepDiag.brand, null, 2));
console.log('\nHeader inner layout:', JSON.stringify(deepDiag.headerInner, null, 2));

// Now check footer boundaries in detail
const footerDiag = await page.evaluate(() => {
  const footer = document.querySelector('.site-footer');
  if (!footer) return 'No footer';
  
  const results = {};
  
  // Get ALL elements inside footer and check for any visual boundaries
  const allEls = footer.querySelectorAll('*');
  const boundaryElements = [];
  
  for (const el of allEls) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const issues = [];
    
    if (cs.borderTopWidth !== '0px') issues.push(`border-top: ${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`);
    if (cs.borderBottomWidth !== '0px') issues.push(`border-bottom: ${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`);
    if (cs.borderLeftWidth !== '0px') issues.push(`border-left: ${cs.borderLeftWidth} ${cs.borderLeftStyle} ${cs.borderLeftColor}`);
    if (cs.borderRightWidth !== '0px') issues.push(`border-right: ${cs.borderRightWidth} ${cs.borderRightStyle} ${cs.borderRightColor}`);
    if (cs.boxShadow !== 'none') issues.push(`box-shadow: ${cs.boxShadow}`);
    if (cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px') issues.push(`outline: ${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`);
    if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') issues.push(`bg: ${cs.backgroundColor}`);
    if (cs.borderRadius !== '0px') issues.push(`border-radius: ${cs.borderRadius}`);
    
    // Check for ring/outline utilities from Tailwind
    if (cs.getPropertyValue('--tw-ring-offset-shadow') && cs.getPropertyValue('--tw-ring-offset-shadow') !== 'none') issues.push('tw-ring');
    if (cs.getPropertyValue('--tw-ring-shadow') && cs.getPropertyValue('--tw-ring-shadow') !== 'none') issues.push('tw-ring-shadow');
    
    if (issues.length > 0) {
      boundaryElements.push({
        tag: el.tagName,
        classes: el.className.substring(0, 100),
        rect: `y=${Math.round(rect.y)} h=${Math.round(rect.height)} w=${Math.round(rect.width)}`,
        issues,
      });
    }
  }
  
  results.boundaryElements = boundaryElements;
  
  // Also check for any global rules that affect div, p, a, h2, ul, li, nav, span
  const selectors = ['div', 'p', 'a', 'h2', 'ul', 'li', 'nav', 'span', 'img'];
  const globalRules = [];
  for (const sheet of [...document.styleSheets]) {
    try {
      for (const rule of [...sheet.cssRules]) {
        if (rule.selectorText) {
          for (const sel of selectors) {
            if (rule.selectorText === sel || (rule.style.border && rule.style.border !== '')) {
              globalRules.push({
                selector: rule.selectorText,
                border: rule.style.border || '',
                borderTop: rule.style.borderTop || '',
                background: rule.style.backgroundColor || '',
                boxShadow: rule.style.boxShadow || '',
                outline: rule.style.outline || '',
                source: sheet.href || 'inline',
              });
            }
          }
        }
      }
    } catch(e) {}
  }
  results.globalRules = globalRules;
  
  return results;
});

console.log('\n=== FOOTER BOUNDARY ELEMENTS ===');
for (const e of footerDiag.boundaryElements) {
  console.log(`  <${e.tag}> "${e.classes}" ${e.rect}`);
  for (const i of e.issues) console.log(`    ${i}`);
}

console.log('\n=== GLOBAL RULES WITH BORDERS ===');
for (const r of footerDiag.globalRules) {
  if (r.border || r.borderTop || r.background || r.boxShadow || r.outline) {
    console.log(`  ${r.selector}: border=${r.border} borderTop=${r.borderTop} bg=${r.background} shadow=${r.boxShadow} outline=${r.outline} [${r.source}]`);
  }
}

await browser.close();
