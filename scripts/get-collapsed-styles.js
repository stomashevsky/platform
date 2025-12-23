const { chromium } = require('playwright');

async function get() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  // Sidebar is already collapsed based on screenshot - extract current state
  const data = await page.evaluate(() => {
    // Find first icon button (should be Chat at top)
    const iconBtns = Array.from(document.querySelectorAll('button, a')).filter(e => {
      const svg = e.querySelector('svg');
      const rect = e.getBoundingClientRect();
      return svg && rect.left < 100 && rect.width < 60 && rect.height < 60;
    });
    
    // Find sidebar container
    let sidebar = iconBtns[0];
    while (sidebar && sidebar.tagName !== 'NAV' && sidebar.tagName !== 'ASIDE') {
      sidebar = sidebar.parentElement;
    }
    const sidebarRect = sidebar?.getBoundingClientRect();
    
    // Get first icon button details
    const firstBtn = iconBtns[0];
    const firstRect = firstBtn?.getBoundingClientRect();
    const firstStyle = firstBtn ? getComputedStyle(firstBtn) : null;
    
    // Center calculation
    const sidebarCenter = (sidebarRect?.left || 0) + (sidebarRect?.width || 0) / 2;
    const btnCenter = (firstRect?.left || 0) + (firstRect?.width || 0) / 2;
    
    return {
      sidebar: {
        width: Math.round(sidebarRect?.width || 0),
      },
      iconButton: {
        left: Math.round((firstRect?.left || 0) - (sidebarRect?.left || 0)),
        width: Math.round(firstRect?.width || 0),
        height: Math.round(firstRect?.height || 0),
        centerOffset: Math.round(btnCenter - sidebarCenter),
        margin: firstStyle?.margin,
        padding: firstStyle?.padding,
      },
      calculation: {
        sidebarWidth: Math.round(sidebarRect?.width || 0),
        btnWidth: Math.round(firstRect?.width || 0),
        expectedLeft: Math.round(((sidebarRect?.width || 0) - (firstRect?.width || 0)) / 2),
      }
    };
  });
  
  console.log('=== OpenAI COLLAPSED Styles ===\n');
  console.log('SIDEBAR:', JSON.stringify(data.sidebar, null, 2));
  console.log('\nICON BUTTON:', JSON.stringify(data.iconButton, null, 2));
  console.log('\nCALCULATION for centering:');
  console.log('  Sidebar width:', data.calculation.sidebarWidth);
  console.log('  Button width:', data.calculation.btnWidth);
  console.log('  Expected left for center:', data.calculation.expectedLeft);
  
  await browser.close();
}

get().catch(console.error);
