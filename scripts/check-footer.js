const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    // Find Add credits card
    const addCredits = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.includes('Add credits') && 
      e.textContent?.includes('Go to Billing') &&
      e.getBoundingClientRect().width < 300
    );
    
    if (!addCredits) return { error: 'Add credits card not found' };
    
    const cardRect = addCredits.getBoundingClientRect();
    const cardStyle = getComputedStyle(addCredits);
    
    // Find collapse button (sidebar icon)
    const collapseBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const rect = b.getBoundingClientRect();
      return rect.top > 700 && rect.left < 300 && rect.width < 60;
    });
    
    const btnRect = collapseBtn?.getBoundingClientRect();
    const btnStyle = collapseBtn ? getComputedStyle(collapseBtn) : null;
    
    // Find sidebar bottom
    const sidebar = document.querySelector('nav') || document.querySelector('aside');
    const sidebarRect = sidebar?.getBoundingClientRect();
    
    return {
      card: {
        width: Math.round(cardRect.width),
        padding: cardStyle.padding,
        margin: cardStyle.margin,
        borderRadius: cardStyle.borderRadius,
        backgroundColor: cardStyle.backgroundColor,
        border: cardStyle.border,
        boxShadow: cardStyle.boxShadow
      },
      collapseButton: {
        width: Math.round(btnRect?.width || 0),
        height: Math.round(btnRect?.height || 0),
        padding: btnStyle?.padding,
        distanceFromBottom: sidebarRect ? Math.round(sidebarRect.bottom - (btnRect?.bottom || 0)) : null
      },
      sidebarHeight: Math.round(sidebarRect?.height || 0)
    };
  });
  
  console.log('=== OpenAI Footer Styles ===\n');
  console.log('Add Credits Card:');
  console.log('  width:', data.card?.width);
  console.log('  padding:', data.card?.padding);
  console.log('  margin:', data.card?.margin);
  console.log('  borderRadius:', data.card?.borderRadius);
  console.log('  backgroundColor:', data.card?.backgroundColor);
  console.log('  border:', data.card?.border);
  console.log('');
  console.log('Collapse Button:');
  console.log('  width:', data.collapseButton?.width);
  console.log('  height:', data.collapseButton?.height);
  console.log('  padding:', data.collapseButton?.padding);
  console.log('  distance from sidebar bottom:', data.collapseButton?.distanceFromBottom);
  
  await browser.close();
}

check().catch(console.error);
