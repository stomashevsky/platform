const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    // Find header/navbar
    const projectSelector = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.includes('Personal') && 
      e.textContent?.includes('Default project') &&
      e.getBoundingClientRect().top < 100
    );
    
    // Find Create title
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().left < 300
    );
    
    // Find sidebar container
    const sidebar = document.querySelector('nav') || document.querySelector('aside');
    
    return {
      projectSelectorBottom: projectSelector ? Math.round(projectSelector.getBoundingClientRect().bottom) : null,
      createTitleTop: createTitle ? Math.round(createTitle.getBoundingClientRect().top) : null,
      sidebarTop: sidebar ? Math.round(sidebar.getBoundingClientRect().top) : null
    };
  });
  
  console.log('Project selector bottom:', data.projectSelectorBottom);
  console.log('Create title top:', data.createTitleTop);
  console.log('Sidebar top:', data.sidebarTop);
  console.log('');
  console.log('Gap from project selector to Create:', data.createTitleTop - data.projectSelectorBottom, 'px');
  
  await browser.close();
}

check().catch(console.error);
