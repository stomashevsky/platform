const { chromium } = require('playwright');

(async () => {
  console.log('Connecting to Chrome via CDP...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.log('Page not found');
    await browser.close();
    return;
  }
  
  console.log('Connected to:', page.url());
  
  // 1. Extract right padding behavior at current viewport
  const layoutData = await page.evaluate(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Find main content card
    const card = document.querySelector('div[class*="zYlRN"]') || 
                 document.querySelector('main')?.parentElement ||
                 Array.from(document.querySelectorAll('div')).find(el => {
                   const s = getComputedStyle(el);
                   return s.backgroundColor === 'rgb(255, 255, 255)' && 
                          s.borderRadius === '8px' &&
                          el.getBoundingClientRect().width > 500;
                 });
    
    const sidebar = document.querySelector('aside');
    const header = Array.from(document.querySelectorAll('div')).find(el => {
      const s = getComputedStyle(el);
      return s.position === 'fixed' && s.top === '0px' && el.getBoundingClientRect().height === 54;
    });
    
    const cardRect = card?.getBoundingClientRect();
    const sidebarRect = sidebar?.getBoundingClientRect();
    const headerRect = header?.getBoundingClientRect();
    
    return {
      viewport,
      header: headerRect ? {
        left: headerRect.left,
        right: headerRect.right,
        width: headerRect.width,
        rightGap: viewport.width - headerRect.right,
        styles: {
          left: getComputedStyle(header).left,
          right: getComputedStyle(header).right
        }
      } : null,
      sidebar: sidebarRect ? {
        left: sidebarRect.left,
        right: sidebarRect.right,
        width: sidebarRect.width
      } : null,
      card: cardRect ? {
        left: cardRect.left,
        right: cardRect.right,
        width: cardRect.width,
        rightGap: viewport.width - cardRect.right,
        gapFromSidebar: cardRect.left - (sidebarRect?.right || 0)
      } : null,
      calculation: {
        expectedRightGap: 8,
        actualRightGap: cardRect ? viewport.width - cardRect.right : null
      }
    };
  });
  
  console.log('\n=== LAYOUT DATA (Current Viewport) ===');
  console.log(JSON.stringify(layoutData, null, 2));
  
  // 2. Extract sidebar scroll behavior
  const sidebarScrollData = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    const scrollContainer = sidebar?.querySelector('div');
    const footer = sidebar?.lastElementChild;
    
    const sidebarStyles = sidebar ? getComputedStyle(sidebar) : null;
    const scrollStyles = scrollContainer ? getComputedStyle(scrollContainer) : null;
    
    return {
      sidebar: sidebar ? {
        height: sidebar.offsetHeight,
        overflow: sidebarStyles?.overflow,
        overflowY: sidebarStyles?.overflowY,
        display: sidebarStyles?.display,
        flexDirection: sidebarStyles?.flexDirection
      } : null,
      scrollContainer: scrollContainer ? {
        height: scrollContainer.offsetHeight,
        scrollHeight: scrollContainer.scrollHeight,
        overflow: scrollStyles?.overflow,
        overflowY: scrollStyles?.overflowY,
        flexGrow: scrollStyles?.flexGrow,
        flexShrink: scrollStyles?.flexShrink
      } : null,
      footer: footer ? {
        height: footer.offsetHeight,
        flexShrink: getComputedStyle(footer).flexShrink
      } : null,
      isScrollable: scrollContainer ? scrollContainer.scrollHeight > scrollContainer.clientHeight : false
    };
  });
  
  console.log('\n=== SIDEBAR SCROLL DATA ===');
  console.log(JSON.stringify(sidebarScrollData, null, 2));
  
  // 3. Resize to small height and check behavior
  await page.setViewportSize({ width: 1060, height: 450 });
  await page.waitForTimeout(500);
  
  const smallHeightData = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    const scrollContainer = sidebar?.querySelector('div');
    const footer = sidebar?.lastElementChild;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    
    const sidebarRect = sidebar?.getBoundingClientRect();
    const footerRect = footer?.getBoundingClientRect();
    const scrollStyles = scrollContainer ? getComputedStyle(scrollContainer) : null;
    
    return {
      viewport,
      sidebar: sidebarRect ? {
        height: sidebarRect.height,
        bottom: sidebarRect.bottom,
        extendsBelow: sidebarRect.bottom > viewport.height
      } : null,
      scrollContainer: scrollContainer ? {
        overflowY: scrollStyles?.overflowY,
        isScrollable: scrollContainer.scrollHeight > scrollContainer.clientHeight,
        scrollHeight: scrollContainer.scrollHeight,
        clientHeight: scrollContainer.clientHeight
      } : null,
      footer: footerRect ? {
        top: footerRect.top,
        bottom: footerRect.bottom,
        isVisible: footerRect.bottom <= viewport.height
      } : null
    };
  });
  
  console.log('\n=== SMALL HEIGHT BEHAVIOR (450px) ===');
  console.log(JSON.stringify(smallHeightData, null, 2));
  
  // 4. Resize to mobile and check behavior
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  
  const mobileData = await page.evaluate(() => {
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const sidebar = document.querySelector('aside');
    const header = Array.from(document.querySelectorAll('div')).find(el => {
      const s = getComputedStyle(el);
      return s.position === 'fixed' && s.top === '0px' && el.getBoundingClientRect().height === 54;
    }) || document.querySelector('header');
    
    // Check for hamburger menu
    const hamburger = document.querySelector('button[aria-label*="menu"]') ||
                      document.querySelector('button[aria-label*="Menu"]') ||
                      document.querySelector('[data-testid="hamburger"]') ||
                      Array.from(document.querySelectorAll('button')).find(btn => {
                        const svg = btn.querySelector('svg');
                        return svg && btn.offsetWidth < 50 && btn.offsetHeight < 50;
                      });
    
    const sidebarStyles = sidebar ? getComputedStyle(sidebar) : null;
    const sidebarRect = sidebar?.getBoundingClientRect();
    
    return {
      viewport,
      sidebar: sidebar ? {
        display: sidebarStyles?.display,
        visibility: sidebarStyles?.visibility,
        opacity: sidebarStyles?.opacity,
        position: sidebarStyles?.position,
        width: sidebarStyles?.width,
        transform: sidebarStyles?.transform,
        left: sidebarRect?.left,
        isHidden: sidebarStyles?.display === 'none' || 
                  sidebarStyles?.visibility === 'hidden' ||
                  parseFloat(sidebarStyles?.opacity) === 0
      } : 'not found',
      header: header ? {
        height: header.offsetHeight,
        childCount: header.children.length
      } : 'not found',
      hamburgerFound: !!hamburger,
      hamburgerDetails: hamburger ? {
        tagName: hamburger.tagName,
        ariaLabel: hamburger.getAttribute('aria-label'),
        width: hamburger.offsetWidth,
        height: hamburger.offsetHeight
      } : null,
      isMobileLayout: viewport.width < 768
    };
  });
  
  console.log('\n=== MOBILE BEHAVIOR (375px) ===');
  console.log(JSON.stringify(mobileData, null, 2));
  
  // Take screenshots
  await page.screenshot({ path: 'reference/screenshots/openai-mobile-375.png' });
  console.log('\nSaved mobile screenshot');
  
  // Resize back to normal
  await page.setViewportSize({ width: 1060, height: 800 });
  
  // Save all data to JSON
  const fs = require('fs');
  const allData = {
    timestamp: new Date().toISOString(),
    layout: layoutData,
    sidebarScroll: sidebarScrollData,
    smallHeight: smallHeightData,
    mobile: mobileData
  };
  
  fs.writeFileSync('reference/layout-behavior.json', JSON.stringify(allData, null, 2));
  console.log('\nSaved all data to reference/layout-behavior.json');
  
  await browser.close();
})();

