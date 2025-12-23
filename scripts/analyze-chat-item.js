const { chromium } = require('playwright');

async function analyze() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const structure = await page.evaluate(() => {
    // Find all elements with gray background
    const grayElements = [];
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (s.backgroundColor.includes('237, 237, 237') || 
          s.backgroundColor.includes('ededed') ||
          s.backgroundColor === 'rgb(237, 237, 237)') {
        const rect = el.getBoundingClientRect();
        grayElements.push({
          tag: el.tagName,
          class: el.className?.substring(0, 50),
          text: el.textContent?.trim().substring(0, 30),
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
          borderRadius: s.borderRadius,
          padding: s.padding
        });
      }
    });
    
    // Find Chat link/button and get full structure
    let chatItem = null;
    document.querySelectorAll('a, button').forEach(el => {
      if (el.textContent?.trim() === 'Chat') {
        chatItem = el;
      }
    });
    
    if (!chatItem) return { grayElements, chatStructure: null };
    
    // Get full HTML structure
    const getStructure = (el, depth = 0) => {
      if (depth > 5) return null;
      const s = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      return {
        tag: el.tagName,
        class: el.className?.substring(0, 60),
        width: rect.width,
        height: rect.height,
        left: rect.left,
        bg: s.backgroundColor,
        borderRadius: s.borderRadius,
        padding: s.padding,
        children: Array.from(el.children).map(c => getStructure(c, depth + 1)).filter(Boolean)
      };
    };
    
    return {
      grayElements,
      chatStructure: getStructure(chatItem),
      chatParent: getStructure(chatItem.parentElement)
    };
  });
  
  console.log('=== Gray Background Elements ===');
  structure.grayElements.forEach((el, i) => {
    console.log(`${i + 1}. ${el.tag} - "${el.text}" - ${el.width}x${el.height} at (${el.left}, ${el.top})`);
    console.log(`   borderRadius: ${el.borderRadius}, padding: ${el.padding}`);
  });
  
  console.log('\n=== Chat Item Structure ===');
  console.log(JSON.stringify(structure.chatStructure, null, 2));
  
  console.log('\n=== Chat Parent Structure ===');
  console.log(JSON.stringify(structure.chatParent, null, 2));
  
  await browser.close();
}

analyze().catch(console.error);
