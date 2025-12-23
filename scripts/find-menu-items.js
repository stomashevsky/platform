const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function findMenuItemsDeep() {
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
  
  console.log('\n🔍 Ищу menu items глубоко в DOM...');
  
  const menuItemStyles = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'Sidebar не найден' };
    
    // Найти ВСЕ кнопки в sidebar, включая внутри всех контейнеров
    const allButtons = Array.from(sidebar.querySelectorAll('button'));
    console.log('Total buttons in sidebar:', allButtons.length);
    
    // Найти "Chat" кнопку по тексту
    const chatButton = allButtons.find(btn => {
      const text = btn.textContent?.trim();
      return text === 'Chat' || text?.includes('Chat');
    });
    
    if (!chatButton) {
      return { 
        error: 'Chat button не найден',
        totalButtons: allButtons.length,
        buttonTexts: allButtons.slice(0, 5).map(b => b.textContent?.trim())
      };
    }
    
    const rect = chatButton.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();
    const styles = getComputedStyle(chatButton);
    const beforeStyles = getComputedStyle(chatButton, '::before');
    
    // Найти родительский контейнер (секцию)
    let parent = chatButton.parentElement;
    let sectionContainer = null;
    while (parent && parent !== sidebar) {
      if (parent.children.length > 1) {
        sectionContainer = parent;
        break;
      }
      parent = parent.parentElement;
    }
    
    const containerStyles = sectionContainer ? getComputedStyle(sectionContainer) : null;
    
    return {
      chatButton: {
        text: chatButton.textContent?.trim(),
        // Размеры
        width: styles.width,
        height: styles.height,
        
        // Spacing
        margin: styles.margin,
        padding: styles.padding,
        
        // Позиция относительно sidebar
        rect: {
          width: rect.width,
          height: rect.height,
          relativeX: rect.x - sidebarRect.x,
          relativeY: rect.y - sidebarRect.y,
        },
        
        // Typography
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        fontFamily: styles.fontFamily,
        color: styles.color,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing,
        textAlign: styles.textAlign,
        
        // Visual
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        border: styles.border,
        
        // Layout
        display: styles.display,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
        
        // ::before pseudo-element
        before: {
          content: beforeStyles.content,
          position: beforeStyles.position,
          inset: beforeStyles.inset,
          backgroundColor: beforeStyles.backgroundColor,
          borderRadius: beforeStyles.borderRadius,
          transition: beforeStyles.transition,
        }
      },
      sectionContainer: containerStyles ? {
        padding: containerStyles.padding,
        margin: containerStyles.margin,
        gap: containerStyles.gap,
        display: containerStyles.display,
        flexDirection: containerStyles.flexDirection,
      } : null
    };
  });
  
  if (menuItemStyles.error) {
    console.log('  ⚠️', menuItemStyles.error);
    if (menuItemStyles.totalButtons) {
      console.log('    Total buttons:', menuItemStyles.totalButtons);
      console.log('    First buttons:', menuItemStyles.buttonTexts);
    }
  } else {
    console.log('  ✓ Chat button найдена!');
    console.log('\n  📐 Размеры:');
    console.log('    - Width:', menuItemStyles.chatButton.width);
    console.log('    - Height:', menuItemStyles.chatButton.height);
    console.log('    - Relative X:', menuItemStyles.chatButton.rect.relativeX, 'px');
    console.log('    - Actual width:', menuItemStyles.chatButton.rect.width, 'px');
    
    console.log('\n  📏 Spacing:');
    console.log('    - Margin:', menuItemStyles.chatButton.margin);
    console.log('    - Padding:', menuItemStyles.chatButton.padding);
    
    console.log('\n  🎨 Typography:');
    console.log('    - Font size:', menuItemStyles.chatButton.fontSize);
    console.log('    - Font weight:', menuItemStyles.chatButton.fontWeight);
    console.log('    - Color:', menuItemStyles.chatButton.color);
    console.log('    - Letter spacing:', menuItemStyles.chatButton.letterSpacing);
    
    console.log('\n  🎭 Visual:');
    console.log('    - Background:', menuItemStyles.chatButton.backgroundColor);
    console.log('    - Border radius:', menuItemStyles.chatButton.borderRadius);
    console.log('    - ::before bg:', menuItemStyles.chatButton.before.backgroundColor);
    console.log('    - ::before radius:', menuItemStyles.chatButton.before.borderRadius);
  }
  
  // Сохранить
  const refDir = path.join(__dirname, '../reference');
  const outputPath = path.join(refDir, 'sidebar-menu-item-exact.json');
  fs.writeFileSync(outputPath, JSON.stringify(menuItemStyles, null, 2));
  
  console.log('\n📁 Сохранено:', outputPath);
  
  await browser.close();
}

findMenuItemsDeep().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

