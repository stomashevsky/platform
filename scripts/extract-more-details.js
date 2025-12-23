const { chromium } = require('playwright');

async function extract() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  // First check if sidebar is collapsed
  const isCollapsed = await page.evaluate(() => {
    const sidebar = document.querySelector('nav') || document.querySelector('aside');
    return sidebar ? sidebar.getBoundingClientRect().width < 100 : false;
  });
  
  console.log('Sidebar collapsed:', isCollapsed);
  
  const data = await page.evaluate(() => {
    const result = {
      sectionTitles: [],
      collapseButton: null,
      collapsedItems: [],
      gaps: []
    };
    
    // Section titles styling
    ['Create', 'Manage', 'Optimize'].forEach(text => {
      const els = Array.from(document.querySelectorAll('*')).filter(e => 
        e.textContent?.trim() === text && 
        e.children.length === 0 &&
        e.getBoundingClientRect().left < 300
      );
      if (els.length > 0) {
        const el = els[0];
        const rect = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        result.sectionTitles.push({
          text,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          height: Math.round(rect.height),
          marginTop: s.marginTop,
          marginBottom: s.marginBottom,
          letterSpacing: s.letterSpacing
        });
      }
    });
    
    // Collapse button at bottom
    const collapseBtn = Array.from(document.querySelectorAll('button')).find(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.left < 100 && rect.bottom > window.innerHeight - 100 && btn.querySelector('svg');
    });
    
    if (collapseBtn) {
      const rect = collapseBtn.getBoundingClientRect();
      const s = getComputedStyle(collapseBtn);
      const svg = collapseBtn.querySelector('svg');
      result.collapseButton = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        bottom: Math.round(window.innerHeight - rect.bottom),
        backgroundColor: s.backgroundColor,
        color: s.color,
        iconColor: svg ? getComputedStyle(svg).color : null,
        iconWidth: svg ? Math.round(svg.getBoundingClientRect().width) : null
      };
    }
    
    // Find all sidebar icons to measure their positions
    const icons = Array.from(document.querySelectorAll('svg')).filter(svg => {
      const rect = svg.getBoundingClientRect();
      return rect.left < 100 && rect.top > 50 && rect.top < 800;
    }).slice(0, 14);
    
    icons.forEach((svg, i) => {
      const rect = svg.getBoundingClientRect();
      result.collapsedItems.push({
        index: i,
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        centerX: Math.round(rect.left + rect.width / 2)
      });
    });
    
    // Calculate gaps between icons
    for (let i = 1; i < result.collapsedItems.length; i++) {
      const gap = result.collapsedItems[i].top - result.collapsedItems[i-1].top;
      result.gaps.push({
        from: i - 1,
        to: i,
        gap: gap
      });
    }
    
    return result;
  });
  
  console.log(JSON.stringify(data, null, 2));
  
  await browser.close();
}

extract().catch(console.error);
