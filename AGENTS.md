# AGENTS.md — Правила разработки UI Kit

Этот документ описывает правила и процедуры для AI-агентов при создании UI компонентов, точно копирующих дизайн OpenAI Platform (https://platform.openai.com).

---

## 0. ГЛАВНОЕ ПРАВИЛО: НЕ ВЫДУМЫВАТЬ

**КРИТИЧЕСКИ ВАЖНО:**

- **НИКОГДА** не выдумывай стили, размеры, цвета или любые другие свойства элементов
- **ВСЕГДА** извлекай существующие стили непосредственно из platform.openai.com через `getComputedStyle()`
- **ТОЛЬКО** повторяй в точности то, что извлечено из оригинала
- **НЕ** округляй значения, не подставляй "похожие" цвета, не используй "примерные" размеры
- **НЕ** используй стандартные значения из других UI библиотек (Material UI, Ant Design и т.д.)
- **НЕ** применяй "best practices" или "стандартные паттерны", если они отличаются от оригинала

### Если не можешь извлечь точное значение:

1. Используй Chrome DevTools с подключением через CDP
2. Сделай скриншот и измерь пиксели
3. Используй пипетку браузера для получения точного цвета
4. Проверь псевдо-элементы (::before, ::after)
5. Протестируй все состояния (hover, active, focus)

### Если значение всё равно недоступно:

- Спроси пользователя открыть DevTools и проверить вручную
- **НЕ УГАДЫВАЙ** — лучше пропусти это свойство, чем используй неправильное значение

---

## 1. Доступ к браузеру в обход Cloudflare

OpenAI Platform защищён Cloudflare, который блокирует автоматические запросы. Для получения доступа к авторизованной странице используй **Chrome Remote Debugging**.

### Шаг 1: Закрыть все экземпляры Chrome

```bash
pkill -9 -f "Google Chrome"
```

Подожди 2 секунды:

```bash
sleep 2
```

### Шаг 2: Запустить Chrome с Remote Debugging

**ВАЖНО:** Chrome требует отдельную директорию данных для remote debugging. Используй временный профиль:

```bash
mkdir -p /tmp/chrome-debug-profile

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile \
  "https://platform.openai.com/chat" &
```

### Шаг 3: Пользователь авторизуется

Попроси пользователя:
1. В открывшемся Chrome пройти капчу Cloudflare
2. Авторизоваться через Google/Microsoft
3. Дождаться полной загрузки интерфейса
4. Написать тебе, когда готово

### Шаг 4: Проверить доступность CDP

```bash
curl -s http://localhost:9222/json | head -20
```

Должен вернуть JSON с информацией о вкладках.

### Шаг 5: Подключиться через Playwright

Установи Playwright в проекте:

```bash
npm install playwright
```

Подключись к Chrome:

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.log('Страница не найдена');
    return;
  }
  
  console.log('Подключено к:', page.url());
  
  // Теперь можно извлекать стили
  // ...
  
  await browser.close();
})();
```

---

## 2. Методология извлечения стилей

### 2.1 Получение computed styles

Используй `page.evaluate()` для извлечения стилей элементов:

```javascript
const styles = await page.evaluate(() => {
  const result = {};
  
  // Получить стили элемента
  const element = document.querySelector('button.primary');
  const computed = getComputedStyle(element);
  
  result.button = {
    backgroundColor: computed.backgroundColor,
    color: computed.color,
    borderRadius: computed.borderRadius,
    padding: computed.padding,
    height: computed.height,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    fontFamily: computed.fontFamily,
    border: computed.border,
    boxShadow: computed.boxShadow
  };
  
  return result;
});
```

### 2.2 Анализ псевдо-элементов

OpenAI часто использует `::before` и `::after` для стилизации. Проверяй их:

```javascript
const pseudoStyles = await page.evaluate(() => {
  const btn = document.querySelector('button');
  const before = getComputedStyle(btn, '::before');
  const after = getComputedStyle(btn, '::after');
  
  return {
    before: {
      content: before.content,
      backgroundColor: before.backgroundColor,
      borderRadius: before.borderRadius
    },
    after: {
      content: after.content,
      backgroundColor: after.backgroundColor
    }
  };
});
```

### 2.3 Поиск элементов по визуальным признакам

Если селекторы не работают (классы обфусцированы), ищи элементы по стилям:

```javascript
const findByStyle = await page.evaluate(() => {
  const allElements = document.querySelectorAll('*');
  
  for (const el of allElements) {
    const s = getComputedStyle(el);
    
    // Найти чёрную кнопку
    if (s.backgroundColor === 'rgb(24, 24, 24)') {
      return {
        tag: el.tagName,
        text: el.textContent?.trim(),
        styles: {
          bg: s.backgroundColor,
          color: s.color,
          borderRadius: s.borderRadius
        }
      };
    }
  }
  
  return null;
});
```

### 2.4 Извлечение всех уникальных цветов

```javascript
const colors = await page.evaluate(() => {
  const bgColors = new Set();
  const textColors = new Set();
  const borderColors = new Set();
  
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      bgColors.add(s.backgroundColor);
    }
    textColors.add(s.color);
    if (s.borderColor) {
      borderColors.add(s.borderColor);
    }
  });
  
  return {
    backgrounds: Array.from(bgColors),
    texts: Array.from(textColors),
    borders: Array.from(borderColors)
  };
});
```

### 2.5 Скриншоты для сравнения

Всегда сохраняй скриншоты оригинала и своей реализации:

```javascript
// Скриншот оригинала
await page.screenshot({ path: 'original.png' });

// Скриншот конкретного элемента
const element = await page.$('button.primary');
await element.screenshot({ path: 'original-button.png' });
```

---

## 3. Правила создания компонентов

### 3.1 Pixel-perfect соответствие

**ОБЯЗАТЕЛЬНО** воспроизводить:
- Точные размеры (height, width, padding, margin)
- Точные цвета (RGB/HEX без округления)
- Точные border-radius
- Точные шрифты (font-family, font-size, font-weight, line-height)
- Точные тени (box-shadow)
- Точные границы (border)

### 3.2 Конвертация RGB в HEX

```javascript
function rgbToHex(rgb) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return rgb;
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

// rgb(24, 24, 24) -> #181818
// rgb(243, 243, 243) -> #f3f3f3
```

### 3.3 Известные стили OpenAI Platform (декабрь 2024)

```css
/* Основные цвета */
--bg-page: #f3f3f3;           /* Фон страницы */
--bg-card: #ffffff;           /* Фон карточек и сайдбара */
--bg-hover: #ededed;          /* Hover состояние */
--bg-active: #e5e5e5;         /* Active состояние */

/* Текст */
--text-primary: #0d0d0d;      /* Основной текст */
--text-secondary: #5d5d5d;    /* Вторичный текст */
--text-muted: #8f8f8f;        /* Приглушённый текст */

/* Кнопки */
--button-primary-bg: #181818; /* Чёрная кнопка */
--button-primary-hover: #0d0d0d;

/* Границы */
--border-default: #ededed;
--border-strong: #d5d5d5;

/* Шрифт */
--font-family: "OpenAI Sans", helvetica, sans-serif;
--font-size-base: 14px;
--font-weight-normal: 400;
--font-weight-medium: 500;

/* Border radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;        /* Pill-shaped кнопки */

/* Сайдбар */
--sidebar-width: 260px;
--sidebar-border-radius: 16px;
--sidebar-padding: 12px;
```

### 3.4 Структура сайдбара OpenAI

```
┌─────────────────────────────┐
│ P  Personal / Default proj ▼│  <- Project Selector
├─────────────────────────────┤
│ Create                      │  <- Section Title (muted)
│ ○ Chat                      │  <- Active item (bg: #ededed)
│ ⊞ ChatGPT Apps             │
│ 🤖 Agent Builder            │
│ 🔊 Audio                    │
│ 🖼 Images                   │
│ 🎬 Videos                   │
├─────────────────────────────┤
│ 👥 Assistants               │
├─────────────────────────────┤
│ Manage                      │  <- Section Title
│ 📊 Usage                    │
│ 🔑 API keys                 │
│ 📄 Logs                     │
│ 💾 Storage                  │
│ { } Batches                 │
├─────────────────────────────┤
│ Optimize                    │  <- Section Title
│ ✓ Evaluation               │
│ ⚙ Fine-tuning              │
└─────────────────────────────┘
```

### 3.5 Hover и Active состояния

**ОБЯЗАТЕЛЬНО** проверять и реализовывать:

```javascript
// Получить hover состояние
await page.hover('button.primary');
await page.waitForTimeout(100);
const hoverStyles = await page.evaluate(() => {
  const btn = document.querySelector('button.primary');
  return getComputedStyle(btn).backgroundColor;
});
```

### 3.6 Шаблон компонента

```tsx
'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base - ТОЧНЫЕ значения из OpenAI
          'inline-flex items-center justify-center',
          'font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          
          // Variants - ТОЧНЫЕ цвета
          {
            'bg-[#181818] text-white hover:bg-[#0d0d0d]': variant === 'primary',
            'bg-white text-[#0d0d0d] border border-[#ededed] hover:bg-[#f5f5f5]': variant === 'secondary',
            'bg-transparent text-[#5d5d5d] hover:bg-[#ededed]': variant === 'ghost',
          },
          
          // Sizes - ТОЧНЫЕ размеры
          {
            'h-8 px-3 text-[13px] rounded-full': size === 'sm',
            'h-10 px-4 text-[14px] rounded-full': size === 'md',
            'h-12 px-6 text-[14px] rounded-full': size === 'lg',
          },
          
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

---

## 4. Чеклист валидации

### Перед коммитом каждого компонента:

- [ ] Скриншот оригинала сохранён
- [ ] Скриншот реализации сделан
- [ ] Side-by-side сравнение проведено
- [ ] Цвета совпадают (проверить пипеткой)
- [ ] Размеры совпадают (height, padding)
- [ ] Border-radius совпадает
- [ ] Шрифт совпадает (family, size, weight)
- [ ] Hover состояние проверено
- [ ] Active/Focus состояние проверено
- [ ] На разных размерах экрана проверено

### Инструменты для сравнения

1. **Скриншоты рядом** — открой оба изображения
2. **Пипетка в браузере** — проверь цвета
3. **DevTools** — сравни computed styles
4. **Overlay** — наложи скриншоты друг на друга

---

## 5. Быстрый старт

### Полный скрипт извлечения стилей

Сохрани в `scripts/extract-styles.js`:

```javascript
const { chromium } = require('playwright');

async function extractOpenAIStyles() {
  console.log('Подключение к Chrome...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('platform.openai.com'));
  
  if (!page) {
    console.error('Страница OpenAI не найдена!');
    console.log('Доступные страницы:', pages.map(p => p.url()));
    await browser.close();
    return;
  }
  
  console.log('Подключено к:', page.url());
  
  // Скриншот
  await page.screenshot({ path: 'reference/openai-full.png' });
  console.log('Скриншот сохранён: reference/openai-full.png');
  
  // Извлечение стилей
  const styles = await page.evaluate(() => {
    const tokens = {
      colors: {},
      typography: {},
      components: {}
    };
    
    // Body
    const body = getComputedStyle(document.body);
    tokens.colors.bgPage = body.backgroundColor;
    tokens.typography.fontFamily = body.fontFamily;
    
    // Все уникальные цвета
    const bgColors = new Set();
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        bgColors.add(s.backgroundColor);
      }
    });
    tokens.colors.all = Array.from(bgColors);
    
    // Кнопка Create (чёрная)
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (s.backgroundColor === 'rgb(24, 24, 24)' || 
          getComputedStyle(el, '::before').backgroundColor === 'rgb(24, 24, 24)') {
        tokens.components.primaryButton = {
          bg: 'rgb(24, 24, 24)',
          color: s.color,
          borderRadius: s.borderRadius,
          height: s.height,
          padding: s.padding
        };
      }
    });
    
    return tokens;
  });
  
  console.log('\n=== Извлечённые стили ===');
  console.log(JSON.stringify(styles, null, 2));
  
  // Сохранить в файл
  require('fs').writeFileSync(
    'reference/openai-styles.json',
    JSON.stringify(styles, null, 2)
  );
  console.log('\nСтили сохранены: reference/openai-styles.json');
  
  await browser.close();
}

extractOpenAIStyles().catch(console.error);
```

### Запуск

```bash
# 1. Запустить Chrome (пользователь авторизуется)
pkill -9 -f "Google Chrome"; sleep 2
mkdir -p /tmp/chrome-debug-profile
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile \
  "https://platform.openai.com/chat" &

# 2. После авторизации пользователя — запустить скрипт
mkdir -p reference
node scripts/extract-styles.js
```

---

## 6. Частые ошибки

### ❌ Неправильно

```css
/* Округление цветов */
background: #f4f4f4;  /* Неточно! */

/* Произвольные значения */
border-radius: 10px;  /* Не из оригинала */

/* Примерные размеры */
padding: 12px 16px;   /* Не измерено */
```

### ✅ Правильно

```css
/* Точные значения из computed styles */
background: #f3f3f3;  /* rgb(243, 243, 243) */

/* Точный border-radius */
border-radius: 8px;   /* Измерено */

/* Точные размеры */
padding: 8px 12px;    /* Из getComputedStyle */
```

---

## 7. Контакт

При возникновении проблем:
1. Проверь, что Chrome запущен с `--remote-debugging-port=9222`
2. Проверь, что пользователь авторизован на OpenAI Platform
3. Проверь `curl http://localhost:9222/json`
4. Пересоздай временный профиль Chrome

---

## 8. ОБЯЗАТЕЛЬНЫЙ ПОРЯДОК РАБОТЫ

**КРИТИЧЕСКИ ВАЖНО:** Этот порядок ОБЯЗАТЕЛЕН для каждого нового компонента или изменения существующего.

### Шаг 1: ИЗВЛЕЧЕНИЕ (ПЕРЕД написанием кода)

**НЕ ПИШИ НИ СТРОЧКИ КОДА** пока не извлечёшь ВСЕ параметры:

1. Определи ВСЕ состояния элемента:
   - `normal` — обычное состояние
   - `hover` — при наведении мыши
   - `active` — при нажатии
   - `focus` — при фокусе
   - `disabled` — отключённое
   - `collapsed` — свёрнутое (для sidebar, panels)
   - `expanded` — развёрнутое

2. Для КАЖДОГО состояния извлеки:
   ```javascript
   // Размеры и позиции
   width, height, padding, margin
   left, top, right, bottom, position
   
   // Стили
   backgroundColor, border, borderRadius, boxShadow
   opacity, transform, transition
   
   // Типография
   fontSize, fontWeight, lineHeight, letterSpacing, color
   
   // Псевдо-элементы
   ::before, ::after — все их свойства
   ```

3. Сохрани ВСЕ данные в `reference/*.json`:
   ```bash
   reference/component-name-states.json
   ```

### Шаг 2: ДОКУМЕНТАЦИЯ

1. Создай/обнови `reference/COMPONENT-NAME.md` с таблицей:
   ```markdown
   | Свойство | normal | hover | collapsed |
   |----------|--------|-------|-----------|
   | width    | 210px  | 210px | 64px      |
   | padding  | 14px 0 | 14px 0| 14px 0    |
   ```

2. Укажи ТОЧНЫЕ значения — никаких "примерно" или "около"

### Шаг 3: РЕАЛИЗАЦИЯ

1. Пиши код ТОЛЬКО на основе извлечённых данных
2. Копируй значения из `reference/*.json` — НЕ УГАДЫВАЙ
3. Для каждого состояния создай отдельную ветку стилей:
   ```tsx
   // ПРАВИЛЬНО: значения из reference
   style={{
     width: collapsed ? '64px' : '210px',  // из JSON
     padding: '14px 0px 0px',               // из JSON
   }}
   
   // НЕПРАВИЛЬНО: угаданные значения
   style={{
     width: collapsed ? '60px' : '200px',  // откуда?!
   }}
   ```

### Шаг 4: ВАЛИДАЦИЯ

1. Сделай скриншот КАЖДОГО состояния:
   ```javascript
   await page.screenshot({ path: 'reference/screenshots/component-normal.png' });
   await page.screenshot({ path: 'reference/screenshots/component-hover.png' });
   await page.screenshot({ path: 'reference/screenshots/component-collapsed.png' });
   ```

2. Сравни с оригиналом side-by-side

3. Если есть расхождения — вернись к Шагу 1 и перепроверь извлечение

### Пример правильного workflow

```bash
# 1. Создать скрипт извлечения
scripts/extract-sidebar-all-states.js

# 2. Запустить и сохранить данные
node scripts/extract-sidebar-all-states.js
# -> reference/sidebar-all-states.json

# 3. Документировать
reference/SIDEBAR-STATES.md

# 4. Реализовать с ТОЧНЫМИ значениями
src/components/ui/Sidebar.tsx

# 5. Скриншоты для сравнения
reference/screenshots/sidebar-expanded.png
reference/screenshots/sidebar-collapsed.png
```

### ЗАПРЕЩЕНО

- ❌ Писать код БЕЗ предварительного извлечения
- ❌ Использовать "примерные" значения
- ❌ Копировать значения из других UI библиотек
- ❌ Угадывать размеры/отступы для разных состояний
- ❌ Пропускать извлечение состояний (hover, collapsed и т.д.)

---

## 9. КРИТИЧЕСКИ ВАЖНО: ОДИН ЗАПРОС = ПОЛНЫЙ КОМПОНЕНТ

**Пользователь НЕ ДОЛЖЕН делать 100 запросов чтобы получить правильный компонент.**

### Алгоритм работы (СТРОГО СЛЕДОВАТЬ):

#### ШАГ 1: КОМПЛЕКСНЫЙ СКРИПТ ИЗВЛЕЧЕНИЯ (5 минут)

**ПЕРЕД написанием ЛЮБОГО кода** создай ОДИН скрипт, который извлекает ВСЁ:

```javascript
// scripts/extract-COMPONENT-complete.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  const COMPLETE_DATA = await page.evaluate(() => {
    const data = {
      layout: {},      // Позиции всех элементов
      elements: {},    // Стили каждого элемента
      states: {},      // Все состояния (hover, active, collapsed)
      icons: {},       // SVG иконки
      typography: {},  // Шрифты
      colors: {},      // Все цвета
    };
    
    // 1. LAYOUT - позиции ВСЕХ элементов относительно viewport
    // Sidebar, content card, header, footer - ВСЕ getBoundingClientRect()
    
    // 2. ELEMENTS - getComputedStyle() для КАЖДОГО элемента
    // width, height, padding, margin, border, borderRadius, background
    
    // 3. STATES - ::before, ::after для hover/active
    
    // 4. ICONS - все SVG: viewBox, path d, fill
    
    // 5. TYPOGRAPHY - fontSize, fontWeight, lineHeight, letterSpacing, color
    
    // 6. COLORS - все уникальные цвета на странице
    
    return data;
  });
  
  // Сохранить ВСЁ в JSON
  require('fs').writeFileSync(
    'reference/COMPONENT-complete.json',
    JSON.stringify(COMPLETE_DATA, null, 2)
  );
  
  // Скриншоты
  await page.screenshot({ path: 'reference/screenshots/COMPONENT-original.png' });
  
  await browser.close();
})();
```

#### ШАГ 2: ЗАПУСК И ПРОВЕРКА (2 минуты)

```bash
node scripts/extract-COMPONENT-complete.js
cat reference/COMPONENT-complete.json
```

**Проверь что JSON содержит ВСЕ нужные данные ПЕРЕД написанием кода!**

#### ШАГ 3: НАПИСАНИЕ КОДА (10 минут)

Открой `reference/COMPONENT-complete.json` и копируй значения НАПРЯМУЮ:

```tsx
// ❌ НЕПРАВИЛЬНО - угадывание
style={{ width: '200px', padding: '10px' }}

// ✅ ПРАВИЛЬНО - из JSON
style={{ 
  width: '210px',           // из data.elements.sidebar.width
  padding: '14px 0px 0px',  // из data.elements.sidebar.padding
}}
```

#### ШАГ 4: ВАЛИДАЦИЯ (3 минуты)

```javascript
// Скриншот нашей реализации
await page.goto('http://localhost:3000');
await page.screenshot({ path: 'reference/screenshots/COMPONENT-ours.png' });

// Сравнить side-by-side с original
```

### ЧЕКЛИСТ ПЕРЕД ОТПРАВКОЙ КОДА ПОЛЬЗОВАТЕЛЮ

- [ ] JSON с полными данными существует в `reference/`
- [ ] ВСЕ значения в коде взяты из JSON (НЕ угаданы)
- [ ] Скриншот оригинала сохранён
- [ ] Скриншот реализации сделан
- [ ] Визуальное сравнение проведено
- [ ] Все состояния (hover, collapsed) работают

### ПРИМЕР ПОЛНОГО СКРИПТА ДЛЯ SIDEBAR

```javascript
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('platform.openai.com'));
  
  // ========== EXPANDED STATE ==========
  const expanded = await page.evaluate(() => {
    const data = { layout: {}, elements: [], icons: [] };
    
    // Sidebar container
    const sidebar = document.querySelector('aside');
    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarS = getComputedStyle(sidebar);
    data.layout.sidebar = {
      left: sidebarRect.left,
      top: sidebarRect.top,
      width: sidebarRect.width,
      height: sidebarRect.height,
      padding: sidebarS.padding,
    };
    
    // Content card
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (s.backgroundColor === 'rgb(255, 255, 255)' && rect.width > 500) {
        data.layout.contentCard = {
          left: rect.left,
          width: rect.width,
          borderRadius: s.borderRadius,
        };
      }
    });
    
    // ALL menu items
    document.querySelectorAll('a').forEach(a => {
      const rect = a.getBoundingClientRect();
      const s = getComputedStyle(a);
      const before = getComputedStyle(a, '::before');
      if (rect.left < 250 && rect.width > 100) {
        data.elements.push({
          text: a.textContent?.trim(),
          tag: 'a',
          width: rect.width,
          height: rect.height,
          left: rect.left,
          margin: s.margin,
          padding: s.padding,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          color: s.color,
          beforeBg: before.backgroundColor,
          beforeRadius: before.borderRadius,
        });
      }
    });
    
    // ALL SVG icons
    document.querySelectorAll('svg').forEach(svg => {
      const rect = svg.getBoundingClientRect();
      if (rect.left < 250) {
        const path = svg.querySelector('path');
        data.icons.push({
          viewBox: svg.getAttribute('viewBox'),
          width: rect.width,
          height: rect.height,
          pathD: path?.getAttribute('d'),
          fill: svg.getAttribute('fill'),
        });
      }
    });
    
    return data;
  });
  
  // ========== COLLAPSED STATE ==========
  // Попросить пользователя свернуть sidebar, затем извлечь
  
  // ========== HOVER STATES ==========
  // page.hover() на каждый элемент, извлечь ::before opacity/background
  
  // Сохранить ВСЁ
  fs.writeFileSync('reference/sidebar-complete.json', JSON.stringify({
    expanded,
    // collapsed,
    // hoverStates,
  }, null, 2));
  
  await page.screenshot({ path: 'reference/screenshots/sidebar-expanded.png' });
  
  await browser.close();
})();
```

### ПОЧЕМУ ЭТО ВАЖНО

1. **100 запросов → 1 запрос** — экономия времени пользователя
2. **Нет итераций** — сразу правильный результат
3. **Нет угадывания** — все данные из источника
4. **Воспроизводимость** — JSON можно использовать повторно
5. **Проверяемость** — легко сравнить скриншоты

### ПОСЛЕДСТВИЯ НАРУШЕНИЯ

Если ты НЕ следуешь этому алгоритму:
- Пользователь потратит 100+ запросов
- Результат всё равно будет неточным
- Пользователь будет разочарован
- Ты потеряешь доверие

**ВСЕГДА ИЗВЛЕКАЙ ВСЁ СРАЗУ. ОДИН РАЗ. ПОЛНОСТЬЮ.**

---

## 10. ВАЛИДАЦИЯ СКРИПТОВ ИЗВЛЕЧЕНИЯ

**КРИТИЧЕСКИ ВАЖНО:** Если скрипт извлечения не сработал корректно — НЕЛЬЗЯ использовать скриншоты для верстки. Нужно ИСПРАВИТЬ скрипт.

### Признаки НЕРАБОТАЮЩЕГО скрипта:

- Возвращает `null`, `undefined`, пустые объекты `{}`
- Не находит элементы (неправильные селекторы)
- Возвращает дублированный текст (`"DashboardDashboard"` вместо `"Dashboard"`)
- Значения не соответствуют визуальному виду в браузере
- Размеры = 0 или отрицательные
- Цвета в неожиданном формате

### Обязательные проверки в конце скрипта:

```javascript
// ВАЛИДАЦИЯ ДАННЫХ - добавь в конец каждого скрипта извлечения
function validateExtractedData(data) {
  const errors = [];
  
  // 1. Проверка что ВСЕ ключевые элементы найдены
  if (!data.header || Object.keys(data.header).length === 0) {
    errors.push('Header не найден');
  }
  
  // 2. Проверка что размеры > 0
  if (data.header?.height <= 0) {
    errors.push(`Header height невалидный: ${data.header.height}`);
  }
  
  // 3. Проверка формата цветов
  const colorRegex = /^(rgb\(|rgba\(|#[0-9a-fA-F])/;
  if (data.header?.backgroundColor && !colorRegex.test(data.header.backgroundColor)) {
    errors.push(`Цвет в неожиданном формате: ${data.header.backgroundColor}`);
  }
  
  // 4. Проверка на дублированный текст
  if (data.navigation?.items) {
    data.navigation.items.forEach(item => {
      if (item.text && /^(.+)\1$/.test(item.text)) {
        errors.push(`Дублированный текст: "${item.text}"`);
      }
    });
  }
  
  // 5. Проверка SVG иконок
  if (data.icons) {
    Object.entries(data.icons).forEach(([name, icon]) => {
      if (!icon.viewBox) {
        errors.push(`SVG ${name} без viewBox`);
      }
      if (!icon.pathD && !icon.outerHTML) {
        errors.push(`SVG ${name} без path данных`);
      }
    });
  }
  
  if (errors.length > 0) {
    console.error('❌ ВАЛИДАЦИЯ НЕ ПРОЙДЕНА:');
    errors.forEach(e => console.error(`  - ${e}`));
    throw new Error('Скрипт извлечения не сработал корректно!');
  }
  
  console.log('✅ Валидация пройдена');
}

// Вызвать перед сохранением
validateExtractedData(data);
```

### Если скрипт НЕ прошёл валидацию:

1. **НЕ** использовать скриншоты для "угадывания" значений
2. **НЕ** брать значения из предыдущих JSON (они могут быть устаревшими)
3. **ИСПРАВИТЬ** селекторы или логику извлечения
4. **ЗАПУСТИТЬ** скрипт снова
5. **ПОВТОРЯТЬ** пока валидация не пройдёт

### Частые причины ошибок и их решения:

| Проблема | Причина | Решение |
|----------|---------|---------|
| `null` или `undefined` | Неправильный селектор | Использовать `querySelectorAll('*')` + поиск по стилям |
| Дублированный текст | Вложенные элементы с тем же текстом | Брать `textContent` только у leaf-элемента |
| Размер = 0 | Элемент скрыт или вне viewport | Проверить `display`, `visibility`, `getBoundingClientRect()` |
| Неправильные цвета | Прозрачный фон, цвет через `::before` | Проверить псевдо-элементы |

### Правильный паттерн получения текста:

```javascript
// ❌ НЕПРАВИЛЬНО - может дублироваться
const text = element.textContent;

// ✅ ПРАВИЛЬНО - только прямой текст
function getDirectText(element) {
  return Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent.trim())
    .join(' ')
    .trim();
}

// Или взять первый текстовый span
const text = element.querySelector('span')?.textContent || 
             element.firstChild?.textContent?.trim();
```

### Правильный паттерн получения SVG:

```javascript
// ❌ НЕПРАВИЛЬНО - только path d
const pathD = svg.querySelector('path')?.getAttribute('d');

// ✅ ПРАВИЛЬНО - полный SVG
const svgData = {
  outerHTML: svg.outerHTML,  // Весь SVG для копирования
  viewBox: svg.getAttribute('viewBox'),
  width: getComputedStyle(svg).width,
  height: getComputedStyle(svg).height,
  paths: Array.from(svg.querySelectorAll('path')).map(p => ({
    d: p.getAttribute('d'),
    fill: p.getAttribute('fill'),
    stroke: p.getAttribute('stroke'),
  })),
};
```

### Правильный паттерн измерения gaps:

```javascript
// ❌ НЕПРАВИЛЬНО - вычисление по margin
const gap = parseInt(getComputedStyle(el).marginRight);

// ✅ ПРАВИЛЬНО - измерение реального расстояния
function measureGap(el1, el2) {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return Math.round(rect2.left - rect1.right);
}
```

---

## 11. ШРИФТ OpenAI Sans

OpenAI использует проприетарный шрифт "OpenAI Sans". Для pixel-perfect соответствия:

### Проверка загрузки шрифта:

```javascript
// В скрипте извлечения
const fontInfo = await page.evaluate(() => {
  const body = document.body;
  const computed = getComputedStyle(body);
  
  return {
    fontFamily: computed.fontFamily,
    // Проверить что шрифт реально загружен
    openAISansLoaded: document.fonts.check('14px "OpenAI Sans"'),
    // Список загруженных шрифтов
    loadedFonts: Array.from(document.fonts).map(f => ({
      family: f.family,
      weight: f.weight,
      style: f.style,
      status: f.status,
    })),
  };
});
```

### Если OpenAI Sans недоступен:

Использовать fallback chain из оригинала:
```css
font-family: "OpenAI Sans", helvetica, sans-serif;
```

Helvetica визуально близка к OpenAI Sans.

---

## 12. ОБЯЗАТЕЛЬНЫЙ ЧЕКЛИСТ ПАРАМЕТРОВ

**КРИТИЧЕСКИ ВАЖНО:** При извлечении ЛЮБОГО компонента нужно извлечь ВСЕ параметры из этого чеклиста. Пропуск любого параметра приведёт к неточной реализации.

### 12.1 Для КНОПОК с текстом и иконкой

```javascript
{
  // КОНТЕЙНЕР КНОПКИ
  container: {
    width: number,
    height: number,
    padding: string,           // ОБЯЗАТЕЛЬНО: "8px 12px" или отдельно
    paddingLeft: number,
    paddingRight: number,
    paddingTop: number,
    paddingBottom: number,
    margin: string,
    marginLeft: number,
    backgroundColor: string,
    borderRadius: string,
    border: string,
    cursor: string,
  },
  
  // GAP МЕЖДУ ЭЛЕМЕНТАМИ ВНУТРИ
  gap: number,  // CSS gap или измерить через getBoundingClientRect()
  
  // ТЕКСТ ВНУТРИ
  text: {
    content: string,
    fontSize: string,          // "14px"
    fontWeight: number,        // 400, 500, 600 - ТОЧНОЕ значение!
    color: string,             // "#282828"
    letterSpacing: string,     // "-0.16px"
    lineHeight: string,        // "21px"
  },
  
  // ИКОНКА ВНУТРИ
  icon: {
    width: number,
    height: number,
    marginLeft: number,        // расстояние от текста до иконки
    color: string,
    outerHTML: string,         // полный SVG
  },
}
```

**Метод измерения gap внутри кнопки:**

```javascript
function measureInnerGap(button) {
  const text = button.querySelector('span');
  const icon = button.querySelector('svg');
  if (!text || !icon) return null;
  
  const textRect = text.getBoundingClientRect();
  const iconRect = icon.getBoundingClientRect();
  
  // Gap = расстояние от правого края текста до левого края иконки
  return Math.round(iconRect.left - textRect.right);
}
```

### 12.2 Для NAV ITEMS (ссылки навигации)

```javascript
{
  text: string,
  href: string,
  
  // ОБЫЧНОЕ СОСТОЯНИЕ
  normal: {
    fontSize: string,
    fontWeight: number,        // ТОЧНЫЙ вес! 400, 500, 600
    color: string,
    padding: string,
    borderRadius: string,
    backgroundColor: string,
    lineHeight: string,
    letterSpacing: string,
  },
  
  // HOVER СОСТОЯНИЕ - ОБЯЗАТЕЛЬНО ИЗВЛЕЧЬ!
  hover: {
    color: string,
    backgroundColor: string,   // часто #ededed или подобный
    fontWeight: number,        // может меняться при hover
  },
  
  // ACTIVE СОСТОЯНИЕ (текущая страница)
  active: {
    fontWeight: number,
    color: string,
    backgroundColor: string,
  },
}
```

**Метод извлечения hover:**

```javascript
async function extractHoverState(page, selector) {
  // 1. Получить default state
  const defaultState = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const s = getComputedStyle(el);
    return {
      color: s.color,
      backgroundColor: s.backgroundColor,
      fontWeight: s.fontWeight,
    };
  }, selector);
  
  // 2. Hover
  await page.hover(selector);
  await page.waitForTimeout(200);  // важно подождать transition
  
  // 3. Получить hover state
  const hoverState = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const s = getComputedStyle(el);
    return {
      color: s.color,
      backgroundColor: s.backgroundColor,
      fontWeight: s.fontWeight,
    };
  }, selector);
  
  // 4. Убрать hover
  await page.mouse.move(0, 0);
  
  return { default: defaultState, hover: hoverState };
}
```

### 12.3 Для ПОЗИЦИОНИРОВАНИЯ элементов

```javascript
{
  // ПОЗИЦИЯ ОТНОСИТЕЛЬНО VIEWPORT
  viewportLeft: number,        // rect.left - расстояние от левого края окна
  viewportTop: number,         // rect.top
  
  // ПОЗИЦИЯ ОТНОСИТЕЛЬНО РОДИТЕЛЯ
  offsetLeft: number,          // element.offsetLeft
  offsetTop: number,           // element.offsetTop
  
  // MARGIN И PADDING
  marginLeft: number,          // важно для отступа от края!
  marginRight: number,
  paddingLeft: number,
  paddingRight: number,
  
  // РАЗМЕРЫ
  width: number,
  height: number,
}
```

**Метод измерения расстояния от края:**

```javascript
function measureDistanceFromEdge(element) {
  const rect = element.getBoundingClientRect();
  const parentRect = element.parentElement.getBoundingClientRect();
  const s = getComputedStyle(element);
  
  return {
    // Расстояние от левого края viewport
    fromViewportLeft: Math.round(rect.left),
    
    // Расстояние от левого края родителя
    fromParentLeft: Math.round(rect.left - parentRect.left),
    
    // CSS margin (может быть auto)
    marginLeft: s.marginLeft,
    
    // Фактический offset
    offsetLeft: element.offsetLeft,
  };
}
```

### 12.4 Для USER AVATAR

```javascript
{
  width: number,
  height: number,
  borderRadius: string,        // "9999px" или "50%"
  backgroundColor: string,     // fallback цвет если нет изображения
  overflow: string,            // "hidden"
  
  // ИЗОБРАЖЕНИЕ (если есть)
  hasImage: boolean,
  image: {
    src: string,               // URL или data:image
    alt: string,
    objectFit: string,
  },
  
  // ИНИЦИАЛЫ (если нет изображения)
  initials: {
    text: string,
    fontSize: string,
    fontWeight: number,
    color: string,
  },
}
```

### 12.5 Для HEADER/НАВБАРА

```javascript
{
  // КОНТЕЙНЕР
  height: number,              // точная высота
  width: string,               // "100%" или число
  
  // PADDING - КРИТИЧЕСКИ ВАЖНО!
  paddingLeft: number,         // расстояние от левого края до первого элемента
  paddingRight: number,        // расстояние от правого края до последнего элемента
  paddingTop: number,
  paddingBottom: number,
  
  // FLEXBOX
  display: string,
  alignItems: string,
  justifyContent: string,
  gap: number,
  
  // ФОН
  backgroundColor: string,
  
  // ШРИФТ
  fontFamily: string,
}
```

### 12.6 ОБЯЗАТЕЛЬНАЯ ВАЛИДАЦИЯ

В конце КАЖДОГО скрипта извлечения добавить проверку:

```javascript
function validateCompleteExtraction(data) {
  const missing = [];
  
  // Проверить header padding
  if (data.header?.paddingLeft === undefined) {
    missing.push('header.paddingLeft');
  }
  
  // Проверить кнопки с gap
  if (data.projectSelector?.personalButton?.gap === undefined) {
    missing.push('personalButton.gap (между текстом и иконкой)');
  }
  
  // Проверить hover states
  if (!data.navigation?.items?.every(item => item.hover)) {
    missing.push('navigation hover states');
  }
  
  // Проверить user avatar
  if (!data.rightSection?.userAvatar?.width) {
    missing.push('userAvatar');
  }
  
  // Проверить fontWeight - должен быть числом
  data.navigation?.items?.forEach((item, i) => {
    if (typeof item.fontWeight === 'string') {
      missing.push(`navigation.items[${i}].fontWeight должен быть числом, получено: "${item.fontWeight}"`);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ ПРОПУЩЕНЫ ПАРАМЕТРЫ:');
    missing.forEach(m => console.error(`  - ${m}`));
    throw new Error('Неполное извлечение! Исправь скрипт.');
  }
  
  console.log('✅ Все обязательные параметры извлечены');
}
```

### 12.7 ЗАПРЕЩЕНО

- ❌ Пропускать `paddingLeft`/`paddingRight` у контейнеров
- ❌ Пропускать `gap` между элементами внутри кнопок
- ❌ Не извлекать hover состояния
- ❌ Использовать fontWeight как строку ("600") вместо числа (600)
- ❌ Пропускать user avatar
- ❌ Угадывать значения без измерения

