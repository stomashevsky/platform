const { chromium } = require('playwright');

async function compare() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    const result = {};
    
    // Find Create title
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().left < 300 &&
      e.getBoundingClientRect().top < 200
    );
    if (createTitle) {
      result.createTitleLeft = Math.round(createTitle.getBoundingClientRect().left);
    }
    
    // Find Chat icon
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    if (chatItem) {
      const svg = chatItem.querySelector('svg');
      result.chatIconLeft = Math.round(svg.getBoundingClientRect().left);
    }
    
    return result;
  });
  
  console.log('OpenAI alignment:');
  console.log('  Create title left:', data.createTitleLeft, 'px');
  console.log('  Chat icon left:', data.chatIconLeft, 'px');
  console.log('  Difference:', data.chatIconLeft - data.createTitleLeft, 'px (icon is right of title)');
  
  await browser.close();
}

compare().catch(console.error);
