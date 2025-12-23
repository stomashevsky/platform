const { chromium } = require('playwright');

async function extract() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  // Click collapse button to collapse sidebar
  const collapseBtn = await page.$('button:has(svg):below(:text("Fine-tuning"))');
  if (collapseBtn) {
    await collapseBtn.click();
    await page.waitForTimeout(500);
  }
  
  const data = await page.evaluate(() => {
    // Find sidebar
    const chatIcon = Array.from(document.querySelectorAll('button, a')).find(e => {
      const svg = e.querySelector('svg');
      const rect = e.getBoundingClientRect();
      return svg && rect.left < 100 && rect.top < 300 && rect.width < 60;
    });
    
    let sidebar = chatIcon;
    while (sidebar && sidebar.tagName !== 'NAV' && sidebar.tagName !== 'ASIDE') {
      sidebar = sidebar.parentElement;
    }
    const sidebarRect = sidebar?.getBoundingClientRect();
    const sidebarStyle = sidebar ? getComputedStyle(sidebar) : null;
    
    // First icon button (Chat)
    const firstBtn = Array.from(document.querySelectorAll('button, a')).find(e => {
      const svg = e.querySelector('svg');
      const rect = e.getBoundingClientRect();
      return svg && rect.left < 100 && rect.top > 100 && rect.top < 200 && rect.width < 60;
    });
    const firstBtnRect = firstBtn?.getBoundingClientRect();
    const firstBtnStyle = firstBtn ? getComputedStyle(firstBtn) : null;
    const firstBtnBefore = firstBtn ? getComputedStyle(firstBtn, '::before') : null;
    
    // Collapse button at bottom
    const collapseBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const rect = b.getBoundingClientRect();
      const svg = b.querySelector('svg');
      return rect.top > 800 && rect.left < 100 && svg;
    });
    const collapseBtnRect = collapseBtn?.getBoundingClientRect();
    const collapseBtnStyle = collapseBtn ? getComputedStyle(collapseBtn) : null;
    
    return {
      sidebar: {
        width: Math.round(sidebarRect?.width || 0),
        paddingTop: sidebarStyle?.paddingTop,
        paddingLeft: sidebarStyle?.paddingLeft,
      },
      iconButton: {
        left: Math.round((firstBtnRect?.left || 0) - (sidebarRect?.left || 0)),
        width: Math.round(firstBtnRect?.width || 0),
        height: Math.round(firstBtnRect?.height || 0),
        backgroundColor: firstBtnStyle?.backgroundColor,
        borderRadius: firstBtnStyle?.borderRadius,
        beforeBg: firstBtnBefore?.backgroundColor,
        beforeBorderRadius: firstBtnBefore?.borderRadius,
      },
      collapseBtn: {
        left: Math.round((collapseBtnRect?.left || 0) - (sidebarRect?.left || 0)),
        width: Math.round(collapseBtnRect?.width || 0),
        height: Math.round(collapseBtnRect?.height || 0),
        border: collapseBtnStyle?.border,
        borderRadius: collapseBtnStyle?.borderRadius,
      }
    };
  });
  
  console.log('=== OpenAI COLLAPSED Sidebar ===\n');
  console.log('SIDEBAR:');
  console.log(JSON.stringify(data.sidebar, null, 2));
  console.log('\nICON BUTTON (first/Chat):');
  console.log(JSON.stringify(data.iconButton, null, 2));
  console.log('\nCOLLAPSE BUTTON:');
  console.log(JSON.stringify(data.collapseBtn, null, 2));
  
  // Click again to expand
  const collapseBtn2 = await page.$('button:has(svg):below(:text(""))');
  if (collapseBtn2) {
    const rect = await collapseBtn2.boundingBox();
    if (rect && rect.y > 800) {
      await collapseBtn2.click();
    }
  }
  
  await browser.close();
}

extract().catch(console.error);
