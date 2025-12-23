# Финальное извлечение стилей OpenAI Platform

**Дата:** 23 декабря 2024  
**Источник:** platform.openai.com/chat  
**Метод:** Chrome DevTools Protocol через Playwright

---

## Резюме

Все стили извлечены напрямую из OpenAI Platform с использованием `getComputedStyle()`. **Ничего не выдумано** - все значения точные.

### Ключевое открытие

OpenAI использует **::before pseudo-элемент** для фоновых цветов вместо прямого `background`. Это позволяет:
- Легче анимировать фон
- Отделить content layer от background layer
- Использовать `position: absolute` с `inset: 0px` для точного покрытия

---

## Глобальные стили

```css
body {
  background-color: #f3f3f3;  /* rgb(243, 243, 243) */
  color: #282828;              /* rgb(40, 40, 40) */
  font-family: "OpenAI Sans", helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: -0.16px;
}
```

---

## Цветовая палитра (извлечено)

### Фоны
| HEX       | RGB                | Использование |
|-----------|--------------------|---------------|
| `#f3f3f3` | rgb(243, 243, 243) | Фон страницы |
| `#ffffff` | rgb(255, 255, 255) | Белые карточки |
| `#ededed` | rgb(237, 237, 237) | Hover состояние, границы |
| `#dfdfdf` | rgb(223, 223, 223) | Активный элемент sidebar (::before) |
| `#181818` | rgb(24, 24, 24)    | Primary кнопка (::before) |

### Текст
| HEX       | RGB              | Использование |
|-----------|------------------|---------------|
| `#0d0d0d` | rgb(13, 13, 13)  | Основной текст (самый тёмный) |
| `#181818` | rgb(24, 24, 24)  | Текст активного элемента sidebar |
| `#282828` | rgb(40, 40, 40)  | Текст неактивного элемента sidebar, body |
| `#5d5d5d` | rgb(93, 93, 93)  | Второстепенный текст |
| `#8f8f8f` | rgb(143, 143, 143) | Приглушённый текст (section titles) |
| `#ffffff` | rgb(255, 255, 255) | Белый текст (на тёмном фоне) |

---

## Header

```typescript
{
  tag: 'DIV',
  height: '54px',
  padding: '0px 12px',
  backgroundColor: 'rgba(0, 0, 0, 0)',  // прозрачный
  display: 'flex',
  position: 'fixed'
}
```

### Project Selector Avatar

```typescript
{
  width: '25px',
  height: '25px',
  borderRadius: '9999px',  // круг
  backgroundColor: '#181818',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600
}
```

### Navigation Items

```typescript
{
  fontSize: '14px',
  padding: '6px',
  borderRadius: '8px',
  
  // Active state
  fontWeight: 600,
  color: '#0d0d0d',
  
  // Inactive state
  fontWeight: 400,
  color: '#5d5d5d',
  
  // Hover (inactive -> hover)
  color: '#0e0e0e'  // темнеет
}
```

---

## Sidebar

### Expanded (развёрнутый)

```typescript
{
  width: '218px',
  padding: '14px 0px 0px',
  backgroundColor: 'rgba(0, 0, 0, 0)',  // прозрачный
  position: 'absolute'
}
```

### Collapsed (свёрнутый)

```typescript
{
  width: '64px',
  padding: '0px 12px 16px',
  margin: '0px 0px 0px -8px'
}
```

### Sidebar Item

```typescript
{
  width: '194px',
  height: '32px',
  padding: '0px',
  margin: '0px 0px 4px',
  fontSize: '14px',
  fontWeight: 400,
  
  // Default/Inactive
  color: '#282828',  // rgb(40, 40, 40)
  backgroundColor: 'rgba(0, 0, 0, 0)',
  
  // Active
  color: '#181818',  // rgb(24, 24, 24)
  '::before': {
    backgroundColor: '#dfdfdf',  // rgb(223, 223, 223)
    borderRadius: '6px',
    position: 'absolute',
    inset: '0px'
  },
  
  // Hover
  '::before': {
    backgroundColor: '#ededed'  // rgb(237, 237, 237)
  }
}
```

### Collapse Button

```typescript
{
  width: '22px',
  height: '22px',
  borderRadius: '6px',
  color: '#5d5d5d',  // rgb(93, 93, 93)
  
  '::before': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',  // oklab полупрозрачный
    borderRadius: '6px',
    position: 'absolute',
    inset: '0px'
  },
  
  // Hover
  color: '#282828'  // rgb(40, 40, 40) - темнеет
}
```

---

## Buttons

### Primary Button (Create)

```typescript
{
  width: '103px',  // динамическая
  height: '40px',
  padding: '0px',
  margin: '0px',
  borderRadius: '9999px',  // pill-shaped
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '-0.14px',
  lineHeight: '14px',
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0)',  // прозрачный
  cursor: 'pointer',
  transition: 'opacity 0.15s, color 0.15s',
  
  '::before': {
    content: '""',
    backgroundColor: '#181818',  // rgb(24, 24, 24)
    borderRadius: '9999px',
    position: 'absolute',
    inset: '0px'
  },
  
  '::after': {
    content: '""',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  },
  
  svg: {
    width: '1em',
    height: '1em',
    viewBox: '0 0 24 24',
    fill: '#ffffff'
  }
}
```

**Gap между иконкой и текстом:** 6px

### Chip Button (suggestion pills)

```typescript
{
  height: '28px',
  padding: '0px 7.98px',  // ≈ 8px
  borderRadius: '9999px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#0d0d0d',
  backgroundColor: 'rgba(0, 0, 0, 0)',  // прозрачный
  
  '::before': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',  // oklab полупрозрачный
    borderRadius: '9999px'
  },
  
  // Hover
  '::before': {
    backgroundColor: '#ededed'  // rgb(237, 237, 237)
  }
}
```

**Gap:** 4px

---

## Input Fields

### Generate Input

```typescript
{
  placeholder: 'Generate...',
  fontSize: '14px',
  color: '#282828',
  padding: '0px 12px',
  height: '32px',  // inner
  
  container: {
    height: '40px',
    padding: '4px 32px 4px 12px',
    borderRadius: '20px',
    border: '0px solid #282828',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
}
```

---

## Cards

### Main Content Card

```css
background-color: #ffffff;
border: 1px solid #ededed;
border-radius: 8px;
```

---

## Transitions & Animations

| Элемент | Transition |
|---------|------------|
| Primary Button | `opacity 0.15s, color 0.15s` |
| Chip Button | `background-color 0.3s cubic-bezier(0.19, 1, 0.22, 1)` |
| Sidebar Item | `all` (default) |
| Nav Item | `colors` (default) |

---

## Важные паттерны

### 1. ::before для фона

```css
.button {
  position: relative;
  background-color: transparent;
}

.button::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: #181818;
  border-radius: 9999px;
  z-index: 0;
}

.button > * {
  position: relative;
  z-index: 10;
}
```

### 2. Pill-shaped elements

```css
border-radius: 9999px;
```

Используется для:
- Primary кнопка
- Chip кнопки
- Project avatar
- Input container

### 3. Letter spacing

Почти везде: `-0.16px` (body) или `-0.14px` (кнопки)

### 4. Font weights

- 400 - normal text
- 500 - medium (кнопки, section titles)
- 600 - semibold (активные nav items, avatar)

---

## Файлы с извлечёнными данными

1. `reference/complete-ui-extraction.json` - глобальные стили, цвета, sidebar
2. `reference/detailed-elements.json` - все кнопки, inputs, иконки, hover states
3. `reference/sidebar-collapsed-state.json` - collapsed sidebar
4. `reference/header-and-empty-state.json` - header, nav, create button, chips
5. `reference/screenshots/` - все скриншоты для сравнения

---

## Проверка соответствия

✅ Все цвета извлечены через `getComputedStyle()`  
✅ Все размеры измерены точно  
✅ Hover состояния протестированы  
✅ ::before/::after проверены  
✅ SVG иконки извлечены  
✅ Transitions задокументированы  
✅ **Ничего не выдумано** - только факты

---

## Реализация в коде

### Button.tsx
- ✅ Использует ::before для фона
- ✅ Точные размеры (40px height)
- ✅ Pill shape (9999px)
- ✅ Letter-spacing -0.14px
- ✅ Transition opacity 0.15s

### Chip.tsx
- ✅ Использует ::before для фона
- ✅ Height 28px, padding 8px
- ✅ Полупрозрачный фон rgba(0,0,0,0.08)
- ✅ Pill shape

### Header.tsx
- ✅ Height 54px, padding 0px 12px
- ✅ Avatar 25x25px, bg #181818
- ✅ Nav items: weight 600/400, color transitions

### Sidebar.tsx
- ✅ Width 218px/64px
- ✅ Item height 32px, margin 4px
- ✅ Active ::before #dfdfdf
- ✅ Hover ::before #ededed

