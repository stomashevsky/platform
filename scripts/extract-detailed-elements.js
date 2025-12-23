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

async function extractDetailedElements() {
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
  
  console.log('\n📐 Извлекаю точную структуру Header...');
  
  const headerData = await page.evaluate(() => {
    // Ищем все элементы в верхней части страницы
    const topElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.top < 100 && rect.width > 200 && rect.height > 30 && rect.height < 80;
    });
    
    const headers = topElements.map(el => {
      const styles = getComputedStyle(el);
      return {
        tag: el.tagName,
        className: el.className,
        rect: el.getBoundingClientRect(),
        styles: {
          height: styles.height,
          padding: styles.padding,
          backgroundColor: styles.backgroundColor,
          display: styles.display,
          position: styles.position,
        }
      };
    });
    
    return headers;
  });
  
  console.log(`  ✓ Найдено ${headerData.length} потенциальных header элементов`);
  headerData.forEach((h, i) => {
    console.log(`    ${i + 1}. ${h.tag} - height: ${h.styles.height}, bg: ${rgbToHex(h.styles.backgroundColor)}`);
  });
  
  console.log('\n🎯 Извлекаю все кнопки с их состояниями...');
  
  const allButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).filter(btn => {
      const rect = btn.getBoundingClientRect();
      const styles = getComputedStyle(btn);
      return rect.width > 20 && 
             rect.height > 20 && 
             styles.visibility !== 'hidden' &&
             styles.display !== 'none';
    });
    
    return buttons.slice(0, 15).map(btn => {
      const styles = getComputedStyle(btn);
      const beforeStyles = getComputedStyle(btn, '::before');
      const afterStyles = getComputedStyle(btn, '::after');
      
      return {
        text: btn.textContent?.trim(),
        ariaLabel: btn.getAttribute('aria-label'),
        width: styles.width,
        height: styles.height,
        padding: styles.padding,
        margin: styles.margin,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border,
        borderRadius: styles.borderRadius,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        cursor: styles.cursor,
        transition: styles.transition,
        before: {
          content: beforeStyles.content,
          backgroundColor: beforeStyles.backgroundColor,
          borderRadius: beforeStyles.borderRadius,
          position: beforeStyles.position,
          inset: beforeStyles.inset,
        },
        after: {
          content: afterStyles.content,
          backgroundColor: afterStyles.backgroundColor,
        },
        svg: btn.querySelector('svg') ? {
          width: btn.querySelector('svg').getAttribute('width'),
          height: btn.querySelector('svg').getAttribute('height'),
          viewBox: btn.querySelector('svg').getAttribute('viewBox'),
        } : null
      };
    });
  });
  
  console.log(`  ✓ Извлечено ${allButtons.length} кнопок`);
  
  console.log('\n🎨 Тестирую hover состояния на первых 5 кнопках...');
  
  const hoverTests = [];
  const buttons = await page.$$('button');
  
  for (let i = 0; i < Math.min(5, buttons.length); i++) {
    const btn = buttons[i];
    
    // Получить состояние до hover
    const beforeHover = await btn.evaluate(el => {
      const styles = getComputedStyle(el);
      const beforeStyles = getComputedStyle(el, '::before');
      return {
        text: el.textContent?.trim().substring(0, 30),
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        before: {
          backgroundColor: beforeStyles.backgroundColor,
        }
      };
    });
    
    // Навести курсор
    await btn.hover();
    await page.waitForTimeout(200); // Подождать анимацию
    
    // Получить состояние после hover
    const afterHover = await btn.evaluate(el => {
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
      button: beforeHover.text,
      default: beforeHover,
      hover: afterHover,
    });
    
    console.log(`    ✓ ${i + 1}. "${beforeHover.text}"`);
  }
  
  console.log('\n🔍 Извлекаю все Input/Textarea элементы...');
  
  const inputs = await page.evaluate(() => {
    const allInputs = [
      ...Array.from(document.querySelectorAll('input')),
      ...Array.from(document.querySelectorAll('textarea'))
    ];
    
    return allInputs.filter(inp => {
      const rect = inp.getBoundingClientRect();
      return rect.width > 50 && rect.height > 20;
    }).map(inp => {
      const styles = getComputedStyle(inp);
      const container = inp.closest('div');
      const containerStyles = container ? getComputedStyle(container) : null;
      
      return {
        tag: inp.tagName,
        type: inp.getAttribute('type'),
        placeholder: inp.getAttribute('placeholder'),
        width: styles.width,
        height: styles.height,
        padding: styles.padding,
        border: styles.border,
        borderRadius: styles.borderRadius,
        fontSize: styles.fontSize,
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        container: containerStyles ? {
          height: containerStyles.height,
          padding: containerStyles.padding,
          borderRadius: containerStyles.borderRadius,
          backgroundColor: containerStyles.backgroundColor,
        } : null
      };
    });
  });
  
  console.log(`  ✓ Найдено ${inputs.length} input/textarea элементов`);
  
  console.log('\n🎭 Извлекаю все SVG иконки...');
  
  const icons = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll('svg')).filter(svg => {
      const rect = svg.getBoundingClientRect();
      return rect.width > 10 && rect.width < 50 && rect.height > 10 && rect.height < 50;
    });
    
    return svgs.slice(0, 20).map(svg => {
      const styles = getComputedStyle(svg);
      return {
        outerHTML: svg.outerHTML.substring(0, 500),
        width: svg.getAttribute('width'),
        height: svg.getAttribute('height'),
        viewBox: svg.getAttribute('viewBox'),
        fill: svg.getAttribute('fill') || styles.fill,
        color: styles.color,
        parentText: svg.closest('button')?.textContent?.trim().substring(0, 30) || 
                   svg.closest('a')?.textContent?.trim().substring(0, 30) ||
                   'standalone'
      };
    });
  });
  
  console.log(`  ✓ Извлечено ${icons.length} SVG иконок`);
  
  console.log('\n📦 Извлекаю белые карточки (Cards)...');
  
  const cards = await page.evaluate(() => {
    // Ищем элементы с белым фоном и скруглёнными углами
    const allElements = Array.from(document.querySelectorAll('*'));
    
    const whiteCards = allElements.filter(el => {
      const styles = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      return styles.backgroundColor === 'rgb(255, 255, 255)' &&
             parseFloat(styles.borderRadius) > 5 &&
             rect.width > 200 &&
             rect.height > 100;
    });
    
    return whiteCards.slice(0, 5).map(card => {
      const styles = getComputedStyle(card);
      return {
        tag: card.tagName,
        className: card.className,
        width: styles.width,
        height: styles.height,
        padding: styles.padding,
        backgroundColor: styles.backgroundColor,
        border: styles.border,
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow,
      };
    });
  });
  
  console.log(`  ✓ Найдено ${cards.length} белых карточек`);
  
  // Скриншот конкретных элементов
  console.log('\n📸 Делаю скриншоты отдельных элементов...');
  
  // Скриншот первой кнопки Create
  const createBtn = await page.$('button:has-text("Create")');
  if (createBtn) {
    await createBtn.screenshot({ 
      path: path.join(screenshotsDir, 'button-create.png') 
    });
    console.log('  ✓ button-create.png');
  }
  
  // Скриншот sidebar
  const sidebar = await page.$('aside');
  if (sidebar) {
    await sidebar.screenshot({ 
      path: path.join(screenshotsDir, 'sidebar-current.png') 
    });
    console.log('  ✓ sidebar-current.png');
  }
  
  // Сохранить результаты
  const results = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    headerCandidates: headerData,
    allButtons,
    hoverTests,
    inputs,
    icons,
    cards,
  };
  
  const outputPath = path.join(refDir, 'detailed-elements.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Детальное извлечение завершено!');
  console.log('📁 Сохранено:', outputPath);
  
  await browser.close();
}

extractDetailedElements().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

