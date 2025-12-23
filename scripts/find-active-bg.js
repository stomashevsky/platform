const { chromium } = require('playwright');

async function extract() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    // Find all elements with gray background in sidebar area
    const grayElements = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.left < 300 && rect.top > 50 && rect.top < 200) {
        const s = getComputedStyle(el);
        const bg = s.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)' && bg !== 'rgb(243, 243, 243)') {
          grayElements.push({
            tag: el.tagName,
            class: el.className?.substring(0, 50),
            text: el.textContent?.trim().substring(0, 20),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            bg: bg,
            borderRadius: s.borderRadius,
            left: Math.round(rect.left),
            top: Math.round(rect.top)
          });
        }
      }
    });
    
    // Also check ::before pseudo elements on menu items
    const chatItems = Array.from(document.querySelectorAll('a, button')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.left < 300 && el.querySelector('svg');
    }).slice(0, 5);
    
    const pseudoStyles = chatItems.map(el => {
      const before = getComputedStyle(el, '::before');
      const after = getComputedStyle(el, '::after');
      return {
        text: el.textContent?.trim().substring(0, 15),
        beforeBg: before.backgroundColor,
        beforeWidth: before.width,
        beforeHeight: before.height,
        beforeRadius: before.borderRadius,
        afterBg: after.backgroundColor
      };
    });
    
    // Find wrapper div with active background
    const chatLink = Array.from(document.querySelectorAll('a, button')).find(el => 
      el.textContent?.trim() === 'Chat' && el.querySelector('svg')
    );
    
    let activeWrapper = null;
    if (chatLink) {
      let parent = chatLink.parentElement;
      for (let i = 0; i < 5; i++) {
        if (parent) {
          const s = getComputedStyle(parent);
          if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            activeWrapper = {
              tag: parent.tagName,
              bg: s.backgroundColor,
              width: Math.round(parent.getBoundingClientRect().width),
              height: Math.round(parent.getBoundingClientRect().height),
              borderRadius: s.borderRadius,
              padding: s.padding
            };
            break;
          }
          parent = parent.parentElement;
        }
      }
    }
    
    return { grayElements, pseudoStyles, activeWrapper };
  });
  
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

extract().catch(console.error);
