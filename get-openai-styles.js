const { chromium } = require('playwright');

(async () => {
  try {
    // Connect to existing Chrome
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    
    if (contexts.length === 0) {
      console.log('No browser contexts found');
      return;
    }
    
    const pages = contexts[0].pages();
    const openaiPage = pages.find(p => p.url().includes('platform.openai.com'));
    
    if (!openaiPage) {
      console.log('OpenAI Platform page not found');
      console.log('Available pages:', pages.map(p => p.url()));
      return;
    }
    
    console.log('Connected to:', openaiPage.url());
    console.log('Title:', await openaiPage.title());
    
    // Take screenshot
    await openaiPage.screenshot({ path: 'openai-platform.png', fullPage: false });
    console.log('Screenshot saved to openai-platform.png');
    
    // Get computed styles of key elements
    const styles = await openaiPage.evaluate(() => {
      const results = {};
      
      // Body
      const body = document.body;
      const bodyCs = getComputedStyle(body);
      results.body = {
        backgroundColor: bodyCs.backgroundColor,
        color: bodyCs.color,
        fontFamily: bodyCs.fontFamily.substring(0, 100)
      };
      
      // All buttons
      const buttons = document.querySelectorAll('button');
      results.buttons = [];
      buttons.forEach((btn, i) => {
        if (i < 5) {
          const cs = getComputedStyle(btn);
          results.buttons.push({
            text: btn.textContent?.trim().substring(0, 30),
            backgroundColor: cs.backgroundColor,
            color: cs.color,
            borderRadius: cs.borderRadius,
            border: cs.border,
            padding: cs.padding
          });
        }
      });
      
      // Inputs
      const inputs = document.querySelectorAll('input, textarea');
      results.inputs = [];
      inputs.forEach((inp, i) => {
        if (i < 3) {
          const cs = getComputedStyle(inp);
          results.inputs.push({
            placeholder: inp.placeholder?.substring(0, 30),
            backgroundColor: cs.backgroundColor,
            border: cs.border,
            borderRadius: cs.borderRadius
          });
        }
      });
      
      return results;
    });
    
    console.log('\n--- Computed Styles ---');
    console.log(JSON.stringify(styles, null, 2));
    
    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
