const { chromium } = require('playwright');

async function analyze() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const grayElements = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (s.backgroundColor === 'rgb(237, 237, 237)') {
        const rect = el.getBoundingClientRect();
        if (rect.width > 50 && rect.height > 20) {
          results.push({
            tag: el.tagName,
            text: el.textContent?.trim().substring(0, 40),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            borderRadius: s.borderRadius,
            padding: s.padding,
            display: s.display,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label')
          });
        }
      }
    });
    return results;
  });
  
  console.log('=== Elements with #ededed background ===');
  grayElements.forEach((el, i) => {
    console.log(`\n${i + 1}. <${el.tag}> "${el.text}"`);
    console.log(`   Size: ${el.width}x${el.height} at (${el.left}, ${el.top})`);
    console.log(`   borderRadius: ${el.borderRadius}`);
    console.log(`   padding: ${el.padding}`);
    console.log(`   display: ${el.display}`);
  });
  
  // Also check for pseudo-elements on Chat item
  const chatPseudo = await page.evaluate(() => {
    const chatLinks = Array.from(document.querySelectorAll('a')).filter(a => 
      a.textContent?.trim() === 'Chat'
    );
    
    if (chatLinks.length === 0) return null;
    
    const chat = chatLinks[0];
    const before = getComputedStyle(chat, '::before');
    const after = getComputedStyle(chat, '::after');
    
    return {
      before: {
        content: before.content,
        bg: before.backgroundColor,
        position: before.position,
        width: before.width,
        height: before.height,
        borderRadius: before.borderRadius
      },
      after: {
        content: after.content,
        bg: after.backgroundColor,
        position: after.position
      }
    };
  });
  
  console.log('\n=== Chat pseudo-elements ===');
  console.log(JSON.stringify(chatPseudo, null, 2));
  
  await browser.close();
}

analyze().catch(console.error);
