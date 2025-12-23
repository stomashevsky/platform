const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractNavbarStyles() {
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
      header: {},
      projectSelector: {},
      navItems: [],
      rightSection: {},
    };
    
    // Find header by position (top of page)
    const nav = document.querySelector('nav');
    if (nav) {
      const rect = nav.getBoundingClientRect();
      const s = getComputedStyle(nav);
      data.header = {
        tag: 'NAV',
        height: rect.height,
        fontFamily: s.fontFamily,
      };
    }
    
    // Search globally for elements
    const allButtons = document.querySelectorAll('button');
    const allLinks = document.querySelectorAll('a');
    
    // P Avatar - search all elements
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      const text = el.textContent?.trim();
      
      // P Avatar - small element with just "P", in top area
      if (text === 'P' && rect.top < 60 && rect.width >= 20 && rect.width <= 36) {
        const s = getComputedStyle(el);
        data.projectSelector.avatar = {
          width: rect.width,
          height: rect.height,
          borderRadius: s.borderRadius,
          backgroundColor: s.backgroundColor,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          lineHeight: s.lineHeight,
        };
      }
      
      // Slash separator
      if (text === '/' && rect.top < 60 && rect.width < 15) {
        const s = getComputedStyle(el);
        data.projectSelector.slash = {
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
        };
      }
    });
    
    // All buttons at top
    allButtons.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      if (rect.top > 60) return; // Skip buttons not in header
      
      const text = btn.textContent?.trim();
      const s = getComputedStyle(btn);
      
      // Personal button
      if (text === 'Personal' || text?.match(/^Personal/)) {
        data.projectSelector.personalButton = {
          text: 'Personal',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          letterSpacing: s.letterSpacing,
          lineHeight: s.lineHeight,
          height: rect.height,
          padding: s.padding,
        };
        
        const svg = btn.querySelector('svg');
        if (svg) {
          data.projectSelector.chevronIcon = {
            width: svg.getAttribute('width') || svg.getBoundingClientRect().width,
            height: svg.getAttribute('height') || svg.getBoundingClientRect().height,
          };
        }
      }
      
      // Default project button
      if (text === 'Default project' || text?.match(/^Default project/)) {
        data.projectSelector.projectButton = {
          text: 'Default project',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          letterSpacing: s.letterSpacing,
          height: rect.height,
        };
      }
      
      // Nav items
      if (text === 'Dashboard') {
        data.navItems.push({
          text: 'Dashboard',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          letterSpacing: s.letterSpacing,
          height: rect.height,
          isActive: true,
        });
      }
      
      if (text === 'Docs') {
        data.navItems.push({
          text: 'Docs',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          letterSpacing: s.letterSpacing,
          height: rect.height,
        });
      }
      
      if (text === 'API reference') {
        data.navItems.push({
          text: 'API reference',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          letterSpacing: s.letterSpacing,
          height: rect.height,
        });
      }
      
      // User avatar (U)
      if (text === 'U' && rect.width < 50) {
        const innerDiv = btn.querySelector('div');
        const targetEl = innerDiv || btn;
        const ts = getComputedStyle(targetEl);
        data.rightSection.userAvatar = {
          width: rect.width,
          height: rect.height,
          buttonBorderRadius: s.borderRadius,
          innerBorderRadius: innerDiv ? getComputedStyle(innerDiv).borderRadius : null,
          backgroundColor: ts.backgroundColor,
          fontSize: ts.fontSize,
          fontWeight: ts.fontWeight,
          color: ts.color,
        };
      }
      
      // Settings button (has SVG, no text or just icon)
      if (rect.width >= 30 && rect.width <= 50 && (!text || text.length < 3)) {
        const svg = btn.querySelector('svg');
        if (svg) {
          const svgRect = svg.getBoundingClientRect();
          // Check it's the settings icon (usually 20x20 or 24x24)
          if (svgRect.width >= 18 && svgRect.width <= 26) {
            data.rightSection.settingsButton = {
              buttonWidth: rect.width,
              buttonHeight: rect.height,
              iconWidth: svg.getAttribute('width') || svgRect.width,
              iconHeight: svg.getAttribute('height') || svgRect.height,
              buttonPadding: s.padding,
            };
          }
        }
      }
    });
    
    // Also check links
    allLinks.forEach(link => {
      const rect = link.getBoundingClientRect();
      if (rect.top > 60) return;
      
      const text = link.textContent?.trim();
      const s = getComputedStyle(link);
      
      if (text === 'Dashboard' && !data.navItems.find(i => i.text === 'Dashboard')) {
        data.navItems.push({
          text: 'Dashboard',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          height: rect.height,
        });
      }
      
      if (text === 'Docs' && !data.navItems.find(i => i.text === 'Docs')) {
        data.navItems.push({
          text: 'Docs',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          height: rect.height,
        });
      }
      
      if (text === 'API reference' && !data.navItems.find(i => i.text === 'API reference')) {
        data.navItems.push({
          text: 'API reference',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          height: rect.height,
        });
      }
    });
    
    return data;
  });
  
  console.log('\n📍 HEADER:', results.header);
  
  console.log('\n🏢 PROJECT SELECTOR:');
  console.log('  Avatar:', results.projectSelector.avatar);
  console.log('  Personal button:', results.projectSelector.personalButton);
  console.log('  Project button:', results.projectSelector.projectButton);
  console.log('  Chevron:', results.projectSelector.chevronIcon);
  console.log('  Slash:', results.projectSelector.slash);
  
  console.log('\n🔗 NAV ITEMS:');
  results.navItems.forEach(item => {
    console.log(' ', item.text, '- fontSize:', item.fontSize, 'fontWeight:', item.fontWeight, 'color:', item.color);
  });
  
  console.log('\n⚙️ RIGHT SECTION:');
  console.log('  Settings button:', results.rightSection.settingsButton);
  console.log('  User avatar:', results.rightSection.userAvatar);
  
  // Save
  const refDir = path.join(__dirname, '../reference');
  const outputPath = path.join(refDir, 'navbar-styles.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('\n✅ Сохранено:', outputPath);
  
  await browser.close();
}

extractNavbarStyles().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
