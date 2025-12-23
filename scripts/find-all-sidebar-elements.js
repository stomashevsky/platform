const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function findAllSidebarElements() {
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
  
  console.log('\n🔍 Ищу ВСЕ элементы в sidebar...');
  
  const allElements = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    const sidebarRect = sidebar.getBoundingClientRect();
    
    // Найти ВСЕ элементы с текстом
    const allWithText = Array.from(sidebar.querySelectorAll('*')).filter(el => {
      const text = el.textContent?.trim();
      return text && text.length > 0 && text.length < 50;
    });
    
    // Найти элементы с "Chat", "Usage", "API keys"
    const menuTexts = ['Chat', 'Usage', 'API keys', 'ChatGPT Apps', 'Agent Builder'];
    const menuElements = [];
    
    for (const searchText of menuTexts) {
      const elements = allWithText.filter(el => {
        const text = el.textContent?.trim();
        return text === searchText;
      });
      
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const styles = getComputedStyle(el);
        
        // Найти кликабельный родитель (button, a, или interactive element)
        let clickableParent = el;
        let parent = el.parentElement;
        while (parent && parent !== sidebar) {
          const pStyles = getComputedStyle(parent);
          if (pStyles.cursor === 'pointer' || 
              parent.tagName === 'BUTTON' || 
              parent.tagName === 'A') {
            clickableParent = parent;
            break;
          }
          parent = parent.parentElement;
        }
        
        const parentRect = clickableParent.getBoundingClientRect();
        const parentStyles = getComputedStyle(clickableParent);
        const beforeStyles = getComputedStyle(clickableParent, '::before');
        
        menuElements.push({
          text: searchText,
          element: {
            tag: el.tagName,
            className: el.className,
          },
          clickableParent: {
            tag: clickableParent.tagName,
            className: clickableParent.className,
            rect: {
              width: parentRect.width,
              height: parentRect.height,
              relativeX: parentRect.x - sidebarRect.x,
              relativeY: parentRect.y - sidebarRect.y,
            },
            styles: {
              width: parentStyles.width,
              height: parentStyles.height,
              margin: parentStyles.margin,
              padding: parentStyles.padding,
              paddingLeft: parentStyles.paddingLeft,
              paddingRight: parentStyles.paddingRight,
              paddingTop: parentStyles.paddingTop,
              paddingBottom: parentStyles.paddingBottom,
              backgroundColor: parentStyles.backgroundColor,
              borderRadius: parentStyles.borderRadius,
              display: parentStyles.display,
              alignItems: parentStyles.alignItems,
              fontSize: parentStyles.fontSize,
              fontWeight: parentStyles.fontWeight,
              color: parentStyles.color,
              letterSpacing: parentStyles.letterSpacing,
              cursor: parentStyles.cursor,
            },
            before: {
              backgroundColor: beforeStyles.backgroundColor,
              borderRadius: beforeStyles.borderRadius,
              inset: beforeStyles.inset,
            }
          },
          textElement: {
            rect: {
              width: rect.width,
              height: rect.height,
              relativeX: rect.x - sidebarRect.x,
            },
            styles: {
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              color: styles.color,
            }
          }
        });
      }
    }
    
    // Найти section titles (Create, Manage)
    const sectionTitles = allWithText.filter(el => {
      const text = el.textContent?.trim();
      return text === 'Create' || text === 'Manage' || text === 'Optimize';
    });
    
    const sectionStyles = sectionTitles.map(el => {
      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      
      return {
        text: el.textContent?.trim(),
        tag: el.tagName,
        rect: {
          width: rect.width,
          height: rect.height,
          relativeX: rect.x - sidebarRect.x,
        },
        styles: {
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          color: styles.color,
          padding: styles.padding,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom,
          margin: styles.margin,
          letterSpacing: styles.letterSpacing,
        }
      };
    });
    
    return {
      menuElements,
      sectionTitles: sectionStyles,
      totalElementsWithText: allWithText.length,
    };
  });
  
  if (allElements.error) {
    console.log('  ⚠️', allElements.error);
  } else {
    console.log('  ✓ Найдено элементов с текстом:', allElements.totalElementsWithText);
    console.log('  ✓ Menu элементов:', allElements.menuElements.length);
    console.log('  ✓ Section titles:', allElements.sectionTitles.length);
    
    if (allElements.menuElements.length > 0) {
      const first = allElements.menuElements[0];
      console.log('\n  📋 Первый menu item (' + first.text + '):');
      console.log('    - Clickable parent:', first.clickableParent.tag);
      console.log('    - Width:', first.clickableParent.rect.width, 'px');
      console.log('    - Height:', first.clickableParent.rect.height, 'px');
      console.log('    - Relative X:', first.clickableParent.rect.relativeX, 'px');
      console.log('    - Padding:', first.clickableParent.styles.padding);
      console.log('    - Padding Left:', first.clickableParent.styles.paddingLeft);
      console.log('    - Border radius:', first.clickableParent.styles.borderRadius);
      console.log('    - Margin:', first.clickableParent.styles.margin);
    }
    
    if (allElements.sectionTitles.length > 0) {
      const first = allElements.sectionTitles[0];
      console.log('\n  📋 Section title (' + first.text + '):');
      console.log('    - Relative X:', first.rect.relativeX, 'px');
      console.log('    - Padding:', first.styles.padding);
      console.log('    - Padding Left:', first.styles.paddingLeft);
      console.log('    - Color:', first.styles.color);
    }
  }
  
  // Сохранить
  const refDir = path.join(__dirname, '../reference');
  const outputPath = path.join(refDir, 'sidebar-all-elements.json');
  fs.writeFileSync(outputPath, JSON.stringify(allElements, null, 2));
  
  console.log('\n📁 Сохранено:', outputPath);
  
  await browser.close();
}

findAllSidebarElements().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

