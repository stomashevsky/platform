const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractVisualPositions() {
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
    
    const sidebar = document.querySelector('aside.JiHZk');
    if (!sidebar) return { error: 'Sidebar not found' };
    
    const sidebarRect = sidebar.getBoundingClientRect();
    data.sidebar = {
      left: sidebarRect.left,
      width: sidebarRect.width,
      right: sidebarRect.right,
    };
    
    // Section title (h3) - where does the TEXT start?
    const sectionTitle = sidebar.querySelector('h3.cTBD-');
    if (sectionTitle) {
      const titleRect = sectionTitle.getBoundingClientRect();
      const s = getComputedStyle(sectionTitle);
      data.sectionTitle = {
        text: sectionTitle.textContent,
        elementLeft: titleRect.left - sidebarRect.left,
        elementRight: sidebarRect.right - titleRect.right,
        width: titleRect.width,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        // Text starts at: elementLeft + paddingLeft
        textStartsAt: (titleRect.left - sidebarRect.left) + parseInt(s.paddingLeft),
      };
    }
    
    // Active menu item - where does the ICON start?
    const activeItem = sidebar.querySelector('a.k-D0f._8xE3c.rZ3k-');
    if (activeItem) {
      const itemRect = activeItem.getBoundingClientRect();
      const iconSpan = activeItem.querySelector('span.J42DB');
      const textSpan = activeItem.querySelector('span.lp65A');
      
      data.activeMenuItem = {
        elementLeft: itemRect.left - sidebarRect.left,
        elementRight: sidebarRect.right - itemRect.right,
        width: itemRect.width,
      };
      
      if (iconSpan) {
        const iconRect = iconSpan.getBoundingClientRect();
        const is = getComputedStyle(iconSpan);
        data.activeMenuItem.icon = {
          left: iconRect.left - sidebarRect.left,
          marginLeft: is.marginLeft,
        };
      }
      
      if (textSpan) {
        const textRect = textSpan.getBoundingClientRect();
        data.activeMenuItem.text = {
          left: textRect.left - sidebarRect.left,
          content: textSpan.textContent,
        };
      }
    }
    
    // Add credits card
    const creditsCard = sidebar.querySelector('div.eE5Hy');
    if (creditsCard) {
      const cardRect = creditsCard.getBoundingClientRect();
      const s = getComputedStyle(creditsCard);
      
      // Find title text inside card
      const titleEl = creditsCard.querySelector('strong');
      
      data.creditsCard = {
        elementLeft: cardRect.left - sidebarRect.left,
        elementRight: sidebarRect.right - cardRect.right,
        width: cardRect.width,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        title: titleEl ? {
          text: titleEl.textContent,
          textLeft: titleEl.getBoundingClientRect().left - sidebarRect.left,
        } : null,
      };
    }
    
    // Collapse button
    const collapseBtn = sidebar.querySelector('div.z3hHU button._8xE3c');
    if (collapseBtn) {
      const btnRect = collapseBtn.getBoundingClientRect();
      data.collapseButton = {
        left: btnRect.left - sidebarRect.left,
        width: btnRect.width,
      };
    }
    
    // Footer container
    const footer = sidebar.querySelector('div.z3hHU');
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      const s = getComputedStyle(footer);
      data.footer = {
        padding: s.padding,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
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
  console.log('  Width:', results.sidebar.width);
  
  console.log('\n📝 SECTION TITLE (h3):');
  console.log('  Element left from sidebar:', results.sectionTitle?.elementLeft);
  console.log('  Element right gap:', results.sectionTitle?.elementRight);
  console.log('  Padding left:', results.sectionTitle?.paddingLeft);
  console.log('  Text starts at:', results.sectionTitle?.textStartsAt, 'px from sidebar edge');
  
  console.log('\n🔘 ACTIVE MENU ITEM:');
  console.log('  Element left from sidebar:', results.activeMenuItem?.elementLeft);
  console.log('  Element right gap:', results.activeMenuItem?.elementRight);
  console.log('  Icon left:', results.activeMenuItem?.icon?.left, 'px from sidebar edge');
  console.log('  Text left:', results.activeMenuItem?.text?.left, 'px from sidebar edge');
  
  console.log('\n💳 CREDITS CARD:');
  console.log('  Element left from sidebar:', results.creditsCard?.elementLeft);
  console.log('  Padding left:', results.creditsCard?.paddingLeft);
  console.log('  Title text left:', results.creditsCard?.title?.textLeft, 'px from sidebar edge');
  
  console.log('\n🔲 FOOTER:');
  console.log('  Padding:', results.footer?.padding);
  
  console.log('\n⏹️ COLLAPSE BUTTON:');
  console.log('  Left from sidebar:', results.collapseButton?.left);
  
  // Save
  const refDir = path.join(__dirname, '../reference');
  const outputPath = path.join(refDir, 'visual-positions.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('\n✅ Сохранено:', outputPath);
  
  await browser.close();
}

extractVisualPositions().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

