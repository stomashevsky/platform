const { chromium } = require('playwright');

async function compare() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const openaiPage = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!openaiPage) { console.error('OpenAI page not found'); return; }
  
  // Extract our UI metrics
  const localBrowser = await chromium.launch({ headless: true });
  const localPage = await localBrowser.newPage();
  await localPage.goto('http://localhost:3000');
  await localPage.waitForTimeout(1000);
  
  const ourMetrics = await localPage.evaluate(() => {
    const result = {};
    
    // Find Chat button (active item)
    const chatBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent?.trim() === 'Chat' || b.textContent?.includes('Chat')
    );
    
    if (chatBtn) {
      const rect = chatBtn.getBoundingClientRect();
      const icon = chatBtn.querySelector('svg') || chatBtn.querySelector('img');
      const iconRect = icon?.getBoundingClientRect();
      
      result.chatItem = {
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        iconLeft: Math.round(iconRect?.left || 0),
      };
    }
    
    // Find Create title
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().width < 200
    );
    if (createTitle) {
      const rect = createTitle.getBoundingClientRect();
      result.createTitle = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        height: Math.round(rect.height),
      };
    }
    
    // Find sidebar/aside
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      result.sidebar = {
        width: Math.round(sidebar.getBoundingClientRect().width),
      };
    }
    
    return result;
  });
  
  const openaiMetrics = await openaiPage.evaluate(() => {
    const result = {};
    
    // Find Chat button (active item)
    const chatBtn = Array.from(document.querySelectorAll('a, button')).find(b => 
      b.textContent?.trim() === 'Chat' && b.querySelector('svg')
    );
    
    if (chatBtn) {
      const rect = chatBtn.getBoundingClientRect();
      const icon = chatBtn.querySelector('svg');
      const iconRect = icon?.getBoundingClientRect();
      
      // Find sidebar
      let sidebar = chatBtn;
      while (sidebar && sidebar.tagName !== 'NAV' && sidebar.tagName !== 'ASIDE') {
        sidebar = sidebar.parentElement;
      }
      const sidebarRect = sidebar?.getBoundingClientRect();
      
      result.chatItem = {
        left: Math.round(rect.left - (sidebarRect?.left || 0)),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        iconLeft: Math.round((iconRect?.left || 0) - (sidebarRect?.left || 0)),
      };
      
      result.sidebar = {
        width: Math.round(sidebarRect?.width || 0),
      };
    }
    
    // Find Create title
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().width < 200
    );
    if (createTitle) {
      const rect = createTitle.getBoundingClientRect();
      result.createTitle = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        height: Math.round(rect.height),
      };
    }
    
    return result;
  });
  
  console.log('=== SIDE BY SIDE COMPARISON ===\n');
  console.log('OUR UI:');
  console.log(JSON.stringify(ourMetrics, null, 2));
  console.log('\nOPENAI:');
  console.log(JSON.stringify(openaiMetrics, null, 2));
  
  console.log('\n=== DIFFERENCES ===');
  if (ourMetrics.sidebar && openaiMetrics.sidebar) {
    const widthDiff = ourMetrics.sidebar.width - openaiMetrics.sidebar.width;
    console.log('Sidebar width diff:', widthDiff, 'px', widthDiff === 0 ? '✓' : '✗');
  }
  if (ourMetrics.chatItem && openaiMetrics.chatItem) {
    const leftDiff = ourMetrics.chatItem.left - openaiMetrics.chatItem.left;
    const widthDiff = ourMetrics.chatItem.width - openaiMetrics.chatItem.width;
    const heightDiff = ourMetrics.chatItem.height - openaiMetrics.chatItem.height;
    console.log('Chat item left diff:', leftDiff, 'px', leftDiff === 0 ? '✓' : '✗');
    console.log('Chat item width diff:', widthDiff, 'px', widthDiff === 0 ? '✓' : '✗');
    console.log('Chat item height diff:', heightDiff, 'px', heightDiff === 0 ? '✓' : '✗');
  }
  
  await localBrowser.close();
  await browser.close();
}

compare().catch(console.error);
