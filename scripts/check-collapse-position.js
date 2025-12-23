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
    const sidebarStyle = sidebar ? getComputedStyle(sidebar) : null;
    
    // Find collapse button
    const collapseBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const rect = b.getBoundingClientRect();
      const svg = b.querySelector('svg');
      return rect.top > 750 && rect.left < 300 && svg && rect.width < 50;
    });
    const collapseBtnRect = collapseBtn?.getBoundingClientRect();
    
    // Find collapse button container (parent div)
    const collapseContainer = collapseBtn?.parentElement;
    const containerRect = collapseContainer?.getBoundingClientRect();
    const containerStyle = collapseContainer ? getComputedStyle(collapseContainer) : null;
    
    return {
      sidebar: {
        paddingLeft: sidebarStyle?.paddingLeft,
        paddingRight: sidebarStyle?.paddingRight,
        paddingTop: sidebarStyle?.paddingTop,
        paddingBottom: sidebarStyle?.paddingBottom,
      },
      collapseBtn: {
        left: Math.round((collapseBtnRect?.left || 0) - (sidebarRect?.left || 0)),
        top: Math.round((collapseBtnRect?.top || 0) - (sidebarRect?.top || 0)),
        width: Math.round(collapseBtnRect?.width || 0),
        height: Math.round(collapseBtnRect?.height || 0),
      },
      collapseContainer: {
        left: Math.round((containerRect?.left || 0) - (sidebarRect?.left || 0)),
        width: Math.round(containerRect?.width || 0),
        height: Math.round(containerRect?.height || 0),
        padding: containerStyle?.padding,
        display: containerStyle?.display,
        justifyContent: containerStyle?.justifyContent,
      }
    };
  });
  
  console.log('=== OpenAI Collapse Button Position ===\n');
  console.log('SIDEBAR PADDING:');
  console.log(JSON.stringify(data.sidebar, null, 2));
  console.log('\nCOLLAPSE BUTTON:');
  console.log(JSON.stringify(data.collapseBtn, null, 2));
  console.log('\nCOLLAPSE CONTAINER:');
  console.log(JSON.stringify(data.collapseContainer, null, 2));
  
  await browser.close();
}

check().catch(console.error);
