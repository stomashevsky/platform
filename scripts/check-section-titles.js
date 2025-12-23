const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    const results = [];
    
    ['Create', 'Manage', 'Optimize'].forEach(text => {
      const els = Array.from(document.querySelectorAll('*')).filter(e => 
        e.textContent?.trim() === text && 
        e.children.length === 0 &&
        e.getBoundingClientRect().left < 300
      );
      
      if (els.length > 0) {
        const el = els[0];
        const rect = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        const parent = el.parentElement;
        const parentRect = parent?.getBoundingClientRect();
        
        results.push({
          text,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          letterSpacing: s.letterSpacing,
          lineHeight: s.lineHeight,
          // Positions
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          height: Math.round(rect.height),
          // Margins and paddings
          paddingLeft: s.paddingLeft,
          paddingTop: s.paddingTop,
          marginTop: s.marginTop,
          marginBottom: s.marginBottom,
          // Parent padding
          parentPaddingLeft: parent ? getComputedStyle(parent).paddingLeft : null
        });
      }
    });
    
    // Also get first item after each title to calculate gap
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    if (chatItem) {
      results.push({
        text: 'Chat (first item)',
        top: Math.round(chatItem.getBoundingClientRect().top),
        left: Math.round(chatItem.getBoundingClientRect().left)
      });
    }
    
    return results;
  });
  
  console.log('=== OpenAI Section Titles ===\n');
  data.forEach(item => {
    console.log(`${item.text}:`);
    if (item.fontSize) {
      console.log(`  fontSize: ${item.fontSize}`);
      console.log(`  fontWeight: ${item.fontWeight}`);
      console.log(`  color: ${item.color}`);
      console.log(`  letterSpacing: ${item.letterSpacing}`);
      console.log(`  lineHeight: ${item.lineHeight}`);
      console.log(`  left: ${item.left}px`);
      console.log(`  top: ${item.top}px`);
      console.log(`  height: ${item.height}px`);
      console.log(`  paddingLeft: ${item.paddingLeft}`);
      console.log(`  paddingTop: ${item.paddingTop}`);
      console.log(`  marginTop: ${item.marginTop}`);
      console.log(`  marginBottom: ${item.marginBottom}`);
    } else {
      console.log(`  top: ${item.top}px`);
      console.log(`  left: ${item.left}px`);
    }
    console.log('');
  });
  
  // Calculate gaps
  if (data.length >= 2) {
    const createTop = data.find(d => d.text === 'Create')?.top;
    const chatTop = data.find(d => d.text === 'Chat (first item)')?.top;
    if (createTop && chatTop) {
      console.log(`Gap Create -> Chat: ${chatTop - createTop}px`);
    }
  }
  
  await browser.close();
}

check().catch(console.error);
