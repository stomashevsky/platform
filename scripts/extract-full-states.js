const { chromium } = require('playwright');

async function extract() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  // Normal state extraction
  const normalState = await page.evaluate(() => {
    const result = {};
    
    // Find sidebar
    const chatItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Chat' && e.querySelector('svg')
    );
    let sidebar = chatItem;
    while (sidebar && sidebar.tagName !== 'NAV' && sidebar.tagName !== 'ASIDE') {
      sidebar = sidebar.parentElement;
    }
    const sidebarRect = sidebar?.getBoundingClientRect();
    
    result.sidebar = {
      width: Math.round(sidebarRect?.width || 0),
      paddingTop: getComputedStyle(sidebar).paddingTop,
      paddingBottom: getComputedStyle(sidebar).paddingBottom,
    };
    
    // Create title
    const createTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Create' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().width < 200 &&
      e.getBoundingClientRect().top < 200
    );
    const createRect = createTitle?.getBoundingClientRect();
    const createStyle = createTitle ? getComputedStyle(createTitle) : null;
    
    result.sectionTitle = {
      left: Math.round((createRect?.left || 0) - (sidebarRect?.left || 0)),
      top: Math.round((createRect?.top || 0) - (sidebarRect?.top || 0)),
      height: Math.round(createRect?.height || 0),
      fontSize: createStyle?.fontSize,
      fontWeight: createStyle?.fontWeight,
      color: createStyle?.color,
      paddingLeft: createStyle?.paddingLeft,
    };
    
    // Chat item (active)
    const chatRect = chatItem?.getBoundingClientRect();
    const chatStyle = chatItem ? getComputedStyle(chatItem) : null;
    const chatIcon = chatItem?.querySelector('svg');
    const chatIconRect = chatIcon?.getBoundingClientRect();
    
    // Check for ::before pseudo-element
    const chatBefore = chatItem ? getComputedStyle(chatItem, '::before') : null;
    
    result.activeItem = {
      left: Math.round((chatRect?.left || 0) - (sidebarRect?.left || 0)),
      width: Math.round(chatRect?.width || 0),
      height: Math.round(chatRect?.height || 0),
      paddingLeft: chatStyle?.paddingLeft,
      paddingRight: chatStyle?.paddingRight,
      borderRadius: chatStyle?.borderRadius,
      backgroundColor: chatStyle?.backgroundColor,
      color: chatStyle?.color,
      fontWeight: chatStyle?.fontWeight,
      fontSize: chatStyle?.fontSize,
      gap: chatStyle?.gap,
      iconLeft: Math.round((chatIconRect?.left || 0) - (sidebarRect?.left || 0)),
      iconWidth: Math.round(chatIconRect?.width || 0),
      beforeBg: chatBefore?.backgroundColor,
      beforeBorderRadius: chatBefore?.borderRadius,
    };
    
    // Inactive item (ChatGPT Apps)
    const appsItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.includes('ChatGPT Apps') && e.querySelector('svg')
    );
    const appsRect = appsItem?.getBoundingClientRect();
    const appsStyle = appsItem ? getComputedStyle(appsItem) : null;
    
    result.inactiveItem = {
      left: Math.round((appsRect?.left || 0) - (sidebarRect?.left || 0)),
      width: Math.round(appsRect?.width || 0),
      height: Math.round(appsRect?.height || 0),
      backgroundColor: appsStyle?.backgroundColor,
      color: appsStyle?.color,
    };
    
    // Gap between items
    result.itemGap = Math.round((appsRect?.top || 0) - ((chatRect?.top || 0) + (chatRect?.height || 0)));
    
    // Section gap (Assistants to Manage title)
    const assistantsItem = Array.from(document.querySelectorAll('a, button')).find(e => 
      e.textContent?.trim() === 'Assistants' && e.querySelector('svg')
    );
    const manageTitle = Array.from(document.querySelectorAll('*')).find(e => 
      e.textContent?.trim() === 'Manage' && 
      e.children.length === 0 &&
      e.getBoundingClientRect().width < 200
    );
    if (assistantsItem && manageTitle) {
      const assRect = assistantsItem.getBoundingClientRect();
      const manRect = manageTitle.getBoundingClientRect();
      result.sectionGap = Math.round(manRect.top - (assRect.top + assRect.height));
    }
    
    // Add credits card
    const billingBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent?.trim() === 'Go to Billing'
    );
    let card = billingBtn?.parentElement;
    while (card) {
      const s = getComputedStyle(card);
      const rect = card.getBoundingClientRect();
      if (s.borderRadius !== '0px' && rect.width > 100 && rect.width < 250) {
        break;
      }
      card = card.parentElement;
    }
    const cardRect = card?.getBoundingClientRect();
    const cardStyle = card ? getComputedStyle(card) : null;
    const billingBtnStyle = billingBtn ? getComputedStyle(billingBtn) : null;
    
    result.creditsCard = {
      width: Math.round(cardRect?.width || 0),
      height: Math.round(cardRect?.height || 0),
      left: Math.round((cardRect?.left || 0) - (sidebarRect?.left || 0)),
      padding: cardStyle?.padding,
      margin: cardStyle?.margin,
      borderRadius: cardStyle?.borderRadius,
      backgroundColor: cardStyle?.backgroundColor,
      border: cardStyle?.border,
    };
    
    result.billingBtn = {
      height: Math.round(billingBtn?.getBoundingClientRect().height || 0),
      paddingLeft: billingBtnStyle?.paddingLeft,
      paddingRight: billingBtnStyle?.paddingRight,
      borderRadius: billingBtnStyle?.borderRadius,
      fontSize: billingBtnStyle?.fontSize,
      fontWeight: billingBtnStyle?.fontWeight,
    };
    
    // Collapse button
    const collapseBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const rect = b.getBoundingClientRect();
      const svg = b.querySelector('svg');
      return rect.top > 750 && rect.left < 300 && svg && rect.width < 50;
    });
    const collapseBtnRect = collapseBtn?.getBoundingClientRect();
    const collapseBtnStyle = collapseBtn ? getComputedStyle(collapseBtn) : null;
    
    result.collapseBtn = {
      left: Math.round((collapseBtnRect?.left || 0) - (sidebarRect?.left || 0)),
      width: Math.round(collapseBtnRect?.width || 0),
      height: Math.round(collapseBtnRect?.height || 0),
      padding: collapseBtnStyle?.padding,
      borderRadius: collapseBtnStyle?.borderRadius,
      color: collapseBtnStyle?.color,
    };
    
    return result;
  });
  
  console.log('=== OpenAI Full State Extraction ===\n');
  console.log('SIDEBAR:');
  console.log(JSON.stringify(normalState.sidebar, null, 2));
  console.log('\nSECTION TITLE:');
  console.log(JSON.stringify(normalState.sectionTitle, null, 2));
  console.log('\nACTIVE ITEM (Chat):');
  console.log(JSON.stringify(normalState.activeItem, null, 2));
  console.log('\nINACTIVE ITEM (ChatGPT Apps):');
  console.log(JSON.stringify(normalState.inactiveItem, null, 2));
  console.log('\nITEM GAP:', normalState.itemGap, 'px');
  console.log('SECTION GAP:', normalState.sectionGap, 'px');
  console.log('\nCREDITS CARD:');
  console.log(JSON.stringify(normalState.creditsCard, null, 2));
  console.log('\nBILLING BUTTON:');
  console.log(JSON.stringify(normalState.billingBtn, null, 2));
  console.log('\nCOLLAPSE BUTTON:');
  console.log(JSON.stringify(normalState.collapseBtn, null, 2));
  
  // Now get hover state for inactive item
  const appsItem = await page.$('button:has-text("ChatGPT Apps"), a:has-text("ChatGPT Apps")');
  if (appsItem) {
    await appsItem.hover();
    await page.waitForTimeout(100);
    
    const hoverState = await page.evaluate(() => {
      const item = Array.from(document.querySelectorAll('a, button')).find(e => 
        e.textContent?.includes('ChatGPT Apps') && e.querySelector('svg')
      );
      const s = item ? getComputedStyle(item) : null;
      const before = item ? getComputedStyle(item, '::before') : null;
      return {
        backgroundColor: s?.backgroundColor,
        color: s?.color,
        beforeBg: before?.backgroundColor,
      };
    });
    
    console.log('\nHOVER STATE (ChatGPT Apps):');
    console.log(JSON.stringify(hoverState, null, 2));
  }
  
  // Get hover state for collapse button
  const collapseBtn = await page.$('button:has(svg):below(:text("Fine-tuning"))');
  if (collapseBtn) {
    await collapseBtn.hover();
    await page.waitForTimeout(100);
    
    const collapseHover = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => {
        const rect = b.getBoundingClientRect();
        const svg = b.querySelector('svg');
        return rect.top > 750 && rect.left < 300 && svg && rect.width < 50;
      });
      const s = btn ? getComputedStyle(btn) : null;
      return {
        backgroundColor: s?.backgroundColor,
        color: s?.color,
      };
    });
    
    console.log('\nCOLLAPSE BUTTON HOVER:');
    console.log(JSON.stringify(collapseHover, null, 2));
  }
  
  await browser.close();
}

extract().catch(console.error);
