# Layout Structure - OpenAI Platform

**Извлечено из:** platform.openai.com/chat  
**Дата:** 23 декабря 2024  
**Метод:** Chrome DevTools Protocol + измерения getBoundingClientRect()

---

## Общая структура страницы

```
┌─────────────────────────────────────────────┐
│  BODY (1060px x 1014px)                     │
│  bg: #f3f3f3, padding: 0, margin: 0        │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ HEADER (fixed, 54px height)           │ │
│  │ left: 8px, right: 8px                 │ │
│  │ padding: 0px 12px                     │ │
│  │ display: flex, justify: space-between │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌─────┬────────────────────────────────┐  │
│  │ SI  │  CONTENT CARD (white)          │  │
│  │ DE  │  position: x=218, y=54         │  │
│  │ BA  │  size: 834px x 952px           │  │
│  │ R   │  border: 1px solid #ededed     │  │
│  │     │  border-radius: 8px            │  │
│  │ 210 │                                │  │
│  │ px  │                                │  │
│  │     │                                │  │
│  └─────┴────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘

Page margins: 8px left, 8px right
```

---

## Header

### Позиция и размеры

```typescript
{
  tag: 'DIV',
  position: 'fixed',
  top: '0px',
  left: '8px',
  right: '8px',
  height: '54px',
  padding: '0px 12px',
  backgroundColor: 'rgba(0, 0, 0, 0)', // прозрачный
  
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  
  // Фактические размеры
  rect: {
    x: 8,
    y: 0,
    width: 1044,  // 1060 - 8 (left) - 8 (right)
    height: 54
  }
}
```

### Дети Header (3 элемента)

**1. Левая часть (Project Selector)**
```typescript
{
  index: 0,
  tag: 'DIV',
  display: 'flex',
  flexGrow: '1',      // растягивается
  flexShrink: '0',
  flexBasis: '0%',
  alignItems: 'center',
  
  rect: {
    x: 20,
    y: 11,
    width: 690.6,     // занимает основное пространство
    height: 32
  }
}
```

**2. Правая часть (Navigation)**
```typescript
{
  index: 1,
  tag: 'DIV',
  display: 'block',
  flexGrow: '0',      // фиксированная
  flexShrink: '0',
  
  rect: {
    x: 710.6,
    y: 0,
    width: 329.4,     // фиксированная ширина
    height: 54
  }
}
```

**3. Скрытый элемент**
```typescript
{
  index: 2,
  display: 'none'     // скрыт
}
```

---

## Sidebar

### Позиция и размеры

```typescript
{
  tag: 'ASIDE',
  position: 'absolute',
  width: '210px',
  height: '952px',    // до низа экрана
  padding: '14px 0px 0px',
  backgroundColor: 'rgba(0, 0, 0, 0)', // прозрачный
  
  display: 'flex',
  flexDirection: 'column',
  
  // Фактические размеры
  rect: {
    x: 0,             // прижат к левому краю
    y: 54,            // под header
    width: 210,
    height: 952
  }
}
```

### Дочерний элемент (scrollable container)

```typescript
{
  index: 0,
  tag: 'DIV',
  display: 'block',
  flexGrow: '1',      // растягивается на всю высоту
  flexShrink: '1',
  overflow: 'visible',
  
  rect: {
    x: 0,
    y: 14,            // относительно sidebar
    width: 210,
    height: 938       // занимает всю высоту sidebar
  }
}
```

---

## Content Card (Main)

### Позиция и размеры

```typescript
{
  tag: 'DIV',
  position: 'static', // обычное позиционирование
  
  // Абсолютная позиция на странице
  rect: {
    x: 218,           // справа от sidebar (210 + 8px gap)
    y: 54,            // под header
    width: 834,       // оставшееся пространство
    height: 952       // до низа экрана
  },
  
  // Стили
  width: '834px',
  height: '952px',
  padding: '0px',
  margin: '0px',
  
  backgroundColor: 'rgb(255, 255, 255)', // #ffffff
  border: '1px solid rgb(237, 237, 237)', // #ededed
  borderRadius: '8px',
  overflow: 'hidden',
  
  display: 'block'
}
```

### Дочерний элемент (content wrapper)

```typescript
{
  index: 0,
  tag: 'DIV',
  display: 'block',
  
  rect: {
    x: 1,             // border offset
    y: 1,             // border offset
    width: 832,       // 834 - 2px border
    height: 950       // 952 - 2px border
  },
  
  padding: '0px',
  margin: '0px'
}
```

---

## Spacing (промежутки)

### Page margins
```typescript
{
  pageLeftMargin: 8,    // от левого края окна
  pageRightMargin: 8,   // до правого края окна
}
```

### Между элементами
```typescript
{
  sidebarToCard: 8,     // от sidebar (210px) до card (218px)
  // 218 - 210 = 8px gap
}
```

---

## Flexbox структура

### Header Layout
```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0%;
  /* Занимает всё доступное пространство */
}

.header-right {
  flex-grow: 0;
  flex-shrink: 0;
  /* Фиксированная ширина */
}
```

### Sidebar Layout
```css
.sidebar {
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex-grow: 1;
  flex-shrink: 1;
  /* Растягивается на всю высоту */
}
```

---

## Расчёты размеров

### Viewport width: 1060px

```
┌──────────────────────────────────────────────┐
│ 8px │ Sidebar 210px │ 8px │ Card 834px │ 8px │
└──────────────────────────────────────────────┘
  8 + 210 + 8 + 834 + 8 = 1068px
  (видимо 8px это scroll bar или округление)
```

### Header width calculation

```
Header left: 8px (page margin)
Header right: 8px (page margin)
Header padding: 12px each side

Total usable width:
1060 - 8 - 8 = 1044px (header width)
1044 - 12 - 12 = 1020px (content width inside header)
```

### Content card width calculation

```
Viewport: 1060px
- Left margin: 8px
- Sidebar: 210px
- Gap: 8px
- Right margin: 8px
= 1060 - 8 - 210 - 8 - 8 = 826px???

Actual card width: 834px
(видимо есть дополнительный margin)
```

---

## React/Next.js структура

### Layout компонент

```tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Header - fixed */}
      <header 
        className="fixed top-0 flex items-center justify-between"
        style={{
          left: '8px',
          right: '8px',
          height: '54px',
          padding: '0 12px'
        }}
      >
        {/* Left side - flex-grow */}
        <div className="flex-1 flex items-center">
          {/* Project selector */}
        </div>
        
        {/* Right side - fixed width */}
        <div className="flex items-center">
          {/* Navigation */}
        </div>
      </header>
      
      {/* Main content - below header */}
      <div className="pt-[54px]">
        <div className="flex">
          {/* Sidebar - fixed width */}
          <aside 
            className="absolute flex flex-col"
            style={{
              width: '210px',
              height: 'calc(100vh - 54px)',
              padding: '14px 0 0'
            }}
          >
            <div className="flex-1">
              {/* Sidebar content */}
            </div>
          </aside>
          
          {/* Content card */}
          <div 
            className="bg-white rounded-lg border border-[#ededed] overflow-hidden"
            style={{
              marginLeft: '218px',  // 210px sidebar + 8px gap
              width: '834px',
              height: 'calc(100vh - 54px)'
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Ключевые выводы

### 1. Fixed Header
- Header имеет `position: fixed`
- Прижат к верху (top: 0)
- Имеет отступы от краёв (left: 8px, right: 8px)
- Высота: 54px

### 2. Sidebar
- `position: absolute`
- Фиксированная ширина: 210px
- Прижат к левому краю
- Начинается под header (y: 54px)

### 3. Content Card
- Белая карточка (#ffffff)
- Граница: 1px solid #ededed
- Border-radius: 8px
- Позиция: слева sidebar + 8px gap

### 4. Spacing System
- Page margins: **8px** слева и справа
- Sidebar-to-content gap: **8px**
- Header padding: **12px** горизонтально

### 5. Flexbox Usage
- Header: `flex` с `justify-content: space-between`
- Sidebar: `flex-direction: column` с `flex-grow: 1` на content
- Header left: `flex-grow: 1` (растягивается)
- Header right: `flex-grow: 0` (фиксированная)

---

## Responsive behavior

На уменьшение viewport width:
1. Header остаётся fixed
2. Content card уменьшается
3. Sidebar остаётся 210px
4. При очень узком viewport - sidebar может collapse

---

## Реализация в Next.js

Файл: `src/app/layout.tsx`

```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body className="bg-[#f3f3f3]">
        {children}
      </body>
    </html>
  );
}
```

Файл: `src/app/page.tsx`

```tsx
export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header className="fixed top-0 left-2 right-2 z-10" />
      
      {/* Main */}
      <div className="flex flex-1 pt-[54px]">
        <Sidebar className="absolute left-0 w-[210px] h-[calc(100vh-54px)]" />
        <main className="ml-[218px] w-[834px] h-[calc(100vh-54px)] bg-white rounded-lg border border-[#ededed]">
          {/* Content */}
        </main>
      </div>
    </div>
  );
}
```

