const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function measureExactGaps() {
  console.log('🔌 Подключение к Chrome...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ Страница не найдена');
    await browser.close();
    return;
  }
  
  console.log('✅ Подключено к:', page.url());
  
  const results = await page.evaluate(() => {
    const data = {};
    
    // Find sidebar - the visible white/grey sidebar area
    const sidebar = document.querySelector('aside.JiHZk');
    if (!sidebar) return { error: 'Sidebar not found' };
    
    const sidebarRect = sidebar.getBoundingClientRect();
    
    // But sidebar might be inside a container with additional offset
    // Let's find the actual left edge of the visible sidebar
    let visibleSidebarLeft = sidebarRect.left;
    
    // Check if sidebar has a parent with background
    const sidebarParent = sidebar.parentElement;
    if (sidebarParent) {
      const parentRect = sidebarParent.getBoundingClientRect();
      data.sidebarParent = {
        left: parentRect.left,
        width: parentRect.width,
        tag: sidebarParent.tagName,
        className: sidebarParent.className,
      };
    }
    
    data.sidebar = {
      left: sidebarRect.left,
      width: sidebarRect.width,
      right: sidebarRect.right,
    };
    
    // Find active menu item and measure from viewport left edge
    const activeItem = sidebar.querySelector('a.k-D0f._8xE3c.rZ3k-');
    if (activeItem) {
      const itemRect = activeItem.getBoundingClientRect();
      
      // Find the ::before element dimensions (the background)
      const beforeStyles = getComputedStyle(activeItem, '::before');
      
      // The icon span
      const iconSpan = activeItem.querySelector('span.J42DB');
      const iconRect = iconSpan?.getBoundingClientRect();
      
      // The SVG inside icon
      const svg = iconSpan?.querySelector('svg');
      const svgRect = svg?.getBoundingClientRect();
      
      data.activeItem = {
        // Item position
        left: itemRect.left,
        right: itemRect.right,
        width: itemRect.width,
        
        // Gap from sidebar edge to item edge
        leftGapFromSidebar: itemRect.left - sidebarRect.left,
        rightGapFromSidebar: sidebarRect.right - itemRect.right,
        
        // Icon position
        iconLeft: iconRect?.left,
        iconLeftFromSidebar: iconRect ? iconRect.left - sidebarRect.left : null,
        iconWidth: iconRect?.width,
        
        // SVG position
        svgLeft: svgRect?.left,
        svgLeftFromSidebar: svgRect ? svgRect.left - sidebarRect.left : null,
        
        // ::before styles
        beforeInset: beforeStyles.inset,
        beforeWidth: beforeStyles.width,
        beforeLeft: beforeStyles.left,
        beforeRight: beforeStyles.right,
      };
    }
    
    // Find content wrapper and its margins/paddings
    const contentWrapper = sidebar.querySelector('div.sQbJC');
    if (contentWrapper) {
      const wrapperRect = contentWrapper.getBoundingClientRect();
      const wrapperStyles = getComputedStyle(contentWrapper);
      
      data.contentWrapper = {
        left: wrapperRect.left,
        leftFromSidebar: wrapperRect.left - sidebarRect.left,
        margin: wrapperStyles.margin,
        padding: wrapperStyles.padding,
        width: wrapperRect.width,
      };
    }
    
    // Find section container
    const section = sidebar.querySelector('div.pb-3');
    if (section) {
      const sectionRect = section.getBoundingClientRect();
      data.section = {
        left: sectionRect.left,
        leftFromSidebar: sectionRect.left - sidebarRect.left,
        width: sectionRect.width,
      };
    }
    
    return data;
  });
  
  if (results.error) {
    console.log('  ⚠️', results.error);
    await browser.close();
    return;
  }
  
  console.log('\n📐 SIDEBAR:');
  console.log('  Left edge:', results.sidebar.left, 'px from viewport');
  console.log('  Width:', results.sidebar.width, 'px');
  
  if (results.sidebarParent) {
    console.log('\n📦 SIDEBAR PARENT:');
    console.log('  Tag:', results.sidebarParent.tag);
    console.log('  Left:', results.sidebarParent.left);
    console.log('  Width:', results.sidebarParent.width);
  }
  
  console.log('\n📋 CONTENT WRAPPER (div.sQbJC):');
  console.log('  Left from sidebar:', results.contentWrapper?.leftFromSidebar, 'px');
  console.log('  Margin:', results.contentWrapper?.margin);
  console.log('  Padding:', results.contentWrapper?.padding);
  console.log('  Width:', results.contentWrapper?.width);
  
  console.log('\n📁 SECTION (div.pb-3):');
  console.log('  Left from sidebar:', results.section?.leftFromSidebar, 'px');
  console.log('  Width:', results.section?.width);
  
  console.log('\n🔘 ACTIVE MENU ITEM (Chat):');
  console.log('  Left gap from sidebar:', results.activeItem?.leftGapFromSidebar, 'px');
  console.log('  Right gap from sidebar:', results.activeItem?.rightGapFromSidebar, 'px');
  console.log('  Item width:', results.activeItem?.width, 'px');
  console.log('  Icon left from sidebar:', results.activeItem?.iconLeftFromSidebar, 'px');
  console.log('  SVG left from sidebar:', results.activeItem?.svgLeftFromSidebar, 'px');
  console.log('  ::before inset:', results.activeItem?.beforeInset);
  
  // Calculate the VISUAL gaps
  console.log('\n🎯 VISUAL MEASUREMENTS:');
  console.log('  From sidebar left edge to icon:', results.activeItem?.iconLeftFromSidebar, 'px');
  console.log('  From sidebar left edge to SVG:', results.activeItem?.svgLeftFromSidebar, 'px');
  console.log('  From item right edge to sidebar right edge:', results.activeItem?.rightGapFromSidebar, 'px');
  
  // Save
  const refDir = path.join(__dirname, '../reference');
  const outputPath = path.join(refDir, 'exact-gaps.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('\n✅ Сохранено:', outputPath);
  
  await browser.close();
}

measureExactGaps().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

