const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Extract ALL collapsed sidebar parameters from OpenAI Platform
 * Following AGENTS.md rule 8: ОБЯЗАТЕЛЬНЫЙ ПОРЯДОК РАБОТЫ
 */
async function extractCollapsedComplete() {
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
  
  // Take screenshot first
  const refDir = path.join(__dirname, '../reference/screenshots');
  if (!fs.existsSync(refDir)) {
    fs.mkdirSync(refDir, { recursive: true });
  }
  
  await page.screenshot({ 
    path: path.join(refDir, 'openai-collapsed-full.png'),
    clip: { x: 0, y: 0, width: 400, height: 800 }
  });
  console.log('📸 Screenshot saved: openai-collapsed-full.png');
  
  const results = await page.evaluate(() => {
    const data = {
      sidebar: {},
      iconButtons: [],
      footer: {},
      collapseButton: {},
      transitions: {},
    };
    
    // Find sidebar - could be collapsed
    const sidebar = document.querySelector('aside') || 
                    document.querySelector('[class*="sidebar"]') ||
                    document.querySelector('nav aside');
    
    // Try to find by position (left side, below header)
    if (!sidebar) {
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const rect = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        // Collapsed sidebar is ~64px wide, on the left
        if (rect.left < 20 && rect.width > 50 && rect.width < 100 && rect.height > 500) {
          data.sidebar.foundBy = 'position search';
          data.sidebar.element = {
            tag: el.tagName,
            className: el.className,
            width: rect.width,
            height: rect.height,
            left: rect.left,
          };
          break;
        }
      }
    }
    
    // Check if sidebar is collapsed by looking for narrow aside OR by class
    const asideElements = document.querySelectorAll('aside, [data-sidebar-collapsible]');
    for (const aside of asideElements) {
      const rect = aside.getBoundingClientRect();
      // Collapsed sidebar is around 64px, expanded is 210px
      // Accept any sidebar and report its state
      if (rect.width > 0 && rect.height > 200) {
        // This is likely the collapsed sidebar
        const s = getComputedStyle(aside);
        data.sidebar = {
          tag: aside.tagName,
          className: aside.className?.substring(0, 50),
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
          padding: s.padding,
          margin: s.margin,
          display: s.display,
          flexDirection: s.flexDirection,
          transition: s.transition,
        };
        
        // Find all icon buttons inside
        const buttons = aside.querySelectorAll('button, a');
        buttons.forEach((btn, i) => {
          const btnRect = btn.getBoundingClientRect();
          const btnStyle = getComputedStyle(btn);
          const beforeStyle = getComputedStyle(btn, '::before');
          
          // Skip if not visible
          if (btnRect.width === 0 || btnRect.height === 0) return;
          
          data.iconButtons.push({
            index: i,
            tag: btn.tagName,
            text: btn.textContent?.trim().substring(0, 20),
            width: btnRect.width,
            height: btnRect.height,
            leftFromSidebar: btnRect.left - rect.left,
            topFromSidebar: btnRect.top - rect.top,
            margin: btnStyle.margin,
            padding: btnStyle.padding,
            borderRadius: btnStyle.borderRadius,
            beforeBg: beforeStyle.backgroundColor,
            beforeBorderRadius: beforeStyle.borderRadius,
          });
        });
        
        // Find footer section (bottom of sidebar)
        const allDivs = aside.querySelectorAll('div');
        let footerDiv = null;
        allDivs.forEach(div => {
          const divRect = div.getBoundingClientRect();
          // Footer is at the bottom
          if (divRect.bottom > rect.bottom - 100 && divRect.height > 30) {
            const divStyle = getComputedStyle(div);
            if (divStyle.flexShrink === '0' || divStyle.padding !== '0px') {
              footerDiv = div;
            }
          }
        });
        
        if (footerDiv) {
          const footerRect = footerDiv.getBoundingClientRect();
          const footerStyle = getComputedStyle(footerDiv);
          data.footer = {
            width: footerRect.width,
            height: footerRect.height,
            leftFromSidebar: footerRect.left - rect.left,
            bottomFromSidebar: rect.bottom - footerRect.bottom,
            padding: footerStyle.padding,
            margin: footerStyle.margin,
            flexShrink: footerStyle.flexShrink,
          };
          
          // Collapse button inside footer
          const collapseBtn = footerDiv.querySelector('button');
          if (collapseBtn) {
            const cbRect = collapseBtn.getBoundingClientRect();
            const cbStyle = getComputedStyle(collapseBtn);
            data.collapseButton = {
              width: cbRect.width,
              height: cbRect.height,
              leftFromFooter: cbRect.left - footerRect.left,
              leftFromSidebar: cbRect.left - rect.left,
              margin: cbStyle.margin,
              padding: cbStyle.padding,
            };
          }
        }
        
        break;
      }
    }
    
    // Check if sidebar is collapsed or expanded
    if (data.sidebar.width) {
      data.isCollapsed = data.sidebar.width < 100;
      data.isExpanded = data.sidebar.width >= 100;
      if (data.isExpanded) {
        data.warning = 'Sidebar is EXPANDED (' + data.sidebar.width + 'px). For collapsed state, collapse it first.';
      }
    } else {
      data.error = 'Could not find sidebar';
    }
    
    return data;
  });
  
  if (results.error) {
    console.log('\n❌', results.error);
    await browser.close();
    return;
  }
  
  if (results.warning) {
    console.log('\n⚠️', results.warning);
  }
  
  console.log('\n📊 STATE:', results.isCollapsed ? 'COLLAPSED' : 'EXPANDED');
  
  console.log('\n📐 COLLAPSED SIDEBAR:');
  console.log('  Width:', results.sidebar.width, 'px');
  console.log('  Height:', results.sidebar.height, 'px');
  console.log('  Left:', results.sidebar.left, 'px');
  console.log('  Top:', results.sidebar.top, 'px');
  console.log('  Padding:', results.sidebar.padding);
  console.log('  Transition:', results.sidebar.transition);
  
  console.log('\n🔘 ICON BUTTONS:', results.iconButtons.length);
  results.iconButtons.slice(0, 5).forEach((btn, i) => {
    console.log(`  [${i}] ${btn.width}x${btn.height}px, left: ${btn.leftFromSidebar}px, margin: ${btn.margin}`);
  });
  
  console.log('\n📍 FOOTER:');
  console.log('  Width:', results.footer.width, 'px');
  console.log('  Height:', results.footer.height, 'px');
  console.log('  Padding:', results.footer.padding);
  console.log('  Left from sidebar:', results.footer.leftFromSidebar, 'px');
  
  console.log('\n⏹️ COLLAPSE BUTTON:');
  console.log('  Width:', results.collapseButton.width, 'px');
  console.log('  Height:', results.collapseButton.height, 'px');
  console.log('  Left from sidebar:', results.collapseButton.leftFromSidebar, 'px');
  
  // Save
  const outputPath = path.join(__dirname, '../reference/sidebar-collapsed-complete.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('\n✅ Saved:', outputPath);
  
  await browser.close();
}

extractCollapsedComplete().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

