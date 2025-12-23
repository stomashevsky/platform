const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractCSSClasses() {
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
  
  console.log('\n📋 Извлекаю CSS стили для всех классов sidebar...\n');
  
  const cssStyles = await page.evaluate(() => {
    const result = {
      containers: {},
      elements: {},
      hover: {},
    };
    
    // Helper function to get all relevant CSS properties
    const getRelevantStyles = (element) => {
      const computed = getComputedStyle(element);
      const beforeStyles = getComputedStyle(element, '::before');
      
      return {
        // Box Model
        width: computed.width,
        height: computed.height,
        margin: computed.margin,
        marginTop: computed.marginTop,
        marginRight: computed.marginRight,
        marginBottom: computed.marginBottom,
        marginLeft: computed.marginLeft,
        padding: computed.padding,
        paddingTop: computed.paddingTop,
        paddingRight: computed.paddingRight,
        paddingBottom: computed.paddingBottom,
        paddingLeft: computed.paddingLeft,
        
        // Display & Layout
        display: computed.display,
        flexDirection: computed.flexDirection,
        alignItems: computed.alignItems,
        justifyContent: computed.justifyContent,
        gap: computed.gap,
        flexGrow: computed.flexGrow,
        flexShrink: computed.flexShrink,
        
        // Position
        position: computed.position,
        top: computed.top,
        right: computed.right,
        bottom: computed.bottom,
        left: computed.left,
        
        // Typography
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        fontFamily: computed.fontFamily,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
        textAlign: computed.textAlign,
        color: computed.color,
        
        // Visual
        backgroundColor: computed.backgroundColor,
        borderRadius: computed.borderRadius,
        border: computed.border,
        boxShadow: computed.boxShadow,
        opacity: computed.opacity,
        
        // Overflow
        overflow: computed.overflow,
        overflowX: computed.overflowX,
        overflowY: computed.overflowY,
        
        // Cursor
        cursor: computed.cursor,
        
        // ::before pseudo-element
        before: {
          content: beforeStyles.content,
          position: beforeStyles.position,
          inset: beforeStyles.inset,
          backgroundColor: beforeStyles.backgroundColor,
          borderRadius: beforeStyles.borderRadius,
          transition: beforeStyles.transition,
        }
      };
    };
    
    // Helper to get bounding rect relative to sidebar
    const getRelativePosition = (element, sidebar) => {
      const elemRect = element.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      
      return {
        relativeX: elemRect.x - sidebarRect.x,
        relativeY: elemRect.y - sidebarRect.y,
        width: elemRect.width,
        height: elemRect.height,
      };
    };
    
    const sidebar = document.querySelector('aside.JiHZk');
    if (!sidebar) return { error: 'Sidebar not found (aside.JiHZk)' };
    
    // 1. aside.JiHZk - Main sidebar
    result.containers['aside.JiHZk'] = {
      styles: getRelevantStyles(sidebar),
      rect: getRelativePosition(sidebar, sidebar),
    };
    
    // 2. div.uDpF9 - Scrollable content container
    const scrollable = sidebar.querySelector('div.uDpF9');
    if (scrollable) {
      result.containers['div.uDpF9'] = {
        styles: getRelevantStyles(scrollable),
        rect: getRelativePosition(scrollable, sidebar),
      };
    }
    
    // 3. div.sQbJC - Content wrapper
    const contentWrapper = sidebar.querySelector('div.sQbJC');
    if (contentWrapper) {
      result.containers['div.sQbJC'] = {
        styles: getRelevantStyles(contentWrapper),
        rect: getRelativePosition(contentWrapper, sidebar),
      };
    }
    
    // 4. div.pb-3 - Section container
    const sectionContainer = sidebar.querySelector('div.pb-3');
    if (sectionContainer) {
      result.containers['div.pb-3'] = {
        styles: getRelevantStyles(sectionContainer),
        rect: getRelativePosition(sectionContainer, sidebar),
      };
    }
    
    // 5. div.z3hHU - Footer container
    const footer = sidebar.querySelector('div.z3hHU');
    if (footer) {
      result.containers['div.z3hHU'] = {
        styles: getRelevantStyles(footer),
        rect: getRelativePosition(footer, sidebar),
      };
    }
    
    // 6. h3.cTBD- - Section title
    const sectionTitle = sidebar.querySelector('h3.cTBD-');
    if (sectionTitle) {
      result.elements['h3.cTBD-'] = {
        styles: getRelevantStyles(sectionTitle),
        rect: getRelativePosition(sectionTitle, sidebar),
        text: sectionTitle.textContent?.trim(),
      };
    }
    
    // 7. a.k-D0f._8xE3c.rZ3k- - Active menu item (with aria-current="page")
    const activeMenuItem = sidebar.querySelector('a.k-D0f._8xE3c.rZ3k-');
    if (activeMenuItem) {
      result.elements['a.k-D0f._8xE3c.rZ3k-'] = {
        styles: getRelevantStyles(activeMenuItem),
        rect: getRelativePosition(activeMenuItem, sidebar),
        text: activeMenuItem.textContent?.trim(),
      };
    }
    
    // 8. a.k-D0f._8xE3c (without rZ3k-) - Inactive menu item
    const inactiveMenuItem = sidebar.querySelector('a.k-D0f._8xE3c:not(.rZ3k-)');
    if (inactiveMenuItem) {
      result.elements['a.k-D0f._8xE3c'] = {
        styles: getRelevantStyles(inactiveMenuItem),
        rect: getRelativePosition(inactiveMenuItem, sidebar),
        text: inactiveMenuItem.textContent?.trim(),
      };
    }
    
    // 9. span.abr-y - Menu item content wrapper
    const contentSpan = sidebar.querySelector('span.abr-y');
    if (contentSpan) {
      result.elements['span.abr-y'] = {
        styles: getRelevantStyles(contentSpan),
        rect: getRelativePosition(contentSpan, sidebar),
      };
    }
    
    // 10. span.J42DB - Icon wrapper
    const iconWrapper = sidebar.querySelector('span.J42DB');
    if (iconWrapper) {
      result.elements['span.J42DB'] = {
        styles: getRelevantStyles(iconWrapper),
        rect: getRelativePosition(iconWrapper, sidebar),
      };
    }
    
    // 11. span.lp65A - Text label
    const textLabel = sidebar.querySelector('span.lp65A');
    if (textLabel) {
      result.elements['span.lp65A'] = {
        styles: getRelevantStyles(textLabel),
        rect: getRelativePosition(textLabel, sidebar),
        text: textLabel.textContent?.trim(),
      };
    }
    
    // 12. Collapse button - button._8xE3c (inside z3hHU footer)
    const collapseBtn = footer?.querySelector('button._8xE3c');
    if (collapseBtn) {
      result.elements['button._8xE3c'] = {
        styles: getRelevantStyles(collapseBtn),
        rect: getRelativePosition(collapseBtn, sidebar),
      };
    }
    
    // 13. Add credits card container - div.eE5Hy
    const addCreditsCard = sidebar.querySelector('div.eE5Hy');
    if (addCreditsCard) {
      result.elements['div.eE5Hy'] = {
        styles: getRelevantStyles(addCreditsCard),
        rect: getRelativePosition(addCreditsCard, sidebar),
      };
    }
    
    return result;
  });
  
  if (cssStyles.error) {
    console.log('  ⚠️', cssStyles.error);
    await browser.close();
    return;
  }
  
  // Print summary
  console.log('📦 Контейнеры:');
  for (const [selector, data] of Object.entries(cssStyles.containers)) {
    console.log(`  ✓ ${selector}`);
    console.log(`      padding: ${data.styles.padding}`);
    console.log(`      margin: ${data.styles.margin}`);
    console.log(`      rect: ${data.rect.width}x${data.rect.height}, x:${data.rect.relativeX}`);
  }
  
  console.log('\n🎨 Элементы:');
  for (const [selector, data] of Object.entries(cssStyles.elements)) {
    console.log(`  ✓ ${selector}${data.text ? ` ("${data.text}")` : ''}`);
    console.log(`      padding: ${data.styles.padding}`);
    console.log(`      margin: ${data.styles.margin}`);
    console.log(`      fontSize: ${data.styles.fontSize}`);
    console.log(`      color: ${data.styles.color}`);
    if (data.styles.before.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      console.log(`      ::before bg: ${data.styles.before.backgroundColor}`);
    }
  }
  
  // Save results
  const refDir = path.join(__dirname, '../reference');
  const outputPath = path.join(refDir, 'sidebar-css-classes.json');
  fs.writeFileSync(outputPath, JSON.stringify(cssStyles, null, 2));
  
  console.log('\n✅ CSS классы извлечены!');
  console.log('📁 Сохранено:', outputPath);
  
  await browser.close();
}

extractCSSClasses().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

