const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    const result = {};
    
    // Get sidebar/nav left edge
    const nav = document.querySelector('nav');
    const navLeft = nav ? nav.getBoundingClientRect().left : 0;
    
    // Create title
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().left < 400 &&
      e.getBoundingClientRect().top < 200
    );
    if (createTitle) {
      const rect = createTitle.getBoundingClientRect();
      const s = getComputedStyle(createTitle);
      result.createTitle = {
        absoluteLeft: Math.round(rect.left),
        relativeToNav: Math.round(rect.left - navLeft),
        paddingLeft: s.paddingLeft,
        marginLeft: s.marginLeft
      };
    }
    
    // Chat item
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    if (chatItem) {
      const rect = chatItem.getBoundingClientRect();
      const svg = chatItem.querySelector('svg');
      const svgRect = svg.getBoundingClientRect();
      result.chatItem = {
        absoluteLeft: Math.round(rect.left),
        relativeToNav: Math.round(rect.left - navLeft),
        iconAbsoluteLeft: Math.round(svgRect.left),
        iconRelativeToNav: Math.round(svgRect.left - navLeft)
      };
    }
    
    // Chat text
    const chatText = chatItem?.querySelector('span, div');
    if (chatText && chatText.textContent?.trim() === 'Chat') {
      result.chatTextLeft = Math.round(chatText.getBoundingClientRect().left - navLeft);
    }
    
    return result;
  });
  
  console.log('=== OpenAI Title Padding ===\n');
  console.log('Create title:');
  console.log('  relative to nav left:', data.createTitle?.relativeToNav, 'px');
  console.log('  paddingLeft:', data.createTitle?.paddingLeft);
  console.log('  marginLeft:', data.createTitle?.marginLeft);
  console.log('');
  console.log('Chat item:');
  console.log('  relative to nav:', data.chatItem?.relativeToNav, 'px');
  console.log('  icon relative to nav:', data.chatItem?.iconRelativeToNav, 'px');
  console.log('  text relative to nav:', data.chatTextLeft, 'px');
  console.log('');
  console.log('ALIGNMENT:');
  console.log('  Create title starts at:', data.createTitle?.relativeToNav, 'px');
  console.log('  Chat icon starts at:', data.chatItem?.iconRelativeToNav, 'px');
  
  await browser.close();
}

check().catch(console.error);
