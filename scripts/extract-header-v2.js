/**
 * ПРАВИЛЬНЫЙ СКРИПТ ИЗВЛЕЧЕНИЯ НАВБАРА v2
 * 
 * Исправления по сравнению с v1:
 * 1. Валидация всех извлечённых данных
 * 2. Правильное получение текста (без дублирования)
 * 3. Полные SVG иконки (outerHTML)
 * 4. Точные измерения gaps через getBoundingClientRect()
 * 5. Проверка загрузки шрифтов
 * 
 * Запуск:
 * node scripts/extract-header-v2.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================
// ВАЛИДАЦИЯ
// ============================================

function validateExtractedData(data) {
  const errors = [];
  
  // 1. Header должен быть найден
  if (!data.header || Object.keys(data.header).length === 0) {
    errors.push('Header не найден');
  }
  
  // 2. Размеры > 0
  if (data.header?.height <= 0) {
    errors.push(`Header height невалидный: ${data.header.height}`);
  }
  
  // 3. Project selector
  if (!data.projectSelector?.avatar) {
    errors.push('Project avatar не найден');
  }
  
  // 4. Navigation items
  if (!data.navigation?.items || data.navigation.items.length === 0) {
    errors.push('Navigation items не найдены');
  }
  
  // 5. Проверка на дублированный текст
  if (data.navigation?.items) {
    data.navigation.items.forEach(item => {
      if (item.text && /^(.+)\1$/.test(item.text)) {
        errors.push(`Дублированный текст: "${item.text}" - ИСПРАВИТЬ!`);
      }
    });
  }
  
  // 6. SVG иконки
  if (!data.icons?.expand?.outerHTML) {
    errors.push('Expand icon SVG не извлечён');
  }
  if (!data.icons?.settings?.outerHTML) {
    errors.push('Settings icon SVG не извлечён');
  }
  
  // 7. Шрифт
  if (!data.fonts?.family) {
    errors.push('Font family не извлечён');
  }
  
  if (errors.length > 0) {
    console.error('\n❌ ВАЛИДАЦИЯ НЕ ПРОЙДЕНА:');
    errors.forEach(e => console.error(`  - ${e}`));
    return false;
  }
  
  console.log('✅ Валидация пройдена');
  return true;
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================

async function extractHeaderV2() {
  console.log('🔌 Подключение к Chrome...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ Страница OpenAI не найдена!');
    console.log('Доступные страницы:', pages.map(p => p.url()));
    await browser.close();
    process.exit(1);
  }
  
  console.log('✅ Подключено к:', page.url());
  
  // Ждём полную загрузку
  await page.waitForTimeout(2000);
  
  // ========================================
  // ИЗВЛЕЧЕНИЕ ДАННЫХ
  // ========================================
  
  const data = await page.evaluate(() => {
    const result = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      fonts: {},
      header: {},
      projectSelector: {},
      navigation: { items: [], hoverStates: [] },
      rightSection: {},
      gaps: {},
      icons: {},
    };
    
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    function rgbToHex(rgb) {
      if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return 'transparent';
      const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return rgb;
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    
    // Получить только прямой текст элемента (без детей)
    function getDirectText(element) {
      // Попробовать найти span с текстом
      const span = element.querySelector('span');
      if (span && span.childNodes.length === 1 && span.childNodes[0].nodeType === Node.TEXT_NODE) {
        return span.textContent.trim();
      }
      
      // Или первый текстовый узел
      for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          return node.textContent.trim();
        }
      }
      
      // Или innerText если короткий
      const text = element.innerText?.trim();
      if (text && text.length < 50) {
        // Проверить на дублирование
        const half = text.length / 2;
        if (text.slice(0, half) === text.slice(half)) {
          return text.slice(0, half);
        }
        return text;
      }
      
      return element.textContent?.trim()?.slice(0, 30) || '';
    }
    
    function measureGap(el1, el2) {
      if (!el1 || !el2) return null;
      const rect1 = el1.getBoundingClientRect();
      const rect2 = el2.getBoundingClientRect();
      return Math.round(rect2.left - rect1.right);
    }
    
    // ========================================
    // 1. ШРИФТЫ
    // ========================================
    
    const bodyStyle = getComputedStyle(document.body);
    result.fonts = {
      family: bodyStyle.fontFamily,
      openAISansLoaded: document.fonts.check('14px "OpenAI Sans"'),
      size: bodyStyle.fontSize,
      weight: bodyStyle.fontWeight,
      letterSpacing: bodyStyle.letterSpacing,
      lineHeight: bodyStyle.lineHeight,
    };
    
    // ========================================
    // 2. HEADER CONTAINER
    // ========================================
    
    // Найти header/nav элемент в верхней части страницы
    const headerCandidates = document.querySelectorAll('header, nav, [role="banner"]');
    let headerEl = null;
    
    for (const el of headerCandidates) {
      const rect = el.getBoundingClientRect();
      if (rect.top < 10 && rect.height > 40 && rect.height < 100) {
        headerEl = el;
        break;
      }
    }
    
    // Fallback: искать по позиции
    if (!headerEl) {
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        if (rect.top === 0 && rect.height >= 50 && rect.height <= 60 && 
            rect.width > 500 && s.display === 'flex') {
          headerEl = el;
        }
      });
    }
    
    if (headerEl) {
      const rect = headerEl.getBoundingClientRect();
      const s = getComputedStyle(headerEl);
      result.header = {
        tag: headerEl.tagName,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        right: Math.round(window.innerWidth - rect.right),
        padding: s.padding,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        display: s.display,
        alignItems: s.alignItems,
        justifyContent: s.justifyContent,
        backgroundColor: rgbToHex(s.backgroundColor),
        fontFamily: s.fontFamily,
      };
    }
    
    // ========================================
    // 3. PROJECT SELECTOR (LEFT SIDE)
    // ========================================
    
    // Найти чёрный круглый avatar
    let avatarEl = null;
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (s.backgroundColor === 'rgb(24, 24, 24)' && 
          s.borderRadius === '9999px' && 
          rect.width >= 20 && rect.width <= 30 &&
          rect.top < 60 && rect.left < 100) {
        avatarEl = el;
      }
    });
    
    if (avatarEl) {
      const rect = avatarEl.getBoundingClientRect();
      const s = getComputedStyle(avatarEl);
      result.projectSelector.avatar = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        borderRadius: s.borderRadius,
        backgroundColor: rgbToHex(s.backgroundColor),
        color: rgbToHex(s.color),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        text: getDirectText(avatarEl),
        left: Math.round(rect.left),
        top: Math.round(rect.top),
      };
    }
    
    // Найти кнопки Project selector (Personal, Default project)
    const projectButtons = [];
    document.querySelectorAll('button').forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const s = getComputedStyle(btn);
      const text = getDirectText(btn);
      
      if (rect.top < 60 && rect.left < 400 && rect.width > 50 && 
          (text.includes('Personal') || text.includes('Default') || text.includes('project'))) {
        projectButtons.push({
          element: btn,
          text: text,
          rect: rect,
          styles: s,
        });
      }
    });
    
    // Personal button
    const personalBtn = projectButtons.find(b => b.text.includes('Personal'));
    if (personalBtn) {
      result.projectSelector.personalButton = {
        text: personalBtn.text,
        fontSize: personalBtn.styles.fontSize,
        fontWeight: personalBtn.styles.fontWeight,
        color: rgbToHex(personalBtn.styles.color),
        lineHeight: personalBtn.styles.lineHeight,
        letterSpacing: personalBtn.styles.letterSpacing,
        padding: personalBtn.styles.padding,
        left: Math.round(personalBtn.rect.left),
        width: Math.round(personalBtn.rect.width),
        height: Math.round(personalBtn.rect.height),
      };
      
      // Gap от avatar к personal button
      if (avatarEl) {
        result.gaps.avatarToPersonal = measureGap(avatarEl, personalBtn.element);
      }
    }
    
    // Separator "/"
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      const text = el.textContent?.trim();
      if (text === '/' && rect.left < 200 && rect.left > 50 && rect.top < 60) {
        const s = getComputedStyle(el);
        result.projectSelector.separator = {
          text: '/',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: rgbToHex(s.color),
          left: Math.round(rect.left),
        };
      }
    });
    
    // Project type button
    const projectTypeBtn = projectButtons.find(b => b.text.includes('Default') || b.text.includes('project'));
    if (projectTypeBtn && projectTypeBtn !== personalBtn) {
      result.projectSelector.projectTypeButton = {
        text: projectTypeBtn.text,
        fontSize: projectTypeBtn.styles.fontSize,
        fontWeight: projectTypeBtn.styles.fontWeight,
        color: rgbToHex(projectTypeBtn.styles.color),
        lineHeight: projectTypeBtn.styles.lineHeight,
        padding: projectTypeBtn.styles.padding,
        left: Math.round(projectTypeBtn.rect.left),
        width: Math.round(projectTypeBtn.rect.width),
      };
    }
    
    // ========================================
    // 4. NAVIGATION ITEMS
    // ========================================
    
    const navLinks = [];
    document.querySelectorAll('a').forEach(link => {
      const rect = link.getBoundingClientRect();
      const s = getComputedStyle(link);
      const href = link.getAttribute('href') || '';
      
      // Ссылки в header (top < 60) справа (left > 400)
      if (rect.top < 60 && rect.left > 400 && rect.width > 20 && rect.height > 20) {
        const text = getDirectText(link);
        
        // Пропустить пустые (иконки settings/avatar)
        if (text && text.length > 0 && text.length < 30) {
          navLinks.push({
            element: link,
            text: text,
            href: href,
            rect: rect,
            styles: s,
          });
        }
      }
    });
    
    // Сортировать по X позиции
    navLinks.sort((a, b) => a.rect.left - b.rect.left);
    
    result.navigation.items = navLinks.map((item, index) => ({
      index: index,
      text: item.text,
      href: item.href,
      fontSize: item.styles.fontSize,
      fontWeight: item.styles.fontWeight,
      color: rgbToHex(item.styles.color),
      padding: item.styles.padding,
      borderRadius: item.styles.borderRadius,
      backgroundColor: rgbToHex(item.styles.backgroundColor),
      lineHeight: item.styles.lineHeight,
      letterSpacing: item.styles.letterSpacing,
      left: Math.round(item.rect.left),
      top: Math.round(item.rect.top),
      width: Math.round(item.rect.width),
      height: Math.round(item.rect.height),
      isActive: item.styles.fontWeight === '600' || parseInt(item.styles.fontWeight) >= 600,
    }));
    
    // Измерить gaps между nav items
    if (navLinks.length >= 2) {
      result.gaps.navItemGaps = [];
      for (let i = 0; i < navLinks.length - 1; i++) {
        result.gaps.navItemGaps.push({
          from: navLinks[i].text,
          to: navLinks[i + 1].text,
          gap: measureGap(navLinks[i].element, navLinks[i + 1].element),
        });
      }
    }
    
    // ========================================
    // 5. SETTINGS BUTTON & USER AVATAR
    // ========================================
    
    // Settings link (href="/settings")
    const settingsLink = document.querySelector('a[href="/settings"]');
    if (settingsLink) {
      const rect = settingsLink.getBoundingClientRect();
      const s = getComputedStyle(settingsLink);
      result.rightSection.settingsButton = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        padding: s.padding,
        borderRadius: s.borderRadius,
        color: rgbToHex(s.color),
        left: Math.round(rect.left),
        top: Math.round(rect.top),
      };
      
      // Settings SVG
      const svg = settingsLink.querySelector('svg');
      if (svg) {
        const svgRect = svg.getBoundingClientRect();
        result.icons.settings = {
          outerHTML: svg.outerHTML,
          width: Math.round(svgRect.width),
          height: Math.round(svgRect.height),
          viewBox: svg.getAttribute('viewBox'),
          fill: svg.getAttribute('fill') || getComputedStyle(svg).fill,
        };
      }
      
      // Gap от последнего nav item к settings
      if (navLinks.length > 0) {
        const lastNav = navLinks[navLinks.length - 1];
        result.gaps.lastNavToSettings = measureGap(lastNav.element, settingsLink);
      }
    }
    
    // User avatar (круглый элемент справа)
    let userAvatarEl = null;
    document.querySelectorAll('button, a, div').forEach(el => {
      const rect = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      
      // Круглый элемент в правой части header
      if (rect.top < 60 && rect.left > 800 && 
          s.borderRadius === '9999px' && 
          rect.width >= 25 && rect.width <= 35 &&
          rect.height >= 25 && rect.height <= 35) {
        userAvatarEl = el;
      }
    });
    
    if (userAvatarEl) {
      const rect = userAvatarEl.getBoundingClientRect();
      const s = getComputedStyle(userAvatarEl);
      result.rightSection.userAvatar = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        borderRadius: s.borderRadius,
        backgroundColor: rgbToHex(s.backgroundColor),
        overflow: s.overflow,
        left: Math.round(rect.left),
        top: Math.round(rect.top),
      };
      
      // Gap от settings к avatar
      if (settingsLink) {
        result.gaps.settingsToAvatar = measureGap(settingsLink, userAvatarEl);
      }
    }
    
    // ========================================
    // 6. SVG ИКОНКИ
    // ========================================
    
    // Expand icons (в project selector buttons)
    document.querySelectorAll('svg').forEach(svg => {
      const rect = svg.getBoundingClientRect();
      const viewBox = svg.getAttribute('viewBox');
      
      // Expand icons в левой части (project selector)
      if (rect.left < 300 && rect.top < 60 && 
          rect.width > 5 && rect.width < 20 &&
          viewBox && viewBox.includes('10 16')) {
        if (!result.icons.expand) {
          result.icons.expand = {
            outerHTML: svg.outerHTML,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            viewBox: viewBox,
            color: rgbToHex(getComputedStyle(svg).color),
          };
        }
      }
    });
    
    return result;
  });
  
  // ========================================
  // HOVER STATES
  // ========================================
  
  console.log('🎯 Извлечение hover состояний...');
  
  // Hover на nav items
  const navLinks = await page.$$('nav a, header a');
  const hoverStates = [];
  
  for (const link of navLinks) {
    const linkData = await page.evaluate(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top > 60 || rect.left < 400) return null;
      
      const text = el.innerText?.trim();
      if (!text || text.length === 0 || text.length > 30) return null;
      
      // Очистить дублированный текст
      let cleanText = text;
      const half = text.length / 2;
      if (text.slice(0, half) === text.slice(half)) {
        cleanText = text.slice(0, half);
      }
      
      const s = getComputedStyle(el);
      return {
        text: cleanText,
        defaultColor: s.color,
        defaultBg: s.backgroundColor,
      };
    }, link);
    
    if (!linkData) continue;
    
    // Hover
    await link.hover();
    await page.waitForTimeout(150);
    
    const hoverData = await page.evaluate(el => {
      const s = getComputedStyle(el);
      return {
        color: s.color,
        backgroundColor: s.backgroundColor,
      };
    }, link);
    
    hoverStates.push({
      text: linkData.text,
      default: {
        color: linkData.defaultColor,
        backgroundColor: linkData.defaultBg,
      },
      hover: hoverData,
    });
    
    // Убрать hover
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
  }
  
  data.navigation.hoverStates = hoverStates;
  
  // ========================================
  // ВАЛИДАЦИЯ
  // ========================================
  
  console.log('\n📋 Проверка извлечённых данных...');
  const isValid = validateExtractedData(data);
  
  if (!isValid) {
    console.error('\n⚠️  Данные сохранены, но требуют проверки!');
  }
  
  // ========================================
  // СОХРАНЕНИЕ
  // ========================================
  
  const outputPath = path.join(__dirname, '../reference/header-v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Данные сохранены: ${outputPath}`);
  
  // Скриншот
  const screenshotPath = path.join(__dirname, '../reference/screenshots/header-v2-original.png');
  await page.screenshot({ 
    path: screenshotPath,
    clip: { x: 0, y: 0, width: 1200, height: 60 }
  });
  console.log(`📸 Скриншот: ${screenshotPath}`);
  
  // ========================================
  // ВЫВОД РЕЗУЛЬТАТОВ
  // ========================================
  
  console.log('\n' + '='.repeat(60));
  console.log('ИЗВЛЕЧЁННЫЕ ДАННЫЕ');
  console.log('='.repeat(60));
  
  console.log('\n📝 ШРИФТЫ:');
  console.log(JSON.stringify(data.fonts, null, 2));
  
  console.log('\n📐 HEADER:');
  console.log(JSON.stringify(data.header, null, 2));
  
  console.log('\n👤 PROJECT SELECTOR:');
  console.log(JSON.stringify(data.projectSelector, null, 2));
  
  console.log('\n🧭 NAVIGATION:');
  console.log(JSON.stringify(data.navigation.items, null, 2));
  
  console.log('\n📏 GAPS:');
  console.log(JSON.stringify(data.gaps, null, 2));
  
  console.log('\n⚙️  RIGHT SECTION:');
  console.log(JSON.stringify(data.rightSection, null, 2));
  
  console.log('\n🎨 ICONS (краткая информация):');
  if (data.icons.expand) {
    console.log(`  - Expand: ${data.icons.expand.width}x${data.icons.expand.height}, viewBox: ${data.icons.expand.viewBox}`);
  }
  if (data.icons.settings) {
    console.log(`  - Settings: ${data.icons.settings.width}x${data.icons.settings.height}, viewBox: ${data.icons.settings.viewBox}`);
  }
  
  await browser.close();
  console.log('\n✅ Извлечение завершено!');
  
  return isValid;
}

// Запуск
extractHeaderV2()
  .then(valid => {
    if (!valid) {
      console.log('\n⚠️  Проверьте данные и исправьте скрипт при необходимости');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
    process.exit(1);
  });

