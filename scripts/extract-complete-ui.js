const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Утилита для конвертации RGB в HEX
function rgbToHex(rgb) {
  if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return rgb;
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!match) return rgb;
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

async function extractCompleteUI() {
  console.log('🔌 Подключение к Chrome через CDP...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  
  if (contexts.length === 0) {
    console.error('❌ Нет доступных контекстов браузера');
    await browser.close();
    return;
  }
  
  const pages = contexts[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ Страница OpenAI не найдена!');
    console.log('📄 Доступные страницы:', pages.map(p => p.url()));
    await browser.close();
    return;
  }
  
  console.log('✅ Подключено к:', page.url());
  
  // Создать директории для результатов
  const refDir = path.join(__dirname, '../reference');
  const screenshotsDir = path.join(refDir, 'screenshots');
  
  if (!fs.existsSync(refDir)) fs.mkdirSync(refDir, { recursive: true });
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  
  // ===== ШАГИ ИЗВЛЕЧЕНИЯ =====
  
  console.log('\n📸 Шаг 1: Делаю скриншоты...');
  
  // Полный скриншот страницы
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'full-page.png'),
    fullPage: true 
  });
  console.log('  ✓ Полный скриншот сохранён');
  
  // Скриншот видимой области
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'viewport.png')
  });
  console.log('  ✓ Скриншот viewport сохранён');
  
  console.log('\n🎨 Шаг 2: Извлекаю глобальные стили...');
  
  const globalStyles = await page.evaluate(() => {
    const body = document.body;
    const bodyStyles = getComputedStyle(body);
    
    return {
      body: {
        backgroundColor: bodyStyles.backgroundColor,
        color: bodyStyles.color,
        fontFamily: bodyStyles.fontFamily,
        fontSize: bodyStyles.fontSize,
        fontWeight: bodyStyles.fontWeight,
        lineHeight: bodyStyles.lineHeight,
        letterSpacing: bodyStyles.letterSpacing,
      },
      documentElement: {
        backgroundColor: getComputedStyle(document.documentElement).backgroundColor,
      }
    };
  });
  
  console.log('  ✓ Глобальные стили извлечены');
  console.log('    - Фон body:', rgbToHex(globalStyles.body.backgroundColor));
  console.log('    - Шрифт:', globalStyles.body.fontFamily);
  
  console.log('\n🎨 Шаг 3: Извлекаю все уникальные цвета...');
  
  const allColors = await page.evaluate(() => {
    const colors = {
      backgrounds: new Set(),
      textColors: new Set(),
      borderColors: new Set(),
    };
    
    const allElements = document.querySelectorAll('*');
    
    for (const el of allElements) {
      const styles = getComputedStyle(el);
      
      if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colors.backgrounds.add(styles.backgroundColor);
      }
      
      if (styles.color) {
        colors.textColors.add(styles.color);
      }
      
      if (styles.borderColor && styles.borderColor !== 'rgb(0, 0, 0)') {
        colors.borderColors.add(styles.borderColor);
      }
    }
    
    return {
      backgrounds: Array.from(colors.backgrounds),
      textColors: Array.from(colors.textColors),
      borderColors: Array.from(colors.borderColors),
    };
  });
  
  console.log(`  ✓ Найдено ${allColors.backgrounds.length} уникальных цветов фона`);
  console.log(`  ✓ Найдено ${allColors.textColors.length} уникальных цветов текста`);
  console.log(`  ✓ Найдено ${allColors.borderColors.length} уникальных цветов границ`);
  
  console.log('\n🧩 Шаг 4: Извлекаю стили Header...');
  
  const headerStyles = await page.evaluate(() => {
    // Найти header - обычно это первый элемент с фиксированной высотой вверху
    const header = document.querySelector('header') || 
                   document.querySelector('[role="banner"]') ||
                   Array.from(document.querySelectorAll('*')).find(el => {
                     const rect = el.getBoundingClientRect();
                     return rect.top === 0 && rect.width === window.innerWidth && rect.height < 100;
                   });
    
    if (!header) return { error: 'Header не найден' };
    
    const styles = getComputedStyle(header);
    
    return {
      element: header.tagName,
      height: styles.height,
      padding: styles.padding,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight,
      backgroundColor: styles.backgroundColor,
      display: styles.display,
      alignItems: styles.alignItems,
      justifyContent: styles.justifyContent,
      position: styles.position,
      zIndex: styles.zIndex,
    };
  });
  
  if (headerStyles.error) {
    console.log('  ⚠️ ', headerStyles.error);
  } else {
    console.log('  ✓ Header стили извлечены');
    console.log('    - Высота:', headerStyles.height);
    console.log('    - Фон:', rgbToHex(headerStyles.backgroundColor));
  }
  
  console.log('\n🧩 Шаг 5: Извлекаю стили Sidebar...');
  
  const sidebarStyles = await page.evaluate(() => {
    // Найти sidebar - обычно слева, фиксированная ширина
    const sidebar = document.querySelector('aside') ||
                    document.querySelector('[role="navigation"]') ||
                    Array.from(document.querySelectorAll('*')).find(el => {
                      const rect = el.getBoundingClientRect();
                      const styles = getComputedStyle(el);
                      return rect.left === 0 && 
                             rect.width < 300 && 
                             rect.height > window.innerHeight * 0.5 &&
                             (styles.position === 'fixed' || styles.position === 'sticky');
                    });
    
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const styles = getComputedStyle(sidebar);
    
    // Найти все элементы навигации в sidebar
    const navItems = Array.from(sidebar.querySelectorAll('button, a')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 50 && rect.height > 20;
    });
    
    const items = navItems.slice(0, 5).map(item => {
      const itemStyles = getComputedStyle(item);
      const isActive = itemStyles.backgroundColor !== 'rgba(0, 0, 0, 0)';
      
      // Проверить ::before
      const beforeStyles = getComputedStyle(item, '::before');
      
      return {
        text: item.textContent?.trim().substring(0, 30),
        width: itemStyles.width,
        height: itemStyles.height,
        padding: itemStyles.padding,
        margin: itemStyles.margin,
        fontSize: itemStyles.fontSize,
        fontWeight: itemStyles.fontWeight,
        color: itemStyles.color,
        backgroundColor: itemStyles.backgroundColor,
        borderRadius: itemStyles.borderRadius,
        isActive,
        before: {
          backgroundColor: beforeStyles.backgroundColor,
          borderRadius: beforeStyles.borderRadius,
          content: beforeStyles.content,
        }
      };
    });
    
    return {
      sidebar: {
        width: styles.width,
        padding: styles.padding,
        backgroundColor: styles.backgroundColor,
        position: styles.position,
      },
      items,
    };
  });
  
  if (sidebarStyles.error) {
    console.log('  ⚠️ ', sidebarStyles.error);
  } else {
    console.log('  ✓ Sidebar стили извлечены');
    console.log('    - Ширина:', sidebarStyles.sidebar.width);
    console.log('    - Найдено элементов:', sidebarStyles.items.length);
  }
  
  console.log('\n🧩 Шаг 6: Извлекаю стили кнопок...');
  
  const buttonStyles = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).filter(btn => {
      const rect = btn.getBoundingClientRect();
      const styles = getComputedStyle(btn);
      return rect.width > 30 && 
             rect.height > 20 && 
             rect.width < 400 &&
             styles.visibility !== 'hidden' &&
             styles.display !== 'none';
    });
    
    const uniqueButtons = [];
    const seen = new Set();
    
    for (const btn of buttons.slice(0, 20)) {
      const styles = getComputedStyle(btn);
      const key = `${styles.height}-${styles.backgroundColor}-${styles.borderRadius}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        
        // Проверить ::before
        const beforeStyles = getComputedStyle(btn, '::before');
        
        uniqueButtons.push({
          text: btn.textContent?.trim().substring(0, 30),
          height: styles.height,
          padding: styles.padding,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          border: styles.border,
          borderRadius: styles.borderRadius,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          before: {
            backgroundColor: beforeStyles.backgroundColor,
            borderRadius: beforeStyles.borderRadius,
          }
        });
      }
      
      if (uniqueButtons.length >= 10) break;
    }
    
    return uniqueButtons;
  });
  
  console.log(`  ✓ Найдено ${buttonStyles.length} уникальных стилей кнопок`);
  
  console.log('\n🧩 Шаг 7: Тестирую hover состояния...');
  
  const hoverStates = await page.evaluate(() => {
    // Найти первую кнопку для тестирования
    const testButton = Array.from(document.querySelectorAll('button')).find(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.width > 50 && rect.height > 30;
    });
    
    if (!testButton) return { error: 'Тестовая кнопка не найдена' };
    
    const defaultStyles = getComputedStyle(testButton);
    
    return {
      element: testButton.textContent?.trim().substring(0, 30),
      default: {
        backgroundColor: defaultStyles.backgroundColor,
        color: defaultStyles.color,
      },
      note: 'Hover состояния требуют эмуляции через page.hover()'
    };
  });
  
  console.log('  ✓ Hover тестирование подготовлено');
  
  // Сохранить все результаты
  const results = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    viewport: await page.viewportSize(),
    globalStyles,
    allColors,
    headerStyles,
    sidebarStyles,
    buttonStyles,
    hoverStates,
  };
  
  const outputPath = path.join(refDir, 'complete-ui-extraction.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Извлечение завершено!');
  console.log('📁 Результаты сохранены:');
  console.log('   -', outputPath);
  console.log('   -', path.join(screenshotsDir, 'full-page.png'));
  console.log('   -', path.join(screenshotsDir, 'viewport.png'));
  
  await browser.close();
}

// Запуск
extractCompleteUI().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

