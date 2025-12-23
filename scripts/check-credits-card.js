const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    // Find "Add credits" text
    const addCreditsText = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Add credits' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().width < 200
    );
    
    if (!addCreditsText) return { error: 'Add credits text not found' };
    
    // Find card container
    let card = addCreditsText.parentElement;
    while (card) {
      const s = getComputedStyle(card);
      if (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.borderRadius !== '0px') {
        break;
      }
      card = card.parentElement;
    }
    
    const cardRect = card?.getBoundingClientRect();
    const cardStyle = card ? getComputedStyle(card) : null;
    
    // Find Go to Billing button
    const billingBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent?.trim() === 'Go to Billing'
    );
    const btnRect = billingBtn?.getBoundingClientRect();
    const btnStyle = billingBtn ? getComputedStyle(billingBtn) : null;
    
    // Find close button (X)
    const closeBtn = card?.querySelector('button');
    const closeBtnRect = closeBtn?.getBoundingClientRect();
    
    // Find collapse button
    const collapseBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const rect = b.getBoundingClientRect();
      return rect.top > 700 && rect.left < 300 && b.querySelector('svg');
    });
    const collapseBtnRect = collapseBtn?.getBoundingClientRect();
    const collapseBtnStyle = collapseBtn ? getComputedStyle(collapseBtn) : null;
    
    // Get sidebar for reference
    const sidebar = document.querySelector('nav') || document.querySelector('aside');
    const sidebarRect = sidebar?.getBoundingClientRect();
    
    return {
      card: {
        width: Math.round(cardRect?.width || 0),
        height: Math.round(cardRect?.height || 0),
        left: Math.round((cardRect?.left || 0) - (sidebarRect?.left || 0)),
        padding: cardStyle?.padding,
        margin: cardStyle?.margin,
        borderRadius: cardStyle?.borderRadius,
        backgroundColor: cardStyle?.backgroundColor,
        border: cardStyle?.border,
        boxShadow: cardStyle?.boxShadow
      },
      goToBillingBtn: {
        width: Math.round(btnRect?.width || 0),
        height: Math.round(btnRect?.height || 0),
        padding: btnStyle?.padding,
        borderRadius: btnStyle?.borderRadius,
        fontSize: btnStyle?.fontSize,
        fontWeight: btnStyle?.fontWeight
      },
      addCreditsTitle: {
        fontSize: getComputedStyle(addCreditsText).fontSize,
        fontWeight: getComputedStyle(addCreditsText).fontWeight
      },
      collapseButton: {
        width: Math.round(collapseBtnRect?.width || 0),
        height: Math.round(collapseBtnRect?.height || 0),
        left: Math.round((collapseBtnRect?.left || 0) - (sidebarRect?.left || 0)),
        padding: collapseBtnStyle?.padding,
        borderRadius: collapseBtnStyle?.borderRadius
      }
    };
  });
  
  console.log('=== OpenAI Add Credits Card ===\n');
  console.log('Card:');
  console.log('  width:', data.card?.width, 'px');
  console.log('  height:', data.card?.height, 'px');
  console.log('  left from sidebar:', data.card?.left, 'px');
  console.log('  padding:', data.card?.padding);
  console.log('  margin:', data.card?.margin);
  console.log('  borderRadius:', data.card?.borderRadius);
  console.log('  backgroundColor:', data.card?.backgroundColor);
  console.log('  border:', data.card?.border);
  console.log('  boxShadow:', data.card?.boxShadow);
  console.log('');
  console.log('Go to Billing button:');
  console.log('  width:', data.goToBillingBtn?.width, 'px');
  console.log('  height:', data.goToBillingBtn?.height, 'px');
  console.log('  padding:', data.goToBillingBtn?.padding);
  console.log('  borderRadius:', data.goToBillingBtn?.borderRadius);
  console.log('  fontSize:', data.goToBillingBtn?.fontSize);
  console.log('  fontWeight:', data.goToBillingBtn?.fontWeight);
  console.log('');
  console.log('Add credits title:');
  console.log('  fontSize:', data.addCreditsTitle?.fontSize);
  console.log('  fontWeight:', data.addCreditsTitle?.fontWeight);
  console.log('');
  console.log('Collapse button:');
  console.log('  width:', data.collapseButton?.width, 'px');
  console.log('  height:', data.collapseButton?.height, 'px');
  console.log('  left from sidebar:', data.collapseButton?.left, 'px');
  console.log('  padding:', data.collapseButton?.padding);
  console.log('  borderRadius:', data.collapseButton?.borderRadius);
  
  await browser.close();
}

check().catch(console.error);
