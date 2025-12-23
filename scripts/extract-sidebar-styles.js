/**
 * Детальное извлечение стилей sidebar с OpenAI Platform
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractSidebarStyles() {
  console.log('🔌 Подключение к Chrome...\n');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const pages = contexts[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ Страница OpenAI не найдена');
    await browser.close();
    return;
  }
  
  console.log('✅ Подключено к:', page.url(), '\n');
  
  // Ждём полной загрузки
  await page.waitForTimeout(1000);
  
  // Создаём директорию
  const refDir = path.join(__dirname, '..', 'reference');
  if (!fs.existsSync(refDir)) fs.mkdirSync(refDir, { recursive: true });
  
  // Скриншот только sidebar области (левые 300px)
  await page.screenshot({ 
    path: path.join(refDir, 'openai-sidebar.png'),
    clip: { x: 0, y: 0, width: 300, height: 900 }
  });
  console.log('📸 Скриншот sidebar сохранён\n');
  
  // Полный скриншот
  await page.screenshot({ path: path.join(refDir, 'openai-full-new.png') });
  console.log('📸 Полный скриншот сохранён\n');
  
  // Детальное извлечение стилей sidebar
  const sidebarStyles = await page.evaluate(() => {
    const result = {
      layout: {},
      projectSelector: {},
      sectionTitles: [],
      menuItems: [],
      dividers: [],
      icons: []
    };
    
    // Ищем nav элемент
    const nav = document.querySelector('nav');
    if (!nav) {
      console.log('Nav not found');
      return result;
    }
    
    // Получаем размеры и позицию nav
    const navRect = nav.getBoundingClientRect();
    const navStyle = getComputedStyle(nav);
    
    result.layout = {
      width: navRect.width,
      height: navRect.height,
      left: navRect.left,
      top: navRect.top,
      backgroundColor: navStyle.backgroundColor,
      padding: navStyle.padding,
      margin: navStyle.margin,
      borderRadius: navStyle.borderRadius
    };
    
    // Получаем родительский контейнер sidebar
    let sidebarContainer = nav.parentElement;
    while (sidebarContainer && sidebarContainer !== document.body) {
      const s = getComputedStyle(sidebarContainer);
      const rect = sidebarContainer.getBoundingClientRect();
      if (rect.width > 200 && rect.width < 350) {
        result.sidebarContainer = {
          width: rect.width,
          backgroundColor: s.backgroundColor,
          padding: s.padding,
          borderRadius: s.borderRadius,
          border: s.border,
          margin: s.margin,
          gap: s.gap
        };
        break;
      }
      sidebarContainer = sidebarContainer.parentElement;
    }
    
    // Все элементы в nav
    const allElements = nav.querySelectorAll('*');
    
    // Ищем section titles (Create, Manage, Optimize)
    const sectionTitleTexts = ['Create', 'Manage', 'Optimize'];
    allElements.forEach(el => {
      const text = el.textContent?.trim();
      if (sectionTitleTexts.includes(text) && el.children.length === 0) {
        const s = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        result.sectionTitles.push({
          text: text,
          tagName: el.tagName,
          width: rect.width,
          height: rect.height,
          color: s.color,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          padding: s.padding,
          margin: s.margin,
          letterSpacing: s.letterSpacing,
          textTransform: s.textTransform
        });
      }
    });
    
    // Ищем menu items (кнопки с иконками)
    const menuItemTexts = ['Chat', 'ChatGPT Apps', 'Agent Builder', 'Audio', 'Images', 'Videos', 
                           'Assistants', 'Usage', 'API keys', 'Logs', 'Storage', 'Batches',
                           'Evaluation', 'Fine-tuning'];
    
    const buttons = nav.querySelectorAll('button, a, [role="button"]');
    buttons.forEach(btn => {
      const text = btn.textContent?.trim();
      const matchedItem = menuItemTexts.find(item => text?.includes(item));
      
      if (matchedItem) {
        const s = getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        
        // Проверяем, активный ли это элемент
        const isActive = s.backgroundColor === 'rgb(237, 237, 237)' || 
                        s.fontWeight === '600' ||
                        btn.getAttribute('aria-current') === 'page';
        
        result.menuItems.push({
          text: matchedItem,
          isActive: isActive,
          width: rect.width,
          height: rect.height,
          backgroundColor: s.backgroundColor,
          color: s.color,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          padding: s.padding,
          paddingLeft: s.paddingLeft,
          paddingRight: s.paddingRight,
          margin: s.margin,
          borderRadius: s.borderRadius,
          gap: s.gap,
          display: s.display,
          alignItems: s.alignItems,
          justifyContent: s.justifyContent,
          cursor: s.cursor
        });
        
        // Ищем иконку внутри
        const svg = btn.querySelector('svg');
        if (svg) {
          const svgStyle = getComputedStyle(svg);
          const svgRect = svg.getBoundingClientRect();
          result.icons.push({
            forItem: matchedItem,
            width: svgRect.width,
            height: svgRect.height,
            color: svgStyle.color,
            fill: svgStyle.fill,
            stroke: svgStyle.stroke
          });
        }
      }
    });
    
    // Ищем разделители (hr или div с border)
    allElements.forEach(el => {
      const s = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      if ((el.tagName === 'HR' || 
          (rect.height <= 2 && rect.width > 100 && s.backgroundColor !== 'rgba(0, 0, 0, 0)')) &&
          rect.width > 50) {
        result.dividers.push({
          tagName: el.tagName,
          width: rect.width,
          height: rect.height,
          backgroundColor: s.backgroundColor,
          borderTop: s.borderTop,
          margin: s.margin
        });
      }
    });
    
    // Project selector (вверху)
    const projectBtn = Array.from(buttons).find(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('personal') || text.includes('default');
    });
    
    if (projectBtn) {
      const s = getComputedStyle(projectBtn);
      const rect = projectBtn.getBoundingClientRect();
      
      result.projectSelector = {
        width: rect.width,
        height: rect.height,
        backgroundColor: s.backgroundColor,
        color: s.color,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        padding: s.padding,
        borderRadius: s.borderRadius,
        border: s.border,
        gap: s.gap,
        display: s.display,
        alignItems: s.alignItems
      };
      
      // Ищем аватар/иконку проекта
      const projectIcon = projectBtn.querySelector('div, span');
      if (projectIcon) {
        const iconStyle = getComputedStyle(projectIcon);
        const iconRect = projectIcon.getBoundingClientRect();
        if (iconRect.width > 15 && iconRect.width < 40) {
          result.projectSelector.icon = {
            width: iconRect.width,
            height: iconRect.height,
            backgroundColor: iconStyle.backgroundColor,
            borderRadius: iconStyle.borderRadius,
            border: iconStyle.border
          };
        }
      }
    }
    
    return result;
  });
  
  // Выводим результат
  console.log('='.repeat(60));
  console.log('SIDEBAR STYLES');
  console.log('='.repeat(60));
  
  console.log('\n📐 LAYOUT:');
  console.log(JSON.stringify(sidebarStyles.layout, null, 2));
  
  if (sidebarStyles.sidebarContainer) {
    console.log('\n📦 SIDEBAR CONTAINER:');
    console.log(JSON.stringify(sidebarStyles.sidebarContainer, null, 2));
  }
  
  console.log('\n🏢 PROJECT SELECTOR:');
  console.log(JSON.stringify(sidebarStyles.projectSelector, null, 2));
  
  console.log('\n📝 SECTION TITLES:');
  sidebarStyles.sectionTitles.forEach(t => {
    console.log(`  "${t.text}": color=${t.color}, size=${t.fontSize}, weight=${t.fontWeight}`);
  });
  
  console.log('\n📋 MENU ITEMS (first 5):');
  sidebarStyles.menuItems.slice(0, 5).forEach(item => {
    console.log(`  "${item.text}": ${item.isActive ? '✓ ACTIVE' : ''}`);
    console.log(`    size: ${item.width}x${item.height}, bg: ${item.backgroundColor}`);
    console.log(`    color: ${item.color}, fontSize: ${item.fontSize}, weight: ${item.fontWeight}`);
    console.log(`    padding: ${item.padding}, radius: ${item.borderRadius}`);
  });
  
  console.log('\n📏 DIVIDERS:');
  sidebarStyles.dividers.forEach(d => {
    console.log(`  ${d.width}x${d.height}, bg: ${d.backgroundColor}`);
  });
  
  console.log('\n' + '='.repeat(60));
  
  // Сохраняем JSON
  const stylesPath = path.join(refDir, 'sidebar-styles.json');
  fs.writeFileSync(stylesPath, JSON.stringify(sidebarStyles, null, 2));
  console.log('\n💾 Сохранено:', stylesPath);
  
  await browser.close();
  console.log('\n✅ Готово!\n');
}

extractSidebarStyles().catch(console.error);

