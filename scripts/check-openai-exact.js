const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    const result = {};
    
    // Sidebar container
    const nav = document.querySelector('nav');
    if (nav) {
      result.sidebar = {
        left: Math.round(nav.getBoundingClientRect().left),
        paddingLeft: getComputedStyle(nav).paddingLeft,
        paddingTop: getComputedStyle(nav).paddingTop
      };
    }
    
    // Section title "Create"
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().left < 300 &&
      e.getBoundingClientRect().top < 200
    );
    if (createTitle) {
      const rect = createTitle.getBoundingClientRect();
      result.createTitle = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        paddingLeft: getComputedStyle(createTitle).paddingLeft,
        marginTop: getComputedStyle(createTitle).marginTop
      };
    }
    
    // Chat icon position (SVG)
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    if (chatItem) {
      const svg = chatItem.querySelector('svg');
      const itemRect = chatItem.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      
      result.chatItem = {
        itemLeft: Math.round(itemRect.left),
        itemTop: Math.round(itemRect.top),
        iconLeft: Math.round(svgRect.left),
        paddingLeft: getComputedStyle(chatItem).paddingLeft
      };
    }
    
    // Compare Create title left with Chat icon left
    if (result.createTitle && result.chatItem) {
      result.comparison = {
        createTitleLeft: result.createTitle.left,
        chatIconLeft: result.chatItem.iconLeft,
        difference: result.createTitle.left - result.chatItem.iconLeft
      };
    }
    
    // Manage title
    const manageTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Manage' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().left < 300
    );
    if (manageTitle) {
      result.manageTitle = {
        left: Math.round(manageTitle.getBoundingClientRect().left),
        top: Math.round(manageTitle.getBoundingClientRect().top)
      };
    }
    
    // Usage item (first in Manage section)
    const usageItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Usage' && e.querySelector('svg')
    );
    if (usageItem) {
      result.usageItem = {
        itemTop: Math.round(usageItem.getBoundingClientRect().top)
      };
    }
    
    // Gap between Manage title and Usage
    if (result.manageTitle && result.usageItem) {
      result.manageTitleToUsage = result.usageItem.itemTop - result.manageTitle.top;
    }
    
    return result;
  });
  
  console.log('=== OpenAI Exact Styles ===\n');
  console.log('Sidebar:', JSON.stringify(data.sidebar, null, 2));
  console.log('\nCreate title:', JSON.stringify(data.createTitle, null, 2));
  console.log('\nChat item:', JSON.stringify(data.chatItem, null, 2));
  console.log('\nComparison (Create vs Chat icon):', JSON.stringify(data.comparison, null, 2));
  console.log('\nManage title:', JSON.stringify(data.manageTitle, null, 2));
  console.log('\nManage title to Usage gap:', data.manageTitleToUsage, 'px');
  
  await browser.close();
}

check().catch(console.error);
