import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321', { waitUntil: 'networkidle0', timeout: 30000 });

// CRITICAL TEST: Does overflow:clip actually clip the rendered pixels?
console.log('=== TEST 1: overflow:clip vs overflow:visible pixel comparison ===');

// Get pixel data WITH overflow:clip (default UA style)
const clipPixels = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  const canvas = document.createElement('canvas');
  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.clientWidth, img.clientHeight);
  
  // Sample top 5 rows
  const rows = [];
  for (let y = 0; y < 5; y++) {
    const data = ctx.getImageData(0, y, img.clientWidth, 1).data;
    let nonTransparent = 0;
    let firstX = -1;
    for (let x = 0; x < img.clientWidth; x++) {
      if (data[x * 4 + 3] > 0) {
        nonTransparent++;
        if (firstX === -1) firstX = x;
      }
    }
    rows.push({ y, nonTransparent, firstX });
  }
  // Also get total opaque pixel count
  let totalOpaque = 0;
  for (let y = 0; y < img.clientHeight; y++) {
    const data = ctx.getImageData(0, y, img.clientWidth, 1).data;
    for (let x = 0; x < img.clientWidth; x++) {
      if (data[x * 4 + 3] > 0) totalOpaque++;
    }
  }
  return { rows, totalOpaque, width: img.clientWidth, height: img.clientHeight };
});
console.log('WITH overflow:clip (default):');
console.log('  Rendered size:', clipPixels.width, 'x', clipPixels.height);
console.log('  Top rows:', JSON.stringify(clipPixels.rows));
console.log('  Total opaque pixels:', clipPixels.totalOpaque);

// Override overflow to visible
await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  img.style.setProperty('overflow', 'visible', 'important');
});
await new Promise(r => setTimeout(r, 200));

const visiblePixels = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  const canvas = document.createElement('canvas');
  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.clientWidth, img.clientHeight);
  
  const rows = [];
  for (let y = 0; y < 5; y++) {
    const data = ctx.getImageData(0, y, img.clientWidth, 1).data;
    let nonTransparent = 0;
    let firstX = -1;
    for (let x = 0; x < img.clientWidth; x++) {
      if (data[x * 4 + 3] > 0) {
        nonTransparent++;
        if (firstX === -1) firstX = x;
      }
    }
    rows.push({ y, nonTransparent, firstX });
  }
  let totalOpaque = 0;
  for (let y = 0; y < img.clientHeight; y++) {
    const data = ctx.getImageData(0, y, img.clientWidth, 1).data;
    for (let x = 0; x < img.clientWidth; x++) {
      if (data[x * 4 + 3] > 0) totalOpaque++;
    }
  }
  return { rows, totalOpaque, width: img.clientWidth, height: img.clientHeight };
});
console.log('\nWITH overflow:visible:');
console.log('  Rendered size:', visiblePixels.width, 'x', visiblePixels.height);
console.log('  Top rows:', JSON.stringify(visiblePixels.rows));
console.log('  Total opaque pixels:', visiblePixels.totalOpaque);

const diff = clipPixels.totalOpaque - visiblePixels.totalOpaque;
console.log('\n  PIXEL DIFFERENCE:', diff, 'opaque pixels', diff > 0 ? '(overflow:clip CLIPS pixels!)' : diff < 0 ? '(unexpected)' : '(no clipping)');

// Reset
await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  img.style.removeProperty('overflow');
});

// TEST 2: Check what overflow-clip-margin does
console.log('\n=== TEST 2: overflow-clip-margin impact ===');
await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  img.style.setProperty('overflow', 'clip', 'important');
  img.style.setProperty('overflow-clip-margin', '0px', 'important');
});
await new Promise(r => setTimeout(r, 200));

const clipMarginPixels = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  const canvas = document.createElement('canvas');
  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.clientWidth, img.clientHeight);
  let totalOpaque = 0;
  for (let y = 0; y < img.clientHeight; y++) {
    const data = ctx.getImageData(0, y, img.clientWidth, 1).data;
    for (let x = 0; x < img.clientWidth; x++) {
      if (data[x * 4 + 3] > 0) totalOpaque++;
    }
  }
  return { totalOpaque };
});
console.log('  With overflow-clip-margin:0px -> total opaque:', clipMarginPixels.totalOpaque);

// Reset
await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  img.style.removeProperty('overflow');
  img.style.removeProperty('overflow-clip-margin');
});

// TEST 3: Comprehensive footer boundary audit
console.log('\n=== TEST 3: COMPREHENSIVE FOOTER BOUNDARY AUDIT ===');

const footerAudit = await page.evaluate(() => {
  const results = [];
  const footer = document.querySelector('.site-footer');
  if (!footer) return ['No footer found'];
  
  const allElements = footer.querySelectorAll('*');
  for (const el of allElements) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    
    // Check for ANY visual boundary property
    const issues = [];
    
    // Borders
    const borderTop = cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor;
    if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) {
      issues.push(`border-top: ${borderTop}`);
    }
    const borderBottom = cs.borderBottomWidth + ' ' + cs.borderBottomStyle + ' ' + cs.borderBottomColor;
    if (cs.borderBottomStyle !== 'none' && parseFloat(cs.borderBottomWidth) > 0) {
      issues.push(`border-bottom: ${borderBottom}`);
    }
    const borderLeft = cs.borderLeftWidth + ' ' + cs.borderLeftStyle;
    if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0) {
      issues.push(`border-left: ${borderLeft}`);
    }
    const borderRight = cs.borderRightWidth + ' ' + cs.borderRightStyle;
    if (cs.borderRightStyle !== 'none' && parseFloat(cs.borderRightWidth) > 0) {
      issues.push(`border-right: ${borderRight}`);
    }
    
    // Outline
    if (cs.outlineStyle !== 'none') {
      issues.push(`outline: ${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`);
    }
    
    // Box shadow
    if (cs.boxShadow !== 'none') {
      issues.push(`box-shadow: ${cs.boxShadow}`);
    }
    
    // Background (non-transparent, non-matching footer)
    if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') {
      // Check if it matches the footer background
      const footerCs = getComputedStyle(footer);
      if (cs.backgroundColor !== footerCs.backgroundColor) {
        issues.push(`background: ${cs.backgroundColor} (different from footer)`);
      }
    }
    
    // Outline-like: any -outline or ring utility
    const ring = cs.getPropertyValue('box-shadow');
    if (ring && ring !== 'none') {
      issues.push(`ring/shadow: ${ring}`);
    }
    
    // Also check for data attributes that might indicate Tailwind classes
    const classes = el.className;
    if (typeof classes === 'string' && classes.length > 0) {
      // Check for Tailwind ring/border/outline utilities
      const twMatch = classes.match(/(?:ring|border|outline|shadow)[^\s]*/g);
      if (twMatch) {
        issues.push(`Tailwind utilities: ${twMatch.join(', ')}`);
      }
    }
    
    if (issues.length > 0) {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? '#' + el.id : '';
      const cls = typeof el.className === 'string' ? '.' + el.className.split(' ').filter(Boolean).join('.') : '';
      results.push({
        element: `${tag}${id}${cls}`,
        rect: `x:${Math.round(rect.x)} y:${Math.round(rect.y)} w:${Math.round(rect.width)} h:${Math.round(rect.height)}`,
        issues
      });
    }
  }
  return results;
});

if (footerAudit.length === 0 || (footerAudit.length === 1 && footerAudit[0] === 'No footer found')) {
  console.log('  No footer found');
} else {
  for (const item of footerAudit) {
    console.log(`\n  ${item.element} [${item.rect}]`);
    for (const issue of item.issues) {
      console.log(`    - ${issue}`);
    }
  }
}

// TEST 4: Check the actual border computed values for footer elements
console.log('\n=== TEST 4: ALL border values on footer elements ===');
const borderDump = await page.evaluate(() => {
  const footer = document.querySelector('.site-footer');
  const results = [];
  for (const el of footer.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const t = parseFloat(cs.borderTopWidth);
    const b = parseFloat(cs.borderBottomWidth);
    const l = parseFloat(cs.borderLeftWidth);
    const r = parseFloat(cs.borderRightWidth);
    if (t > 0 || b > 0 || l > 0 || r > 0) {
      const tag = el.tagName.toLowerCase();
      const cls = typeof el.className === 'string' ? '.' + el.className.split(' ').filter(Boolean).join('.') : '';
      results.push({
        el: `${tag}${cls}`,
        borderTop: `${t}px ${cs.borderTopStyle} ${cs.borderTopColor}`,
        borderBottom: `${b}px ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
        borderLeft: `${l}px ${cs.borderLeftStyle} ${cs.borderLeftColor}`,
        borderRight: `${r}px ${cs.borderRightStyle} ${cs.borderRightColor}`,
      });
    }
  }
  return results;
});
for (const item of borderDump) {
  console.log(`  ${item.el}: T=${item.borderTop} | B=${item.borderBottom} | L=${item.borderLeft} | R=${item.borderRight}`);
}
if (borderDump.length === 0) {
  console.log('  No elements with non-zero borders');
}

// TEST 5: Check the HEADER border-bottom
console.log('\n=== TEST 5: Header border-bottom ===');
const headerBorder = await page.evaluate(() => {
  const header = document.querySelector('.site-header');
  if (!header) return 'No header';
  const cs = getComputedStyle(header);
  return {
    borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
    background: cs.backgroundColor,
  };
});
console.log('  Header:', JSON.stringify(headerBorder));

// TEST 6: Check header brand overflow chain
console.log('\n=== TEST 6: Brand/Logo overflow chain ===');
const overflowChain = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  const chain = [];
  let el = img;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    const tag = el.tagName.toLowerCase();
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.split(' ').filter(Boolean).join('.') : '';
    chain.push({
      el: `${tag}${cls}`,
      overflow: cs.overflow,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      overflowClipMargin: cs.overflowClipMargin || cs.overflowClipMarginBlock || '(n/a)',
      clip: cs.clip,
      clipPath: cs.clipPath,
      mask: cs.mask,
      maskImage: cs.maskImage,
    });
    el = el.parentElement;
  }
  return chain;
});
for (const item of overflowChain) {
  console.log(`  ${item.el}: overflow=${item.overflow} (${item.overflowX}/${item.overflowY}) clip-margin=${item.overflowClipMargin} clip=${item.clip} clipPath=${item.clipPath} mask=${item.mask}`);
}

await browser.close();
