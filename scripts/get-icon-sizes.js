const { chromium } = require('playwright');

async function getIconSizes() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const iconData = await page.evaluate(() => {
    const results = [];
    
    // Find all SVGs in sidebar area
    const svgs = document.querySelectorAll('svg');
    
    svgs.forEach(svg => {
      const rect = svg.getBoundingClientRect();
      // Only icons in left sidebar area (x < 100)
      if (rect.left < 100 && rect.width > 10 && rect.width < 50) {
        const parent = svg.parentElement;
        const grandparent = parent?.parentElement;
        
        results.push({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          svgWidth: svg.getAttribute('width'),
          svgHeight: svg.getAttribute('height'),
          parentTag: parent?.tagName,
          text: grandparent?.textContent?.trim().substring(0, 20)
        });
      }
    });
    
    return results;
  });
  
  console.log('=== Icon Sizes in OpenAI Sidebar ===\n');
  iconData.forEach((icon, i) => {
    console.log(`${i + 1}. ${icon.text || 'unknown'}`);
    console.log(`   Rendered: ${icon.width}x${icon.height}px at (${icon.x}, ${icon.y})`);
    console.log(`   SVG attrs: width="${icon.svgWidth}" height="${icon.svgHeight}"`);
    console.log('');
  });
  
  // Also get sidebar width
  const sidebarWidth = await page.evaluate(() => {
    // Find first navigation element or sidebar-like container on the left
    const nav = document.querySelector('nav');
    if (nav) {
      return nav.getBoundingClientRect().width;
    }
    // Alternative: find leftmost container with icons
    const firstIcon = document.querySelector('svg');
    if (firstIcon) {
      let el = firstIcon.parentElement;
      while (el && el.getBoundingClientRect().left > 10) {
        el = el.parentElement;
      }
      if (el) return el.getBoundingClientRect().width;
    }
    return null;
  });
  
  console.log(`Sidebar width: ${sidebarWidth}px`);
  
  await browser.close();
}

getIconSizes().catch(console.error);
