const { chromium } = require('playwright');
const fs = require('fs');

async function extractAll() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  if (!page) { console.error('OpenAI page not found'); return; }
  
  const allStyles = await page.evaluate(() => {
    const result = {
      sidebar: {},
      header: {},
      content: {},
      buttons: {},
      inputs: {},
      cards: {},
      typography: {},
      colors: new Set(),
    };
    
    // Helper to get all styles
    function getStyles(el) {
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        display: s.display,
        flexDirection: s.flexDirection,
        alignItems: s.alignItems,
        justifyContent: s.justifyContent,
        gap: s.gap,
        width: s.width,
        height: s.height,
        minHeight: s.minHeight,
        padding: s.padding,
        paddingTop: s.paddingTop,
        paddingRight: s.paddingRight,
        paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft,
        margin: s.margin,
        marginTop: s.marginTop,
        marginBottom: s.marginBottom,
        marginLeft: s.marginLeft,
        marginRight: s.marginRight,
        backgroundColor: s.backgroundColor,
        color: s.color,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontFamily: s.fontFamily,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        borderRadius: s.borderRadius,
        border: s.border,
        borderColor: s.borderColor,
        boxShadow: s.boxShadow,
        position: s.position,
        top: s.top,
        left: s.left,
        right: s.right,
        bottom: s.bottom,
        overflow: s.overflow,
        textDecoration: s.textDecoration,
        cursor: s.cursor,
        transition: s.transition,
      };
    }
    
    function getPseudoStyles(el, pseudo) {
      if (!el) return null;
      const s = getComputedStyle(el, pseudo);
      return {
        content: s.content,
        backgroundColor: s.backgroundColor,
        borderRadius: s.borderRadius,
        inset: s.inset,
        position: s.position,
      };
    }
    
    // === SIDEBAR ===
    
    // Sidebar container
    const sidebarContainer = document.querySelector('.sQbJC') || document.querySelector('nav');
    result.sidebar.container = getStyles(sidebarContainer);
    
    // Section (pb-3)
    const section = document.querySelector('.pb-3');
    result.sidebar.section = getStyles(section);
    
    // Section title (h3)
    const sectionTitle = document.querySelector('h3.cTBD-') || document.querySelector('.cTBD-');
    result.sidebar.sectionTitle = getStyles(sectionTitle);
    
    // Active sidebar item
    const activeItem = document.querySelector('a[aria-current="page"]') || 
                       document.querySelector('.k-D0f._8xE3c.rZ3k-');
    result.sidebar.activeItem = getStyles(activeItem);
    result.sidebar.activeItemBefore = getPseudoStyles(activeItem, '::before');
    
    // Inactive sidebar item
    const inactiveItem = document.querySelector('.k-D0f._8xE3c:not(.rZ3k-)');
    result.sidebar.inactiveItem = getStyles(inactiveItem);
    result.sidebar.inactiveItemBefore = getPseudoStyles(inactiveItem, '::before');
    
    // Inner span (abr-y)
    const innerSpan = document.querySelector('.abr-y');
    result.sidebar.innerSpan = getStyles(innerSpan);
    
    // Icon container (J42DB)
    const iconContainer = document.querySelector('.J42DB');
    result.sidebar.iconContainer = getStyles(iconContainer);
    
    // Icon SVG
    const iconSvg = iconContainer?.querySelector('svg');
    result.sidebar.iconSvg = getStyles(iconSvg);
    
    // Text label (lp65A)
    const textLabel = document.querySelector('.lp65A');
    result.sidebar.textLabel = getStyles(textLabel);
    
    // === HEADER ===
    
    const header = document.querySelector('header');
    result.header.container = getStyles(header);
    
    // Project selector
    const projectSelector = document.querySelector('[class*="project"]') || 
                            document.querySelector('button:has-text("Personal")');
    result.header.projectSelector = getStyles(projectSelector);
    
    // Navigation buttons (Dashboard, Docs, API)
    const navButtons = document.querySelectorAll('header button, header a');
    if (navButtons.length) {
      result.header.navButton = getStyles(navButtons[0]);
    }
    
    // === MAIN CONTENT ===
    
    const main = document.querySelector('main');
    result.content.main = getStyles(main);
    
    // Page title (h1)
    const h1 = document.querySelector('h1');
    result.typography.h1 = getStyles(h1);
    
    // Subtitle (h2)
    const h2 = document.querySelector('h2');
    result.typography.h2 = getStyles(h2);
    
    // === BUTTONS ===
    
    // Primary button (Create - black)
    const primaryBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const s = getComputedStyle(b);
      return s.backgroundColor === 'rgb(13, 13, 13)' || s.backgroundColor === 'rgb(0, 0, 0)';
    });
    result.buttons.primary = getStyles(primaryBtn);
    
    // Secondary/outline buttons
    const outlineBtn = Array.from(document.querySelectorAll('button')).find(b => {
      const s = getComputedStyle(b);
      return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.border !== 'none';
    });
    result.buttons.outline = getStyles(outlineBtn);
    
    // Chip/tag buttons
    const chipBtn = document.querySelector('[class*="chip"]') || 
                    Array.from(document.querySelectorAll('button')).find(b => {
                      const rect = b.getBoundingClientRect();
                      return rect.height < 40 && rect.height > 25;
                    });
    result.buttons.chip = getStyles(chipBtn);
    
    // === INPUTS ===
    
    const textInput = document.querySelector('input[type="text"], input:not([type])');
    result.inputs.text = getStyles(textInput);
    
    const textarea = document.querySelector('textarea');
    result.inputs.textarea = getStyles(textarea);
    
    // === CARDS ===
    
    // Add credits card
    const creditsCard = Array.from(document.querySelectorAll('div')).find(d => {
      return d.textContent?.includes('Add credits') && d.textContent?.includes('Go to Billing');
    });
    if (creditsCard) {
      // Find actual card container
      let card = creditsCard;
      while (card) {
        const s = getComputedStyle(card);
        if (s.borderRadius !== '0px' && card.getBoundingClientRect().width < 250) {
          break;
        }
        card = card.parentElement;
      }
      result.cards.addCredits = getStyles(card);
    }
    
    // === COLLECT ALL UNIQUE COLORS ===
    
    const allElements = document.querySelectorAll('*');
    const colors = {
      backgrounds: new Set(),
      texts: new Set(),
      borders: new Set(),
    };
    
    allElements.forEach(el => {
      const s = getComputedStyle(el);
      if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colors.backgrounds.add(s.backgroundColor);
      }
      colors.texts.add(s.color);
      if (s.borderColor && s.borderColor !== 'rgba(0, 0, 0, 0)') {
        colors.borders.add(s.borderColor);
      }
    });
    
    result.colors = {
      backgrounds: Array.from(colors.backgrounds),
      texts: Array.from(colors.texts),
      borders: Array.from(colors.borders),
    };
    
    // === PAGE LAYOUT ===
    
    const body = document.body;
    result.layout = {
      body: getStyles(body),
      pageBackground: getComputedStyle(body).backgroundColor,
    };
    
    // Content wrapper
    const contentWrapper = main?.parentElement;
    result.layout.contentWrapper = getStyles(contentWrapper);
    
    return result;
  });
  
  // Save to file
  fs.writeFileSync(
    'reference/openai-all-styles.json',
    JSON.stringify(allStyles, null, 2)
  );
  
  console.log('=== ALL OpenAI Styles Extracted ===\n');
  console.log('Saved to: reference/openai-all-styles.json\n');
  
  // Print key values
  console.log('=== SIDEBAR ===');
  console.log('Section title:', JSON.stringify(allStyles.sidebar.sectionTitle, null, 2));
  console.log('\nActive item:', JSON.stringify(allStyles.sidebar.activeItem, null, 2));
  console.log('\nActive item ::before:', JSON.stringify(allStyles.sidebar.activeItemBefore, null, 2));
  console.log('\nInner span:', JSON.stringify(allStyles.sidebar.innerSpan, null, 2));
  console.log('\nIcon container:', JSON.stringify(allStyles.sidebar.iconContainer, null, 2));
  console.log('\nText label:', JSON.stringify(allStyles.sidebar.textLabel, null, 2));
  
  console.log('\n=== TYPOGRAPHY ===');
  console.log('H1:', JSON.stringify(allStyles.typography.h1, null, 2));
  console.log('H2:', JSON.stringify(allStyles.typography.h2, null, 2));
  
  console.log('\n=== BUTTONS ===');
  console.log('Primary:', JSON.stringify(allStyles.buttons.primary, null, 2));
  
  console.log('\n=== COLORS ===');
  console.log('Backgrounds:', allStyles.colors.backgrounds.slice(0, 10));
  console.log('Texts:', allStyles.colors.texts.slice(0, 10));
  
  await browser.close();
}

extractAll().catch(console.error);
