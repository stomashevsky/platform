const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function compareOriginalVsOurs() {
  console.log('🔌 Подключение к Chrome...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ OpenAI страница не найдена');
    await browser.close();
    return;
  }
  
  console.log('✅ Подключено к:', page.url());
  
  const refDir = path.join(__dirname, '../reference');
  const screenshotsDir = path.join(refDir, 'screenshots');
  
  // 1. Скриншот оригинального sidebar
  console.log('\n📸 Скриншот оригинального sidebar...');
  const originalSidebar = await page.$('aside');
  if (originalSidebar) {
    await originalSidebar.screenshot({ 
      path: path.join(screenshotsDir, 'sidebar-original.png') 
    });
    console.log('  ✓ sidebar-original.png');
  }
  
  // 2. Извлечь ВСЕ computed styles для sidebar и его детей
  console.log('\n🔍 Извлекаю все computed styles...');
  
  const allStyles = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const sidebarStyles = getComputedStyle(sidebar);
    const sidebarRect = sidebar.getBoundingClientRect();
    
    // Получить все CSS свойства sidebar
    const allSidebarProps = {};
    for (let prop of sidebarStyles) {
      allSidebarProps[prop] = sidebarStyles.getPropertyValue(prop);
    }
    
    // Найти все menu items (кнопки)
    const menuButtons = Array.from(sidebar.querySelectorAll('button')).filter(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.width > 100 && rect.height > 25 && rect.height < 40;
    });
    
    const firstMenuItem = menuButtons[0];
    let firstMenuItemStyles = null;
    let firstMenuItemBeforeStyles = null;
    
    if (firstMenuItem) {
      const styles = getComputedStyle(firstMenuItem);
      const beforeStyles = getComputedStyle(firstMenuItem, '::before');
      
      firstMenuItemStyles = {
        width: styles.width,
        height: styles.height,
        margin: styles.margin,
        padding: styles.padding,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        fontFamily: styles.fontFamily,
        borderRadius: styles.borderRadius,
        display: styles.display,
        alignItems: styles.alignItems,
        textAlign: styles.textAlign,
        border: styles.border,
      };
      
      firstMenuItemBeforeStyles = {
        content: beforeStyles.content,
        backgroundColor: beforeStyles.backgroundColor,
        borderRadius: beforeStyles.borderRadius,
        position: beforeStyles.position,
        inset: beforeStyles.inset,
        top: beforeStyles.top,
        right: beforeStyles.right,
        bottom: beforeStyles.bottom,
        left: beforeStyles.left,
      };
    }
    
    // Найти section titles (Create, Manage, Optimize)
    const allText = Array.from(sidebar.querySelectorAll('*')).filter(el => {
      const text = el.textContent?.trim();
      return text === 'Create' || text === 'Manage' || text === 'Optimize';
    });
    
    const firstSectionTitle = allText[0];
    let sectionTitleStyles = null;
    
    if (firstSectionTitle) {
      const styles = getComputedStyle(firstSectionTitle);
      sectionTitleStyles = {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.color,
        margin: styles.margin,
        padding: styles.padding,
        textTransform: styles.textTransform,
        letterSpacing: styles.letterSpacing,
      };
    }
    
    // Найти divider (разделитель между секциями)
    const possibleDividers = Array.from(sidebar.querySelectorAll('div, hr')).filter(el => {
      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      return rect.height < 5 && rect.width > 100 && 
             (styles.borderBottom !== 'none' || styles.backgroundColor !== 'rgba(0, 0, 0, 0)');
    });
    
    let dividerStyles = null;
    if (possibleDividers[0]) {
      const styles = getComputedStyle(possibleDividers[0]);
      dividerStyles = {
        height: styles.height,
        margin: styles.margin,
        marginTop: styles.marginTop,
        marginBottom: styles.marginBottom,
        backgroundColor: styles.backgroundColor,
        borderBottom: styles.borderBottom,
      };
    }
    
    return {
      sidebar: {
        // Основные
        width: sidebarStyles.width,
        height: sidebarStyles.height,
        padding: sidebarStyles.padding,
        margin: sidebarStyles.margin,
        display: sidebarStyles.display,
        flexDirection: sidebarStyles.flexDirection,
        backgroundColor: sidebarStyles.backgroundColor,
        
        // Границы
        border: sidebarStyles.border,
        borderRadius: sidebarStyles.borderRadius,
        
        // Position
        position: sidebarStyles.position,
        top: sidebarStyles.top,
        left: sidebarStyles.left,
        
        // Overflow
        overflow: sidebarStyles.overflow,
        overflowX: sidebarStyles.overflowX,
        overflowY: sidebarStyles.overflowY,
        
        // Gap
        gap: sidebarStyles.gap,
        rowGap: sidebarStyles.rowGap,
        columnGap: sidebarStyles.columnGap,
      },
      firstMenuItem: firstMenuItemStyles,
      firstMenuItemBefore: firstMenuItemBeforeStyles,
      sectionTitle: sectionTitleStyles,
      divider: dividerStyles,
      menuButtonsCount: menuButtons.length,
    };
  });
  
  if (allStyles.error) {
    console.log('  ⚠️', allStyles.error);
  } else {
    console.log('  ✓ Styles extracted');
    console.log('    - Menu buttons found:', allStyles.menuButtonsCount);
    console.log('    - Sidebar padding:', allStyles.sidebar.padding);
    console.log('    - Sidebar gap:', allStyles.sidebar.gap);
    
    if (allStyles.firstMenuItem) {
      console.log('    - First menu item width:', allStyles.firstMenuItem.width);
      console.log('    - First menu item height:', allStyles.firstMenuItem.height);
      console.log('    - First menu item margin:', allStyles.firstMenuItem.margin);
    }
  }
  
  // Сохранить результаты
  const outputPath = path.join(refDir, 'sidebar-complete-styles.json');
  fs.writeFileSync(outputPath, JSON.stringify(allStyles, null, 2));
  
  console.log('\n✅ Полное сравнение завершено!');
  console.log('📁 Styles: sidebar-complete-styles.json');
  console.log('📸 Screenshot: sidebar-original.png');
  console.log('\nТеперь откройте localhost:3000 и сделайте скриншот нашего sidebar для сравнения!');
  
  await browser.close();
}

compareOriginalVsOurs().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
