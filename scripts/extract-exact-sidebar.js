/**
 * Точное извлечение ВСЕХ стилей sidebar
 */
const { chromium } = require('playwright');
const fs = require('fs');

async function extract() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('Page not found'); return; }
  
  const data = await page.evaluate(() => {
    const result = {
      sidebar: {},
      items: [],
      sections: [],
      icons: {}
    };
    
    // Find sidebar container
    const sidebar = document.querySelector('[class*="sidebar"]') || 
                   document.querySelector('aside') ||
                   document.querySelector('nav');
    
    if (!sidebar) return result;
    
    // Get all buttons/links in sidebar
    const items = sidebar.querySelectorAll('a, button');
    
    items.forEach((item, idx) => {
      const text = item.textContent?.trim();
      if (!text || text.length > 30) return;
      
      const rect = item.getBoundingClientRect();
      const style = getComputedStyle(item);
      
      // Get SVG if present
      const svg = item.querySelector('svg');
      let svgData = null;
      if (svg) {
        svgData = {
          outerHTML: svg.outerHTML,
          width: svg.getAttribute('width') || getComputedStyle(svg).width,
          height: svg.getAttribute('height') || getComputedStyle(svg).height,
          fill: getComputedStyle(svg).fill,
          color: getComputedStyle(svg).color
        };
      }
      
      result.items.push({
        text,
        width: rect.width,
        height: rect.height,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        marginLeft: style.marginLeft,
        marginRight: style.marginRight,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
        color: style.color,
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        gap: style.gap,
        display: style.display,
        alignItems: style.alignItems,
        svg: svgData
      });
    });
    
    // Find section titles
    ['Create', 'Manage', 'Optimize'].forEach(title => {
      const el = Array.from(sidebar.querySelectorAll('*')).find(
        e => e.textContent?.trim() === title && e.children.length === 0
      );
      if (el) {
        const s = getComputedStyle(el);
        result.sections.push({
          text: title,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          paddingLeft: s.paddingLeft,
          marginTop: s.marginTop,
          marginBottom: s.marginBottom,
          letterSpacing: s.letterSpacing
        });
      }
    });
    
    // Sidebar container styles
    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarStyle = getComputedStyle(sidebar);
    result.sidebar = {
      width: sidebarRect.width,
      paddingLeft: sidebarStyle.paddingLeft,
      paddingRight: sidebarStyle.paddingRight,
      paddingTop: sidebarStyle.paddingTop,
      backgroundColor: sidebarStyle.backgroundColor
    };
    
    return result;
  });
  
  console.log(JSON.stringify(data, null, 2));
  fs.writeFileSync('reference/exact-sidebar-styles.json', JSON.stringify(data, null, 2));
  
  await browser.close();
}

extract().catch(console.error);
