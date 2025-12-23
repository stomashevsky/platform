const { chromium } = require('playwright');

async function extract() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    const results = [];
    
    // Find all menu items with SVGs in sidebar
    const menuItems = Array.from(document.querySelectorAll('a, button')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.left < 300 && rect.top > 50 && rect.top < 800 && el.querySelector('svg');
    });
    
    menuItems.forEach(item => {
      const svg = item.querySelector('svg');
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const itemText = item.textContent?.trim().replace(/\s+/g, ' ').substring(0, 20);
        
        results.push({
          text: itemText,
          svgWidth: svg.getAttribute('width'),
          svgHeight: svg.getAttribute('height'),
          svgViewBox: svg.getAttribute('viewBox'),
          renderedWidth: Math.round(rect.width * 10) / 10,
          renderedHeight: Math.round(rect.height * 10) / 10,
          computedWidth: getComputedStyle(svg).width,
          computedHeight: getComputedStyle(svg).height,
          strokeWidth: svg.querySelector('[stroke-width]')?.getAttribute('stroke-width') || 
                       svg.querySelector('path')?.getAttribute('stroke-width') || 'n/a'
        });
      }
    });
    
    return results;
  });
  
  console.log('=== OpenAI Sidebar Icon Sizes ===\n');
  data.forEach((icon, i) => {
    console.log(`${i+1}. ${icon.text}`);
    console.log(`   SVG: width="${icon.svgWidth}" height="${icon.svgHeight}" viewBox="${icon.svgViewBox}"`);
    console.log(`   Rendered: ${icon.renderedWidth}x${icon.renderedHeight}px`);
    console.log(`   Computed: ${icon.computedWidth} x ${icon.computedHeight}`);
    console.log(`   Stroke-width: ${icon.strokeWidth}`);
    console.log('');
  });
  
  await browser.close();
}

extract().catch(console.error);
