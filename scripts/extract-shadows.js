const { chromium } = require('playwright');

(async () => {
  console.log('Connecting to Chrome...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('openai.github.io'));
  
  if (!page) {
    console.log('Page not found');
    await browser.close();
    return;
  }
  
  console.log('Connected to:', page.url());
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Find iframe with Storybook content
  const frames = page.frames();
  let targetFrame = page;
  
  for (const frame of frames) {
    const url = frame.url();
    if (url.includes('iframe.html')) {
      targetFrame = frame;
      console.log('Found Storybook iframe:', url);
      break;
    }
  }
  
  // Scroll to shadows section
  await targetFrame.evaluate(() => {
    const shadowsHeading = document.querySelector('#shadows');
    if (shadowsHeading) {
      shadowsHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
  
  await page.waitForTimeout(1000);
  
  // Extract shadow tokens
  const shadows = await targetFrame.evaluate(() => {
    const results = [];
    
    // Find all shadow-related elements in the documentation
    // Look for table rows or definition lists with shadow info
    const allText = document.body.innerText;
    
    // Try to find shadow tokens by looking for common patterns
    // Method 1: Look for CSS variable definitions
    const cssVars = getComputedStyle(document.documentElement);
    const shadowVars = [];
    
    // Check for shadow-related CSS custom properties
    const style = document.documentElement.style;
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      if (prop.includes('shadow')) {
        shadowVars.push({
          name: prop,
          value: style.getPropertyValue(prop)
        });
      }
    }
    
    // Method 2: Find table with shadow definitions
    const tables = document.querySelectorAll('table');
    const tableData = [];
    tables.forEach((table, tableIndex) => {
      const rows = table.querySelectorAll('tr');
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
      
      rows.forEach((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length > 0) {
          const rowData = {};
          cells.forEach((cell, cellIndex) => {
            rowData[headers[cellIndex] || `col${cellIndex}`] = cell.textContent.trim();
          });
          tableData.push(rowData);
        }
      });
    });
    
    // Method 3: Find shadow preview elements and extract their computed styles
    const shadowPreviews = document.querySelectorAll('[class*="shadow"], [style*="box-shadow"]');
    const previewStyles = [];
    shadowPreviews.forEach((el, i) => {
      const computed = getComputedStyle(el);
      if (computed.boxShadow && computed.boxShadow !== 'none') {
        previewStyles.push({
          element: el.className,
          boxShadow: computed.boxShadow
        });
      }
    });
    
    // Method 4: Look for specific shadow documentation structure
    const shadowSection = document.querySelector('#shadows');
    let sectionContent = null;
    if (shadowSection) {
      // Get all siblings until next heading
      let sibling = shadowSection.nextElementSibling;
      const content = [];
      while (sibling && !sibling.matches('h1, h2, h3')) {
        content.push({
          tag: sibling.tagName,
          text: sibling.textContent.trim().substring(0, 500),
          html: sibling.innerHTML.substring(0, 1000)
        });
        sibling = sibling.nextElementSibling;
      }
      sectionContent = content;
    }
    
    // Method 5: Find all code blocks that might contain shadow values
    const codeBlocks = document.querySelectorAll('code, pre');
    const shadowCodes = [];
    codeBlocks.forEach(code => {
      const text = code.textContent;
      if (text.includes('shadow') || text.includes('box-shadow')) {
        shadowCodes.push(text.trim());
      }
    });
    
    return {
      cssVars: shadowVars,
      tableData,
      previewStyles,
      sectionContent,
      shadowCodes,
      pageText: allText.substring(allText.indexOf('Shadows'), allText.indexOf('Shadows') + 3000)
    };
  });
  
  console.log('\n=== SHADOW TOKENS EXTRACTION ===\n');
  console.log(JSON.stringify(shadows, null, 2));
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('/Users/sergey/github/platform/reference/shadow-tokens.json', JSON.stringify(shadows, null, 2));
  console.log('\nSaved to reference/shadow-tokens.json');
  
  await browser.close();
})();

