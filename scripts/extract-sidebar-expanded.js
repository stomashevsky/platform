const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractExpandedSidebarStructure() {
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
  
  console.log('\n📐 Извлекаю полную структуру sidebar...');
  
  const fullStructure = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarStyles = getComputedStyle(sidebar);
    
    // Получить все прямые дети sidebar
    const directChildren = Array.from(sidebar.children).map((child, index) => {
      const rect = child.getBoundingClientRect();
      const styles = getComputedStyle(child);
      
      // Определить тип
      let type = 'unknown';
      if (styles.overflow === 'auto' || styles.overflowY === 'auto' || 
          styles.flexGrow === '1') {
        type = 'scrollable-content';
      } else if (rect.y > sidebarRect.y + sidebarRect.height * 0.8) {
        type = 'footer';
      }
      
      return {
        index,
        type,
        tag: child.tagName,
        className: child.className,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          // Относительно sidebar
          relativeX: rect.x - sidebarRect.x,
          relativeY: rect.y - sidebarRect.y,
        },
        styles: {
          display: styles.display,
          flexGrow: styles.flexGrow,
          flexShrink: styles.flexShrink,
          flexBasis: styles.flexBasis,
          overflow: styles.overflow,
          overflowY: styles.overflowY,
          padding: styles.padding,
          margin: styles.margin,
          marginTop: styles.marginTop,
        }
      };
    });
    
    return {
      sidebar: {
        tag: sidebar.tagName,
        className: sidebar.className,
        rect: {
          x: sidebarRect.x,
          y: sidebarRect.y,
          width: sidebarRect.width,
          height: sidebarRect.height,
        },
        styles: {
          display: sidebarStyles.display,
          flexDirection: sidebarStyles.flexDirection,
          width: sidebarStyles.width,
          padding: sidebarStyles.padding,
          margin: sidebarStyles.margin,
        }
      },
      children: directChildren
    };
  });
  
  if (fullStructure.error) {
    console.log('  ⚠️', fullStructure.error);
  } else {
    console.log('  ✓ Sidebar structure:');
    console.log('    - Width:', fullStructure.sidebar.styles.width);
    console.log('    - Padding:', fullStructure.sidebar.styles.padding);
    console.log('    - Flex direction:', fullStructure.sidebar.styles.flexDirection);
    console.log('    - Children:', fullStructure.children.length);
    fullStructure.children.forEach((child, i) => {
      console.log(`      ${i + 1}. ${child.type} (${child.tag})`);
      console.log(`         - Height: ${child.rect.height}px`);
      console.log(`         - Flex-grow: ${child.styles.flexGrow}`);
      console.log(`         - Relative Y: ${child.rect.relativeY}px`);
    });
  }
  
  console.log('\n📋 Извлекаю все элементы меню (включая scrollable область)...');
  
  const menuItems = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const sidebarRect = sidebar.getBoundingClientRect();
    
    // Найти ВСЕ кнопки в sidebar
    const allButtons = Array.from(sidebar.querySelectorAll('button'));
    
    const items = allButtons.map(btn => {
      const rect = btn.getBoundingClientRect();
      const styles = getComputedStyle(btn);
      const beforeStyles = getComputedStyle(btn, '::before');
      
      const text = btn.textContent?.trim();
      
      // Определить тип кнопки
      let type = 'unknown';
      if (rect.width < 30 && rect.height < 30) {
        type = 'collapse-button';
      } else if (rect.width > 100 && rect.height > 25 && rect.height < 35) {
        type = 'menu-item';
      } else if (rect.height > 35) {
        type = 'primary-button';
      }
      
      return {
        type,
        text: text?.substring(0, 50) || '(empty)',
        rect: {
          width: rect.width,
          height: rect.height,
          // Абсолютная позиция
          x: rect.x,
          y: rect.y,
          // Относительно sidebar
          relativeX: rect.x - sidebarRect.x,
          relativeY: rect.y - sidebarRect.y,
        },
        styles: {
          margin: styles.margin,
          padding: styles.padding,
          display: styles.display,
        },
        before: {
          backgroundColor: beforeStyles.backgroundColor,
          borderRadius: beforeStyles.borderRadius,
        }
      };
    });
    
    // Сгруппировать по типу
    const grouped = {
      menuItems: items.filter(i => i.type === 'menu-item'),
      collapseButton: items.find(i => i.type === 'collapse-button'),
      otherButtons: items.filter(i => i.type !== 'menu-item' && i.type !== 'collapse-button'),
    };
    
    return grouped;
  });
  
  if (menuItems.error) {
    console.log('  ⚠️', menuItems.error);
  } else {
    console.log('  ✓ Найдено элементов:');
    console.log('    - Menu items:', menuItems.menuItems?.length || 0);
    console.log('    - Collapse button:', menuItems.collapseButton ? 'Да' : 'Нет');
    console.log('    - Other buttons:', menuItems.otherButtons?.length || 0);
    
    if (menuItems.menuItems && menuItems.menuItems.length > 0) {
      const first = menuItems.menuItems[0];
      console.log('    - Первый элемент:');
      console.log('      Text:', first.text);
      console.log('      Relative Y:', first.rect.relativeY, 'px');
      console.log('      Relative X:', first.rect.relativeX, 'px');
      console.log('      Margin:', first.styles.margin);
    }
    
    if (menuItems.collapseButton) {
      console.log('    - Collapse button:');
      console.log('      Relative X:', menuItems.collapseButton.rect.relativeX, 'px');
      console.log('      Relative Y:', menuItems.collapseButton.rect.relativeY, 'px');
      console.log('      Size:', menuItems.collapseButton.rect.width, 'x', menuItems.collapseButton.rect.height);
    }
  }
  
  console.log('\n🔄 Извлекаю footer контейнер...');
  
  const footer = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const sidebarRect = sidebar.getBoundingClientRect();
    
    // Найти footer - обычно это последний flex ребёнок с margin-top auto
    const children = Array.from(sidebar.children);
    const lastChild = children[children.length - 1];
    
    if (!lastChild) return { error: 'Footer не найден' };
    
    const rect = lastChild.getBoundingClientRect();
    const styles = getComputedStyle(lastChild);
    
    // Найти контейнер кнопки внутри footer
    const buttonContainer = lastChild.querySelector('button')?.parentElement;
    const containerStyles = buttonContainer ? getComputedStyle(buttonContainer) : null;
    const containerRect = buttonContainer ? buttonContainer.getBoundingClientRect() : null;
    
    return {
      footer: {
        tag: lastChild.tagName,
        className: lastChild.className,
        rect: {
          width: rect.width,
          height: rect.height,
          relativeY: rect.y - sidebarRect.y,
          fromBottom: (sidebarRect.y + sidebarRect.height) - (rect.y + rect.height),
        },
        styles: {
          padding: styles.padding,
          margin: styles.margin,
          marginTop: styles.marginTop,
          display: styles.display,
        }
      },
      buttonContainer: containerStyles ? {
        padding: containerStyles.padding,
        display: containerStyles.display,
        justifyContent: containerStyles.justifyContent,
        alignItems: containerStyles.alignItems,
        rect: {
          width: containerRect.width,
          height: containerRect.height,
          relativeX: containerRect.x - sidebarRect.x,
        }
      } : null
    };
  });
  
  if (footer.error) {
    console.log('  ⚠️', footer.error);
  } else {
    console.log('  ✓ Footer:');
    console.log('    - Padding:', footer.footer.styles.padding);
    console.log('    - Margin:', footer.footer.styles.margin);
    console.log('    - Margin-top:', footer.footer.styles.marginTop);
    console.log('    - From bottom:', footer.footer.rect.fromBottom, 'px');
    if (footer.buttonContainer) {
      console.log('    - Button container padding:', footer.buttonContainer.padding);
      console.log('    - Button container justify:', footer.buttonContainer.justifyContent);
    }
  }
  
  // Сохранить результаты
  const results = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    fullStructure,
    menuItems,
    footer,
  };
  
  const outputPath = path.join(refDir, 'sidebar-expanded-structure.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Извлечение структуры sidebar завершено!');
  console.log('📁 Сохранено:', outputPath);
  
  await browser.close();
}

extractExpandedSidebarStructure().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

