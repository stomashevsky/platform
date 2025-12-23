/**
 * КОМПЛЕКСНЫЙ СКРИПТ ИЗВЛЕЧЕНИЯ НАВБАРА OpenAI Platform
 * 
 * Согласно AGENTS.md - НЕ ВЫДУМЫВАТЬ!
 * Извлекаем ВСЕ параметры через getComputedStyle()
 * 
 * Запуск:
 * 1. Chrome должен быть запущен с --remote-debugging-port=9222
 * 2. Пользователь должен быть авторизован на platform.openai.com
 * 3. node scripts/extract-header-complete.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractHeaderComplete() {
  console.log('🔌 Подключение к Chrome...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ Страница OpenAI не найдена!');
    console.log('Доступные страницы:', pages.map(p => p.url()));
    await browser.close();
    return;
  }
  
  console.log('✅ Подключено к:', page.url());
  
  // Ждём полную загрузку
  await page.waitForTimeout(1000);
  
  // ========================================
  // ИЗВЛЕЧЕНИЕ ВСЕХ ДАННЫХ HEADER
  // ========================================
  
  const headerData = await page.evaluate(() => {
    const data = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      header: {},
      projectSelector: {},
      navigation: {},
      rightSection: {},
      gaps: {},
      icons: {}
    };
    
    // Helper: конвертация RGB в HEX
    function rgbToHex(rgb) {
      if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return 'transparent';
      const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return rgb;
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    
    // ========================================
    // 1. HEADER CONTAINER
    // ========================================
    const nav = document.querySelector('nav');
    if (nav) {
      const s = getComputedStyle(nav);
      const rect = nav.getBoundingClientRect();
      data.header = {
        tag: nav.tagName,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        right: window.innerWidth - rect.right,
        padding: s.padding,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        display: s.display,
        justifyContent: s.justifyContent,
        alignItems: s.alignItems,
        position: s.position,
        backgroundColor: rgbToHex(s.backgroundColor),
        fontFamily: s.fontFamily
      };
    }
    
    // ========================================
    // 2. PROJECT SELECTOR (LEFT SIDE)
    // ========================================
    
    // Найти avatar (круглый элемент с буквой P)
    const allElements = document.querySelectorAll('*');
    let avatarElement = null;
    let personalTextElement = null;
    let separatorElement = null;
    let projectTypeElement = null;
    
    allElements.forEach(el => {
      const s = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const text = el.textContent?.trim();
      
      // Avatar: круг с #181818 и буквой P
      if (s.backgroundColor === 'rgb(24, 24, 24)' && 
          s.borderRadius === '9999px' && 
          rect.width > 20 && rect.width < 30 &&
          rect.left < 200) {
        avatarElement = el;
        data.projectSelector.avatar = {
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          borderRadius: s.borderRadius,
          backgroundColor: rgbToHex(s.backgroundColor),
          color: rgbToHex(s.color),
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          display: s.display,
          alignItems: s.alignItems,
          justifyContent: s.justifyContent,
          left: rect.left,
          top: rect.top
        };
      }
      
      // "Personal" text (без дубликатов)
      if (text === 'Personal' && rect.left < 200 && rect.width > 50 && !personalTextElement) {
        personalTextElement = el;
        data.projectSelector.personalText = {
          text: text,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: rgbToHex(s.color),
          lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        };
      }
      
      // Separator "/"
      if (text === '/' && rect.left < 300 && rect.left > 100) {
        separatorElement = el;
        data.projectSelector.separator = {
          text: '/',
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: rgbToHex(s.color),
          left: rect.left,
          marginLeft: s.marginLeft,
          marginRight: s.marginRight
        };
      }
      
      // "Default project" text
      if (text === 'Default project' && rect.left < 400) {
        projectTypeElement = el;
        data.projectSelector.projectType = {
          text: text,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: rgbToHex(s.color),
          lineHeight: s.lineHeight,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        };
      }
    });
    
    // ========================================
    // 3. NAVIGATION ITEMS (RIGHT SIDE)
    // ========================================
    
    const navLinks = document.querySelectorAll('nav a');
    const navItems = [];
    
    navLinks.forEach((link, index) => {
      const s = getComputedStyle(link);
      const rect = link.getBoundingClientRect();
      const text = link.textContent?.trim();
      
      // Только видимые навигационные ссылки (Dashboard, Docs, API)
      if (rect.width > 20 && text && (text.includes('Dashboard') || text.includes('Docs') || text.includes('API'))) {
        // Очищаем дублированный текст
        const cleanText = text.replace(/(.+)\1/, '$1');
        
        navItems.push({
          index,
          text: cleanText,
          href: link.getAttribute('href'),
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: rgbToHex(s.color),
          padding: s.padding,
          paddingLeft: s.paddingLeft,
          paddingRight: s.paddingRight,
          borderRadius: s.borderRadius,
          backgroundColor: rgbToHex(s.backgroundColor),
          lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          isActive: s.fontWeight === '600' || s.fontWeight === 'bold'
        });
      }
    });
    
    data.navigation.items = navItems;
    
    // ========================================
    // 4. SETTINGS BUTTON
    // ========================================
    
    const settingsLink = document.querySelector('nav a[href="/settings"]');
    if (settingsLink) {
      const s = getComputedStyle(settingsLink);
      const rect = settingsLink.getBoundingClientRect();
      data.rightSection.settingsButton = {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        padding: s.padding,
        borderRadius: s.borderRadius,
        color: rgbToHex(s.color),
        left: rect.left,
        top: rect.top
      };
      
      // Settings SVG icon
      const svg = settingsLink.querySelector('svg');
      if (svg) {
        const svgRect = svg.getBoundingClientRect();
        const pathEl = svg.querySelector('path');
        data.icons.settings = {
          width: `${svgRect.width}px`,
          height: `${svgRect.height}px`,
          viewBox: svg.getAttribute('viewBox'),
          fill: svg.getAttribute('fill') || getComputedStyle(svg).fill,
          pathD: pathEl ? pathEl.getAttribute('d') : null
        };
      }
    }
    
    // ========================================
    // 5. USER AVATAR (rightmost element)
    // ========================================
    
    // Найти avatar пользователя (круг справа)
    const rightElements = [];
    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      // Круглый элемент справа
      if (s.borderRadius === '9999px' && rect.left > 700 && rect.width > 20 && rect.width < 35) {
        rightElements.push({
          el,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    });
    
    // Самый правый круглый элемент - это user avatar
    rightElements.sort((a, b) => b.left - a.left);
    if (rightElements.length > 0) {
      const userAvatarEl = rightElements[0].el;
      const s = getComputedStyle(userAvatarEl);
      const rect = userAvatarEl.getBoundingClientRect();
      data.rightSection.userAvatar = {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: s.borderRadius,
        backgroundColor: rgbToHex(s.backgroundColor),
        overflow: s.overflow,
        left: rect.left,
        top: rect.top
      };
    }
    
    // ========================================
    // 6. GAPS (РАССТОЯНИЯ МЕЖДУ ЭЛЕМЕНТАМИ)
    // ========================================
    
    // Измеряем расстояния через getBoundingClientRect
    if (avatarElement && personalTextElement) {
      const avatarRect = avatarElement.getBoundingClientRect();
      const personalRect = personalTextElement.getBoundingClientRect();
      data.gaps.avatarToPersonal = personalRect.left - avatarRect.right;
    }
    
    if (separatorElement && personalTextElement) {
      const personalRect = personalTextElement.getBoundingClientRect();
      const separatorRect = separatorElement.getBoundingClientRect();
      data.gaps.personalToSeparator = separatorRect.left - personalRect.right;
    }
    
    if (separatorElement && projectTypeElement) {
      const separatorRect = separatorElement.getBoundingClientRect();
      const typeRect = projectTypeElement.getBoundingClientRect();
      data.gaps.separatorToProjectType = typeRect.left - separatorRect.right;
    }
    
    // Gaps между nav items
    if (navItems.length >= 2) {
      data.gaps.navItemGaps = [];
      for (let i = 0; i < navItems.length - 1; i++) {
        data.gaps.navItemGaps.push({
          from: navItems[i].text,
          to: navItems[i + 1].text,
          gap: navItems[i + 1].left - (navItems[i].left + navItems[i].width)
        });
      }
    }
    
    // Gap между последним nav item и settings
    if (navItems.length > 0 && data.rightSection.settingsButton) {
      const lastNav = navItems[navItems.length - 1];
      data.gaps.lastNavToSettings = data.rightSection.settingsButton.left - (lastNav.left + lastNav.width);
    }
    
    // Gap между settings и user avatar
    if (data.rightSection.settingsButton && data.rightSection.userAvatar) {
      const settingsRight = data.rightSection.settingsButton.left + parseFloat(data.rightSection.settingsButton.width);
      data.gaps.settingsToAvatar = data.rightSection.userAvatar.left - settingsRight;
    }
    
    // ========================================
    // 7. DROPDOWN ICONS (expand icons)
    // ========================================
    
    const expandIcons = [];
    document.querySelectorAll('svg').forEach(svg => {
      const rect = svg.getBoundingClientRect();
      // Маленькие иконки в левой части header (dropdown arrows)
      if (rect.left < 400 && rect.top < 60 && rect.width < 20 && rect.height < 20) {
        const pathEl = svg.querySelector('path');
        expandIcons.push({
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          viewBox: svg.getAttribute('viewBox'),
          left: rect.left,
          top: rect.top,
          pathD: pathEl ? pathEl.getAttribute('d') : null,
          fill: svg.getAttribute('fill'),
          color: getComputedStyle(svg).color
        });
      }
    });
    data.icons.expandIcons = expandIcons;
    
    return data;
  });
  
  // ========================================
  // HOVER STATES
  // ========================================
  console.log('🎯 Извлечение hover состояний...');
  
  // Hover на nav items
  const navLinks = await page.$$('nav a');
  const hoverStates = [];
  
  for (const link of navLinks) {
    const text = await link.textContent();
    const cleanText = text?.trim().replace(/(.+)\1/, '$1');
    
    if (cleanText && (cleanText.includes('Dashboard') || cleanText.includes('Docs') || cleanText.includes('API'))) {
      // Получаем default state
      const defaultState = await page.evaluate(el => {
        const s = getComputedStyle(el);
        return {
          color: s.color,
          backgroundColor: s.backgroundColor
        };
      }, link);
      
      // Hover
      await link.hover();
      await page.waitForTimeout(150);
      
      const hoverState = await page.evaluate(el => {
        const s = getComputedStyle(el);
        return {
          color: s.color,
          backgroundColor: s.backgroundColor
        };
      }, link);
      
      hoverStates.push({
        text: cleanText,
        default: defaultState,
        hover: hoverState
      });
      
      // Убрать hover
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
    }
  }
  
  headerData.navigation.hoverStates = hoverStates;
  
  // ========================================
  // СОХРАНЕНИЕ
  // ========================================
  
  const outputPath = path.join(__dirname, '../reference/header-complete.json');
  fs.writeFileSync(outputPath, JSON.stringify(headerData, null, 2));
  console.log(`✅ Данные сохранены: ${outputPath}`);
  
  // Скриншот header
  const screenshotPath = path.join(__dirname, '../reference/screenshots/header-extracted.png');
  
  // Делаем скриншот только header области
  await page.screenshot({ 
    path: screenshotPath,
    clip: {
      x: 0,
      y: 0,
      width: 1200,
      height: 60
    }
  });
  console.log(`📸 Скриншот сохранён: ${screenshotPath}`);
  
  // Вывод ключевых данных
  console.log('\n=== КЛЮЧЕВЫЕ ДАННЫЕ HEADER ===\n');
  console.log('Header:', JSON.stringify(headerData.header, null, 2));
  console.log('\nProject Selector:', JSON.stringify(headerData.projectSelector, null, 2));
  console.log('\nNavigation Items:', JSON.stringify(headerData.navigation.items, null, 2));
  console.log('\nGaps:', JSON.stringify(headerData.gaps, null, 2));
  console.log('\nRight Section:', JSON.stringify(headerData.rightSection, null, 2));
  
  await browser.close();
  console.log('\n✅ Извлечение завершено!');
}

extractHeaderComplete().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});

