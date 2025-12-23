const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractAllHeaderElements() {
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
  
  // Take screenshot of header area
  const refDir = path.join(__dirname, '../reference/screenshots');
  await page.screenshot({ 
    path: path.join(refDir, 'openai-header.png'),
    clip: { x: 0, y: 0, width: 1200, height: 60 }
  });
  console.log('📸 Header screenshot saved');
  
  const results = await page.evaluate(() => {
    const data = {
      allButtonsInHeader: [],
      allLinksInHeader: [],
    };
    
    // Get all buttons in top 60px
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach((btn, i) => {
      const rect = btn.getBoundingClientRect();
      if (rect.top > 60) return;
      
      const s = getComputedStyle(btn);
      data.allButtonsInHeader.push({
        index: i,
        text: btn.textContent?.trim().substring(0, 50),
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
        hasSvg: !!btn.querySelector('svg'),
      });
    });
    
    // Get all links in top 60px
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach((link, i) => {
      const rect = link.getBoundingClientRect();
      if (rect.top > 60) return;
      
      const s = getComputedStyle(link);
      data.allLinksInHeader.push({
        index: i,
        text: link.textContent?.trim().substring(0, 50),
        href: link.getAttribute('href'),
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
      });
    });
    
    return data;
  });
  
  console.log('\n🔘 ALL BUTTONS IN HEADER:');
  results.allButtonsInHeader.forEach(btn => {
    console.log(`  [${btn.index}] "${btn.text}" at (${btn.x.toFixed(0)},${btn.y.toFixed(0)}) ${btn.width.toFixed(0)}x${btn.height.toFixed(0)} - fontSize:${btn.fontSize} fontWeight:${btn.fontWeight} hasSvg:${btn.hasSvg}`);
  });
  
  console.log('\n🔗 ALL LINKS IN HEADER:');
  results.allLinksInHeader.forEach(link => {
    console.log(`  [${link.index}] "${link.text}" -> ${link.href} at (${link.x.toFixed(0)},${link.y.toFixed(0)}) - fontSize:${link.fontSize}`);
  });
  
  // Save
  const outputPath = path.join(__dirname, '../reference/header-all-elements.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('\n✅ Сохранено:', outputPath);
  
  await browser.close();
}

extractAllHeaderElements().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

