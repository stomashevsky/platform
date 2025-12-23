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

async function extractHeaderAndEmpty() {
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
  
  console.log('\n📋 Извлекаю Project Selector (левая часть Header)...');
  
  const projectSelector = await page.evaluate(() => {
    // Найти элементы проекта - обычно начинается с "P" или другой буквы в круге
    const avatars = Array.from(document.querySelectorAll('*')).filter(el => {
      const styles = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.top < 60 &&
             rect.width > 20 && rect.width < 40 &&
             rect.height > 20 && rect.height < 40 &&
             parseFloat(styles.borderRadius) > 10;
    });
    
    const projectAvatar = avatars[0];
    
    if (!projectAvatar) return { error: 'Project avatar не найден' };
    
    const styles = getComputedStyle(projectAvatar);
    
    // Найти текст рядом с аватаром
    const parent = projectAvatar.closest('div');
    const texts = parent ? Array.from(parent.querySelectorAll('span, button')).map(el => ({
      text: el.textContent?.trim(),
      styles: {
        fontSize: getComputedStyle(el).fontSize,
        fontWeight: getComputedStyle(el).fontWeight,
        color: getComputedStyle(el).color,
      }
    })) : [];
    
    return {
      avatar: {
        width: styles.width,
        height: styles.height,
        borderRadius: styles.borderRadius,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
      },
      texts: texts.slice(0, 5),
    };
  });
  
  if (projectSelector.error) {
    console.log('  ⚠️', projectSelector.error);
  } else {
    console.log('  ✓ Project selector извлечён');
    console.log('    - Avatar size:', projectSelector.avatar.width, 'x', projectSelector.avatar.height);
    console.log('    - Avatar bg:', rgbToHex(projectSelector.avatar.backgroundColor));
  }
  
  console.log('\n🔍 Извлекаю Navigation items (Dashboard, Docs, API reference)...');
  
  const navItems = await page.evaluate(() => {
    // Найти NAV элемент
    const nav = document.querySelector('nav') || 
                Array.from(document.querySelectorAll('*')).find(el => {
                  return el.textContent?.includes('Dashboard') && 
                         el.textContent?.includes('Docs');
                });
    
    if (!nav) return { error: 'Navigation не найден' };
    
    // Найти все кликабельные элементы в nav
    const items = Array.from(nav.querySelectorAll('button, a')).filter(el => {
      const text = el.textContent?.trim();
      return text && text.length > 0 && text.length < 30;
    });
    
    return items.map(item => {
      const styles = getComputedStyle(item);
      const isActive = styles.fontWeight === '500' || styles.fontWeight === '600';
      
      return {
        text: item.textContent?.trim(),
        tag: item.tagName,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.color,
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        backgroundColor: styles.backgroundColor,
        isActive,
      };
    });
  });
  
  if (navItems.error) {
    console.log('  ⚠️', navItems.error);
  } else {
    console.log(`  ✓ Найдено ${navItems.length} nav items`);
    navItems.forEach((item, i) => {
      console.log(`    ${i + 1}. "${item.text}" - weight: ${item.fontWeight}, color: ${rgbToHex(item.color)}`);
    });
  }
  
  console.log('\n🎨 Тестирую hover на nav items...');
  
  const navButtons = await page.$$('nav button, nav a');
  const navHovers = [];
  
  for (let i = 0; i < Math.min(3, navButtons.length); i++) {
    const btn = navButtons[i];
    
    const before = await btn.evaluate(el => ({
      text: el.textContent?.trim(),
      color: getComputedStyle(el).color,
      backgroundColor: getComputedStyle(el).backgroundColor,
    }));
    
    await btn.hover();
    await page.waitForTimeout(150);
    
    const after = await btn.evaluate(el => ({
      color: getComputedStyle(el).color,
      backgroundColor: getComputedStyle(el).backgroundColor,
    }));
    
    navHovers.push({
      text: before.text,
      default: before,
      hover: after,
    });
    
    console.log(`    ✓ "${before.text}"`);
  }
  
  console.log('\n✨ Извлекаю Empty State (центральная область)...');
  
  const emptyState = await page.evaluate(() => {
    // Найти Create button
    const createBtn = Array.from(document.querySelectorAll('button')).find(btn => {
      return btn.textContent?.trim() === 'Create' && 
             btn.offsetHeight > 35 &&
             btn.offsetHeight < 45;
    });
    
    if (!createBtn) return { error: 'Create button не найден' };
    
    const btnStyles = getComputedStyle(createBtn);
    const beforeStyles = getComputedStyle(createBtn, '::before');
    const afterStyles = getComputedStyle(createBtn, '::after');
    
    // Найти SVG в кнопке
    const svg = createBtn.querySelector('svg');
    const svgStyles = svg ? getComputedStyle(svg) : null;
    
    // Найти input Generate
    const generateInput = document.querySelector('input[placeholder*="Generate"], input[placeholder*="generate"]');
    const inputData = generateInput ? {
      placeholder: generateInput.getAttribute('placeholder'),
      styles: {
        fontSize: getComputedStyle(generateInput).fontSize,
        color: getComputedStyle(generateInput).color,
        padding: getComputedStyle(generateInput).padding,
        height: getComputedStyle(generateInput).height,
      },
      container: generateInput.closest('div') ? {
        height: getComputedStyle(generateInput.closest('div')).height,
        padding: getComputedStyle(generateInput.closest('div')).padding,
        borderRadius: getComputedStyle(generateInput.closest('div')).borderRadius,
        border: getComputedStyle(generateInput.closest('div')).border,
        backgroundColor: getComputedStyle(generateInput.closest('div')).backgroundColor,
      } : null
    } : null;
    
    // Найти chip buttons (Trip planner, etc)
    const chips = Array.from(document.querySelectorAll('button')).filter(btn => {
      const styles = getComputedStyle(btn);
      return parseFloat(styles.height) > 20 && 
             parseFloat(styles.height) < 32 &&
             parseFloat(styles.borderRadius) > 10 &&
             btn.textContent?.trim().length > 3 &&
             btn.textContent?.trim().length < 30;
    });
    
    const chipData = chips.slice(0, 5).map(chip => {
      const styles = getComputedStyle(chip);
      const beforeStyles = getComputedStyle(chip, '::before');
      
      return {
        text: chip.textContent?.trim(),
        height: styles.height,
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        before: {
          backgroundColor: beforeStyles.backgroundColor,
          borderRadius: beforeStyles.borderRadius,
        }
      };
    });
    
    return {
      createButton: {
        width: btnStyles.width,
        height: btnStyles.height,
        padding: btnStyles.padding,
        margin: btnStyles.margin,
        borderRadius: btnStyles.borderRadius,
        fontSize: btnStyles.fontSize,
        fontWeight: btnStyles.fontWeight,
        color: btnStyles.color,
        backgroundColor: btnStyles.backgroundColor,
        letterSpacing: btnStyles.letterSpacing,
        lineHeight: btnStyles.lineHeight,
        cursor: btnStyles.cursor,
        transition: btnStyles.transition,
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
        svg: svg ? {
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          viewBox: svg.getAttribute('viewBox'),
          fill: svgStyles.fill,
          color: svgStyles.color,
        } : null
      },
      generateInput: inputData,
      chips: chipData,
    };
  });
  
  if (emptyState.error) {
    console.log('  ⚠️', emptyState.error);
  } else {
    console.log('  ✓ Empty state извлечён');
    console.log('    - Create button:', emptyState.createButton.width, 'x', emptyState.createButton.height);
    console.log('    - Create bg (::before):', rgbToHex(emptyState.createButton.before.backgroundColor));
    if (emptyState.generateInput) {
      console.log('    - Generate input найден');
    }
    console.log('    - Chips найдено:', emptyState.chips.length);
  }
  
  console.log('\n📸 Делаю детальные скриншоты...');
  
  // Create button
  const createBtn = await page.$('button:has-text("Create")');
  if (createBtn) {
    await createBtn.screenshot({ path: path.join(screenshotsDir, 'create-button-detailed.png') });
    console.log('  ✓ create-button-detailed.png');
  }
  
  // Chips
  const chipButtons = await page.$$('button');
  for (let i = 0; i < Math.min(3, chipButtons.length); i++) {
    const chip = chipButtons[i];
    const text = await chip.evaluate(el => el.textContent?.trim());
    if (text && text.length > 3 && text.length < 20) {
      await chip.screenshot({ 
        path: path.join(screenshotsDir, `chip-${i}.png`) 
      });
      console.log(`  ✓ chip-${i}.png (${text})`);
      if (i >= 2) break;
    }
  }
  
  // Сохранить результаты
  const results = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    projectSelector,
    navItems,
    navHovers,
    emptyState,
  };
  
  const outputPath = path.join(refDir, 'header-and-empty-state.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Извлечение завершено!');
  console.log('📁 Сохранено:', outputPath);
  
  await browser.close();
}

extractHeaderAndEmpty().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

