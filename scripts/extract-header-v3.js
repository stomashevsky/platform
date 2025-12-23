/**
 * ДЕТАЛЬНЫЙ СКРИПТ ИЗВЛЕЧЕНИЯ НАВБАРА v3
 * 
 * Исправления по сравнению с v2:
 * 1. Извлекает paddingLeft header (расстояние от края до аватарки)
 * 2. Извлекает gap между текстом и иконкой в кнопках
 * 3. Извлекает ТОЧНЫЙ fontWeight как число
 * 4. Извлекает hover backgroundColor для nav items
 * 5. Извлекает user avatar с изображением
 * 
 * Запуск:
 * node scripts/extract-header-v3.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================
// ВАЛИДАЦИЯ
// ============================================

function validateCompleteExtraction(data) {
  const missing = [];
  
  // Header padding
  if (data.layout?.headerPaddingLeft === undefined) {
    missing.push('layout.headerPaddingLeft');
  }
  if (data.layout?.avatarDistanceFromLeft === undefined) {
    missing.push('layout.avatarDistanceFromLeft');
  }
  
  // Personal button gap
  if (data.projectSelector?.personalButton?.gap === undefined) {
    missing.push('personalButton.gap (между текстом и иконкой)');
  }
  
  // Project type button gap
  if (data.projectSelector?.projectTypeButton?.gap === undefined) {
    missing.push('projectTypeButton.gap');
  }
  
  // Navigation hover states
  if (!data.navigation?.items?.length) {
    missing.push('navigation.items');
  } else {
    data.navigation.items.forEach((item, i) => {
      if (!item.hover) {
        missing.push(`navigation.items[${i}].hover`);
      }
      if (typeof item.normal?.fontWeight !== 'number') {
        missing.push(`navigation.items[${i}].fontWeight должен быть числом`);
      }
    });
  }
  
  // User avatar
  if (!data.rightSection?.userAvatar?.width) {
    missing.push('userAvatar');
  }
  
  if (missing.length > 0) {
    console.error('\n❌ ПРОПУЩЕНЫ ПАРАМЕТРЫ:');
    missing.forEach(m => console.error(`  - ${m}`));
    return false;
  }
  
  console.log('✅ Все обязательные параметры извлечены');
  return true;
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================

async function extractHeaderV3() {
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
      
      // LAYOUT - расстояния от краёв
      layout: {},
      
      // FONTS
      fonts: {},
      
      // HEADER контейнер
      header: {},
      
      // PROJECT SELECTOR - полные данные
      projectSelector: {},
      
      // NAVIGATION - с hover states
      navigation: { items: [] },
      
      // RIGHT SECTION
      rightSection: {},
      
      // GAPS между секциями
      gaps: {},
      
      // ICONS
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
    
    function parseFontWeight(fw) {
      // Конвертировать строку в число
      const num = parseInt(fw);
      return isNaN(num) ? 400 : num;
    }
    
    function getDirectText(element) {
      const span = element.querySelector('span');
      if (span && span.childNodes.length === 1 && span.childNodes[0].nodeType === Node.TEXT_NODE) {
        return span.textContent.trim();
      }
      for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          return node.textContent.trim();
        }
      }
      const text = element.innerText?.trim();
      if (text && text.length < 50) {
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
    
    function measureInnerGap(button) {
      // Измерить gap между текстом и иконкой внутри кнопки
      const spans = button.querySelectorAll('span');
      const svg = button.querySelector('svg');
      
      if (!svg) return null;
      
      // Найти span с текстом (не содержащий svg)
      let textSpan = null;
      for (const span of spans) {
        if (!span.querySelector('svg') && span.textContent.trim()) {
          textSpan = span;
          break;
        }
      }
      
      if (!textSpan) return null;
      
      const textRect = textSpan.getBoundingClientRect();
      const iconRect = svg.getBoundingClientRect();
      
      return Math.round(iconRect.left - textRect.right);
    }
    
    // ========================================
    // 1. FONTS
    // ========================================
    
    const bodyStyle = getComputedStyle(document.body);
    result.fonts = {
      family: bodyStyle.fontFamily,
      openAISansLoaded: document.fonts.check('14px "OpenAI Sans"'),
    };
    
    // ========================================
    // 2. НАЙТИ HEADER
    // ========================================
    
    let headerEl = null;
    document.querySelectorAll('header, nav, [role="banner"]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < 10 && rect.height > 40 && rect.height < 100) {
        if (!headerEl || rect.width > headerEl.getBoundingClientRect().width) {
          headerEl = el;
        }
      }
    });
    
    // Fallback - искать родителя аватарки
    if (!headerEl) {
      const avatar = document.querySelector('[class*="avatar"], [class*="Avatar"]');
      if (avatar) {
        let parent = avatar.parentElement;
        while (parent && parent !== document.body) {
          const rect = parent.getBoundingClientRect();
          if (rect.top === 0 && rect.height >= 50 && rect.height <= 60) {
            headerEl = parent;
            break;
          }
          parent = parent.parentElement;
        }
      }
    }
    
    // ========================================
    // 3. LAYOUT - расстояния от краёв
    // ========================================
    
    // Найти чёрный аватар
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
      const avatarRect = avatarEl.getBoundingClientRect();
      result.layout.avatarDistanceFromLeft = Math.round(avatarRect.left);
      
      // Header padding
      if (headerEl) {
        const headerRect = headerEl.getBoundingClientRect();
        const headerS = getComputedStyle(headerEl);
        result.layout.headerPaddingLeft = parseInt(headerS.paddingLeft) || 0;
        result.layout.headerPaddingRight = parseInt(headerS.paddingRight) || 0;
        
        // Если paddingLeft = 0, то avatarDistanceFromLeft это реальный отступ
        if (result.layout.headerPaddingLeft === 0) {
          result.layout.headerPaddingLeft = Math.round(avatarRect.left - headerRect.left);
        }
      }
    }
    
    // ========================================
    // 4. HEADER CONTAINER
    // ========================================
    
    if (headerEl) {
      const rect = headerEl.getBoundingClientRect();
      const s = getComputedStyle(headerEl);
      result.header = {
        tag: headerEl.tagName,
        height: Math.round(rect.height),
        paddingLeft: result.layout.headerPaddingLeft,
        paddingRight: result.layout.headerPaddingRight,
        display: s.display,
        alignItems: s.alignItems,
        fontFamily: s.fontFamily,
      };
    }
    
    // ========================================
    // 5. PROJECT SELECTOR - ДЕТАЛЬНО
    // ========================================
    
    // Avatar
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
        fontWeight: parseFontWeight(s.fontWeight),
        text: getDirectText(avatarEl),
        distanceFromLeft: Math.round(rect.left),
      };
    }
    
    // Найти кнопки Personal и Default project
    const allButtons = Array.from(document.querySelectorAll('button'));
    
    allButtons.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const s = getComputedStyle(btn);
      const text = getDirectText(btn);
      
      if (rect.top > 60 || rect.left > 400) return;
      
      // Personal button
      if (text === 'Personal' || text.includes('Personal')) {
        const innerGap = measureInnerGap(btn);
        const svg = btn.querySelector('svg');
        
        result.projectSelector.personalButton = {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          padding: s.padding,
          paddingLeft: parseInt(s.paddingLeft) || 0,
          paddingRight: parseInt(s.paddingRight) || 0,
          gap: innerGap,
          left: Math.round(rect.left),
          text: {
            content: 'Personal',
            fontSize: s.fontSize,
            fontWeight: parseFontWeight(s.fontWeight),
            color: rgbToHex(s.color),
            letterSpacing: s.letterSpacing,
          },
          icon: svg ? {
            width: Math.round(svg.getBoundingClientRect().width),
            height: Math.round(svg.getBoundingClientRect().height),
            marginLeft: innerGap,
            viewBox: svg.getAttribute('viewBox'),
            outerHTML: svg.outerHTML,
          } : null,
        };
        
        // Gap от avatar к personal button
        if (avatarEl) {
          result.gaps.avatarToPersonal = measureGap(avatarEl, btn);
        }
      }
      
      // Default project button
      if (text.includes('Default') || text.includes('project')) {
        if (result.projectSelector.personalButton && 
            rect.left > result.projectSelector.personalButton.left + 50) {
          const innerGap = measureInnerGap(btn);
          const svg = btn.querySelector('svg');
          
          result.projectSelector.projectTypeButton = {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            padding: s.padding,
            paddingLeft: parseInt(s.paddingLeft) || 0,
            paddingRight: parseInt(s.paddingRight) || 0,
            gap: innerGap,
            left: Math.round(rect.left),
            text: {
              content: text,
              fontSize: s.fontSize,
              fontWeight: parseFontWeight(s.fontWeight),
              color: rgbToHex(s.color),
            },
            icon: svg ? {
              width: Math.round(svg.getBoundingClientRect().width),
              height: Math.round(svg.getBoundingClientRect().height),
              marginLeft: innerGap,
              viewBox: svg.getAttribute('viewBox'),
            } : null,
          };
        }
      }
    });
    
    // Separator "/"
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      const text = el.textContent?.trim();
      if (text === '/' && rect.left < 200 && rect.left > 50 && rect.top < 60) {
        const s = getComputedStyle(el);
        result.projectSelector.separator = {
          text: '/',
          fontSize: s.fontSize,
          fontWeight: parseFontWeight(s.fontWeight),
          color: rgbToHex(s.color),
          marginLeft: parseInt(s.marginLeft) || 0,
          marginRight: parseInt(s.marginRight) || 0,
        };
      }
    });
    
    // ========================================
    // 6. NAVIGATION ITEMS
    // ========================================
    
    const navLinks = [];
    document.querySelectorAll('a').forEach(link => {
      const rect = link.getBoundingClientRect();
      const s = getComputedStyle(link);
      const href = link.getAttribute('href') || '';
      
      if (rect.top < 60 && rect.left > 400 && rect.width > 20 && rect.height > 20) {
        const text = getDirectText(link);
        
        if (text && text.length > 0 && text.length < 30 && 
            !href.includes('/settings')) {
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
    
    navLinks.sort((a, b) => a.rect.left - b.rect.left);
    
    result.navigation.items = navLinks.map((item, index) => ({
      index: index,
      text: item.text,
      href: item.href,
      normal: {
        fontSize: item.styles.fontSize,
        fontWeight: parseFontWeight(item.styles.fontWeight),
        color: rgbToHex(item.styles.color),
        padding: item.styles.padding,
        borderRadius: item.styles.borderRadius,
        backgroundColor: rgbToHex(item.styles.backgroundColor),
        lineHeight: item.styles.lineHeight,
        letterSpacing: item.styles.letterSpacing,
      },
      hover: null, // будет заполнено позже
      isActive: parseFontWeight(item.styles.fontWeight) >= 600,
      left: Math.round(item.rect.left),
      width: Math.round(item.rect.width),
      height: Math.round(item.rect.height),
    }));
    
    // Gaps между nav items
    if (navLinks.length >= 2) {
      result.gaps.navItemGap = measureGap(navLinks[0].element, navLinks[1].element);
    }
    
    // ========================================
    // 7. SETTINGS BUTTON & USER AVATAR
    // ========================================
    
    const settingsLink = document.querySelector('a[href="/settings"]');
    if (settingsLink) {
      const rect = settingsLink.getBoundingClientRect();
      const s = getComputedStyle(settingsLink);
      const svg = settingsLink.querySelector('svg');
      
      result.rightSection.settingsButton = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        padding: s.padding,
        borderRadius: s.borderRadius,
        color: rgbToHex(s.color),
        left: Math.round(rect.left),
      };
      
      if (svg) {
        result.icons.settings = {
          outerHTML: svg.outerHTML,
          width: Math.round(svg.getBoundingClientRect().width),
          height: Math.round(svg.getBoundingClientRect().height),
          viewBox: svg.getAttribute('viewBox'),
        };
      }
      
      // Gap от последнего nav к settings
      if (navLinks.length > 0) {
        result.gaps.lastNavToSettings = measureGap(
          navLinks[navLinks.length - 1].element, 
          settingsLink
        );
      }
    }
    
    // User Avatar - ищем более тщательно
    let userAvatarEl = null;
    
    // Метод 1: Круглый элемент справа
    document.querySelectorAll('button, a, div, img').forEach(el => {
      const rect = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      
      if (rect.top > 0 && rect.top < 60 && rect.left > 900 && 
          (s.borderRadius === '9999px' || s.borderRadius === '50%' || s.borderRadius === '100%') && 
          rect.width >= 25 && rect.width <= 40 &&
          rect.height >= 25 && rect.height <= 40 &&
          el !== avatarEl) {  // не путать с P аватаркой
        userAvatarEl = el;
      }
    });
    
    // Метод 2: Искать по структуре - последний элемент в header
    if (!userAvatarEl && headerEl) {
      const lastChild = headerEl.querySelector(':scope > *:last-child');
      if (lastChild) {
        const possibleAvatar = lastChild.querySelector('button, [role="button"]');
        if (possibleAvatar) {
          const rect = possibleAvatar.getBoundingClientRect();
          if (rect.width >= 25 && rect.width <= 40) {
            userAvatarEl = possibleAvatar;
          }
        }
      }
    }
    
    if (userAvatarEl) {
      const rect = userAvatarEl.getBoundingClientRect();
      const s = getComputedStyle(userAvatarEl);
      const img = userAvatarEl.querySelector('img');
      
      result.rightSection.userAvatar = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        borderRadius: s.borderRadius,
        backgroundColor: rgbToHex(s.backgroundColor),
        overflow: s.overflow,
        left: Math.round(rect.left),
        hasImage: !!img,
        image: img ? {
          src: img.src,
          alt: img.alt,
          width: Math.round(img.getBoundingClientRect().width),
          height: Math.round(img.getBoundingClientRect().height),
        } : null,
      };
      
      // Gap от settings к avatar
      if (settingsLink) {
        result.gaps.settingsToAvatar = measureGap(settingsLink, userAvatarEl);
      }
    }
    
    // ========================================
    // 8. EXPAND ICON
    // ========================================
    
    document.querySelectorAll('svg').forEach(svg => {
      const rect = svg.getBoundingClientRect();
      const viewBox = svg.getAttribute('viewBox');
      
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
  // HOVER STATES - извлекаем отдельно
  // ========================================
  
  console.log('🎯 Извлечение hover состояний...');
  
  for (let i = 0; i < data.navigation.items.length; i++) {
    const item = data.navigation.items[i];
    const selector = `a[href="${item.href}"]`;
    
    try {
      // Hover
      await page.hover(selector);
      await page.waitForTimeout(200);
      
      const hoverState = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const s = getComputedStyle(el);
        
        function rgbToHex(rgb) {
          if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return 'transparent';
          const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!match) return rgb;
          const r = parseInt(match[1]).toString(16).padStart(2, '0');
          const g = parseInt(match[2]).toString(16).padStart(2, '0');
          const b = parseInt(match[3]).toString(16).padStart(2, '0');
          return `#${r}${g}${b}`;
        }
        
        return {
          color: rgbToHex(s.color),
          backgroundColor: rgbToHex(s.backgroundColor),
          fontWeight: parseInt(s.fontWeight) || 400,
        };
      }, selector);
      
      data.navigation.items[i].hover = hoverState;
      
      // Убрать hover
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
      
    } catch (err) {
      console.warn(`  ⚠️ Не удалось извлечь hover для ${item.text}:`, err.message);
      data.navigation.items[i].hover = { error: err.message };
    }
  }
  
  // ========================================
  // ВАЛИДАЦИЯ
  // ========================================
  
  console.log('\n📋 Проверка извлечённых данных...');
  const isValid = validateCompleteExtraction(data);
  
  // ========================================
  // СОХРАНЕНИЕ
  // ========================================
  
  const outputPath = path.join(__dirname, '../reference/header-v3.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Данные сохранены: ${outputPath}`);
  
  // Скриншот
  const screenshotPath = path.join(__dirname, '../reference/screenshots/header-v3-original.png');
  await page.screenshot({ 
    path: screenshotPath,
    clip: { x: 0, y: 0, width: 1400, height: 60 }
  });
  console.log(`📸 Скриншот: ${screenshotPath}`);
  
  // ========================================
  // ВЫВОД КЛЮЧЕВЫХ ДАННЫХ
  // ========================================
  
  console.log('\n' + '='.repeat(60));
  console.log('КЛЮЧЕВЫЕ ИЗВЛЕЧЁННЫЕ ПАРАМЕТРЫ');
  console.log('='.repeat(60));
  
  console.log('\n📐 LAYOUT:');
  console.log(`  - Avatar distance from left: ${data.layout.avatarDistanceFromLeft}px`);
  console.log(`  - Header padding left: ${data.layout.headerPaddingLeft}px`);
  
  console.log('\n🔘 PERSONAL BUTTON:');
  if (data.projectSelector.personalButton) {
    console.log(`  - Gap (text to icon): ${data.projectSelector.personalButton.gap}px`);
    console.log(`  - FontWeight: ${data.projectSelector.personalButton.text.fontWeight}`);
    console.log(`  - Padding: ${data.projectSelector.personalButton.padding}`);
  }
  
  console.log('\n🔘 PROJECT TYPE BUTTON:');
  if (data.projectSelector.projectTypeButton) {
    console.log(`  - Gap (text to icon): ${data.projectSelector.projectTypeButton.gap}px`);
    console.log(`  - FontWeight: ${data.projectSelector.projectTypeButton.text.fontWeight}`);
  }
  
  console.log('\n🧭 NAVIGATION ITEMS:');
  data.navigation.items.forEach(item => {
    console.log(`  - ${item.text}:`);
    console.log(`      Normal: fontWeight=${item.normal.fontWeight}, color=${item.normal.color}`);
    if (item.hover) {
      console.log(`      Hover:  fontWeight=${item.hover.fontWeight}, color=${item.hover.color}, bg=${item.hover.backgroundColor}`);
    }
  });
  
  console.log('\n📏 GAPS:');
  console.log(JSON.stringify(data.gaps, null, 2));
  
  console.log('\n👤 USER AVATAR:');
  if (data.rightSection.userAvatar) {
    console.log(`  - Size: ${data.rightSection.userAvatar.width}x${data.rightSection.userAvatar.height}`);
    console.log(`  - Has image: ${data.rightSection.userAvatar.hasImage}`);
    console.log(`  - Background: ${data.rightSection.userAvatar.backgroundColor}`);
  }
  
  await browser.close();
  console.log('\n✅ Извлечение завершено!');
  
  return isValid;
}

// Запуск
extractHeaderV3()
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

