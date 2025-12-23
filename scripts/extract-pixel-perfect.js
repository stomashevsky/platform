const { chromium } = require('playwright');

async function extract() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    const result = {};
    
    // Header height
    const header = document.querySelector('header');
    result.headerHeight = header ? Math.round(header.getBoundingClientRect().height) : null;
    result.headerBottom = header ? Math.round(header.getBoundingClientRect().bottom) : null;
    
    // Create title
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().left < 300 &&
      e.getBoundingClientRect().top < 200
    );
    if (createTitle) {
      const rect = createTitle.getBoundingClientRect();
      const s = getComputedStyle(createTitle);
      result.createTitle = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        height: Math.round(rect.height),
        paddingLeft: s.paddingLeft,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
        lineHeight: s.lineHeight
      };
    }
    
    // Chat item (first menu item)
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    if (chatItem) {
      const rect = chatItem.getBoundingClientRect();
      const svg = chatItem.querySelector('svg');
      const svgRect = svg.getBoundingClientRect();
      const s = getComputedStyle(chatItem);
      
      result.chatItem = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        iconLeft: Math.round(svgRect.left),
        iconCenterX: Math.round(svgRect.left + svgRect.width / 2),
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        gap: s.gap,
        borderRadius: s.borderRadius
      };
    }
    
    // Gap from Create to Chat
    if (result.createTitle && result.chatItem) {
      result.createToChatGap = result.chatItem.top - (result.createTitle.top + result.createTitle.height);
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
    
    // Assistants (last item in Create section)
    const assistantsItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Assistants' && e.querySelector('svg')
    );
    if (assistantsItem && result.manageTitle) {
      const rect = assistantsItem.getBoundingClientRect();
      result.assistantsToManageGap = result.manageTitle.top - (rect.top + rect.height);
    }
    
    // Usage (first item in Manage section)
    const usageItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Usage' && e.querySelector('svg')
    );
    if (usageItem && result.manageTitle) {
      result.manageToUsageGap = usageItem.getBoundingClientRect().top - (result.manageTitle.top + 22);
    }
    
    // Sidebar width
    const nav = document.querySelector('nav');
    if (nav) {
      result.sidebarWidth = Math.round(nav.getBoundingClientRect().width);
    }
    
    // Item-to-item vertical distance
    const chatGPTApps = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.includes('ChatGPT Apps') && e.querySelector('svg')
    );
    if (chatItem && chatGPTApps) {
      result.itemToItemDistance = Math.round(chatGPTApps.getBoundingClientRect().top - chatItem.getBoundingClientRect().top);
    }
    
    return result;
  });
  
  console.log('=== PIXEL-PERFECT OpenAI Data ===\n');
  console.log('Header height:', data.headerHeight);
  console.log('Header bottom:', data.headerBottom);
  console.log('');
  console.log('CREATE TITLE:');
  console.log('  left:', data.createTitle?.left, 'px');
  console.log('  top:', data.createTitle?.top, 'px');
  console.log('  height:', data.createTitle?.height, 'px');
  console.log('  paddingLeft:', data.createTitle?.paddingLeft);
  console.log('  fontSize:', data.createTitle?.fontSize);
  console.log('  fontWeight:', data.createTitle?.fontWeight);
  console.log('  color:', data.createTitle?.color);
  console.log('');
  console.log('CHAT ITEM:');
  console.log('  left:', data.chatItem?.left, 'px');
  console.log('  top:', data.chatItem?.top, 'px');
  console.log('  height:', data.chatItem?.height, 'px');
  console.log('  width:', data.chatItem?.width, 'px');
  console.log('  iconLeft:', data.chatItem?.iconLeft, 'px');
  console.log('  paddingLeft:', data.chatItem?.paddingLeft);
  console.log('  gap:', data.chatItem?.gap);
  console.log('  borderRadius:', data.chatItem?.borderRadius);
  console.log('');
  console.log('GAPS:');
  console.log('  Create title to Chat item:', data.createToChatGap, 'px');
  console.log('  Assistants to Manage title:', data.assistantsToManageGap, 'px');
  console.log('  Manage title to Usage:', data.manageToUsageGap, 'px');
  console.log('  Item-to-item distance:', data.itemToItemDistance, 'px');
  console.log('');
  console.log('SIDEBAR:');
  console.log('  width:', data.sidebarWidth, 'px');
  console.log('');
  console.log('ALIGNMENT CHECK:');
  console.log('  Create title left:', data.createTitle?.left, 'px');
  console.log('  Chat icon left:', data.chatItem?.iconLeft, 'px');
  console.log('  Difference:', (data.chatItem?.iconLeft - data.createTitle?.left), 'px');
  
  await browser.close();
}

extract().catch(console.error);
