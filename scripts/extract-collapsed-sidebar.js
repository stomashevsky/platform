const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function rgbToHex(rgb) {
  if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return rgb;
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!match) return rgb;
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

async function extractCollapsedSidebar() {
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
  
  const refDir = path.join(__dirname, '../reference');
  const screenshotsDir = path.join(refDir, 'screenshots');
  
  console.log('\n📏 Извлекаю collapsed sidebar...');
  
  const collapsedSidebar = await page.evaluate(() => {
    // Найти sidebar
    const sidebar = document.querySelector('aside') ||
                    Array.from(document.querySelectorAll('*')).find(el => {
                      const rect = el.getBoundingClientRect();
                      const styles = getComputedStyle(el);
                      return rect.left === 0 && 
                             rect.width < 100 && 
                             rect.height > window.innerHeight * 0.5;
                    });
    
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const styles = getComputedStyle(sidebar);
    const rect = sidebar.getBoundingClientRect();
    
    // Найти все кнопки/элементы в collapsed sidebar
    const items = Array.from(sidebar.querySelectorAll('button')).map(btn => {
      const btnStyles = getComputedStyle(btn);
      const btnRect = btn.getBoundingClientRect();
      const beforeStyles = getComputedStyle(btn, '::before');
      
      // Найти SVG иконку
      const svg = btn.querySelector('svg');
      const svgStyles = svg ? getComputedStyle(svg) : null;
      
      return {
        text: btn.getAttribute('title') || btn.getAttribute('aria-label') || '',
        width: btnStyles.width,
        height: btnStyles.height,
        margin: btnStyles.margin,
        padding: btnStyles.padding,
        backgroundColor: btnStyles.backgroundColor,
        color: btnStyles.color,
        borderRadius: btnStyles.borderRadius,
        display: btnStyles.display,
        position: btnRect,
        before: {
          backgroundColor: beforeStyles.backgroundColor,
          borderRadius: beforeStyles.borderRadius,
          inset: beforeStyles.inset,
        },
        svg: svg ? {
          width: svgStyles.width,
          height: svgStyles.height,
          color: svgStyles.color,
        } : null
      };
    });
    
    return {
      sidebar: {
        width: styles.width,
        height: styles.height,
        padding: styles.padding,
        backgroundColor: styles.backgroundColor,
        position: styles.position,
        rect: {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
        }
      },
      items: items.slice(0, 15),
      itemCount: items.length,
    };
  });
  
  if (collapsedSidebar.error) {
    console.log('  ⚠️', collapsedSidebar.error);
  } else {
    console.log('  ✓ Collapsed sidebar извлечён');
    console.log('    - Ширина:', collapsedSidebar.sidebar.width);
    console.log('    - Padding:', collapsedSidebar.sidebar.padding);
    console.log('    - Найдено элементов:', collapsedSidebar.itemCount);
  }
  
  console.log('\n📸 Делаю скриншот collapsed sidebar...');
  
  const sidebar = await page.$('aside');
  if (sidebar) {
    await sidebar.screenshot({ 
      path: path.join(screenshotsDir, 'sidebar-collapsed.png') 
    });
    console.log('  ✓ sidebar-collapsed.png сохранён');
  }
  
  // Скриншот полной страницы с collapsed sidebar
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'full-page-collapsed.png'),
    fullPage: true 
  });
  console.log('  ✓ full-page-collapsed.png сохранён');
  
  console.log('\n🎨 Тестирую hover на collapsed элементах...');
  
  const buttons = await page.$$('aside button');
  const hoverTests = [];
  
  for (let i = 0; i < Math.min(3, buttons.length); i++) {
    const btn = buttons[i];
    
    // До hover
    const before = await btn.evaluate(el => {
      const styles = getComputedStyle(el);
      const beforeStyles = getComputedStyle(el, '::before');
      return {
        title: el.getAttribute('title'),
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        before: {
          backgroundColor: beforeStyles.backgroundColor,
        }
      };
    });
    
    // Hover
    await btn.hover();
    await page.waitForTimeout(200);
    
    const after = await btn.evaluate(el => {
      const styles = getComputedStyle(el);
      const beforeStyles = getComputedStyle(el, '::before');
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        before: {
          backgroundColor: beforeStyles.backgroundColor,
        }
      };
    });
    
    hoverTests.push({
      button: before.title || `Button ${i + 1}`,
      default: before,
      hover: after,
    });
    
    console.log(`    ✓ ${i + 1}. ${before.title || 'Unnamed'}`);
  }
  
  // Сохранить результаты
  const results = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    state: 'collapsed',
    collapsedSidebar,
    hoverTests,
  };
  
  const outputPath = path.join(refDir, 'sidebar-collapsed-state.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Извлечение collapsed состояния завершено!');
  console.log('📁 Сохранено:', outputPath);
  
  await browser.close();
}

extractCollapsedSidebar().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

