const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Extract collapsed sidebar parameters by measuring VISIBLE elements
 */
async function extractCollapsedVisual() {
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
    const data = {
      collapsed: {},
      iconButtons: [],
      footer: {},
      collapseButton: {},
      contentCard: {},
    };
    
    // Method 1: Find the leftmost visible element that's part of sidebar
    // In collapsed state, the rightmost edge of sidebar icons is ~64px from viewport
    
    // Find all icon buttons (small clickable elements on left side)
    const allButtons = document.querySelectorAll('button, a');
    const leftSideButtons = [];
    
    allButtons.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      // Buttons in collapsed sidebar are on the left (< 100px from viewport) and small
      if (rect.left < 100 && rect.width > 30 && rect.width < 60 && rect.height > 25 && rect.height < 45) {
        const s = getComputedStyle(btn);
        const beforeS = getComputedStyle(btn, '::before');
        leftSideButtons.push({
          tag: btn.tagName,
          text: btn.textContent?.trim().substring(0, 20) || '',
          left: rect.left,
          right: rect.right,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          margin: s.margin,
          padding: s.padding,
          beforeBg: beforeS.backgroundColor,
          beforeOpacity: beforeS.opacity,
          beforeBorderRadius: beforeS.borderRadius,
        });
      }
    });
    
    // Sort by top position
    leftSideButtons.sort((a, b) => a.top - b.top);
    data.iconButtons = leftSideButtons;
    
    // Calculate sidebar width from the rightmost edge of sidebar elements
    if (leftSideButtons.length > 0) {
      const rightMostEdge = Math.max(...leftSideButtons.map(b => b.right));
      const leftMostEdge = Math.min(...leftSideButtons.map(b => b.left));
      
      data.collapsed = {
        visualWidth: rightMostEdge + 8, // Add padding
        leftMostButton: leftMostEdge,
        rightMostButton: rightMostEdge,
        buttonWidth: leftSideButtons[0]?.width,
        buttonHeight: leftSideButtons[0]?.height,
        buttonLeft: leftSideButtons[0]?.left,
      };
    }
    
    // Find content card (white area to the right of sidebar)
    const allDivs = document.querySelectorAll('div, main, section');
    for (const div of allDivs) {
      const rect = div.getBoundingClientRect();
      const s = getComputedStyle(div);
      // Content card has white bg, is on the right side
      if (s.backgroundColor === 'rgb(255, 255, 255)' && 
          rect.left > 50 && rect.left < 200 && 
          rect.width > 500 && rect.height > 500) {
        data.contentCard = {
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: s.borderRadius,
        };
        break;
      }
    }
    
    // Gap between sidebar and content
    if (data.collapsed.rightMostButton && data.contentCard.left) {
      data.collapsed.gapToContent = data.contentCard.left - data.collapsed.rightMostButton;
    }
    
    // Find collapse button (bottom of sidebar, usually last button)
    const bottomButton = leftSideButtons[leftSideButtons.length - 1];
    if (bottomButton && bottomButton.top > 800) {
      data.collapseButton = bottomButton;
    }
    
    // Find footer area
    const footerButtons = leftSideButtons.filter(b => b.top > 700);
    if (footerButtons.length > 0) {
      data.footer = {
        topMost: Math.min(...footerButtons.map(b => b.top)),
        buttons: footerButtons.length,
      };
    }
    
    return data;
  });
  
  console.log('\n📐 COLLAPSED SIDEBAR (Visual):');
  console.log('  Left most button:', results.collapsed.leftMostButton, 'px');
  console.log('  Right most button:', results.collapsed.rightMostButton, 'px');
  console.log('  Visual width (approx):', results.collapsed.visualWidth, 'px');
  console.log('  Button size:', results.collapsed.buttonWidth, 'x', results.collapsed.buttonHeight, 'px');
  console.log('  Gap to content card:', results.collapsed.gapToContent, 'px');
  
  console.log('\n🔘 ICON BUTTONS:', results.iconButtons.length);
  results.iconButtons.slice(0, 5).forEach((btn, i) => {
    console.log(`  [${i}] ${btn.width}x${btn.height}px at left:${btn.left}px, margin:${btn.margin}`);
  });
  
  console.log('\n📦 CONTENT CARD:');
  console.log('  Left:', results.contentCard.left, 'px');
  console.log('  Width:', results.contentCard.width, 'px');
  
  console.log('\n⏹️ COLLAPSE BUTTON:');
  console.log('  Left:', results.collapseButton?.left, 'px');
  console.log('  Size:', results.collapseButton?.width, 'x', results.collapseButton?.height, 'px');
  
  // Save
  const outputPath = path.join(__dirname, '../reference/sidebar-collapsed-visual.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('\n✅ Saved:', outputPath);
  
  await browser.close();
}

extractCollapsedVisual().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

