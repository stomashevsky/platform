const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractDetailedStyles() {
  console.log('🔌 Подключение к Chrome...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ Страница не найдена');
    await browser.close();
    return;
  }
  
  console.log('✅ Подключено к:', page.url());
  
  const results = await page.evaluate(() => {
    const data = {
      sidebarPadding: {},
      hoverColors: {},
      navbar: {},
      footerCard: {},
    };
    
    const sidebar = document.querySelector('aside.JiHZk');
    if (!sidebar) return { error: 'Sidebar not found' };
    
    // 1. SIDEBAR PADDING - get exact left/right positions
    console.log('Extracting sidebar padding...');
    
    // Get sidebar bounds
    const sidebarRect = sidebar.getBoundingClientRect();
    
    // Get first menu item position
    const firstMenuItem = sidebar.querySelector('a.k-D0f._8xE3c');
    const menuItemRect = firstMenuItem?.getBoundingClientRect();
    
    // Get section title position
    const sectionTitle = sidebar.querySelector('h3.cTBD-');
    const titleRect = sectionTitle?.getBoundingClientRect();
    
    if (menuItemRect && sidebarRect) {
      data.sidebarPadding = {
        sidebarWidth: sidebarRect.width,
        menuItem: {
          leftFromSidebar: menuItemRect.left - sidebarRect.left,
          rightFromSidebar: sidebarRect.right - menuItemRect.right,
          width: menuItemRect.width,
          height: menuItemRect.height,
        },
        sectionTitle: titleRect ? {
          leftFromSidebar: titleRect.left - sidebarRect.left,
          rightFromSidebar: sidebarRect.right - titleRect.right,
          width: titleRect.width,
        } : null,
        // Content wrapper details
        contentWrapper: (() => {
          const wrapper = sidebar.querySelector('div.sQbJC');
          if (!wrapper) return null;
          const s = getComputedStyle(wrapper);
          return {
            margin: s.margin,
            padding: s.padding,
            width: wrapper.getBoundingClientRect().width,
          };
        })(),
      };
    }
    
    // 2. HOVER COLORS - get ::before opacity states
    const activeItem = sidebar.querySelector('a.k-D0f._8xE3c.rZ3k-');
    const inactiveItem = sidebar.querySelector('a.k-D0f._8xE3c:not(.rZ3k-)');
    
    if (activeItem) {
      const beforeActive = getComputedStyle(activeItem, '::before');
      data.hoverColors.active = {
        beforeBg: beforeActive.backgroundColor,
        beforeOpacity: beforeActive.opacity,
        beforeBorderRadius: beforeActive.borderRadius,
      };
    }
    
    if (inactiveItem) {
      const beforeInactive = getComputedStyle(inactiveItem, '::before');
      data.hoverColors.inactive = {
        beforeBg: beforeInactive.backgroundColor,
        beforeOpacity: beforeInactive.opacity,
      };
    }
    
    // 3. NAVBAR - header styles
    const header = document.querySelector('header') || document.querySelector('[role="banner"]');
    if (header) {
      // Project selector
      const projectBtn = header.querySelector('button');
      if (projectBtn) {
        const s = getComputedStyle(projectBtn);
        data.navbar.projectSelector = {
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          fontFamily: s.fontFamily,
          color: s.color,
          letterSpacing: s.letterSpacing,
        };
      }
      
      // Nav links (Dashboard, Docs, API reference)
      const navLinks = header.querySelectorAll('a, button');
      const navItems = [];
      navLinks.forEach(link => {
        const text = link.textContent?.trim();
        if (text && ['Dashboard', 'Docs', 'API reference'].includes(text)) {
          const s = getComputedStyle(link);
          navItems.push({
            text,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            color: s.color,
            letterSpacing: s.letterSpacing,
          });
        }
      });
      data.navbar.navItems = navItems;
      
      // Settings icon
      const settingsIcon = header.querySelector('svg');
      if (settingsIcon) {
        const parent = settingsIcon.parentElement;
        if (parent) {
          data.navbar.settingsIcon = {
            width: settingsIcon.getAttribute('width') || getComputedStyle(settingsIcon).width,
            height: settingsIcon.getAttribute('height') || getComputedStyle(settingsIcon).height,
          };
        }
      }
    }
    
    // 4. FOOTER CARD (Add Credits)
    const footerCard = sidebar.querySelector('div.eE5Hy');
    if (footerCard) {
      const cardStyles = getComputedStyle(footerCard);
      
      // Card container
      data.footerCard.container = {
        width: footerCard.getBoundingClientRect().width,
        height: footerCard.getBoundingClientRect().height,
        padding: cardStyles.padding,
        margin: cardStyles.margin,
        backgroundColor: cardStyles.backgroundColor,
        borderRadius: cardStyles.borderRadius,
        border: cardStyles.border,
        leftFromSidebar: footerCard.getBoundingClientRect().left - sidebarRect.left,
      };
      
      // "Add credits" title
      const titleEl = footerCard.querySelector('strong');
      if (titleEl) {
        const s = getComputedStyle(titleEl);
        data.footerCard.title = {
          text: titleEl.textContent,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          lineHeight: s.lineHeight,
        };
      }
      
      // Description text
      const descEl = footerCard.querySelector('span.text-secondary') || 
                     footerCard.querySelector('span:not(:first-child)');
      if (descEl) {
        const s = getComputedStyle(descEl);
        data.footerCard.description = {
          text: descEl.textContent?.trim(),
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          lineHeight: s.lineHeight,
        };
      }
      
      // "Go to Billing" button
      const billingBtn = footerCard.querySelector('a.lkCln');
      if (billingBtn) {
        const s = getComputedStyle(billingBtn);
        const beforeS = getComputedStyle(billingBtn, '::before');
        data.footerCard.billingButton = {
          width: billingBtn.getBoundingClientRect().width,
          height: billingBtn.getBoundingClientRect().height,
          padding: s.padding,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          borderRadius: s.borderRadius,
          backgroundColor: s.backgroundColor,
          beforeBg: beforeS.backgroundColor,
        };
      }
      
      // Close button (X icon)
      const closeBtn = footerCard.querySelector('button');
      if (closeBtn) {
        const svg = closeBtn.querySelector('svg');
        data.footerCard.closeButton = {
          width: closeBtn.getBoundingClientRect().width,
          height: closeBtn.getBoundingClientRect().height,
          iconSize: svg ? {
            width: svg.getAttribute('width'),
            height: svg.getAttribute('height'),
          } : null,
        };
      }
      
      // Arrow icon next to "Add credits"
      const arrowIcon = footerCard.querySelector('div.C7fBq svg');
      if (arrowIcon) {
        data.footerCard.arrowIcon = {
          width: arrowIcon.getAttribute('width'),
          height: arrowIcon.getAttribute('height'),
        };
      }
    }
    
    return data;
  });
  
  if (results.error) {
    console.log('  ⚠️', results.error);
    await browser.close();
    return;
  }
  
  console.log('\n📐 SIDEBAR PADDING:');
  console.log('  Sidebar width:', results.sidebarPadding.sidebarWidth);
  console.log('  Menu item left from sidebar:', results.sidebarPadding.menuItem?.leftFromSidebar);
  console.log('  Menu item right from sidebar:', results.sidebarPadding.menuItem?.rightFromSidebar);
  console.log('  Menu item width:', results.sidebarPadding.menuItem?.width);
  console.log('  Content wrapper margin:', results.sidebarPadding.contentWrapper?.margin);
  console.log('  Content wrapper padding:', results.sidebarPadding.contentWrapper?.padding);
  
  console.log('\n🎨 HOVER COLORS:');
  console.log('  Active ::before bg:', results.hoverColors.active?.beforeBg);
  console.log('  Active ::before opacity:', results.hoverColors.active?.beforeOpacity);
  console.log('  Inactive ::before bg:', results.hoverColors.inactive?.beforeBg);
  console.log('  Inactive ::before opacity:', results.hoverColors.inactive?.beforeOpacity);
  
  console.log('\n📍 NAVBAR:');
  console.log('  Project selector:', results.navbar.projectSelector);
  console.log('  Nav items:', results.navbar.navItems);
  
  console.log('\n💳 FOOTER CARD:');
  console.log('  Container:', results.footerCard.container);
  console.log('  Title:', results.footerCard.title);
  console.log('  Description:', results.footerCard.description);
  console.log('  Billing button:', results.footerCard.billingButton);
  console.log('  Close button:', results.footerCard.closeButton);
  
  // Save
  const refDir = path.join(__dirname, '../reference');
  const outputPath = path.join(refDir, 'detailed-fixes.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('\n✅ Сохранено:', outputPath);
  
  // Now test hover state
  console.log('\n🖱️ Testing hover state...');
  const inactiveItem = await page.$('aside.JiHZk a.k-D0f._8xE3c:not(.rZ3k-)');
  if (inactiveItem) {
    await inactiveItem.hover();
    await page.waitForTimeout(200);
    
    const hoverState = await page.evaluate(() => {
      const sidebar = document.querySelector('aside.JiHZk');
      const item = sidebar?.querySelector('a.k-D0f._8xE3c:not(.rZ3k-)');
      if (!item) return null;
      
      const beforeS = getComputedStyle(item, '::before');
      return {
        beforeBg: beforeS.backgroundColor,
        beforeOpacity: beforeS.opacity,
      };
    });
    
    console.log('  Hover ::before bg:', hoverState?.beforeBg);
    console.log('  Hover ::before opacity:', hoverState?.beforeOpacity);
    
    results.hoverColors.hover = hoverState;
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  }
  
  await browser.close();
}

extractDetailedStyles().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

