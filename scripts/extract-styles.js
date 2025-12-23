/**
 * Скрипт извлечения стилей с OpenAI Platform
 * 
 * Использование:
 * 1. Запустить Chrome с remote debugging (см. AGENTS.md)
 * 2. Авторизоваться на platform.openai.com
 * 3. Запустить: node scripts/extract-styles.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Конвертация RGB в HEX
function rgbToHex(rgb) {
  if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return null;
  
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return rgb;
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

async function extractOpenAIStyles() {
  console.log('🔌 Подключение к Chrome на порту 9222...\n');
  
  let browser;
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
  } catch (error) {
    console.error('❌ Не удалось подключиться к Chrome!');
    console.error('   Убедитесь, что Chrome запущен с флагом --remote-debugging-port=9222');
    console.error('   См. инструкцию в AGENTS.md\n');
    process.exit(1);
  }
  
  const contexts = browser.contexts();
  if (contexts.length === 0) {
    console.error('❌ Нет открытых контекстов браузера');
    await browser.close();
    process.exit(1);
  }
  
  const pages = contexts[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ Страница OpenAI Platform не найдена!');
    console.log('   Доступные страницы:');
    pages.forEach(p => console.log(`   - ${p.url()}`));
    await browser.close();
    process.exit(1);
  }
  
  console.log(`✅ Подключено к: ${page.url()}\n`);
  
  // Создаём директорию для референсов
  const refDir = path.join(__dirname, '..', 'reference');
  if (!fs.existsSync(refDir)) {
    fs.mkdirSync(refDir, { recursive: true });
  }
  
  // Скриншот полной страницы
  const screenshotPath = path.join(refDir, 'openai-platform.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Скриншот сохранён: ${screenshotPath}\n`);
  
  // Извлечение стилей
  console.log('🔍 Извлечение стилей...\n');
  
  const styles = await page.evaluate(() => {
    const result = {
      colors: {
        backgrounds: [],
        texts: [],
        borders: []
      },
      typography: {},
      components: {}
    };
    
    // === BODY ===
    const body = getComputedStyle(document.body);
    result.typography = {
      fontFamily: body.fontFamily,
      fontSize: body.fontSize,
      lineHeight: body.lineHeight,
      color: body.color
    };
    result.colors.pageBg = body.backgroundColor;
    
    // === Собираем уникальные цвета ===
    const bgSet = new Set();
    const textSet = new Set();
    const borderSet = new Set();
    
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      
      if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        bgSet.add(s.backgroundColor);
      }
      if (s.color) {
        textSet.add(s.color);
      }
      if (s.borderColor && s.borderStyle !== 'none') {
        borderSet.add(s.borderColor);
      }
    });
    
    result.colors.backgrounds = Array.from(bgSet);
    result.colors.texts = Array.from(textSet);
    result.colors.borders = Array.from(borderSet);
    
    // === PRIMARY BUTTON (Create) ===
    // Ищем по тексту или по цвету
    const allButtons = Array.from(document.querySelectorAll('button'));
    const createBtn = allButtons.find(b => 
      b.textContent?.includes('Create') && 
      (b.textContent?.includes('+') || b.querySelector('svg'))
    );
    
    if (createBtn) {
      const s = getComputedStyle(createBtn);
      const before = getComputedStyle(createBtn, '::before');
      
      result.components.primaryButton = {
        backgroundColor: before.backgroundColor !== 'rgba(0, 0, 0, 0)' 
          ? before.backgroundColor 
          : s.backgroundColor,
        color: s.color,
        borderRadius: s.borderRadius,
        height: s.height,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        border: s.border
      };
    }
    
    // === SIDEBAR ===
    const nav = document.querySelector('nav');
    if (nav) {
      let sidebarContainer = nav;
      while (sidebarContainer && sidebarContainer !== document.body) {
        const s = getComputedStyle(sidebarContainer);
        if (s.backgroundColor === 'rgb(255, 255, 255)' && parseInt(s.width) > 200) {
          result.components.sidebar = {
            backgroundColor: s.backgroundColor,
            width: s.width,
            borderRadius: s.borderRadius,
            padding: s.padding
          };
          break;
        }
        sidebarContainer = sidebarContainer.parentElement;
      }
    }
    
    // === SIDEBAR ITEM ===
    const sidebarItems = document.querySelectorAll('nav button');
    if (sidebarItems.length > 0) {
      const item = sidebarItems[0];
      const s = getComputedStyle(item);
      result.components.sidebarItem = {
        color: s.color,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        padding: s.padding,
        borderRadius: s.borderRadius,
        gap: s.gap
      };
    }
    
    // === SIDEBAR ITEM ACTIVE ===
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (s.backgroundColor === 'rgb(237, 237, 237)' && 
          parseInt(s.height) > 30 && parseInt(s.height) < 50) {
        result.components.sidebarItemActive = {
          backgroundColor: s.backgroundColor,
          borderRadius: s.borderRadius,
          padding: s.padding
        };
      }
    });
    
    // === SECTION TITLE (Create, Manage, Optimize) ===
    const sectionTitle = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent?.trim() === 'Create' && 
      el.tagName !== 'BUTTON' &&
      !el.querySelector('button')
    );
    if (sectionTitle) {
      const s = getComputedStyle(sectionTitle);
      result.components.sectionTitle = {
        color: s.color,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        padding: s.padding
      };
    }
    
    // === CHIPS (Trip planner, etc.) ===
    const chipBtn = allButtons.find(b => b.textContent?.includes('Trip planner'));
    if (chipBtn) {
      // Ищем контейнер с border
      let chipContainer = chipBtn;
      while (chipContainer) {
        const s = getComputedStyle(chipContainer);
        if (s.border.includes('1px')) {
          result.components.chip = {
            backgroundColor: s.backgroundColor,
            color: getComputedStyle(chipBtn).color,
            border: s.border,
            borderRadius: s.borderRadius,
            padding: s.padding,
            fontSize: getComputedStyle(chipBtn).fontSize
          };
          break;
        }
        chipContainer = chipContainer.parentElement;
      }
    }
    
    // === INPUT ===
    const input = document.querySelector('input');
    if (input) {
      let inputContainer = input;
      while (inputContainer && inputContainer !== document.body) {
        const s = getComputedStyle(inputContainer);
        if (s.border.includes('1px') && s.borderRadius !== '0px') {
          result.components.input = {
            backgroundColor: s.backgroundColor,
            border: s.border,
            borderRadius: s.borderRadius,
            height: s.height,
            padding: getComputedStyle(input).padding
          };
          break;
        }
        inputContainer = inputContainer.parentElement;
      }
    }
    
    // === CARD (main content area) ===
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (s.backgroundColor === 'rgb(255, 255, 255)' && 
          s.borderRadius.includes('8') &&
          parseInt(s.width) > 500) {
        if (!result.components.card) {
          result.components.card = {
            backgroundColor: s.backgroundColor,
            borderRadius: s.borderRadius,
            border: s.border
          };
        }
      }
    });
    
    return result;
  });
  
  // Конвертируем RGB в HEX для удобства
  const convertColors = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].startsWith('rgb(')) {
        const hex = rgbToHex(obj[key]);
        if (hex) obj[key + '_hex'] = hex;
      } else if (typeof obj[key] === 'object') {
        convertColors(obj[key]);
      }
    }
  };
  
  function rgbToHex(rgb) {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return null;
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgb;
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  // Добавляем HEX версии
  if (styles.colors.pageBg) {
    styles.colors.pageBg_hex = rgbToHex(styles.colors.pageBg);
  }
  
  styles.colors.backgrounds_hex = styles.colors.backgrounds
    .map(c => rgbToHex(c))
    .filter(Boolean);
  
  styles.colors.texts_hex = styles.colors.texts
    .map(c => rgbToHex(c))
    .filter(Boolean);
  
  // Выводим результат
  console.log('='.repeat(50));
  console.log('ИЗВЛЕЧЁННЫЕ СТИЛИ');
  console.log('='.repeat(50));
  console.log(JSON.stringify(styles, null, 2));
  console.log('='.repeat(50));
  
  // Сохраняем в файл
  const stylesPath = path.join(refDir, 'openai-styles.json');
  fs.writeFileSync(stylesPath, JSON.stringify(styles, null, 2));
  console.log(`\n💾 Стили сохранены: ${stylesPath}`);
  
  // Создаём CSS переменные
  const cssVars = generateCSSVariables(styles);
  const cssPath = path.join(refDir, 'openai-tokens.css');
  fs.writeFileSync(cssPath, cssVars);
  console.log(`💾 CSS токены сохранены: ${cssPath}`);
  
  await browser.close();
  console.log('\n✅ Готово!\n');
}

function generateCSSVariables(styles) {
  let css = `/* OpenAI Platform Design Tokens */
/* Автоматически извлечено ${new Date().toISOString()} */

:root {
  /* Page Background */
  --openai-bg-page: ${styles.colors.pageBg || '#f3f3f3'};
  
  /* Typography */
  --openai-font-family: ${styles.typography.fontFamily || '"OpenAI Sans", sans-serif'};
  --openai-font-size: ${styles.typography.fontSize || '14px'};
  --openai-text-color: ${styles.typography.color || '#282828'};
`;

  if (styles.components.primaryButton) {
    css += `
  /* Primary Button */
  --openai-btn-primary-bg: ${styles.components.primaryButton.backgroundColor};
  --openai-btn-primary-color: ${styles.components.primaryButton.color};
  --openai-btn-primary-radius: ${styles.components.primaryButton.borderRadius};
  --openai-btn-primary-height: ${styles.components.primaryButton.height};
`;
  }

  if (styles.components.sidebar) {
    css += `
  /* Sidebar */
  --openai-sidebar-bg: ${styles.components.sidebar.backgroundColor};
  --openai-sidebar-width: ${styles.components.sidebar.width};
  --openai-sidebar-radius: ${styles.components.sidebar.borderRadius};
`;
  }

  if (styles.components.sidebarItemActive) {
    css += `
  /* Sidebar Item Active */
  --openai-sidebar-item-active-bg: ${styles.components.sidebarItemActive.backgroundColor};
  --openai-sidebar-item-active-radius: ${styles.components.sidebarItemActive.borderRadius};
`;
  }

  if (styles.components.chip) {
    css += `
  /* Chip */
  --openai-chip-bg: ${styles.components.chip.backgroundColor};
  --openai-chip-border: ${styles.components.chip.border};
  --openai-chip-radius: ${styles.components.chip.borderRadius};
`;
  }

  if (styles.components.input) {
    css += `
  /* Input */
  --openai-input-bg: ${styles.components.input.backgroundColor};
  --openai-input-border: ${styles.components.input.border};
  --openai-input-radius: ${styles.components.input.borderRadius};
  --openai-input-height: ${styles.components.input.height};
`;
  }

  css += `}
`;

  return css;
}

extractOpenAIStyles().catch(console.error);

