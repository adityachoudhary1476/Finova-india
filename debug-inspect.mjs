import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321', { waitUntil: 'networkidle0', timeout: 30000 });

// ============================================================
// 1. HEADER LOGO INSPECTION
// ============================================================
console.log('\n========== HEADER LOGO INSPECTION ==========');

const logoInfo = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  if (!img) return { error: 'No .brand__logo found' };

  const results = {};

  // Get the image element's computed box
  const imgRect = img.getBoundingClientRect();
  results.imgRect = { x: imgRect.x, y: imgRect.y, width: imgRect.width, height: imgRect.height, top: imgRect.top, bottom: imgRect.bottom };

  // Walk up ancestors and check for overflow, height, etc.
  const ancestors = [];
  let el = img.parentElement;
  while (el && el !== document.body) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    ancestors.push({
      tag: el.tagName,
      classes: el.className,
      id: el.id,
      overflow: cs.overflow,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      overflowClip: cs.overflowClip || cs.overflow || '',
      height: cs.height,
      maxHeight: cs.maxHeight,
      minHeight: cs.minHeight,
      width: cs.width,
      maxWidth: cs.maxWidth,
      position: cs.position,
      display: cs.display,
      alignItems: cs.alignItems,
      justifyContent: cs.justifyContent,
      lineHeight: cs.lineHeight,
      transform: cs.transform,
      clipPath: cs.clipPath,
      clip: cs.clip,
      border: cs.border,
      borderTop: cs.borderTop,
      padding: cs.padding,
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      boxSizing: cs.boxSizing,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom },
      dataAttrs: [...el.attributes].filter(a => a.name.startsWith('data-')).map(a => `${a.name}=${a.value}`),
    });
    el = el.parentElement;
  }
  results.ancestors = ancestors;

  // Check computed styles on the image itself
  const imgCS = getComputedStyle(img);
  results.imgComputed = {
    display: imgCS.display,
    height: imgCS.height,
    width: imgCS.width,
    maxHeight: imgCS.maxHeight,
    maxWidth: imgCS.maxWidth,
    objectFit: imgCS.objectFit,
    overflow: imgCS.overflow,
    position: imgCS.position,
    top: imgCS.top,
    transform: imgCS.transform,
    marginTop: imgCS.marginTop,
    paddingTop: imgCS.paddingTop,
    border: imgCS.border,
    boxSizing: imgCS.boxSizing,
    verticalAlign: imgCS.verticalAlign,
    lineHeight: imgCS.lineHeight,
  };

  // Check the image intrinsic dimensions
  results.naturalWidth = img.naturalWidth;
  results.naturalHeight = img.naturalHeight;
  results.src = img.src;

  return results;
});

console.log('Image element:', JSON.stringify(logoInfo.imgRect, null, 2));
console.log('Image computed styles:', JSON.stringify(logoInfo.imgComputed, null, 2));
console.log('Natural dimensions:', logoInfo.naturalWidth, 'x', logoInfo.naturalHeight);
console.log('\nAncestor chain:');
if (logoInfo.ancestors) {
  for (const a of logoInfo.ancestors) {
    console.log(`  <${a.tag}> class="${a.classes}" id="${a.id}"`);
    console.log(`    overflow: ${a.overflow}, overflowX: ${a.overflowX}, overflowY: ${a.overflowY}`);
    console.log(`    height: ${a.height}, maxHeight: ${a.maxHeight}, minHeight: ${a.minHeight}`);
    console.log(`    width: ${a.width}, maxWidth: ${a.maxWidth}`);
    console.log(`    display: ${a.display}, position: ${a.position}`);
    console.log(`    alignItems: ${a.alignItems}, justifyContent: ${a.justifyContent}`);
    console.log(`    lineHeight: ${a.lineHeight}, transform: ${a.transform}`);
    console.log(`    clipPath: ${a.clipPath}, clip: ${a.clip}`);
    console.log(`    border: ${a.border}, borderTop: ${a.borderTop}`);
    console.log(`    padding: ${a.padding}, paddingTop: ${a.paddingTop}`);
    console.log(`    boxSizing: ${a.boxSizing}`);
    console.log(`    rect: y=${a.rect.y.toFixed(1)} h=${a.rect.height.toFixed(1)}`);
    if (a.dataAttrs.length) console.log(`    ${a.dataAttrs.join(', ')}`);
  }
}

// ============================================================
// 2. Add diagnostic outlines to identify clipping
// ============================================================
console.log('\n========== CLIPPING DIAGNOSTIC ==========');

const clipDiagnostic = await page.evaluate(() => {
  const img = document.querySelector('.brand__logo');
  if (!img) return 'No image';

  // Check if image overflows any ancestor
  const imgRect = img.getBoundingClientRect();
  const issues = [];
  let el = img.parentElement;
  while (el && el !== document.body) {
    const elRect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);

    // Check if image extends beyond this ancestor
    if (imgRect.top < elRect.top - 0.5) {
      issues.push(`${el.tagName}.${el.className}: image TOP (${imgRect.top.toFixed(1)}) extends above ancestor TOP (${elRect.top.toFixed(1)})`);
    }
    if (imgRect.bottom > elRect.bottom + 0.5) {
      issues.push(`${el.tagName}.${el.className}: image BOTTOM (${imgRect.bottom.toFixed(1)}) extends below ancestor BOTTOM (${elRect.bottom.toFixed(1)})`);
    }

    // Check overflow
    if (cs.overflow === 'hidden' || cs.overflow === 'clip' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden') {
      issues.push(`${el.tagName}.${el.className}: has overflow=${cs.overflow} overflowX=${cs.overflowX} overflowY=${cs.overflowY}`);
    }

    // Check max-height
    if (cs.maxHeight !== 'none') {
      issues.push(`${el.tagName}.${el.className}: has maxHeight=${cs.maxHeight}`);
    }

    el = el.parentElement;
  }
  return issues;
});

console.log('Clipping issues found:', clipDiagnostic);

// ============================================================
// 3. FOOTER INSPECTION
// ============================================================
console.log('\n========== FOOTER INSPECTION ==========');

const footerInfo = await page.evaluate(() => {
  const footer = document.querySelector('.site-footer');
  if (!footer) return { error: 'No .site-footer found' };

  const results = {};

  // Get all elements inside footer with their computed borders, backgrounds, outlines, shadows
  const allElements = footer.querySelectorAll('*');
  const elementsWithBoundaries = [];

  for (const el of allElements) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const issues = [];

    // Check border
    const borderParts = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth];
    if (borderParts.some(b => b !== '0px' && b !== 'medium')) {
      issues.push(`border: top=${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}, right=${cs.borderRightWidth}, bottom=${cs.borderBottomWidth}, left=${cs.borderLeftWidth}`);
    }

    // Check outline
    if (cs.outlineWidth !== '0px' && cs.outlineStyle !== 'none') {
      issues.push(`outline: ${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`);
    }

    // Check box-shadow
    if (cs.boxShadow !== 'none') {
      issues.push(`box-shadow: ${cs.boxShadow}`);
    }

    // Check background (non-transparent)
    if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') {
      issues.push(`background: ${cs.backgroundColor}`);
    }

    // Check border-radius
    if (cs.borderRadius !== '0px' && cs.borderRadius !== '0%') {
      issues.push(`border-radius: ${cs.borderRadius}`);
    }

    if (issues.length > 0) {
      elementsWithBoundaries.push({
        tag: el.tagName,
        classes: el.className.split(' ').filter(c => c.startsWith('site-footer') || c.startsWith('brand')).join(' '),
        rect: { y: Math.round(rect.y), h: Math.round(rect.height), w: Math.round(rect.width) },
        issues,
      });
    }
  }

  results.boundaryElements = elementsWithBoundaries;

  // Also check the footer structure
  results.footerRect = (() => {
    const r = footer.getBoundingClientRect();
    return { y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width) };
  })();

  // Check the footer CSS directly
  const footerCS = getComputedStyle(footer);
  results.footerBg = footerCS.backgroundColor;
  results.footerBorder = footerCS.borderTop;
  results.footerColor = footerCS.color;

  // Check the main brand/text links containers
  const brand = footer.querySelector('.site-footer__brand');
  if (brand) {
    const bcs = getComputedStyle(brand);
    results.brandRect = (() => { const r = brand.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height) }; })();
    results.brandBg = bcs.backgroundColor;
    results.brandBorder = bcs.border;
  }

  const links = footer.querySelector('.site-footer__links');
  if (links) {
    const lcs = getComputedStyle(links);
    results.linksRect = (() => { const r = links.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height) }; })();
    results.linksBg = lcs.backgroundColor;
    results.linksBorder = lcs.border;
  }

  const bottom = footer.querySelector('.site-footer__bottom');
  if (bottom) {
    const bcs = getComputedStyle(bottom);
    results.bottomRect = (() => { const r = bottom.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height) }; })();
    results.bottomBg = bcs.backgroundColor;
    results.bottomBorder = bcs.border;
  }

  return results;
});

console.log('Footer background:', footerInfo.footerBg);
console.log('Footer border:', footerInfo.footerBorder);
console.log('Footer rect:', JSON.stringify(footerInfo.footerRect));
console.log('Brand rect:', JSON.stringify(footerInfo.brandRect), 'bg:', footerInfo.brandBg, 'border:', footerInfo.brandBorder);
console.log('Links rect:', JSON.stringify(footerInfo.linksRect), 'bg:', footerInfo.linksBg, 'border:', footerInfo.linksBorder);
console.log('\nElements with boundaries inside footer:');
if (footerInfo.boundaryElements) {
  for (const e of footerInfo.boundaryElements) {
    console.log(`  <${e.tag}> class="${e.classes}" rect=${JSON.stringify(e.rect)}`);
    for (const i of e.issues) {
      console.log(`    ${i}`);
    }
  }
}

// ============================================================
// 4. CHECK TAILWIND PREFLIGHT IMPACT
// ============================================================
console.log('\n========== TAILWIND PREFLIGHT CHECK ==========');

const preflightCheck = await page.evaluate(() => {
  // Check all stylesheets for rules that might affect footer elements
  const sheets = [...document.styleSheets];
  const footerRules = [];
  
  for (const sheet of sheets) {
    try {
      const rules = [...sheet.cssRules];
      for (const rule of rules) {
        const selector = rule.selectorText || '';
        // Check for rules targeting img, a, p, div, span, ul, li, h2, nav
        if (selector && (
          selector === 'img' || 
          selector.startsWith('img,') ||
          selector.includes(' img') ||
          selector === 'a' ||
          (rule.style && rule.style.overflow && rule.style.overflow !== '')
        )) {
          footerRules.push({
            selector,
            cssText: rule.cssText.substring(0, 200),
          });
        }
      }
    } catch (e) {
      // Cross-origin stylesheet
    }
  }
  return footerRules;
});

console.log('Relevant global CSS rules:');
for (const r of preflightCheck) {
  console.log(`  ${r.selector}: ${r.cssText}`);
}

// ============================================================
// 5. Screenshots
// ============================================================
await page.screenshot({ path: 'debug-header-full.png', fullPage: false });
console.log('\nScreenshot saved: debug-header-full.png');

// Scroll to footer and screenshot
await page.evaluate(() => {
  document.querySelector('.site-footer')?.scrollIntoView();
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: 'debug-footer.png', fullPage: false });
console.log('Screenshot saved: debug-footer.png');

await browser.close();
