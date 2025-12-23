const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    // Find "Go to Billing" button
    const billingBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent?.trim() === 'Go to Billing'
    );
    
    // Find card container (parent with background/border)
    let card = billingBtn;
    while (card) {
      const s = getComputedStyle(card);
      if (s.backgroundColor !== 'rgba(0, 0, 0, 0)' || s.borderRadius !== '0px') {
        break;
      }
      card = card.parentElement;
    }
    
    const cardRect = card?.getBoundingClientRect();
    const cardStyle = card ? getComputedStyle(card) : null;
    
    // Find collapse icon at bottom
    const allButtons = Array.from(document.querySelectorAll('button, [role="button"]'));
    const collapseBtn = allButtons.find(b => {
      const rect = b.getBoundingClientRect();
      const svg = b.querySelector('svg');
      // Look for button at bottom left with small size
      return rect.top > 600 && rect.left < 300 && svg && rect.width < 100;
    });
    
    const btnRect = collapseBtn?.getBoundingClientRect();
    const btnStyle = collapseBtn ? getComputedStyle(collapseBtn) : null;
    
    // Check hover state class
    const btnClasses = collapseBtn?.className;
    
    return {
      card: {
        width: Math.round(cardRect?.width || 0),
        height: Math.round(cardRect?.height || 0),
        padding: cardStyle?.padding,
        margin: cardStyle?.margin,
        borderRadius: cardStyle?.borderRadius,
        backgroundColor: cardStyle?.backgroundColor,
        border: cardStyle?.border
      },
      collapseButton: {
        width: Math.round(btnRect?.width || 0),
        height: Math.round(btnRect?.height || 0),
        top: Math.round(btnRect?.top || 0),
        padding: btnStyle?.padding,
        borderRadius: btnStyle?.borderRadius,
        classes: btnClasses
      },
      billingButton: {
        height: Math.round(billingBtn?.getBoundingClientRect().height || 0),
        borderRadius: billingBtn ? getComputedStyle(billingBtn).borderRadius : null
      }
    };
  });
  
  console.log('=== OpenAI Footer Details ===\n');
  console.log('Add Credits Card:');
  console.log('  width:', data.card?.width, 'px');
  console.log('  height:', data.card?.height, 'px');
  console.log('  padding:', data.card?.padding);
  console.log('  margin:', data.card?.margin);
  console.log('  borderRadius:', data.card?.borderRadius);
  console.log('  backgroundColor:', data.card?.backgroundColor);
  console.log('  border:', data.card?.border);
  console.log('');
  console.log('Collapse Button:');
  console.log('  width:', data.collapseButton?.width, 'px');
  console.log('  height:', data.collapseButton?.height, 'px');
  console.log('  padding:', data.collapseButton?.padding);
  console.log('  borderRadius:', data.collapseButton?.borderRadius);
  console.log('');
  console.log('Go to Billing button:');
  console.log('  height:', data.billingButton?.height, 'px');
  console.log('  borderRadius:', data.billingButton?.borderRadius);
  
  await browser.close();
}

check().catch(console.error);
