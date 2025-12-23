const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractHoverStates() {
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
  
  console.log('\n🎯 Извлекаю hover states...\n');
  
  const results = {
    menuItemInactive: {},
    menuItemHover: {},
    collapseButtonNormal: {},
    collapseButtonHover: {},
  };
  
  // 1. Get inactive menu item normal state
  console.log('📋 Normal state (inactive menu item)...');
  const normalState = await page.evaluate(() => {
    const sidebar = document.querySelector('aside.JiHZk');
    if (!sidebar) return { error: 'Sidebar not found' };
    
    const inactiveItem = sidebar.querySelector('a.k-D0f._8xE3c:not(.rZ3k-)');
    if (!inactiveItem) return { error: 'Inactive menu item not found' };
    
    const styles = getComputedStyle(inactiveItem);
    const beforeStyles = getComputedStyle(inactiveItem, '::before');
    
    return {
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      cursor: styles.cursor,
      before: {
        backgroundColor: beforeStyles.backgroundColor,
        opacity: beforeStyles.opacity,
        transform: beforeStyles.transform,
      }
    };
  });
  
  if (normalState.error) {
    console.log('  ⚠️', normalState.error);
  } else {
    results.menuItemInactive = normalState;
    console.log('  ✓ color:', normalState.color);
    console.log('  ✓ ::before bg:', normalState.before.backgroundColor);
  }
  
  // 2. Hover over inactive menu item and get styles
  console.log('\n🖱️ Hover state (inactive menu item)...');
  
  // Find inactive menu item
  const inactiveItem = await page.$('aside.JiHZk a.k-D0f._8xE3c:not(.rZ3k-)');
  
  if (inactiveItem) {
    try {
      await inactiveItem.hover({ timeout: 5000 });
      await page.waitForTimeout(200); // Wait for transition
      
      const hoverState = await page.evaluate(() => {
        const sidebar = document.querySelector('aside.JiHZk');
        const item = sidebar?.querySelector('a.k-D0f._8xE3c:not(.rZ3k-)');
        if (!item) return { error: 'Item not found during hover' };
        
        const styles = getComputedStyle(item);
        const beforeStyles = getComputedStyle(item, '::before');
        
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          cursor: styles.cursor,
          before: {
            backgroundColor: beforeStyles.backgroundColor,
            opacity: beforeStyles.opacity,
            transform: beforeStyles.transform,
          }
        };
      });
      
      if (hoverState.error) {
        console.log('  ⚠️', hoverState.error);
      } else {
        results.menuItemHover = hoverState;
        console.log('  ✓ color:', hoverState.color);
        console.log('  ✓ ::before bg:', hoverState.before.backgroundColor);
      }
    } catch (e) {
      console.log('  ⚠️ Hover failed:', e.message);
    }
    
    // Move away to reset hover
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
  } else {
    console.log('  ⚠️ Inactive menu item not found for hover');
  }
  
  // 3. Collapse button normal state
  console.log('\n📋 Collapse button normal state...');
  
  const collapseNormal = await page.evaluate(() => {
    const sidebar = document.querySelector('aside.JiHZk');
    if (!sidebar) return { error: 'Sidebar not found' };
    
    const footer = sidebar.querySelector('div.z3hHU');
    const button = footer?.querySelector('button._8xE3c');
    if (!button) return { error: 'Collapse button not found' };
    
    const styles = getComputedStyle(button);
    const beforeStyles = getComputedStyle(button, '::before');
    
    return {
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      cursor: styles.cursor,
      before: {
        backgroundColor: beforeStyles.backgroundColor,
        opacity: beforeStyles.opacity,
      }
    };
  });
  
  if (collapseNormal.error) {
    console.log('  ⚠️', collapseNormal.error);
  } else {
    results.collapseButtonNormal = collapseNormal;
    console.log('  ✓ color:', collapseNormal.color);
    console.log('  ✓ ::before bg:', collapseNormal.before.backgroundColor);
  }
  
  // 4. Collapse button hover state
  console.log('\n🖱️ Collapse button hover state...');
  
  const collapseButton = await page.$('aside.JiHZk div.z3hHU button._8xE3c');
  
  if (collapseButton) {
    try {
      await collapseButton.hover({ timeout: 5000 });
      await page.waitForTimeout(200);
      
      const collapseHover = await page.evaluate(() => {
        const sidebar = document.querySelector('aside.JiHZk');
        const footer = sidebar?.querySelector('div.z3hHU');
        const button = footer?.querySelector('button._8xE3c');
        if (!button) return { error: 'Button not found during hover' };
        
        const styles = getComputedStyle(button);
        const beforeStyles = getComputedStyle(button, '::before');
        
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          cursor: styles.cursor,
          before: {
            backgroundColor: beforeStyles.backgroundColor,
            opacity: beforeStyles.opacity,
          }
        };
      });
      
      if (collapseHover.error) {
        console.log('  ⚠️', collapseHover.error);
      } else {
        results.collapseButtonHover = collapseHover;
        console.log('  ✓ color:', collapseHover.color);
        console.log('  ✓ ::before bg:', collapseHover.before.backgroundColor);
      }
    } catch (e) {
      console.log('  ⚠️ Hover failed:', e.message);
    }
  } else {
    console.log('  ⚠️ Collapse button not found for hover');
  }
  
  // Save results
  const refDir = path.join(__dirname, '../reference');
  const outputPath = path.join(refDir, 'sidebar-hover-states.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Hover states извлечены!');
  console.log('📁 Сохранено:', outputPath);
  
  // Summary
  console.log('\n📊 Сводка:');
  console.log('  Menu item (inactive):');
  console.log('    - Normal ::before bg:', results.menuItemInactive?.before?.backgroundColor || 'N/A');
  console.log('    - Hover ::before bg:', results.menuItemHover?.before?.backgroundColor || 'N/A');
  console.log('  Collapse button:');
  console.log('    - Normal ::before bg:', results.collapseButtonNormal?.before?.backgroundColor || 'N/A');
  console.log('    - Hover ::before bg:', results.collapseButtonHover?.before?.backgroundColor || 'N/A');
  
  await browser.close();
}

extractHoverStates().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

