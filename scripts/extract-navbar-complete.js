/**
 * КОМПЛЕКСНЫЙ СКРИПТ ИЗВЛЕЧЕНИЯ СТИЛЕЙ НАВБАРА
 * 
 * Извлекает ВСЕ параметры за один проход:
 * - Project selector (аватарка P, Personal, /, Default project)
 * - Navigation items (Dashboard, Docs, API reference) с hover states
 * - Right section (settings, user avatar)
 * - Все gaps и позиции
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function extractNavbarComplete() {
  console.log('🔗 Подключение к Chrome через CDP...');
  
  let browser;
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
  } catch (error) {
    console.error('❌ Не удалось подключиться к Chrome!');
    console.error('Убедитесь, что Chrome запущен с --remote-debugging-port=9222');
    console.error('Запустите: ./scripts/start-chrome-debug.sh');
    process.exit(1);
  }
  
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('❌ Страница platform.openai.com не найдена!');
    console.log('Доступные страницы:', pages.map(p => p.url()));
    await browser.close();
    process.exit(1);
  }
  
  console.log('✅ Подключено к:', page.url());
  
  // ========================================
  // STEP 1: Извлечение статических стилей
  // ========================================
  console.log('\n📊 Извлечение статических стилей...');
  
  const staticData = await page.evaluate(() => {
    const data = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      layout: {},
      projectSelector: {},
      navigation: { items: [] },
      rightSection: {},
      gaps: {},
      icons: {}
    };
    
    // Вспомогательная функция для конвертации RGB в HEX
    function rgbToHex(rgb) {
      if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent';
      const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return rgb;
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    
    // Функция для получения прямого текста (без дублирования)
    function getDirectText(element) {
      // Пробуем найти span внутри
      const span = element.querySelector('span');
      if (span) {
        return span.textContent?.trim() || '';
      }
      // Иначе берём только текстовые ноды
      return Array.from(element.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent?.trim())
        .filter(Boolean)
        .join(' ')
        .trim() || element.textContent?.trim() || '';
    }
    
    // ========================================
    // PROJECT SELECTOR (левая часть)
    // ========================================
    
    // Аватарка "P" - ищем по цвету фона #181818
    let avatarP = null;
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (s.backgroundColor === 'rgb(24, 24, 24)' && 
          rect.width >= 20 && rect.width <= 30 &&
          rect.height >= 20 && rect.height <= 30 &&
          rect.left < 100) {
        avatarP = el;
      }
    });
    
    if (avatarP) {
      const rect = avatarP.getBoundingClientRect();
      const s = getComputedStyle(avatarP);
      data.projectSelector.avatar = {
        text: avatarP.textContent?.trim(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        borderRadius: s.borderRadius,
        backgroundColor: rgbToHex(s.backgroundColor),
        color: rgbToHex(s.color),
        fontSize: s.fontSize,
        fontWeight: parseInt(s.fontWeight, 10),
        lineHeight: s.lineHeight
      };
    }
    
    // Кнопка "Personal" - ищем кнопку или div с текстом Personal слева
    let personalButton = null;
    let personalText = null;
    let personalIcon = null;
    
    document.querySelectorAll('button, div').forEach(el => {
      const rect = el.getBoundingClientRect();
      const text = getDirectText(el);
      if (text === 'Personal' && rect.left < 200 && rect.left > 30) {
        personalText = el;
        // Ищем родительский контейнер (кнопку)
        let parent = el.parentElement;
        while (parent && parent.tagName !== 'BUTTON' && parent.tagName !== 'A') {
          parent = parent.parentElement;
          if (!parent || parent.tagName === 'BODY') break;
        }
        if (parent && (parent.tagName === 'BUTTON' || parent.tagName === 'A')) {
          personalButton = parent;
        }
      }
    });
    
    // Если не нашли через кнопку, ищем span с текстом Personal
    if (!personalText) {
      document.querySelectorAll('span').forEach(el => {
        const text = el.textContent?.trim();
        const rect = el.getBoundingClientRect();
        if (text === 'Personal' && rect.left < 200 && rect.left > 30) {
          personalText = el;
          // Ищем родителя-кнопку
          let parent = el.parentElement;
          while (parent && parent.tagName !== 'BUTTON') {
            parent = parent.parentElement;
            if (!parent || parent.tagName === 'BODY') break;
          }
          if (parent && parent.tagName === 'BUTTON') {
            personalButton = parent;
            // Ищем иконку внутри кнопки
            personalIcon = parent.querySelector('svg');
          }
        }
      });
    }
    
    if (personalText) {
      const textRect = personalText.getBoundingClientRect();
      const textStyle = getComputedStyle(personalText);
      
      data.projectSelector.personalText = {
        text: 'Personal',
        left: Math.round(textRect.left),
        top: Math.round(textRect.top),
        width: Math.round(textRect.width),
        height: Math.round(textRect.height),
        fontSize: textStyle.fontSize,
        fontWeight: parseInt(textStyle.fontWeight, 10),
        color: rgbToHex(textStyle.color),
        letterSpacing: textStyle.letterSpacing,
        lineHeight: textStyle.lineHeight
      };
      
      // Измеряем gap между текстом Personal и иконкой
      if (personalButton) {
        const btnIcon = personalButton.querySelector('svg');
        if (btnIcon) {
          const iconRect = btnIcon.getBoundingClientRect();
          const gap = Math.round(iconRect.left - textRect.right);
          data.projectSelector.personalButton = {
            textToIconGap: gap,
            iconWidth: Math.round(iconRect.width),
            iconHeight: Math.round(iconRect.height)
          };
          
          // SVG иконки expand
          data.icons.expandPersonal = {
            outerHTML: btnIcon.outerHTML,
            viewBox: btnIcon.getAttribute('viewBox'),
            width: Math.round(iconRect.width),
            height: Math.round(iconRect.height),
            color: rgbToHex(getComputedStyle(btnIcon).color)
          };
        }
      }
    }
    
    // Separator "/"
    document.querySelectorAll('*').forEach(el => {
      const text = el.textContent?.trim();
      const rect = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (text === '/' && 
          rect.left > 100 && rect.left < 200 &&
          rect.width < 20 && rect.height < 30) {
        data.projectSelector.separator = {
          text: '/',
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          fontSize: s.fontSize,
          fontWeight: parseInt(s.fontWeight, 10),
          color: rgbToHex(s.color),
          marginLeft: s.marginLeft,
          marginRight: s.marginRight
        };
      }
    });
    
    // "Default project" - аналогично Personal
    let defaultProjectText = null;
    let defaultProjectButton = null;
    
    document.querySelectorAll('span').forEach(el => {
      const text = el.textContent?.trim();
      const rect = el.getBoundingClientRect();
      if (text === 'Default project' && rect.left < 350 && rect.left > 100) {
        defaultProjectText = el;
        // Ищем родителя-кнопку
        let parent = el.parentElement;
        while (parent && parent.tagName !== 'BUTTON') {
          parent = parent.parentElement;
          if (!parent || parent.tagName === 'BODY') break;
        }
        if (parent && parent.tagName === 'BUTTON') {
          defaultProjectButton = parent;
        }
      }
    });
    
    if (defaultProjectText) {
      const textRect = defaultProjectText.getBoundingClientRect();
      const textStyle = getComputedStyle(defaultProjectText);
      
      data.projectSelector.defaultProjectText = {
        text: 'Default project',
        left: Math.round(textRect.left),
        top: Math.round(textRect.top),
        width: Math.round(textRect.width),
        height: Math.round(textRect.height),
        fontSize: textStyle.fontSize,
        fontWeight: parseInt(textStyle.fontWeight, 10),
        color: rgbToHex(textStyle.color),
        letterSpacing: textStyle.letterSpacing,
        lineHeight: textStyle.lineHeight
      };
      
      // Измеряем gap между текстом и иконкой
      if (defaultProjectButton) {
        const btnIcon = defaultProjectButton.querySelector('svg');
        if (btnIcon) {
          const iconRect = btnIcon.getBoundingClientRect();
          const gap = Math.round(iconRect.left - textRect.right);
          data.projectSelector.defaultProjectButton = {
            textToIconGap: gap,
            iconWidth: Math.round(iconRect.width),
            iconHeight: Math.round(iconRect.height)
          };
        }
      }
    }
    
    // ========================================
    // NAVIGATION ITEMS (Dashboard, Docs, API reference)
    // ========================================
    
    const navTexts = ['Dashboard', 'Docs', 'API reference'];
    const navElements = [];
    
    document.querySelectorAll('a').forEach(a => {
      const rect = a.getBoundingClientRect();
      const href = a.getAttribute('href') || '';
      const text = getDirectText(a);
      
      // Проверяем что это один из nav items
      if (navTexts.includes(text) && rect.left > 400) {
        const s = getComputedStyle(a);
        navElements.push({
          element: a,
          text: text,
          href: href,
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          normal: {
            fontSize: s.fontSize,
            fontWeight: parseInt(s.fontWeight, 10),
            color: rgbToHex(s.color),
            padding: s.padding,
            borderRadius: s.borderRadius,
            backgroundColor: rgbToHex(s.backgroundColor),
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing
          },
          isActive: href === '/chat' || href.includes('/chat')
        });
      }
    });
    
    // Сортируем по позиции слева направо
    navElements.sort((a, b) => a.left - b.left);
    
    // Добавляем в data (без element для сериализации)
    data.navigation.items = navElements.map(({ element, ...rest }, index) => ({
      index,
      ...rest
    }));
    
    // Вычисляем gaps между nav items
    if (navElements.length >= 2) {
      data.gaps.navItemGaps = [];
      for (let i = 0; i < navElements.length - 1; i++) {
        const gap = Math.round(navElements[i + 1].left - (navElements[i].left + navElements[i].width));
        data.gaps.navItemGaps.push({
          from: navElements[i].text,
          to: navElements[i + 1].text,
          gap: gap
        });
      }
    }
    
    // ========================================
    // RIGHT SECTION (Settings button, User avatar)
    // ========================================
    
    // Settings button - ищем ссылку на /settings
    document.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.includes('/settings') || href === '/settings/organization') {
        const rect = a.getBoundingClientRect();
        const s = getComputedStyle(a);
        if (rect.left > 500) { // Должен быть справа
          data.rightSection.settingsButton = {
            href: href,
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            padding: s.padding,
            borderRadius: s.borderRadius,
            color: rgbToHex(s.color)
          };
          
          // SVG иконки settings
          const icon = a.querySelector('svg');
          if (icon) {
            const iconRect = icon.getBoundingClientRect();
            data.icons.settings = {
              outerHTML: icon.outerHTML,
              viewBox: icon.getAttribute('viewBox'),
              width: Math.round(iconRect.width),
              height: Math.round(iconRect.height)
            };
          }
        }
      }
    });
    
    // User avatar - ищем круглый элемент справа с изображением или инициалами
    // Обычно это кнопка с фото или серый/цветной круг
    document.querySelectorAll('button, div').forEach(el => {
      const rect = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      
      // Критерии: справа (> 1000px), круглый, размер около 28-32px
      if (rect.left > 1000 && 
          rect.width >= 24 && rect.width <= 40 &&
          rect.height >= 24 && rect.height <= 40 &&
          (s.borderRadius === '9999px' || s.borderRadius === '50%' || s.borderRadius === '100%' || parseInt(s.borderRadius) > 10)) {
        
        // Проверяем что это именно user avatar (не settings button)
        const img = el.querySelector('img');
        const hasAvatar = img || s.backgroundColor !== 'rgba(0, 0, 0, 0)';
        
        if (hasAvatar && (!data.rightSection.userAvatar || rect.left > data.rightSection.userAvatar.left)) {
          data.rightSection.userAvatar = {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            borderRadius: s.borderRadius,
            backgroundColor: rgbToHex(s.backgroundColor),
            overflow: s.overflow,
            hasImage: !!img,
            imageSrc: img?.src || null
          };
        }
      }
    });
    
    // ========================================
    // GAPS BETWEEN SECTIONS
    // ========================================
    
    // Gap от последнего nav item до settings
    if (data.navigation.items.length > 0 && data.rightSection.settingsButton) {
      const lastNavItem = data.navigation.items[data.navigation.items.length - 1];
      const settingsLeft = data.rightSection.settingsButton.left;
      data.gaps.lastNavToSettings = Math.round(settingsLeft - (lastNavItem.left + lastNavItem.width));
    }
    
    // Gap от settings до user avatar
    if (data.rightSection.settingsButton && data.rightSection.userAvatar) {
      const settingsRight = data.rightSection.settingsButton.left + data.rightSection.settingsButton.width;
      data.gaps.settingsToAvatar = Math.round(data.rightSection.userAvatar.left - settingsRight);
    }
    
    // Gap от avatar P до Personal text
    if (data.projectSelector.avatar && data.projectSelector.personalText) {
      const avatarRight = data.projectSelector.avatar.left + data.projectSelector.avatar.width;
      data.gaps.avatarToPersonal = Math.round(data.projectSelector.personalText.left - avatarRight);
    }
    
    // Layout info
    data.layout.viewportWidth = window.innerWidth;
    data.layout.viewportHeight = window.innerHeight;
    data.layout.avatarDistanceFromLeft = data.projectSelector.avatar?.left || 0;
    
    return data;
  });
  
  console.log('✅ Статические стили извлечены');
  
  // ========================================
  // STEP 2: Извлечение HOVER states
  // ========================================
  console.log('\n🖱️  Извлечение hover states...');
  
  const hoverStates = [];
  
  // Находим nav links
  const navLinks = await page.$$('a');
  
  for (const link of navLinks) {
    const href = await link.getAttribute('href');
    const text = await link.textContent();
    const cleanText = text?.trim().replace(/\s+/g, ' ');
    
    // Только nav items (Dashboard, Docs, API reference)
    if (['Dashboard', 'Docs', 'API reference'].includes(cleanText)) {
      // Получаем default state
      const defaultState = await page.evaluate((el) => {
        const s = getComputedStyle(el);
        function rgbToHex(rgb) {
          if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent';
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
          fontWeight: parseInt(s.fontWeight, 10)
        };
      }, link);
      
      // Hover
      await link.hover();
      await page.waitForTimeout(150); // Ждём transition
      
      // Получаем hover state
      const hoverState = await page.evaluate((el) => {
        const s = getComputedStyle(el);
        function rgbToHex(rgb) {
          if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent';
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
          fontWeight: parseInt(s.fontWeight, 10)
        };
      }, link);
      
      // Убираем hover
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
      
      hoverStates.push({
        text: cleanText,
        href: href,
        default: defaultState,
        hover: hoverState
      });
      
      console.log(`  ✓ ${cleanText}: ${defaultState.color} → ${hoverState.color}`);
    }
  }
  
  // Добавляем hover states к data
  staticData.navigation.hoverStates = hoverStates;
  
  // ========================================
  // STEP 3: Скриншоты
  // ========================================
  console.log('\n📸 Делаем скриншоты...');
  
  // Создаём папку для скриншотов
  if (!fs.existsSync('reference/screenshots')) {
    fs.mkdirSync('reference/screenshots', { recursive: true });
  }
  
  // Скриншот всей страницы
  await page.screenshot({ 
    path: 'reference/screenshots/navbar-original.png',
    clip: { x: 0, y: 0, width: staticData.layout.viewportWidth, height: 60 }
  });
  console.log('  ✓ Скриншот navbar сохранён');
  
  // ========================================
  // STEP 4: Валидация
  // ========================================
  console.log('\n🔍 Валидация данных...');
  
  const errors = [];
  
  // Проверка project selector
  if (!staticData.projectSelector.avatar) {
    errors.push('Avatar "P" не найден');
  }
  if (!staticData.projectSelector.personalText) {
    errors.push('Personal text не найден');
  }
  if (!staticData.projectSelector.personalButton?.textToIconGap) {
    errors.push('Personal button gap не измерен');
  }
  if (!staticData.projectSelector.separator) {
    errors.push('Separator "/" не найден');
  }
  if (!staticData.projectSelector.defaultProjectText) {
    errors.push('Default project text не найден');
  }
  
  // Проверка navigation
  if (staticData.navigation.items.length < 3) {
    errors.push(`Найдено только ${staticData.navigation.items.length} nav items (ожидается 3)`);
  }
  
  // Проверка на дублированный текст
  staticData.navigation.items.forEach((item, i) => {
    if (/^(.+)\1$/.test(item.text)) {
      errors.push(`Дублированный текст в nav item ${i}: "${item.text}"`);
    }
  });
  
  // Проверка fontWeight - должен быть числом
  staticData.navigation.items.forEach((item, i) => {
    if (typeof item.normal.fontWeight !== 'number') {
      errors.push(`fontWeight не число в nav item ${i}: ${item.normal.fontWeight}`);
    }
  });
  
  // Проверка right section
  if (!staticData.rightSection.settingsButton) {
    errors.push('Settings button не найден');
  }
  if (!staticData.rightSection.userAvatar) {
    errors.push('User avatar не найден');
  }
  
  // Проверка gaps
  if (!staticData.gaps.avatarToPersonal || staticData.gaps.avatarToPersonal <= 0) {
    errors.push(`avatarToPersonal gap невалидный: ${staticData.gaps.avatarToPersonal}`);
  }
  
  if (errors.length > 0) {
    console.error('\n❌ ВАЛИДАЦИЯ НЕ ПРОЙДЕНА:');
    errors.forEach(e => console.error(`  - ${e}`));
    console.log('\n⚠️  Данные сохранены, но могут быть неполными!');
  } else {
    console.log('✅ Валидация пройдена');
  }
  
  // ========================================
  // STEP 5: Сохранение
  // ========================================
  console.log('\n💾 Сохранение данных...');
  
  fs.writeFileSync(
    'reference/navbar-complete.json',
    JSON.stringify(staticData, null, 2)
  );
  console.log('✅ Данные сохранены в reference/navbar-complete.json');
  
  // Вывод ключевых значений
  console.log('\n📋 КЛЮЧЕВЫЕ ЗНАЧЕНИЯ:');
  console.log('─'.repeat(50));
  
  console.log('\n🎯 PROJECT SELECTOR:');
  console.log(`  Avatar "P" left: ${staticData.projectSelector.avatar?.left}px`);
  console.log(`  Avatar to Personal gap: ${staticData.gaps.avatarToPersonal}px`);
  console.log(`  Personal fontWeight: ${staticData.projectSelector.personalText?.fontWeight}`);
  console.log(`  Personal textToIconGap: ${staticData.projectSelector.personalButton?.textToIconGap}px`);
  console.log(`  Default project textToIconGap: ${staticData.projectSelector.defaultProjectButton?.textToIconGap}px`);
  
  console.log('\n🧭 NAVIGATION:');
  staticData.navigation.items.forEach(item => {
    console.log(`  ${item.text}: fontWeight=${item.normal.fontWeight}, color=${item.normal.color}`);
  });
  
  console.log('\n🖱️  HOVER STATES:');
  staticData.navigation.hoverStates?.forEach(state => {
    console.log(`  ${state.text}: ${state.default.color} → ${state.hover.color}`);
  });
  
  console.log('\n👤 RIGHT SECTION:');
  console.log(`  Settings: ${staticData.rightSection.settingsButton?.width}x${staticData.rightSection.settingsButton?.height}px at ${staticData.rightSection.settingsButton?.left}px`);
  console.log(`  User avatar: ${staticData.rightSection.userAvatar?.width}x${staticData.rightSection.userAvatar?.height}px at ${staticData.rightSection.userAvatar?.left}px`);
  console.log(`  Gap settings→avatar: ${staticData.gaps.settingsToAvatar}px`);
  
  console.log('\n─'.repeat(50));
  
  await browser.close();
  console.log('\n✅ Готово!');
}

extractNavbarComplete().catch(error => {
  console.error('❌ Ошибка:', error);
  process.exit(1);
});

