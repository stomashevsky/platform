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

async function extractLayoutStructure() {
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
  
  console.log('\n📐 Извлекаю общую структуру страницы...');
  
  const pageStructure = await page.evaluate(() => {
    const body = document.body;
    const bodyStyles = getComputedStyle(body);
    const bodyRect = body.getBoundingClientRect();
    
    // Найти все top-level контейнеры
    const topContainers = Array.from(document.body.children).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 100 && rect.height > 100;
    });
    
    return {
      body: {
        width: bodyStyles.width,
        height: bodyStyles.height,
        padding: bodyStyles.padding,
        margin: bodyStyles.margin,
        backgroundColor: bodyStyles.backgroundColor,
        display: bodyStyles.display,
        position: bodyStyles.position,
        rect: {
          width: bodyRect.width,
          height: bodyRect.height,
        }
      },
      topLevelContainers: topContainers.map(el => ({
        tag: el.tagName,
        className: el.className,
        id: el.id,
        rect: el.getBoundingClientRect(),
        styles: {
          display: getComputedStyle(el).display,
          position: getComputedStyle(el).position,
          width: getComputedStyle(el).width,
          height: getComputedStyle(el).height,
        }
      }))
    };
  });
  
  console.log('  ✓ Body:', pageStructure.body.width, 'x', pageStructure.body.height);
  console.log('  ✓ Top containers:', pageStructure.topLevelContainers.length);
  
  console.log('\n🏗️ Извлекаю структуру Header...');
  
  const headerLayout = await page.evaluate(() => {
    // Найти header (fixed элемент вверху)
    const header = Array.from(document.querySelectorAll('*')).find(el => {
      const styles = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return styles.position === 'fixed' &&
             rect.top === 0 &&
             rect.width > window.innerWidth * 0.5 &&
             rect.height < 100;
    });
    
    if (!header) return { error: 'Header не найден' };
    
    const styles = getComputedStyle(header);
    const rect = header.getBoundingClientRect();
    
    // Найти детей header (левая и правая части)
    const children = Array.from(header.children).map((child, index) => {
      const childStyles = getComputedStyle(child);
      const childRect = child.getBoundingClientRect();
      
      return {
        index,
        tag: child.tagName,
        className: child.className,
        rect: {
          x: childRect.x,
          y: childRect.y,
          width: childRect.width,
          height: childRect.height,
        },
        styles: {
          display: childStyles.display,
          flexGrow: childStyles.flexGrow,
          flexShrink: childStyles.flexShrink,
          flexBasis: childStyles.flexBasis,
          justifyContent: childStyles.justifyContent,
          alignItems: childStyles.alignItems,
          gap: childStyles.gap,
          padding: childStyles.padding,
          margin: childStyles.margin,
        }
      };
    });
    
    return {
      tag: header.tagName,
      className: header.className,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      },
      styles: {
        display: styles.display,
        position: styles.position,
        top: styles.top,
        left: styles.left,
        right: styles.right,
        zIndex: styles.zIndex,
        height: styles.height,
        padding: styles.padding,
        margin: styles.margin,
        backgroundColor: styles.backgroundColor,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
        gap: styles.gap,
      },
      children
    };
  });
  
  if (headerLayout.error) {
    console.log('  ⚠️', headerLayout.error);
  } else {
    console.log('  ✓ Header найден:', headerLayout.rect.width, 'x', headerLayout.rect.height);
    console.log('    - Display:', headerLayout.styles.display);
    console.log('    - Position:', headerLayout.styles.position);
    console.log('    - Justify:', headerLayout.styles.justifyContent);
    console.log('    - Children:', headerLayout.children.length);
  }
  
  console.log('\n🏗️ Извлекаю структуру Main Layout (ниже header)...');
  
  const mainLayout = await page.evaluate(() => {
    // Найти main container (обычно flex с sidebar и content)
    const mainContainers = Array.from(document.querySelectorAll('*')).filter(el => {
      const styles = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.top > 50 && rect.top < 100 &&
             rect.width > window.innerWidth * 0.8 &&
             rect.height > window.innerHeight * 0.5 &&
             styles.display === 'flex';
    });
    
    const mainContainer = mainContainers[0];
    
    if (!mainContainer) return { error: 'Main container не найден' };
    
    const styles = getComputedStyle(mainContainer);
    const rect = mainContainer.getBoundingClientRect();
    
    // Найти sidebar и content
    const children = Array.from(mainContainer.children).map((child, index) => {
      const childStyles = getComputedStyle(child);
      const childRect = child.getBoundingClientRect();
      
      // Определить что это (sidebar или content)
      let type = 'unknown';
      if (childRect.width < 300) type = 'sidebar';
      else if (childRect.width > 400) type = 'content';
      
      return {
        index,
        type,
        tag: child.tagName,
        className: child.className,
        rect: {
          x: childRect.x,
          y: childRect.y,
          width: childRect.width,
          height: childRect.height,
        },
        styles: {
          display: childStyles.display,
          flexGrow: childStyles.flexGrow,
          flexShrink: childStyles.flexShrink,
          flexBasis: childStyles.flexBasis,
          width: childStyles.width,
          minWidth: childStyles.minWidth,
          maxWidth: childStyles.maxWidth,
          height: childStyles.height,
          padding: childStyles.padding,
          margin: childStyles.margin,
          backgroundColor: childStyles.backgroundColor,
          borderRadius: childStyles.borderRadius,
          border: childStyles.border,
          overflow: childStyles.overflow,
        }
      };
    });
    
    return {
      tag: mainContainer.tagName,
      className: mainContainer.className,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      styles: {
        display: styles.display,
        flexDirection: styles.flexDirection,
        gap: styles.gap,
        padding: styles.padding,
        margin: styles.margin,
        height: styles.height,
        overflow: styles.overflow,
      },
      children
    };
  });
  
  if (mainLayout.error) {
    console.log('  ⚠️', mainLayout.error);
  } else {
    console.log('  ✓ Main container найден');
    console.log('    - Display:', mainLayout.styles.display);
    console.log('    - Direction:', mainLayout.styles.flexDirection);
    console.log('    - Gap:', mainLayout.styles.gap);
    console.log('    - Children:', mainLayout.children.length);
    mainLayout.children.forEach((child, i) => {
      console.log(`      ${i + 1}. ${child.type} (${child.tag}): ${child.rect.width}px wide`);
    });
  }
  
  console.log('\n📦 Извлекаю структуру Sidebar...');
  
  const sidebarLayout = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const styles = getComputedStyle(sidebar);
    const rect = sidebar.getBoundingClientRect();
    
    // Найти scrollable container и footer
    const children = Array.from(sidebar.children).map((child, index) => {
      const childStyles = getComputedStyle(child);
      const childRect = child.getBoundingClientRect();
      
      // Определить тип
      let type = 'unknown';
      if (childStyles.overflow === 'auto' || childStyles.overflowY === 'auto') {
        type = 'scrollable';
      } else if (childRect.y > rect.y + rect.height * 0.8) {
        type = 'footer';
      }
      
      return {
        index,
        type,
        tag: child.tagName,
        className: child.className,
        rect: {
          x: childRect.x - rect.x,
          y: childRect.y - rect.y,
          width: childRect.width,
          height: childRect.height,
        },
        styles: {
          display: childStyles.display,
          flexGrow: childStyles.flexGrow,
          flexShrink: childStyles.flexShrink,
          overflow: childStyles.overflow,
          overflowY: childStyles.overflowY,
          padding: childStyles.padding,
          margin: childStyles.margin,
        }
      };
    });
    
    return {
      tag: sidebar.tagName,
      className: sidebar.className,
      rect: {
        width: rect.width,
        height: rect.height,
      },
      styles: {
        display: styles.display,
        flexDirection: styles.flexDirection,
        width: styles.width,
        height: styles.height,
        padding: styles.padding,
        margin: styles.margin,
        position: styles.position,
        backgroundColor: styles.backgroundColor,
      },
      children
    };
  });
  
  if (sidebarLayout.error) {
    console.log('  ⚠️', sidebarLayout.error);
  } else {
    console.log('  ✓ Sidebar найден');
    console.log('    - Width:', sidebarLayout.rect.width);
    console.log('    - Display:', sidebarLayout.styles.display);
    console.log('    - Direction:', sidebarLayout.styles.flexDirection);
    console.log('    - Children:', sidebarLayout.children.length);
    sidebarLayout.children.forEach((child, i) => {
      console.log(`      ${i + 1}. ${child.type} - height: ${child.rect.height}px`);
    });
  }
  
  console.log('\n📄 Извлекаю структуру Content Area...');
  
  const contentLayout = await page.evaluate(() => {
    // Найти белую карточку main content
    const mainCards = Array.from(document.querySelectorAll('*')).filter(el => {
      const styles = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return styles.backgroundColor === 'rgb(255, 255, 255)' &&
             parseFloat(styles.borderRadius) > 5 &&
             rect.width > 400 &&
             rect.height > 300;
    });
    
    const mainCard = mainCards[0];
    
    if (!mainCard) return { error: 'Content card не найден' };
    
    const styles = getComputedStyle(mainCard);
    const rect = mainCard.getBoundingClientRect();
    
    // Найти детей (header, body, footer)
    const children = Array.from(mainCard.children).map((child, index) => {
      const childStyles = getComputedStyle(child);
      const childRect = child.getBoundingClientRect();
      
      // Определить тип
      let type = 'unknown';
      if (childRect.y - rect.y < 100) type = 'header';
      else if (childRect.y - rect.y > rect.height - 100) type = 'footer';
      else type = 'body';
      
      return {
        index,
        type,
        tag: child.tagName,
        className: child.className,
        rect: {
          x: childRect.x - rect.x,
          y: childRect.y - rect.y,
          width: childRect.width,
          height: childRect.height,
        },
        styles: {
          display: childStyles.display,
          flexDirection: childStyles.flexDirection,
          justifyContent: childStyles.justifyContent,
          alignItems: childStyles.alignItems,
          padding: childStyles.padding,
          margin: childStyles.margin,
          gap: childStyles.gap,
        }
      };
    });
    
    return {
      tag: mainCard.tagName,
      className: mainCard.className,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      styles: {
        display: styles.display,
        flexDirection: styles.flexDirection,
        width: styles.width,
        height: styles.height,
        padding: styles.padding,
        margin: styles.margin,
        backgroundColor: styles.backgroundColor,
        border: styles.border,
        borderRadius: styles.borderRadius,
        overflow: styles.overflow,
      },
      children
    };
  });
  
  if (contentLayout.error) {
    console.log('  ⚠️', contentLayout.error);
  } else {
    console.log('  ✓ Content area найден');
    console.log('    - Size:', contentLayout.rect.width, 'x', contentLayout.rect.height);
    console.log('    - Border:', contentLayout.styles.border);
    console.log('    - Border-radius:', contentLayout.styles.borderRadius);
    console.log('    - Children:', contentLayout.children.length);
  }
  
  console.log('\n📏 Извлекаю gaps и spacing между элементами...');
  
  const spacing = await page.evaluate(() => {
    // Измерить расстояния между ключевыми элементами
    const header = document.querySelector('[style*="position: fixed"]') ||
                   Array.from(document.querySelectorAll('*')).find(el => 
                     getComputedStyle(el).position === 'fixed' &&
                     el.getBoundingClientRect().top === 0
                   );
    
    const sidebar = document.querySelector('aside');
    
    const mainCard = Array.from(document.querySelectorAll('*')).find(el => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.backgroundColor === 'rgb(255, 255, 255)' &&
             parseFloat(s.borderRadius) > 5 &&
             r.width > 400;
    });
    
    if (!header || !sidebar || !mainCard) {
      return { error: 'Не все элементы найдены' };
    }
    
    const headerRect = header.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();
    const cardRect = mainCard.getBoundingClientRect();
    
    return {
      headerToContent: cardRect.top - (headerRect.top + headerRect.height),
      sidebarToCard: cardRect.left - (sidebarRect.left + sidebarRect.width),
      pageLeftMargin: sidebarRect.left,
      pageRightMargin: window.innerWidth - (cardRect.left + cardRect.width),
      cardTopMargin: cardRect.top - (headerRect.top + headerRect.height),
    };
  });
  
  if (spacing.error) {
    console.log('  ⚠️', spacing.error);
  } else {
    console.log('  ✓ Spacing измерен:');
    console.log('    - Header -> Content:', spacing.headerToContent, 'px');
    console.log('    - Sidebar -> Card:', spacing.sidebarToCard, 'px');
    console.log('    - Page left margin:', spacing.pageLeftMargin, 'px');
    console.log('    - Page right margin:', spacing.pageRightMargin, 'px');
  }
  
  // Сохранить результаты
  const results = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    pageStructure,
    headerLayout,
    mainLayout,
    sidebarLayout,
    contentLayout,
    spacing,
  };
  
  const outputPath = path.join(refDir, 'layout-structure.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Извлечение layout структуры завершено!');
  console.log('📁 Сохранено:', outputPath);
  
  await browser.close();
}

extractLayoutStructure().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

