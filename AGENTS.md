# AGENTS.md — Правила разработки UI компонентов

Этот документ — краткое руководство по созданию pixel-perfect компонентов на основе существующих интерфейсов.

---

## GOLDEN RULE
**ВСЁ ДЕЛАЕМ В ТОЧНОСТИ КАК НА https://platform.openai.com/chat — ВСЕГДА!**

Никаких догадок, округлений или "похожих" значений. Каждый пиксель, цвет, отступ и поведение должны быть идентичны оригиналу.

---

## 0. ГЛАВНОЕ ПРАВИЛО: НЕ УГАДЫВАТЬ
**НИКОГДА** не выдумывай и не округляй значения. Если свойство (размер, цвет, отступ) не извлечено программно через `getComputedStyle()` — оно считается неизвестным. Используй Chrome DevTools и пипетку только если `evaluate()` недоступен.

---

## 1. Способ доступа к браузеру (CDP)
Если целевой сайт защищён (Cloudflare и т.п.), используй **Chrome Remote Debugging Protocol (CDP)**.

### Шаг 1: Закрыть все экземпляры Chrome

```bash
pkill -9 -f "Google Chrome"
sleep 2
```

### Шаг 2: Запустить Chrome с Remote Debugging

**ВАЖНО:** Chrome требует отдельную директорию данных для remote debugging:

```bash
mkdir -p /tmp/chrome-debug-profile

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile \
  "URL_ЦЕЛЕВОГО_САЙТА" &
```

### Шаг 3: Пользователь проходит аутентификацию

Попроси пользователя:
1. Пройти защиту (капчу)
2. Авторизоваться
3. Дождаться полной загрузки интерфейса
4. Сообщить когда готово

### Шаг 4: Проверить доступность CDP

```bash
curl -s http://localhost:9222/json | head -20
```

Должен вернуть JSON с информацией о вкладках.

### Шаг 5: Подключиться через Playwright

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('ЦЕЛЕВОЙ_ДОМЕН'));
  
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
Извлекай `getComputedStyle` для самого элемента и его псевдо-элементов (`::before`, `::after`).

```javascript
const data = await page.evaluate((selector) => {
  const el = document.querySelector(selector);
  const s = getComputedStyle(el);
  const b = getComputedStyle(el, '::before');
  return {
    styles: { color: s.color, backgroundColor: s.backgroundColor, padding: s.padding },
    before: { content: b.content, opacity: b.opacity }
  };
}, 'button.primary');
```

---

## 3. Правила создания компонентов
Используй `forwardRef` и библиотеку `cn` для объединения классов. Все значения (размеры, цвета) должны быть **inline-классами Tailwind** (через `[]`) или извлеченными константами.

```tsx
export const Component = forwardRef<HTMLElement, Props>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center', // База
      variant === 'primary' && 'bg-[#HEX] text-[#HEX] h-[PX]', // Извлеченные значения
      className
    )}
    {...props}
  />
));
```

---

## 4. Workflow извлечения и реализации
1. **ИЗВЛЕЧЕНИЕ**: Скрипт собирает JSON всех состояний (`normal`, `hover`, `active`) и делает скриншот оригинала.
2. **РЕАЛИЗАЦИЯ**: Код пишется СТРОГО по данным из JSON.
3. **ВАЛИДАЦИЯ**: Скриншот реализации сравнивается с оригиналом "side-by-side".

---

## 5. Валидация скриптов
Скрипт извлечения обязан проверять корректность данных перед сохранением:
- Элементы найдены (не `null`).
- Размеры > 0.
- Цвета в формате `rgb` или `hex`.

```javascript
if (!data.width || data.width === '0px') throw new Error('Invalid element width');
```

---

## 6. Извлечение hover states
Всегда дожидайся завершения transition перед замером.

```javascript
const normal = await page.evaluate(el => getComputedStyle(el).backgroundColor, element);
await element.hover();
await page.waitForTimeout(300); // Wait for transition
const hover = await page.evaluate(el => getComputedStyle(el).backgroundColor, element);
```

---

## 7. Чеклист валидации
- [ ] Скриншоты оригинала и реализации идентичны при наложении.
- [ ] Цвета совпадают до единицы в HEX.
- [ ] Отступы (padding/gap) и размеры (height) совпадают пиксель-в-пиксель.
- [ ] Шрифты (size, weight, line-height) идентичны.
- [ ] Все состояния (hover/active) реализованы.
