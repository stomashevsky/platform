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

async function extractCollapsedSidebarSimple() {
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
  
  // Подождать завершения анимации
  await page.waitForTimeout(500);
  
  const refDir = path.join(__dirname, '../reference');
  
  console.log('\n📏 Извлекаю все элементы слева (collapsed sidebar область)...');
  
  const leftArea = await page.evaluate(() => {
    // Найти все элементы в левой области (x < 100)
    const leftElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.left < 100 && 
             rect.width > 20 && 
             rect.width < 100 &&
             rect.height > window.innerHeight * 0.3;
    });
    
    return leftElements.map(el => {
      const styles = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      return {
        tag: el.tagName,
        className: el.className,
        width: styles.width,
        height: styles.height,
        padding: styles.padding,
        margin: styles.margin,
        backgroundColor: styles.backgroundColor,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        }
      };
    });
  });
  
  console.log(`  ✓ Найдено ${leftArea.length} элементов в левой области`);
  leftArea.forEach((el, i) => {
    console.log(`    ${i + 1}. ${el.tag} - width: ${el.width}, rect.width: ${el.rect.width}px`);
  });
  
  console.log('\n🔘 Извлекаю все кнопки с иконками...');
  
  const iconButtons = await page.evaluate(() => {
    // Найти все кнопки с SVG
    const buttons = Array.from(document.querySelectorAll('button')).filter(btn => {
      const svg = btn.querySelector('svg');
      const rect = btn.getBoundingClientRect();
      return svg && rect.left < 100 && rect.width < 100;
    });
    
    return buttons.map(btn => {
      const styles = getComputedStyle(btn);
      const rect = btn.getBoundingClientRect();
      const beforeStyles = getComputedStyle(btn, '::before');
      
      const svg = btn.querySelector('svg');
      const svgRect = svg.getBoundingClientRect();
      
      return {
        title: btn.getAttribute('title') || btn.textContent?.trim(),
        width: styles.width,
        height: styles.height,
        padding: styles.padding,
        margin: styles.margin,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderRadius: styles.borderRadius,
        position: {
          x: rect.x,
          y: rect.y,
        },
        before: {
          backgroundColor: beforeStyles.backgroundColor,
          borderRadius: beforeStyles.borderRadius,
        },
        svg: {
          width: svgRect.width,
          height: svgRect.height,
        }
      };
    });
  });
  
  console.log(`  ✓ Найдено ${iconButtons.length} кнопок с иконками`);
  iconButtons.forEach((btn, i) => {
    console.log(`    ${i + 1}. "${btn.title}" - ${btn.width} x ${btn.height}, bg: ${rgbToHex(btn.backgroundColor)}`);
  });
  
  // Сохранить результаты
  const results = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    state: 'collapsed (after animation)',
    leftArea,
    iconButtons,
  };
  
  const outputPath = path.join(refDir, 'sidebar-collapsed-state.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Извлечение завершено!');
  console.log('📁 Сохранено:', outputPath);
  
  await browser.close();
}

extractCollapsedSidebarSimple().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

