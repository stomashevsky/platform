const { chromium } = require('playwright');
const fs = require('fs');

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
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Find iframe
  const frames = page.frames();
  let targetFrame = page;
  for (const frame of frames) {
    if (frame.url().includes('iframe.html')) {
      targetFrame = frame;
      break;
    }
  }
  
  // Extract all color palettes
  const colorData = await targetFrame.evaluate(() => {
    const result = {
      grayscale: [],
      alphas: [],
      blue: [],
      red: [],
      green: [],
      orange: [],
      yellow: [],
      purple: [],
      pink: [],
      teal: [],
      cyan: []
    };
    
    // Find all section headings
    const allElements = document.querySelectorAll('h2, h3, h4, p, div');
    let currentPalette = null;
    
    // Find palette sections
    const headings = document.querySelectorAll('h2, h3');
    const sections = [];
    
    headings.forEach(h => {
      const text = h.textContent.trim().toLowerCase();
      if (text.includes('grayscale') || text.includes('gray')) {
        sections.push({ name: 'grayscale', element: h });
      } else if (text.includes('alpha')) {
        sections.push({ name: 'alphas', element: h });
      } else if (text.includes('primary') || text.includes('blue')) {
        sections.push({ name: 'primary', element: h });
      }
    });
    
    // Get all color swatches on the page
    // They appear to be div elements with background colors
    const allDivs = document.querySelectorAll('div');
    const swatches = [];
    
    allDivs.forEach((div, index) => {
      const style = getComputedStyle(div);
      const rect = div.getBoundingClientRect();
      const bg = style.backgroundColor;
      
      // Color swatches are typically square-ish
      if (rect.width >= 40 && rect.width <= 120 && 
          rect.height >= 40 && rect.height <= 120 &&
          Math.abs(rect.width - rect.height) < 20 &&
          bg && bg !== 'rgba(0, 0, 0, 0)' &&
          !bg.includes('255, 255, 255')) {
        
        // Find the label - look for nearby text
        let label = '';
        
        // Check parent for text
        const parent = div.parentElement;
        const grandparent = parent?.parentElement;
        
        // Look for sibling or child with just a number
        const siblings = parent ? [...parent.children] : [];
        const textSiblings = siblings.filter(s => s !== div && s.textContent);
        
        if (textSiblings.length > 0) {
          label = textSiblings[0].textContent.trim();
        }
        
        // Also check parent's inner text
        if (!label && parent) {
          const parentText = parent.innerText.trim().split('\n')[0];
          if (parentText && parentText.length < 20) {
            label = parentText;
          }
        }
        
        swatches.push({
          backgroundColor: bg,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          label,
          index
        });
      }
    });
    
    // Sort by position (top to bottom, left to right)
    swatches.sort((a, b) => {
      if (Math.abs(a.top - b.top) < 30) {
        return a.left - b.left;
      }
      return a.top - b.top;
    });
    
    return {
      swatchCount: swatches.length,
      swatches: swatches.slice(0, 200)
    };
  });
  
  console.log(`Found ${colorData.swatchCount} color swatches\n`);
  
  // Group swatches by row (similar Y position)
  const rows = [];
  let currentRow = [];
  let lastTop = -1000;
  
  colorData.swatches.forEach(swatch => {
    if (Math.abs(swatch.top - lastTop) > 50) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [swatch];
    } else {
      currentRow.push(swatch);
    }
    lastTop = swatch.top;
  });
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  console.log(`Organized into ${rows.length} rows\n`);
  
  // Convert RGB to HEX
  const rgbToHex = (rgb) => {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return rgb;
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  
  // Format output
  const palettes = {};
  
  // Known palette names based on page structure
  const paletteNames = [
    'gray',      // Grayscale
    'alpha',     // Alphas
    'blue',      // Primary colors row 1
    'red',       // Primary colors row 2
    'green',     // Primary colors row 3
    'orange',    // Primary colors row 4
    'yellow',    // Primary colors row 5
    'purple',    // Primary colors row 6
    'pink',      // Primary colors row 7
    'teal',      // (if exists)
    'cyan'       // (if exists)
  ];
  
  // Grayscale steps: 0, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 925, 950, 975, 1000
  const graySteps = [0, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 925, 950, 975, 1000];
  
  // Alpha steps: 0, 02, 04, 05, 06, 08, 10, 12, 15, 16, 20, 25, 30, 35, 40, 50
  const alphaSteps = ['00', '02', '04', '05', '06', '08', '10', '12', '15', '16', '20', '25', '30', '35', '40', '50'];
  
  // Primary color steps: 25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000, a25, a50, a75, a100, a200, a300
  const primarySteps = [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000, 'a25', 'a50', 'a75', 'a100', 'a200', 'a300'];
  
  rows.forEach((row, rowIndex) => {
    let paletteName = '';
    let steps = [];
    
    if (rowIndex === 0) {
      paletteName = 'gray';
      steps = graySteps;
    } else if (rowIndex === 1) {
      paletteName = 'alpha';
      steps = alphaSteps;
    } else {
      const primaryIndex = rowIndex - 2;
      const primaryNames = ['blue', 'red', 'green', 'orange', 'yellow', 'purple', 'pink'];
      if (primaryIndex < primaryNames.length) {
        paletteName = primaryNames[primaryIndex];
        steps = primarySteps;
      } else {
        paletteName = `palette-${rowIndex}`;
        steps = row.map((_, i) => i);
      }
    }
    
    palettes[paletteName] = {};
    
    row.forEach((swatch, i) => {
      const step = steps[i] !== undefined ? steps[i] : i;
      const hex = rgbToHex(swatch.backgroundColor);
      palettes[paletteName][step] = {
        hex,
        rgb: swatch.backgroundColor
      };
    });
    
    console.log(`\n${paletteName.toUpperCase()} (${row.length} colors):`);
    row.forEach((swatch, i) => {
      const step = steps[i] !== undefined ? steps[i] : i;
      console.log(`  ${String(step).padStart(4)}: ${rgbToHex(swatch.backgroundColor)}`);
    });
  });
  
  // Save to file
  const output = {
    extractedAt: new Date().toISOString(),
    source: 'https://openai.github.io/apps-sdk-ui/?path=/docs/foundations-colors--docs',
    palettes
  };
  
  fs.writeFileSync('/Users/sergey/github/platform/reference/openai-colors-for-figma.json', 
    JSON.stringify(output, null, 2));
  
  console.log('\n\n✅ Saved to reference/openai-colors-for-figma.json');
  
  await browser.close();
})();

