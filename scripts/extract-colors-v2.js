const { chromium } = require('playwright');

(async () => {
  console.log('Connecting to Chrome...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('foundations-colors'));
  
  if (!page) {
    console.log('Colors page not found');
    await browser.close();
    return;
  }
  
  console.log('Connected to:', page.url());
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Find iframe with Storybook content
  const frames = page.frames();
  let targetFrame = page;
  
  for (const frame of frames) {
    const url = frame.url();
    if (url.includes('iframe.html')) {
      targetFrame = frame;
      console.log('Found Storybook iframe:', url);
      break;
    }
  }
  
  // First, let's see what's actually on the page
  const pageContent = await targetFrame.evaluate(() => {
    return {
      title: document.title,
      bodyText: document.body.innerText.substring(0, 5000),
      allClasses: [...new Set([...document.querySelectorAll('*')].map(el => el.className).filter(c => c && typeof c === 'string'))].slice(0, 50)
    };
  });
  
  console.log('\n=== PAGE CONTENT SAMPLE ===\n');
  console.log(pageContent.bodyText.substring(0, 2000));
  
  // Get full page HTML structure
  const structure = await targetFrame.evaluate(() => {
    const extractStructure = (el, depth = 0) => {
      if (depth > 3) return null;
      
      const children = [...el.children].slice(0, 10).map(c => extractStructure(c, depth + 1)).filter(Boolean);
      
      return {
        tag: el.tagName,
        class: el.className?.toString?.()?.substring(0, 100) || '',
        id: el.id,
        childCount: el.children.length,
        text: el.innerText?.substring(0, 50) || '',
        children: children.length > 0 ? children : undefined
      };
    };
    
    return extractStructure(document.body);
  });
  
  console.log('\n=== PAGE STRUCTURE ===\n');
  console.log(JSON.stringify(structure, null, 2).substring(0, 3000));
  
  // Look for color-specific elements
  const colorElements = await targetFrame.evaluate(() => {
    const results = [];
    
    // Get all elements
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(el => {
      const style = getComputedStyle(el);
      const className = el.className?.toString?.() || '';
      const rect = el.getBoundingClientRect();
      
      // Look for small colored boxes (likely color swatches)
      if (rect.width > 20 && rect.width < 150 && 
          rect.height > 20 && rect.height < 150 &&
          style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          style.backgroundColor !== 'rgb(255, 255, 255)' &&
          style.backgroundColor !== 'rgb(249, 249, 249)') {
        
        // Get nearby text
        let label = '';
        const parent = el.parentElement;
        if (parent) {
          const siblingText = parent.innerText?.substring(0, 100) || '';
          label = siblingText;
        }
        
        results.push({
          tag: el.tagName,
          class: className.substring(0, 80),
          bgColor: style.backgroundColor,
          size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
          label: label.split('\n')[0]
        });
      }
    });
    
    return results.slice(0, 100);
  });
  
  console.log('\n=== COLORED ELEMENTS ===\n');
  console.log(`Found ${colorElements.length} colored elements`);
  colorElements.slice(0, 20).forEach(e => {
    console.log(`${e.size} ${e.bgColor} - ${e.label?.substring(0, 40)}`);
  });
  
  // Try to scroll and find all color palettes
  await targetFrame.evaluate(() => {
    window.scrollTo(0, 0);
  });
  
  await page.waitForTimeout(500);
  
  // Scroll through the page and collect colors
  const allColors = [];
  const scrollHeight = await targetFrame.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await targetFrame.evaluate(() => window.innerHeight);
  
  console.log(`\nScrolling through ${scrollHeight}px page...`);
  
  for (let scrollPos = 0; scrollPos < scrollHeight; scrollPos += viewportHeight / 2) {
    await targetFrame.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
    await page.waitForTimeout(200);
    
    const visibleColors = await targetFrame.evaluate(() => {
      const results = [];
      const elements = document.querySelectorAll('*');
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Only visible elements
        if (rect.top >= -50 && rect.bottom <= window.innerHeight + 50 &&
            rect.width > 15 && rect.width < 200 &&
            rect.height > 15 && rect.height < 200) {
          
          const style = getComputedStyle(el);
          const bg = style.backgroundColor;
          
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && 
              bg !== 'rgb(255, 255, 255)' &&
              bg !== 'rgb(249, 249, 249)' &&
              bg !== 'rgb(247, 247, 248)') {
            
            // Find label
            let label = '';
            const parent = el.parentElement;
            const grandparent = parent?.parentElement;
            
            const nearbyText = (parent?.innerText || grandparent?.innerText || '').trim();
            const lines = nearbyText.split('\n').filter(l => l.trim());
            label = lines[0] || '';
            
            results.push({
              bg,
              label: label.substring(0, 50),
              w: Math.round(rect.width),
              h: Math.round(rect.height)
            });
          }
        }
      });
      
      return results;
    });
    
    allColors.push(...visibleColors);
  }
  
  // Deduplicate
  const uniqueColors = [];
  const seen = new Set();
  
  allColors.forEach(c => {
    const key = c.bg + c.label;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueColors.push(c);
    }
  });
  
  console.log(`\n=== ALL UNIQUE COLORS (${uniqueColors.length}) ===\n`);
  uniqueColors.slice(0, 50).forEach(c => {
    console.log(`${c.bg.padEnd(35)} ${c.label}`);
  });
  
  // Parse the page text for color definitions
  const colorDefinitions = await targetFrame.evaluate(() => {
    const text = document.body.innerText;
    const lines = text.split('\n').filter(l => l.trim());
    
    const colorDefs = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for patterns like "gray-50" or "#RRGGBB"
      if (/^(gray|blue|red|green|orange|yellow|purple|pink|teal|cyan|alpha)-\d+/i.test(line) ||
          /^#[0-9A-Fa-f]{6}$/.test(line)) {
        colorDefs.push({
          name: line,
          context: lines.slice(Math.max(0, i-1), i+2).join(' | ')
        });
      }
    }
    
    return colorDefs;
  });
  
  console.log('\n=== COLOR DEFINITIONS FROM TEXT ===\n');
  colorDefinitions.slice(0, 30).forEach(c => {
    console.log(`${c.name}: ${c.context}`);
  });
  
  // Save everything
  const fs = require('fs');
  fs.writeFileSync('/Users/sergey/github/platform/reference/openai-colors-raw.json', JSON.stringify({
    pageContent: pageContent.bodyText,
    coloredElements: colorElements,
    uniqueColors,
    colorDefinitions
  }, null, 2));
  
  console.log('\n\nSaved to reference/openai-colors-raw.json');
  
  await browser.close();
})();

