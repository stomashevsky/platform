const { chromium } = require('playwright');

async function extract() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    const result = {
      sidebar: {},
      chatItem: {},
      otherItems: [],
      sectionTitles: []
    };
    
    // Find Chat item (active)
    const chatLink = Array.from(document.querySelectorAll('a, button')).find(el => 
      el.textContent?.trim() === 'Chat' && el.querySelector('svg')
    );
    
    if (chatLink) {
      const rect = chatLink.getBoundingClientRect();
      const s = getComputedStyle(chatLink);
      result.chatItem = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        backgroundColor: s.backgroundColor,
        borderRadius: s.borderRadius,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        fontSize: s.fontSize,
        gap: s.gap,
        color: s.color
      };
    }
    
    // Find other menu items
    ['ChatGPT Apps', 'Usage', 'Evaluation'].forEach(text => {
      const el = Array.from(document.querySelectorAll('a, button')).find(e => 
        e.textContent?.trim() === text
      );
      if (el) {
        const rect = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        result.otherItems.push({
          text,
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          backgroundColor: s.backgroundColor,
          paddingLeft: s.paddingLeft,
          paddingTop: s.paddingTop,
        });
      }
    });
    
    // Calculate vertical spacing
    const items = Array.from(document.querySelectorAll('a, button')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.left < 300 && el.querySelector('svg') && el.textContent?.trim().length < 20;
    });
    
    if (items.length >= 2) {
      const rect1 = items[0].getBoundingClientRect();
      const rect2 = items[1].getBoundingClientRect();
      result.verticalSpacing = Math.round(rect2.top - rect1.bottom);
      result.itemToItemDistance = Math.round(rect2.top - rect1.top);
    }
    
    // Section titles
    ['Create', 'Manage', 'Optimize'].forEach(text => {
      const el = Array.from(document.querySelectorAll('*')).find(e => 
        e.textContent?.trim() === text && 
        e.children.length === 0 &&
        e.getBoundingClientRect().left < 300
      );
      if (el) {
        const rect = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        result.sectionTitles.push({
          text,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          paddingLeft: s.paddingLeft,
          marginTop: s.marginTop,
          marginBottom: s.marginBottom,
          height: Math.round(rect.height),
          top: Math.round(rect.top)
        });
      }
    });
    
    // Sidebar container
    const sidebar = document.querySelector('nav') || document.querySelector('aside');
    if (sidebar) {
      const rect = sidebar.getBoundingClientRect();
      result.sidebar = {
        width: Math.round(rect.width),
        paddingTop: getComputedStyle(sidebar).paddingTop,
        paddingLeft: getComputedStyle(sidebar).paddingLeft
      };
    }
    
    return result;
  });
  
  console.log(JSON.stringify(data, null, 2));
  
  await browser.close();
}

extract().catch(console.error);
