const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const data = await page.evaluate(() => {
    const result = {};
    
    // Section title "Create"
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().left < 300
    );
    if (createTitle) {
      const rect = createTitle.getBoundingClientRect();
      result.createTitle = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        textLeft: Math.round(rect.left) // where text starts
      };
    }
    
    // Chat item text position
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    if (chatItem) {
      const rect = chatItem.getBoundingClientRect();
      // Find the text span
      const spans = chatItem.querySelectorAll('span, div');
      let textSpan = null;
      spans.forEach(span => {
        if (span.textContent?.trim() === 'Chat' && span.children.length === 0) {
          textSpan = span;
        }
      });
      
      result.chatItem = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        textLeft: textSpan ? Math.round(textSpan.getBoundingClientRect().left) : null
      };
    }
    
    // Collapse button icon size
    const collapseBtn = Array.from(document.querySelectorAll('button')).find(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.left < 100 && rect.bottom > window.innerHeight - 100 && btn.querySelector('svg');
    });
    if (collapseBtn) {
      const svg = collapseBtn.querySelector('svg');
      const btnRect = collapseBtn.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      result.collapseButton = {
        btnWidth: Math.round(btnRect.width),
        btnHeight: Math.round(btnRect.height),
        iconWidth: Math.round(svgRect.width),
        iconHeight: Math.round(svgRect.height),
        svgViewBox: svg.getAttribute('viewBox'),
        left: Math.round(btnRect.left)
      };
    }
    
    // Gap between header and sidebar content
    const header = document.querySelector('header');
    if (header) {
      result.headerBottom = Math.round(header.getBoundingClientRect().bottom);
    }
    
    return result;
  });
  
  console.log('=== OpenAI Sidebar Details ===\n');
  console.log('Create title:');
  console.log(`  left: ${data.createTitle?.left}px`);
  console.log(`  top: ${data.createTitle?.top}px`);
  console.log('');
  console.log('Chat item:');
  console.log(`  item left: ${data.chatItem?.left}px`);
  console.log(`  text left: ${data.chatItem?.textLeft}px`);
  console.log(`  top: ${data.chatItem?.top}px`);
  console.log('');
  console.log('Title vs Text alignment:');
  console.log(`  Create title left: ${data.createTitle?.left}px`);
  console.log(`  Chat text left: ${data.chatItem?.textLeft}px`);
  console.log(`  Difference: ${data.chatItem?.textLeft - data.createTitle?.left}px`);
  console.log('');
  console.log('Collapse button:');
  console.log(`  btn size: ${data.collapseButton?.btnWidth}x${data.collapseButton?.btnHeight}px`);
  console.log(`  icon size: ${data.collapseButton?.iconWidth}x${data.collapseButton?.iconHeight}px`);
  console.log(`  left: ${data.collapseButton?.left}px`);
  console.log('');
  console.log('Header bottom:', data.headerBottom);
  console.log('Create top:', data.createTitle?.top);
  console.log('Gap from header:', data.createTitle?.top - data.headerBottom, 'px');
  
  await browser.close();
}

check().catch(console.error);
