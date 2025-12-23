const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    // Find the sidebar - look for element containing Create title
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().width < 300
    );
    
    if (!createTitle) return { error: 'Create title not found' };
    
    // Find sidebar container (parent that has the full sidebar width)
    let sidebar = createTitle;
    while (sidebar && sidebar.getBoundingClientRect().width < 200) {
      sidebar = sidebar.parentElement;
    }
    
    const sidebarRect = sidebar?.getBoundingClientRect();
    const titleRect = createTitle.getBoundingClientRect();
    const titleStyle = getComputedStyle(createTitle);
    
    // Find Chat item
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    const chatRect = chatItem?.getBoundingClientRect();
    const chatIcon = chatItem?.querySelector('svg');
    const iconRect = chatIcon?.getBoundingClientRect();
    
    return {
      sidebarLeft: sidebarRect?.left,
      sidebarWidth: sidebarRect?.width,
      title: {
        left: titleRect.left,
        leftFromSidebar: Math.round(titleRect.left - (sidebarRect?.left || 0)),
        paddingLeft: titleStyle.paddingLeft
      },
      chatItem: {
        left: chatRect?.left,
        leftFromSidebar: Math.round((chatRect?.left || 0) - (sidebarRect?.left || 0))
      },
      chatIcon: {
        left: iconRect?.left,
        leftFromSidebar: Math.round((iconRect?.left || 0) - (sidebarRect?.left || 0))
      }
    };
  });
  
  console.log('=== OpenAI Exact Positions ===\n');
  console.log('Sidebar width:', data.sidebarWidth);
  console.log('');
  console.log('Create title:');
  console.log('  left from sidebar:', data.title?.leftFromSidebar, 'px');
  console.log('  paddingLeft:', data.title?.paddingLeft);
  console.log('');
  console.log('Chat item left from sidebar:', data.chatItem?.leftFromSidebar, 'px');
  console.log('Chat icon left from sidebar:', data.chatIcon?.leftFromSidebar, 'px');
  console.log('');
  console.log('=== CONCLUSION ===');
  console.log('Title text starts at:', data.title?.leftFromSidebar, 'px from sidebar edge');
  console.log('Icon starts at:', data.chatIcon?.leftFromSidebar, 'px from sidebar edge');
  
  await browser.close();
}

check().catch(console.error);
