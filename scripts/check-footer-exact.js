const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    // Find sidebar
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    let sidebar = chatItem;
    while (sidebar && sidebar.tagName !== 'NAV' && sidebar.tagName !== 'ASIDE') {
      sidebar = sidebar.parentElement;
    }
    const sidebarRect = sidebar?.getBoundingClientRect();
    
    // Find Add credits card by "Add credits" text
    const addCreditsText = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Add credits' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().top > 600
    );
    
    // Find card container
    let card = addCreditsText?.parentElement;
    while (card) {
      const s = getComputedStyle(card);
      const rect = card.getBoundingClientRect();
      if (s.borderRadius !== '0px' && rect.width > 100 && rect.width < 250) {
        break;
      }
      card = card.parentElement;
    }
    const cardRect = card?.getBoundingClientRect();
    const cardStyle = card ? getComputedStyle(card) : null;
    
    // Find collapse button (at bottom)
    const collapseBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const rect = b.getBoundingClientRect();
      const svg = b.querySelector('svg');
      return rect.top > 750 && rect.left < 300 && svg && rect.width < 50;
    });
    const collapseBtnRect = collapseBtn?.getBoundingClientRect();
    
    return {
      sidebarWidth: Math.round(sidebarRect?.width || 0),
      sidebarLeft: Math.round(sidebarRect?.left || 0),
      card: {
        width: Math.round(cardRect?.width || 0),
        height: Math.round(cardRect?.height || 0),
        left: Math.round((cardRect?.left || 0) - (sidebarRect?.left || 0)),
        padding: cardStyle?.padding,
        margin: cardStyle?.margin,
        borderRadius: cardStyle?.borderRadius,
        backgroundColor: cardStyle?.backgroundColor,
      },
      collapseBtn: {
        width: Math.round(collapseBtnRect?.width || 0),
        height: Math.round(collapseBtnRect?.height || 0),
        left: Math.round((collapseBtnRect?.left || 0) - (sidebarRect?.left || 0)),
        top: Math.round(collapseBtnRect?.top || 0),
      }
    };
  });
  
  console.log('=== OpenAI Footer Exact ===\n');
  console.log('Sidebar width:', data.sidebarWidth, 'px');
  console.log('');
  console.log('ADD CREDITS CARD:');
  console.log('  width:', data.card?.width, 'px');
  console.log('  height:', data.card?.height, 'px');
  console.log('  left from sidebar:', data.card?.left, 'px');
  console.log('  padding:', data.card?.padding);
  console.log('  margin:', data.card?.margin);
  console.log('  borderRadius:', data.card?.borderRadius);
  console.log('  backgroundColor:', data.card?.backgroundColor);
  console.log('');
  console.log('COLLAPSE BUTTON:');
  console.log('  width:', data.collapseBtn?.width, 'px');
  console.log('  height:', data.collapseBtn?.height, 'px');
  console.log('  left from sidebar:', data.collapseBtn?.left, 'px');
  
  await browser.close();
}

check().catch(console.error);
