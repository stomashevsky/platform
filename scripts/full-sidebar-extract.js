const { chromium } = require('playwright');

async function extract() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    // Find sidebar
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    
    // Find sidebar container
    let sidebar = chatItem;
    while (sidebar && sidebar.tagName !== 'NAV' && sidebar.tagName !== 'ASIDE') {
      sidebar = sidebar.parentElement;
    }
    if (!sidebar) {
      sidebar = chatItem?.closest('[class*="sidebar"]') || chatItem?.parentElement?.parentElement?.parentElement;
    }
    
    const sidebarRect = sidebar?.getBoundingClientRect();
    const sidebarStyle = sidebar ? getComputedStyle(sidebar) : null;
    
    // Chat item details
    const chatRect = chatItem?.getBoundingClientRect();
    const chatStyle = chatItem ? getComputedStyle(chatItem) : null;
    const chatIcon = chatItem?.querySelector('svg');
    const chatIconRect = chatIcon?.getBoundingClientRect();
    
    // Create title
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().width < 200
    );
    const createRect = createTitle?.getBoundingClientRect();
    const createStyle = createTitle ? getComputedStyle(createTitle) : null;
    
    // ChatGPT Apps (second item)
    const appsItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.includes('ChatGPT Apps') && e.querySelector('svg')
    );
    const appsRect = appsItem?.getBoundingClientRect();
    
    // Add Credits card
    const billingBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent?.trim() === 'Go to Billing'
    );
    let card = billingBtn?.parentElement;
    while (card) {
      const s = getComputedStyle(card);
      if (s.borderRadius !== '0px' && card.getBoundingClientRect().width > 100) {
        break;
      }
      card = card.parentElement;
    }
    const cardRect = card?.getBoundingClientRect();
    const cardStyle = card ? getComputedStyle(card) : null;
    
    // Collapse button
    const collapseBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const rect = b.getBoundingClientRect();
      const svg = b.querySelector('svg');
      return rect.top > 800 && rect.left < 300 && svg && rect.width < 50;
    });
    const collapseBtnRect = collapseBtn?.getBoundingClientRect();
    
    return {
      sidebar: {
        width: Math.round(sidebarRect?.width || 0),
        paddingTop: sidebarStyle?.paddingTop,
        paddingLeft: sidebarStyle?.paddingLeft,
        paddingRight: sidebarStyle?.paddingRight,
      },
      createTitle: {
        left: Math.round((createRect?.left || 0) - (sidebarRect?.left || 0)),
        top: Math.round((createRect?.top || 0) - (sidebarRect?.top || 0)),
        height: Math.round(createRect?.height || 0),
        fontSize: createStyle?.fontSize,
        fontWeight: createStyle?.fontWeight,
        color: createStyle?.color,
      },
      chatItem: {
        left: Math.round((chatRect?.left || 0) - (sidebarRect?.left || 0)),
        top: Math.round((chatRect?.top || 0) - (sidebarRect?.top || 0)),
        width: Math.round(chatRect?.width || 0),
        height: Math.round(chatRect?.height || 0),
        paddingLeft: chatStyle?.paddingLeft,
        paddingRight: chatStyle?.paddingRight,
        borderRadius: chatStyle?.borderRadius,
        gap: chatStyle?.gap,
        iconLeft: Math.round((chatIconRect?.left || 0) - (sidebarRect?.left || 0)),
      },
      gapChatToApps: Math.round((appsRect?.top || 0) - ((chatRect?.top || 0) + (chatRect?.height || 0))),
      gapCreateToChat: Math.round((chatRect?.top || 0) - ((createRect?.top || 0) + (createRect?.height || 0))),
      card: {
        width: Math.round(cardRect?.width || 0),
        left: Math.round((cardRect?.left || 0) - (sidebarRect?.left || 0)),
        padding: cardStyle?.padding,
        borderRadius: cardStyle?.borderRadius,
        backgroundColor: cardStyle?.backgroundColor,
      },
      collapseBtn: {
        left: Math.round((collapseBtnRect?.left || 0) - (sidebarRect?.left || 0)),
        width: Math.round(collapseBtnRect?.width || 0),
        height: Math.round(collapseBtnRect?.height || 0),
      }
    };
  });
  
  console.log('=== FULL OpenAI Sidebar Extract ===\n');
  console.log('SIDEBAR:');
  console.log('  width:', data.sidebar?.width, 'px');
  console.log('  paddingTop:', data.sidebar?.paddingTop);
  console.log('  paddingLeft:', data.sidebar?.paddingLeft);
  console.log('  paddingRight:', data.sidebar?.paddingRight);
  console.log('');
  console.log('CREATE TITLE:');
  console.log('  left:', data.createTitle?.left, 'px');
  console.log('  top:', data.createTitle?.top, 'px');
  console.log('  height:', data.createTitle?.height, 'px');
  console.log('  fontSize:', data.createTitle?.fontSize);
  console.log('  fontWeight:', data.createTitle?.fontWeight);
  console.log('  color:', data.createTitle?.color);
  console.log('');
  console.log('CHAT ITEM:');
  console.log('  left:', data.chatItem?.left, 'px');
  console.log('  top:', data.chatItem?.top, 'px');
  console.log('  width:', data.chatItem?.width, 'px');
  console.log('  height:', data.chatItem?.height, 'px');
  console.log('  paddingLeft:', data.chatItem?.paddingLeft);
  console.log('  paddingRight:', data.chatItem?.paddingRight);
  console.log('  borderRadius:', data.chatItem?.borderRadius);
  console.log('  gap:', data.chatItem?.gap);
  console.log('  iconLeft:', data.chatItem?.iconLeft, 'px');
  console.log('');
  console.log('GAPS:');
  console.log('  Create to Chat:', data.gapCreateToChat, 'px');
  console.log('  Chat to Apps:', data.gapChatToApps, 'px');
  console.log('');
  console.log('ADD CREDITS CARD:');
  console.log('  width:', data.card?.width, 'px');
  console.log('  left:', data.card?.left, 'px');
  console.log('  padding:', data.card?.padding);
  console.log('  borderRadius:', data.card?.borderRadius);
  console.log('  backgroundColor:', data.card?.backgroundColor);
  console.log('');
  console.log('COLLAPSE BUTTON:');
  console.log('  left:', data.collapseBtn?.left, 'px');
  console.log('  width:', data.collapseBtn?.width, 'px');
  console.log('  height:', data.collapseBtn?.height, 'px');
  
  await browser.close();
}

extract().catch(console.error);
