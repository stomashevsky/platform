/**
 * Extract Icons from OpenAI Apps SDK UI Storybook
 * 
 * Extracts all icons from the Storybook page and saves them as individual SVG files.
 * 
 * Usage: node scripts/extract-icons.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STORYBOOK_URL = 'https://openai.github.io/apps-sdk-ui/?path=/docs/foundations-icons--docs';
const OUTPUT_DIR = path.join(__dirname, '..', 'icons');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUTPUT_DIR}`);
}

/**
 * Sanitize filename from icon name
 */
function sanitizeFileName(name) {
  if (!name) return 'Unknown';
  // Remove special characters, keep alphanumeric
  return name.trim().replace(/[^a-zA-Z0-9]/g, '');
}

(async () => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log(`Navigating to ${STORYBOOK_URL}...`);
    await page.goto(STORYBOOK_URL, { waitUntil: 'networkidle', timeout: 60000 });

    console.log('Waiting for iframe...');
    await page.waitForSelector('iframe', { timeout: 60000 });

    console.log('Accessing iframe content...');
    const iframeElement = await page.$('iframe');
    if (!iframeElement) {
      throw new Error('Could not find iframe element');
    }

    const frame = await iframeElement.contentFrame();
    if (!frame) {
      throw new Error('Could not access iframe content (might be cross-origin)');
    }

    console.log('Waiting for icons to load...');
    await frame.waitForLoadState('networkidle', { timeout: 60000 });
    await frame.waitForTimeout(3000);

    console.log('Finding all icon elements...');
    
    // Extract icon data: for each SVG, find its name and extract SVG content
    const iconData = await frame.evaluate(() => {
      const results = [];
      const svgs = Array.from(document.querySelectorAll('svg'));
      
      svgs.forEach((svg) => {
        // Skip navigation/link SVGs (they're usually small, 14x14)
        const width = svg.getAttribute('width');
        const height = svg.getAttribute('height');
        if (width === '14' && height === '14') {
          return; // Skip small navigation icons
        }
        
        const parent = svg.parentElement;
        if (!parent) return;
        
        // Find icon name - look in parent container structure
        let iconName = null;
        
        // Strategy 1: Look for text in sibling elements
        const siblings = Array.from(parent.children);
        for (const sibling of siblings) {
          if (sibling === svg) continue;
          
          // Get direct text content (not nested)
          const directText = Array.from(sibling.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .filter(text => text.length > 0)
            .join(' ');
          
          if (directText && directText.match(/^[A-Z][a-zA-Z0-9]+$/)) {
            iconName = directText;
            break;
          }
          
          // Also check textContent if it's a simple element
          const text = sibling.textContent?.trim();
          if (text && 
              text.length > 1 && 
              text.length < 100 &&
              !text.match(/^\d+$/) &&
              !text.toLowerCase().includes('search') &&
              text.match(/^[A-Z][a-zA-Z0-9]+$/)) {
            iconName = text;
            break;
          }
        }
        
        // Strategy 2: Look in parent container's text
        if (!iconName) {
          const parentContainer = parent.parentElement;
          if (parentContainer) {
            // Get all text nodes from parent container, excluding the SVG's parent
            const allText = parentContainer.textContent?.trim();
            if (allText) {
              // Split by whitespace and find PascalCase words
              const words = allText.split(/\s+/);
              for (const word of words) {
                if (word.match(/^[A-Z][a-zA-Z0-9]+$/) && word.length > 1 && word.length < 100) {
                  iconName = word;
                  break;
                }
              }
            }
          }
        }
        
        // Strategy 3: Look in the grandparent's children (for nested structures)
        if (!iconName && parent.parentElement) {
          const grandParent = parent.parentElement;
          const cousins = Array.from(grandParent.children);
          for (const cousin of cousins) {
            if (cousin === parent) continue;
            const text = cousin.textContent?.trim();
            if (text && text.match(/^[A-Z][a-zA-Z0-9]+$/) && text.length > 1 && text.length < 100) {
              iconName = text;
              break;
            }
          }
        }
        
        if (iconName) {
          results.push({
            name: iconName,
            svgHTML: svg.outerHTML
          });
        }
      });
      
      return results;
    });

    console.log(`Found ${iconData.length} icon candidates`);

    if (iconData.length === 0) {
      console.log('No icons found. Checking page structure...');
      // Debug: print some info about the page
      const debugInfo = await frame.evaluate(() => {
        const svgs = document.querySelectorAll('svg');
        const firstFew = Array.from(svgs).slice(0, 5).map(svg => ({
          parentHTML: svg.parentElement?.outerHTML.substring(0, 200) || 'no parent',
          svgHTML: svg.outerHTML.substring(0, 100)
        }));
        return {
          totalSVGs: svgs.length,
          firstFew
        };
      });
      console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
    }

    const extractedIcons = [];
    const seenNames = new Set();

    // Process each icon
    for (const iconInfo of iconData) {
      try {
        const iconName = iconInfo.name;
        const sanitizedName = sanitizeFileName(iconName);
        
        // Skip duplicates
        if (seenNames.has(sanitizedName)) {
          continue;
        }
        seenNames.add(sanitizedName);

        const svgContent = iconInfo.svgHTML.trim();
        
        if (!svgContent || !svgContent.startsWith('<svg')) {
          console.warn(`  ⚠️  Invalid SVG for ${iconName}`);
          continue;
        }

        // Save SVG file
        const filePath = path.join(OUTPUT_DIR, `${sanitizedName}.svg`);
        fs.writeFileSync(filePath, svgContent, 'utf-8');

        extractedIcons.push({
          name: iconName,
          sanitizedName,
          svg: svgContent
        });

        console.log(`  ✓ ${iconName} -> ${sanitizedName}.svg`);

      } catch (err) {
        console.warn(`  ⚠️  Error processing icon ${iconInfo.name}:`, err.message);
      }
    }

    console.log(`\n✅ Successfully extracted ${extractedIcons.length} icons`);
    console.log(`   Saved to: ${OUTPUT_DIR}`);

    await browser.close();

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
})();
