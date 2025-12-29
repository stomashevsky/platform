const { chromium } = require('playwright');

(async () => {
  console.log('Connecting to Chrome...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('foundations-colors'));
  
  if (!page) {
    console.log('Colors page not found');
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
  
  // Extract all color tokens
  const colors = await targetFrame.evaluate(() => {
    const results = {
      primitives: [],
      semantic: []
    };
    
    // Find all color swatches with their labels
    const colorRows = document.querySelectorAll('tr');
    
    colorRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        // Look for color preview element
        const colorPreview = row.querySelector('[style*="background"]');
        const nameCell = cells[0];
        const valueCell = cells[1];
        
        if (nameCell && valueCell) {
          const name = nameCell.textContent.trim();
          const value = valueCell.textContent.trim();
          
          // Get computed background color if there's a preview
          let computedColor = null;
          if (colorPreview) {
            const computed = getComputedStyle(colorPreview);
            computedColor = computed.backgroundColor;
          }
          
          if (name && (value || computedColor)) {
            results.semantic.push({
              name,
              value,
              computedColor
            });
          }
        }
      }
    });
    
    // Find primitive color palettes (gray-50, gray-100, etc.)
    const allDivs = document.querySelectorAll('div');
    const colorGrids = [];
    
    allDivs.forEach(div => {
      // Look for color swatch grids
      const style = getComputedStyle(div);
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const rect = div.getBoundingClientRect();
        // Color swatches are typically small squares
        if (rect.width > 20 && rect.width < 200 && rect.height > 20 && rect.height < 200) {
          // Get the label if available
          const parent = div.closest('[class*="ColorSwatch"], [class*="color"]');
          let label = '';
          if (parent) {
            const labelEl = parent.querySelector('span, p, div');
            if (labelEl) label = labelEl.textContent.trim();
          }
          
          // Check for data attributes or nearby text
          const prevSibling = div.previousElementSibling;
          const nextSibling = div.nextElementSibling;
          
          if (!label && prevSibling) label = prevSibling.textContent.trim();
          if (!label && nextSibling) label = nextSibling.textContent.trim();
          
          colorGrids.push({
            backgroundColor: style.backgroundColor,
            width: rect.width,
            height: rect.height,
            label: label.substring(0, 50)
          });
        }
      }
    });
    
    // Find all elements with class containing "Swatch" or "Color"
    const swatches = document.querySelectorAll('[class*="Swatch"], [class*="ColorDisplay"]');
    const swatchData = [];
    
    swatches.forEach(swatch => {
      const style = getComputedStyle(swatch);
      const text = swatch.textContent.trim();
      
      swatchData.push({
        className: swatch.className,
        backgroundColor: style.backgroundColor,
        text: text.substring(0, 100)
      });
    });
    
    // Extract from specific structure - look for color name patterns
    const allText = document.body.innerText;
    const colorPattern = /(gray|blue|red|green|orange|yellow|purple|pink|teal|cyan|alpha)-(\d+|a\d+)/gi;
    const foundColors = [...new Set(allText.match(colorPattern) || [])];
    
    // Get all hex colors visible on page
    const hexPattern = /#[0-9A-Fa-f]{6}/g;
    const hexColors = [...new Set(allText.match(hexPattern) || [])];
    
    return {
      semantic: results.semantic.slice(0, 100),
      swatches: swatchData.slice(0, 50),
      colorGrids: colorGrids.slice(0, 50),
      foundColorNames: foundColors.sort(),
      hexColors: hexColors.sort()
    };
  });
  
  console.log('\n=== EXTRACTED COLOR NAMES ===');
  console.log('Found', colors.foundColorNames.length, 'color tokens');
  console.log(colors.foundColorNames.join(', '));
  
  console.log('\n=== HEX COLORS ===');
  console.log(colors.hexColors.join(', '));
  
  // Now let's get the actual computed colors from swatches
  const colorSwatches = await targetFrame.evaluate(() => {
    const results = [];
    
    // Find all elements that look like color swatches
    const elements = document.querySelectorAll('[class*="_ColorDisplay"], [class*="_Swatch"]');
    
    elements.forEach(el => {
      const bgEl = el.querySelector('div[style*="background"], div[class*="preview"]') || el.querySelector('div');
      if (bgEl) {
        const style = getComputedStyle(bgEl);
        const text = el.textContent.trim();
        
        // Parse the text to find color name and value
        const lines = text.split('\n').filter(l => l.trim());
        
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          results.push({
            text: lines.slice(0, 3).join(' | '),
            backgroundColor: style.backgroundColor
          });
        }
      }
    });
    
    return results;
  });
  
  console.log('\n=== COLOR SWATCHES ===');
  colorSwatches.forEach(s => console.log(s.text, '→', s.backgroundColor));
  
  // Get primitive colors from the palette grid
  const primitiveColors = await targetFrame.evaluate(() => {
    const results = {};
    
    // Find headings for color sections
    const headings = document.querySelectorAll('h2, h3, h4');
    
    headings.forEach(heading => {
      const headingText = heading.textContent.trim().toLowerCase();
      
      // Look for color palette sections
      if (['gray', 'blue', 'red', 'green', 'orange', 'yellow', 'purple', 'pink', 'teal', 'cyan'].includes(headingText)) {
        let sibling = heading.nextElementSibling;
        const colorValues = [];
        
        while (sibling && !sibling.matches('h2, h3, h4')) {
          // Find color swatches in this section
          const swatches = sibling.querySelectorAll('[style*="background"]');
          swatches.forEach(swatch => {
            const computed = getComputedStyle(swatch);
            if (computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
              // Try to find the label
              const parent = swatch.closest('div');
              const text = parent?.textContent?.trim() || '';
              colorValues.push({
                color: computed.backgroundColor,
                label: text.substring(0, 30)
              });
            }
          });
          
          sibling = sibling.nextElementSibling;
        }
        
        if (colorValues.length > 0) {
          results[headingText] = colorValues;
        }
      }
    });
    
    return results;
  });
  
  console.log('\n=== PRIMITIVE PALETTES ===');
  console.log(JSON.stringify(primitiveColors, null, 2));
  
  // Get a better extraction by finding the table structure
  const tableColors = await targetFrame.evaluate(() => {
    const tables = document.querySelectorAll('table');
    const results = [];
    
    tables.forEach((table, tableIndex) => {
      const caption = table.querySelector('caption')?.textContent || `Table ${tableIndex + 1}`;
      const rows = table.querySelectorAll('tr');
      const tableData = [];
      
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        const rowData = cells.map(cell => {
          // Check for color preview in cell
          const colorDiv = cell.querySelector('div[style*="background"]');
          let bgColor = null;
          if (colorDiv) {
            bgColor = getComputedStyle(colorDiv).backgroundColor;
          }
          
          return {
            text: cell.textContent.trim(),
            bgColor
          };
        });
        
        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      });
      
      if (tableData.length > 0) {
        results.push({ caption, data: tableData });
      }
    });
    
    return results;
  });
  
  // Full page extraction - get all color displays with their exact values
  const fullColorExtraction = await targetFrame.evaluate(() => {
    const colors = [];
    
    // Find all divs that contain color information
    const colorContainers = document.querySelectorAll('[class*="ColorDisplay"], [class*="Row"]');
    
    colorContainers.forEach(container => {
      const text = container.innerText.trim();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      // Find the color preview element
      const previews = container.querySelectorAll('div');
      let bgColor = null;
      
      previews.forEach(div => {
        const style = getComputedStyle(div);
        if (style.backgroundColor && 
            style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
            style.backgroundColor !== 'rgb(255, 255, 255)') {
          bgColor = style.backgroundColor;
        }
      });
      
      if (lines.length > 0) {
        colors.push({
          name: lines[0],
          value: lines[1] || null,
          hex: lines.find(l => l.startsWith('#')) || null,
          computedBg: bgColor
        });
      }
    });
    
    return colors;
  });
  
  console.log('\n=== FULL COLOR EXTRACTION ===');
  fullColorExtraction.slice(0, 30).forEach(c => {
    console.log(`${c.name}: ${c.hex || c.value || ''} → ${c.computedBg || ''}`);
  });
  
  // Final comprehensive extraction
  const comprehensiveColors = await targetFrame.evaluate(() => {
    const allColors = {
      primitives: {},
      semanticColors: []
    };
    
    // Get all text content and parse it
    const body = document.body;
    
    // Find gray palette specifically
    const graySection = body.innerText.match(/gray[\s\S]*?(?=blue|$)/i);
    
    // Extract all color rows with pattern: name + value
    const rows = document.querySelectorAll('[class*="_ColorRow"], [class*="_Row"]');
    
    rows.forEach(row => {
      const text = row.innerText.trim();
      const parts = text.split('\n').filter(p => p.trim());
      
      if (parts.length >= 1) {
        // Find computed background
        let bgColor = null;
        const divs = row.querySelectorAll('div');
        for (const div of divs) {
          const style = getComputedStyle(div);
          const rect = div.getBoundingClientRect();
          // Color preview elements are typically small
          if (rect.width > 10 && rect.width < 100 && 
              style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            bgColor = style.backgroundColor;
            break;
          }
        }
        
        allColors.semanticColors.push({
          name: parts[0],
          reference: parts[1] || null,
          computed: bgColor
        });
      }
    });
    
    return allColors;
  });
  
  // Save complete extraction
  const fs = require('fs');
  const output = {
    extractedAt: new Date().toISOString(),
    url: page.url(),
    colorNames: colors.foundColorNames,
    hexValues: colors.hexColors,
    swatches: colorSwatches,
    tables: tableColors,
    fullExtraction: fullColorExtraction,
    comprehensive: comprehensiveColors
  };
  
  fs.writeFileSync('/Users/sergey/github/platform/reference/openai-colors-raw.json', 
    JSON.stringify(output, null, 2));
  
  console.log('\n\nSaved to reference/openai-colors-raw.json');
  
  await browser.close();
})();

