/**
 * Детальное извлечение стилей с OpenAI Platform
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractDetailedStyles() {
  console.log('🔌 Подключение к Chrome...\n');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const pages = contexts[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ Страница OpenAI не найдена');
    await browser.close();
    return;
  }
  
  console.log('✅ Подключено к:', page.url(), '\n');
  
  // Ждём полной загрузки
  await page.waitForTimeout(1000);
  
  // Создаём директорию
  const refDir = path.join(__dirname, '..', 'reference');
  if (!fs.existsSync(refDir)) fs.mkdirSync(refDir, { recursive: true });
  
  // Скриншот
  await page.screenshot({ path: path.join(refDir, 'openai-full.png'), fullPage: false });
  console.log('📸 Скриншот сохранён\n');
  
  // Извлекаем стили
  const styles = await page.evaluate(() => {
    const result = {
      page: {},
      sidebar: {},
      sidebarItems: [],
      buttons: {},
      chips: [],
      input: {},
      icons: []
    };
    
    // === PAGE ===
    const body = getComputedStyle(document.body);
    result.page = {
      backgroundColor: body.backgroundColor,
      color: body.color,
      fontFamily: body.fontFamily,
      fontSize: body.fontSize
    };
    
    // === SIDEBAR ===
    // Ищем nav или элемент с белым фоном слева
    const allElements = Array.from(document.querySelectorAll('*'));
    
    // Находим sidebar container
    for (const el of allElements) {
      const s = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      // Sidebar обычно слева, белый фон, ширина ~260px
      if (rect.left < 50 && 
          rect.width > 200 && rect.width < 300 &&
          rect.height > 400 &&
          s.backgroundColor === 'rgb(255, 255, 255)') {
        result.sidebar = {
          width: s.width,
          height: s.height,
          backgroundColor: s.backgroundColor,
          borderRadius: s.borderRadius,
          padding: s.padding,
          margin: s.margin,
          boxShadow: s.boxShadow,
          border: s.border
        };
        break;
      }
    }
    
    // === SIDEBAR ITEMS ===
    // Ищем все кликабельные элементы в sidebar
    const nav = document.querySelector('nav');
    if (nav) {
      const buttons = nav.querySelectorAll('button, a, [role="button"]');
      buttons.forEach((btn, idx) => {
        const s = getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        const text = btn.textContent?.trim().substring(0, 30);
        
        // Пропускаем мелкие элементы
        if (rect.height < 20) return;
        
        result.sidebarItems.push({
          index: idx,
          text: text,
          height: s.height,
          padding: s.padding,
          margin: s.margin,
          borderRadius: s.borderRadius,
          backgroundColor: s.backgroundColor,
          color: s.color,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          gap: s.gap,
          display: s.display,
          alignItems: s.alignItems
        });
      });
    }
    
    // === ACTIVE SIDEBAR ITEM ===
    for (const el of allElements) {
      const s = getComputedStyle(el);
      // Активный элемент имеет серый фон #ededed
      if (s.backgroundColor === 'rgb(237, 237, 237)') {
        const rect = el.getBoundingClientRect();
        if (rect.height > 30 && rect.height < 50 && rect.width > 100) {
          result.sidebarItemActive = {
            backgroundColor: s.backgroundColor,
            borderRadius: s.borderRadius,
            height: s.height,
            padding: s.padding
          };
          break;
        }
      }
    }
    
    // === PROJECT SELECTOR (top of sidebar) ===
    const projectSelector = allElements.find(el => {
      const text = el.textContent?.toLowerCase() || '';
      return (text.includes('personal') || text.includes('default')) && 
             el.querySelector && el.querySelector('svg');
    });
    if (projectSelector) {
      const s = getComputedStyle(projectSelector);
      result.projectSelector = {
        height: s.height,
        padding: s.padding,
        borderRadius: s.borderRadius,
        backgroundColor: s.backgroundColor,
        color: s.color,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight
      };
    }
    
    // === SECTION TITLES (Create, Manage, Optimize) ===
    const sectionTitles = ['Create', 'Manage', 'Optimize'];
    for (const title of sectionTitles) {
      const el = allElements.find(e => 
        e.textContent?.trim() === title && 
        !e.querySelector('button') &&
        e.tagName !== 'BUTTON'
      );
      if (el) {
        const s = getComputedStyle(el);
        result.sectionTitle = {
          color: s.color,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          padding: s.padding,
          margin: s.margin,
          textTransform: s.textTransform,
          letterSpacing: s.letterSpacing
        };
        break;
      }
    }
    
    // === PRIMARY BUTTON (Create +) ===
    const createBtn = allElements.find(el => {
      const text = el.textContent?.trim();
      return el.tagName === 'BUTTON' && text?.includes('Create');
    });
    if (createBtn) {
      const s = getComputedStyle(createBtn);
      const before = getComputedStyle(createBtn, '::before');
      
      result.buttons.primary = {
        backgroundColor: s.backgroundColor,
        backgroundColorBefore: before.backgroundColor,
        color: s.color,
        height: s.height,
        padding: s.padding,
        borderRadius: s.borderRadius,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        border: s.border,
        boxShadow: s.boxShadow,
        gap: s.gap,
        display: s.display,
        alignItems: s.alignItems,
        justifyContent: s.justifyContent
      };
    }
    
    // === CHIPS (Trip planner, etc.) ===
    const chipTexts = ['Trip planner', 'Learn a topic', 'Surprise me', 'Make a plan'];
    for (const chipText of chipTexts) {
      const chip = allElements.find(el => 
        el.textContent?.includes(chipText) && 
        el.tagName === 'BUTTON'
      );
      if (chip) {
        // Ищем контейнер с border
        let container = chip;
        while (container && container !== document.body) {
          const s = getComputedStyle(container);
          if (s.border.includes('1px') || s.borderWidth === '1px') {
            const chipStyles = getComputedStyle(chip);
            result.chips.push({
              text: chipText,
              container: {
                backgroundColor: s.backgroundColor,
                border: s.border,
                borderColor: s.borderColor,
                borderRadius: s.borderRadius,
                padding: s.padding,
                height: s.height
              },
              button: {
                color: chipStyles.color,
                fontSize: chipStyles.fontSize,
                fontWeight: chipStyles.fontWeight,
                padding: chipStyles.padding
              }
            });
            break;
          }
          container = container.parentElement;
        }
        break; // Достаточно одного чипа для понимания стилей
      }
    }
    
    // === CHAT INPUT ===
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const s = getComputedStyle(textarea);
      result.input.textarea = {
        backgroundColor: s.backgroundColor,
        color: s.color,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        padding: s.padding,
        border: s.border,
        borderRadius: s.borderRadius,
        lineHeight: s.lineHeight
      };
      
      // Контейнер input
      let container = textarea.parentElement;
      while (container && container !== document.body) {
        const cs = getComputedStyle(container);
        if (cs.border.includes('1px') || cs.borderRadius.includes('px')) {
          result.input.container = {
            backgroundColor: cs.backgroundColor,
            border: cs.border,
            borderColor: cs.borderColor,
            borderRadius: cs.borderRadius,
            padding: cs.padding,
            boxShadow: cs.boxShadow
          };
          break;
        }
        container = container.parentElement;
      }
    }
    
    // === SEND BUTTON ===
    const sendBtn = allElements.find(el => {
      const rect = el.getBoundingClientRect();
      return el.tagName === 'BUTTON' && 
             el.querySelector('svg') &&
             rect.width > 30 && rect.width < 50 &&
             rect.height > 30 && rect.height < 50;
    });
    if (sendBtn) {
      const s = getComputedStyle(sendBtn);
      result.buttons.send = {
        backgroundColor: s.backgroundColor,
        color: s.color,
        width: s.width,
        height: s.height,
        borderRadius: s.borderRadius,
        border: s.border
      };
    }
    
    // === ICONS (extract SVG paths) ===
    const iconNames = ['Chat', 'Audio', 'Images', 'Videos', 'API keys', 'Usage'];
    const svgs = document.querySelectorAll('svg');
    svgs.forEach((svg, idx) => {
      const parent = svg.closest('button, a, [role="button"]');
      const text = parent?.textContent?.trim().substring(0, 20);
      
      if (text && iconNames.some(name => text.includes(name))) {
        const paths = Array.from(svg.querySelectorAll('path')).map(p => p.getAttribute('d'));
        if (paths.length > 0) {
          result.icons.push({
            name: text,
            viewBox: svg.getAttribute('viewBox'),
            width: svg.getAttribute('width') || getComputedStyle(svg).width,
            height: svg.getAttribute('height') || getComputedStyle(svg).height,
            paths: paths.slice(0, 3), // Первые 3 path
            fill: getComputedStyle(svg).fill,
            stroke: getComputedStyle(svg).stroke
          });
        }
      }
    });
    
    // === HOVER COLORS (approximate) ===
    result.hoverColors = {
      sidebarItem: 'rgb(245, 245, 245)', // ~#f5f5f5
      sidebarItemActive: 'rgb(237, 237, 237)', // #ededed
      buttonPrimary: 'rgb(13, 13, 13)' // #0d0d0d
    };
    
    return result;
  });
  
  // Конвертируем RGB в HEX
  function rgbToHex(rgb) {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return null;
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgb;
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  // Выводим результат
  console.log('='.repeat(60));
  console.log('EXTRACTED STYLES');
  console.log('='.repeat(60));
  
  console.log('\n📄 PAGE:');
  console.log('  Background:', styles.page.backgroundColor, '→', rgbToHex(styles.page.backgroundColor));
  console.log('  Font:', styles.page.fontFamily);
  console.log('  Font Size:', styles.page.fontSize);
  console.log('  Color:', styles.page.color, '→', rgbToHex(styles.page.color));
  
  console.log('\n📁 SIDEBAR:');
  console.log('  Width:', styles.sidebar.width);
  console.log('  Background:', styles.sidebar.backgroundColor, '→', rgbToHex(styles.sidebar.backgroundColor));
  console.log('  Border Radius:', styles.sidebar.borderRadius);
  console.log('  Padding:', styles.sidebar.padding);
  
  if (styles.sidebarItemActive) {
    console.log('\n📌 SIDEBAR ITEM ACTIVE:');
    console.log('  Background:', styles.sidebarItemActive.backgroundColor, '→', rgbToHex(styles.sidebarItemActive.backgroundColor));
    console.log('  Border Radius:', styles.sidebarItemActive.borderRadius);
    console.log('  Height:', styles.sidebarItemActive.height);
  }
  
  if (styles.sectionTitle) {
    console.log('\n📝 SECTION TITLE:');
    console.log('  Color:', styles.sectionTitle.color, '→', rgbToHex(styles.sectionTitle.color));
    console.log('  Font Size:', styles.sectionTitle.fontSize);
    console.log('  Font Weight:', styles.sectionTitle.fontWeight);
  }
  
  if (styles.buttons.primary) {
    console.log('\n🔘 PRIMARY BUTTON:');
    console.log('  Background:', styles.buttons.primary.backgroundColor, '→', rgbToHex(styles.buttons.primary.backgroundColor));
    console.log('  Background (::before):', styles.buttons.primary.backgroundColorBefore, '→', rgbToHex(styles.buttons.primary.backgroundColorBefore));
    console.log('  Color:', styles.buttons.primary.color, '→', rgbToHex(styles.buttons.primary.color));
    console.log('  Height:', styles.buttons.primary.height);
    console.log('  Border Radius:', styles.buttons.primary.borderRadius);
    console.log('  Font Size:', styles.buttons.primary.fontSize);
  }
  
  if (styles.chips.length > 0) {
    console.log('\n💊 CHIP:');
    console.log('  Border:', styles.chips[0].container.border);
    console.log('  Border Color:', styles.chips[0].container.borderColor);
    console.log('  Border Radius:', styles.chips[0].container.borderRadius);
    console.log('  Background:', styles.chips[0].container.backgroundColor);
    console.log('  Text Color:', styles.chips[0].button.color, '→', rgbToHex(styles.chips[0].button.color));
    console.log('  Font Size:', styles.chips[0].button.fontSize);
  }
  
  if (styles.input.container) {
    console.log('\n✏️ INPUT:');
    console.log('  Container Border:', styles.input.container.border);
    console.log('  Container Radius:', styles.input.container.borderRadius);
    console.log('  Container Background:', styles.input.container.backgroundColor);
    console.log('  Textarea Font Size:', styles.input.textarea?.fontSize);
  }
  
  if (styles.icons.length > 0) {
    console.log('\n🎨 ICONS:');
    styles.icons.forEach(icon => {
      console.log(`  ${icon.name}: ${icon.width}x${icon.height}, viewBox: ${icon.viewBox}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Сохраняем JSON
  const stylesPath = path.join(refDir, 'detailed-styles.json');
  fs.writeFileSync(stylesPath, JSON.stringify(styles, null, 2));
  console.log('\n💾 Сохранено:', stylesPath);
  
  // Также сохраним первые несколько sidebar items для анализа
  if (styles.sidebarItems.length > 0) {
    console.log('\n📋 SIDEBAR ITEMS (first 5):');
    styles.sidebarItems.slice(0, 5).forEach(item => {
      console.log(`  [${item.index}] "${item.text}" - h:${item.height}, fs:${item.fontSize}, fw:${item.fontWeight}`);
    });
  }
  
  await browser.close();
  console.log('\n✅ Готово!\n');
}

extractDetailedStyles().catch(console.error);

