const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeComparisonScreenshots() {
  console.log('🔌 Подключение к Chrome (OpenAI)...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ OpenAI страница не найдена');
    await browser.close();
    return;
  }
  
  console.log('✅ Подключено к:', page.url());
  
  const refDir = path.join(__dirname, '../reference');
  const screenshotsDir = path.join(refDir, 'screenshots');
  
  // Ensure directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  console.log('\n📸 Делаю скриншоты OpenAI...');
  
  // 1. Full sidebar screenshot
  const sidebar = await page.$('aside.JiHZk');
  if (sidebar) {
    await sidebar.screenshot({ 
      path: path.join(screenshotsDir, 'openai-sidebar-full.png') 
    });
    console.log('  ✓ openai-sidebar-full.png');
  }
  
  // 2. First section (Create) with menu items
  const firstSection = await page.$('aside.JiHZk div.pb-3');
  if (firstSection) {
    await firstSection.screenshot({ 
      path: path.join(screenshotsDir, 'openai-section-create.png') 
    });
    console.log('  ✓ openai-section-create.png');
  }
  
  // 3. Active menu item
  const activeItem = await page.$('aside.JiHZk a.k-D0f._8xE3c.rZ3k-');
  if (activeItem) {
    await activeItem.screenshot({ 
      path: path.join(screenshotsDir, 'openai-menu-item-active.png') 
    });
    console.log('  ✓ openai-menu-item-active.png');
  }
  
  // 4. Inactive menu item
  const inactiveItem = await page.$('aside.JiHZk a.k-D0f._8xE3c:not(.rZ3k-)');
  if (inactiveItem) {
    await inactiveItem.screenshot({ 
      path: path.join(screenshotsDir, 'openai-menu-item-inactive.png') 
    });
    console.log('  ✓ openai-menu-item-inactive.png');
  }
  
  // 5. Footer with Add Credits and collapse button
  const footer = await page.$('aside.JiHZk div.z3hHU');
  if (footer) {
    await footer.screenshot({ 
      path: path.join(screenshotsDir, 'openai-footer.png') 
    });
    console.log('  ✓ openai-footer.png');
  }
  
  // 6. Add Credits card
  const addCreditsCard = await page.$('aside.JiHZk div.eE5Hy');
  if (addCreditsCard) {
    await addCreditsCard.screenshot({ 
      path: path.join(screenshotsDir, 'openai-add-credits-card.png') 
    });
    console.log('  ✓ openai-add-credits-card.png');
  }
  
  // 7. Collapse button
  const collapseBtn = await page.$('aside.JiHZk div.z3hHU button._8xE3c');
  if (collapseBtn) {
    await collapseBtn.screenshot({ 
      path: path.join(screenshotsDir, 'openai-collapse-button.png') 
    });
    console.log('  ✓ openai-collapse-button.png');
  }
  
  console.log('\n✅ Все скриншоты сохранены в:', screenshotsDir);
  console.log('\nТеперь запустите localhost:3000 и сделайте скриншоты нашей реализации для сравнения.');
  
  await browser.close();
}

takeComparisonScreenshots().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

