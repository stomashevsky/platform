const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractSidebarDetails() {
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
  
  console.log('\n📍 Извлекаю точную позицию меню в sidebar...');
  
  const sidebarMenu = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarStyles = getComputedStyle(sidebar);
    
    // Найти все элементы меню (кнопки)
    const menuItems = Array.from(sidebar.querySelectorAll('button')).filter(btn => {
      const rect = btn.getBoundingClientRect();
      const text = btn.textContent?.trim();
      return rect.width > 50 && text && text.length > 2 && text.length < 30;
    });
    
    // Измерить позиции относительно sidebar
    const items = menuItems.slice(0, 15).map(btn => {
      const rect = btn.getBoundingClientRect();
      const styles = getComputedStyle(btn);
      
      return {
        text: btn.textContent?.trim(),
        // Абсолютная позиция
        absolutePosition: {
          x: rect.x,
          y: rect.y,
        },
        // Позиция относительно sidebar
        relativePosition: {
          x: rect.x - sidebarRect.x,
          y: rect.y - sidebarRect.y,
          fromTop: rect.y - sidebarRect.y,
          fromLeft: rect.x - sidebarRect.x,
        },
        size: {
          width: rect.width,
          height: rect.height,
        },
        styles: {
          margin: styles.margin,
          padding: styles.padding,
        }
      };
    });
    
    // Найти контейнер меню
    const menuContainer = sidebar.querySelector('[class*="menu"], [class*="nav"]') || 
                          sidebar.children[0];
    
    const containerStyles = menuContainer ? getComputedStyle(menuContainer) : null;
    
    return {
      sidebar: {
        width: sidebarStyles.width,
        padding: sidebarStyles.padding,
        rect: {
          x: sidebarRect.x,
          y: sidebarRect.y,
          width: sidebarRect.width,
          height: sidebarRect.height,
        }
      },
      menuContainer: containerStyles ? {
        padding: containerStyles.padding,
        margin: containerStyles.margin,
        display: containerStyles.display,
      } : null,
      items,
      firstItemOffsetFromTop: items[0] ? items[0].relativePosition.fromTop : null,
      firstItemOffsetFromLeft: items[0] ? items[0].relativePosition.fromLeft : null,
    };
  });
  
  if (sidebarMenu.error) {
    console.log('  ⚠️', sidebarMenu.error);
  } else {
    console.log('  ✓ Sidebar menu измерен');
    console.log('    - Sidebar width:', sidebarMenu.sidebar.width);
    console.log('    - Sidebar padding:', sidebarMenu.sidebar.padding);
    console.log('    - Первый элемент от верха:', sidebarMenu.firstItemOffsetFromTop, 'px');
    console.log('    - Первый элемент от левого края:', sidebarMenu.firstItemOffsetFromLeft, 'px');
    console.log('    - Всего элементов:', sidebarMenu.items.length);
  }
  
  console.log('\n🔽 Извлекаю кнопку сворачивания...');
  
  const collapseButton = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const sidebarRect = sidebar.getBoundingClientRect();
    
    // Найти кнопку сворачивания (обычно маленькая кнопка внизу)
    const buttons = Array.from(sidebar.querySelectorAll('button'));
    
    // Кнопка сворачивания обычно: маленькая (20-25px), без текста или с иконкой, внизу sidebar
    const collapseBtn = buttons.find(btn => {
      const rect = btn.getBoundingClientRect();
      const styles = getComputedStyle(btn);
      return rect.width < 30 && 
             rect.height < 30 &&
             rect.y > sidebarRect.y + sidebarRect.height * 0.8; // в нижней части
    });
    
    if (!collapseBtn) return { error: 'Collapse button не найден' };
    
    const btnRect = collapseBtn.getBoundingClientRect();
    const btnStyles = getComputedStyle(collapseBtn);
    const beforeStyles = getComputedStyle(collapseBtn, '::before');
    
    // Найти родительский контейнер кнопки (footer)
    const footer = collapseBtn.closest('div');
    const footerStyles = footer ? getComputedStyle(footer) : null;
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    
    return {
      button: {
        width: btnStyles.width,
        height: btnStyles.height,
        padding: btnStyles.padding,
        margin: btnStyles.margin,
        borderRadius: btnStyles.borderRadius,
        backgroundColor: btnStyles.backgroundColor,
        color: btnStyles.color,
        cursor: btnStyles.cursor,
        before: {
          backgroundColor: beforeStyles.backgroundColor,
          borderRadius: beforeStyles.borderRadius,
        }
      },
      position: {
        absolute: {
          x: btnRect.x,
          y: btnRect.y,
        },
        relativeTo: {
          sidebar: {
            x: btnRect.x - sidebarRect.x,
            y: btnRect.y - sidebarRect.y,
            fromBottom: (sidebarRect.y + sidebarRect.height) - (btnRect.y + btnRect.height),
          }
        }
      },
      footer: footerStyles ? {
        padding: footerStyles.padding,
        margin: footerStyles.margin,
        display: footerStyles.display,
        justifyContent: footerStyles.justifyContent,
        alignItems: footerStyles.alignItems,
        position: {
          relativeTo: {
            sidebar: {
              y: footerRect.y - sidebarRect.y,
              height: footerRect.height,
            }
          }
        }
      } : null
    };
  });
  
  if (collapseButton.error) {
    console.log('  ⚠️', collapseButton.error);
  } else {
    console.log('  ✓ Collapse button найдена');
    console.log('    - Size:', collapseButton.button.width, 'x', collapseButton.button.height);
    console.log('    - Border-radius:', collapseButton.button.borderRadius);
    console.log('    - От левого края:', collapseButton.position.relativeTo.sidebar.x, 'px');
    console.log('    - От нижнего края:', collapseButton.position.relativeTo.sidebar.fromBottom, 'px');
    if (collapseButton.footer) {
      console.log('    - Footer padding:', collapseButton.footer.padding);
      console.log('    - Footer justify:', collapseButton.footer.justifyContent);
    }
  }
  
  console.log('\n🎬 Извлекаю CSS transitions для collapse/expand...');
  
  const transitions = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const sidebarStyles = getComputedStyle(sidebar);
    
    // Найти все элементы с transition
    const elementsWithTransition = Array.from(sidebar.querySelectorAll('*')).filter(el => {
      const styles = getComputedStyle(el);
      return styles.transition && styles.transition !== 'all 0s ease 0s';
    });
    
    return {
      sidebar: {
        transition: sidebarStyles.transition,
        transitionProperty: sidebarStyles.transitionProperty,
        transitionDuration: sidebarStyles.transitionDuration,
        transitionTimingFunction: sidebarStyles.transitionTimingFunction,
      },
      elementsCount: elementsWithTransition.length,
      samples: elementsWithTransition.slice(0, 5).map(el => ({
        tag: el.tagName,
        className: el.className,
        transition: getComputedStyle(el).transition,
      }))
    };
  });
  
  if (transitions.error) {
    console.log('  ⚠️', transitions.error);
  } else {
    console.log('  ✓ Transitions извлечены');
    console.log('    - Sidebar transition:', transitions.sidebar.transition);
    console.log('    - Elements with transition:', transitions.elementsCount);
  }
  
  console.log('\n📸 Делаю скриншоты...');
  
  // Скриншот sidebar с маркерами позиций
  const sidebar = await page.$('aside');
  if (sidebar) {
    await sidebar.screenshot({ 
      path: path.join(screenshotsDir, 'sidebar-with-positions.png') 
    });
    console.log('  ✓ sidebar-with-positions.png');
  }
  
  // Скриншот collapse button
  const collapseBtn = await page.$$('aside button');
  for (const btn of collapseBtn) {
    const size = await btn.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    
    if (size.width < 30 && size.height < 30) {
      await btn.screenshot({ 
        path: path.join(screenshotsDir, 'collapse-button.png') 
      });
      console.log('  ✓ collapse-button.png');
      break;
    }
  }
  
  // Сохранить результаты
  const results = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    sidebarMenu,
    collapseButton,
    transitions,
  };
  
  const outputPath = path.join(refDir, 'sidebar-detailed-positions.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Детальное извлечение sidebar завершено!');
  console.log('📁 Сохранено:', outputPath);
  
  await browser.close();
}

extractSidebarDetails().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

