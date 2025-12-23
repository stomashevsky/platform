# OpenAI Sidebar CSS Extraction - Complete Reference

Extracted from `platform.openai.com/chat` on December 23, 2024.

## Container Structure

```
aside.JiHZk (sidebar)
├── div.uDpF9 (scrollable wrapper)
│   └── div.sQbJC (content with negative margin)
│       ├── div.pb-3 (section: Create)
│       │   ├── h3.cTBD- (section title)
│       │   └── a.k-D0f._8xE3c (menu items)
│       ├── div.pb-3 (section: Manage)
│       └── div.pb-3 (section: Optimize)
└── div.z3hHU (footer)
    ├── div.eE5Hy (Add Credits card)
    └── button._8xE3c (collapse button)
```

---

## Container Styles

### `aside.JiHZk` - Main Sidebar
```css
width: 210px;
height: 952px;
padding: 14px 0px 0px;
margin: 0px;
display: flex;
flex-direction: column;
position: absolute;
inset: 0px;
background-color: transparent;
font-family: "OpenAI Sans", helvetica, sans-serif;
letter-spacing: -0.16px;
```

### `div.uDpF9` - Scrollable Container
```css
flex-grow: 1;
flex-shrink: 1;
flex-basis: 0%;
padding: 0px;
margin: 0px;
```

### `div.sQbJC` - Content Wrapper (IMPORTANT!)
```css
margin: 0px 0px 0px -8px;  /* Negative left margin! */
padding: 0px 12px 16px;
width: 218px;  /* Wider than sidebar! */
overflow: auto;
```

**Math:** 
- Sidebar: 210px
- Content: margin-left -8px + width 218px = starts at -8px, extends to 210px
- Effective padding: 12px left, 12px right within the 218px

### `div.pb-3` - Section Container
```css
width: 194px;
padding: 0px 0px 12px;
margin: 0px;
/* Position: relativeX 4px from sidebar left edge */
/* 4px = -8px (content margin) + 12px (content padding) */
```

### `div.z3hHU` - Footer
```css
padding: 6px 12px 6px 4px;  /* Different left/right! */
display: flex;
flex-direction: column;
flex-shrink: 0;  /* Never shrink */
position: relative;
```

---

## Element Styles

### `h3.cTBD-` - Section Title
```css
width: 194px;
height: 22px;
padding: 0px 12px 8px;
margin: 0px;
font-size: 13px;
font-weight: 500;
color: rgb(143, 143, 143);  /* #8f8f8f */
line-height: 14px;
letter-spacing: -0.16px;
```

### `a.k-D0f._8xE3c.rZ3k-` - Active Menu Item
```css
width: 194px;
height: 32px;
margin: 0px 0px 4px;
padding: 0px;
display: flex;
align-items: center;
position: relative;
font-size: 14px;
font-weight: 400;
line-height: 20px;
letter-spacing: -0.16px;
color: rgb(24, 24, 24);  /* #181818 - darker for active! */
cursor: default;  /* No pointer for active */
```

**::before pseudo-element:**
```css
content: "";
position: absolute;
inset: 0px;
background-color: rgb(223, 223, 223);  /* #dfdfdf */
border-radius: 6px;
opacity: 1;  /* Fully visible for active */
transition: opacity 0.15s cubic-bezier(0.19, 1, 0.22, 1),
            background-color 0.15s cubic-bezier(0.19, 1, 0.22, 1),
            transform 0.15s cubic-bezier(0.19, 1, 0.22, 1),
            box-shadow 0.15s cubic-bezier(0.19, 1, 0.22, 1),
            color 0.15s cubic-bezier(0.19, 1, 0.22, 1);
```

### `a.k-D0f._8xE3c` - Inactive Menu Item
```css
/* Same as active except: */
color: rgb(40, 40, 40);  /* #282828 - lighter for inactive */
cursor: pointer;
```

**::before (normal state):**
```css
opacity: 0;  /* Invisible */
```

**::before (hover state):**
```css
opacity: 0.5;  /* Semi-transparent */
```

### `span.abr-y` - Menu Item Content Wrapper
```css
display: flex;
align-items: center;
position: relative;
overflow: hidden;
```

### `span.J42DB` - Icon Wrapper
```css
width: 32px;
height: 20px;
margin: 0px 2px 0px 4px;  /* 4px left, 2px right */
display: flex;
align-items: center;
justify-content: center;
flex-shrink: 0;
```

### `span.lp65A` - Text Label
```css
display: block;
overflow: hidden;
white-space: nowrap;
text-overflow: ellipsis;
flex-shrink: 1;
```

### `button._8xE3c` - Collapse Button
```css
width: 40px;
height: 32px;
padding: 0px;
margin: 0px;
display: inline-block;
position: relative;
color: rgb(40, 40, 40);  /* #282828 */
cursor: pointer;
```

**::before (normal):**
```css
opacity: 0;
```

**::before (hover):**
```css
opacity: 0.5;
```

### `div.eE5Hy` - Add Credits Card
```css
width: 194px;
height: 121px;
margin: 8px 0px;
padding: 6px 12px 10px;
background-color: rgb(243, 243, 243);  /* #f3f3f3 */
border-radius: 8px;
border: 1px solid rgba(0, 0, 0, 0.1);
font-size: 14px;
line-height: 21px;
letter-spacing: -0.16px;
color: rgb(40, 40, 40);  /* #282828 */
cursor: pointer;
```

---

## Hover States (IMPORTANT!)

OpenAI uses **opacity** transitions on `::before`, NOT background-color changes!

### Menu Item Hover Logic
```css
/* ::before always has: */
background-color: #dfdfdf;
border-radius: 6px;

/* State changes via opacity: */
/* Inactive (normal): */ opacity: 0;
/* Inactive (hover):  */ opacity: 0.5;
/* Active:            */ opacity: 1;
```

### Transition Timing
```css
transition: opacity 0.15s cubic-bezier(0.19, 1, 0.22, 1),
            background-color 0.15s cubic-bezier(0.19, 1, 0.22, 1),
            transform 0.15s cubic-bezier(0.19, 1, 0.22, 1),
            box-shadow 0.15s cubic-bezier(0.19, 1, 0.22, 1),
            color 0.15s cubic-bezier(0.19, 1, 0.22, 1);
```

---

## Color Palette

| Name | RGB | HEX | Usage |
|------|-----|-----|-------|
| Text Active | rgb(24, 24, 24) | #181818 | Active menu item text |
| Text Inactive | rgb(40, 40, 40) | #282828 | Inactive menu item, buttons |
| Text Muted | rgb(143, 143, 143) | #8f8f8f | Section titles |
| Background Hover | rgb(223, 223, 223) | #dfdfdf | Menu item ::before |
| Card Background | rgb(243, 243, 243) | #f3f3f3 | Add Credits card |

---

## Position Calculations

### Content Position
```
Sidebar left edge: 0px
Content margin-left: -8px
Content padding-left: 12px
Section position from sidebar: -8 + 12 = 4px
```

### Element Widths
```
Sidebar: 210px
Content wrapper: 218px (with -8px margin)
Sections: 194px
Menu items: 194px
Add Credits card: 194px
Collapse button: 40px
```

---

## Tailwind Classes Implementation

### Menu Item
```tsx
className={cn(
  // ::before with fixed bg, opacity changes
  'before:absolute before:inset-0 before:rounded-[6px] before:bg-[#dfdfdf]',
  // Transition
  'before:transition-[opacity,background-color,transform,box-shadow,color]',
  'before:duration-150 before:ease-[cubic-bezier(0.19,1,0.22,1)]',
  // State-based opacity
  active ? 'before:opacity-100' : 'before:opacity-0 hover:before:opacity-50'
)}
```

### Collapse Button
```tsx
className={cn(
  'before:absolute before:inset-0 before:rounded-[6px] before:bg-[#dfdfdf]',
  'before:transition-[opacity,background-color,transform,box-shadow,color]',
  'before:duration-150 before:ease-[cubic-bezier(0.19,1,0.22,1)]',
  'before:opacity-0 hover:before:opacity-50'
)}
```

---

## Files

- `reference/sidebar-css-classes.json` - Full computed styles for all classes
- `reference/sidebar-hover-states.json` - Hover state styles
- `src/components/ui/Sidebar.tsx` - Implementation

---

## Key Takeaways

1. **Negative margin trick**: `div.sQbJC` uses `margin-left: -8px` with `padding: 0 12px` to achieve 4px offset from sidebar edge.

2. **Opacity-based hover**: `::before` always has `bg: #dfdfdf`, visibility controlled by `opacity: 0 → 0.5 → 1`.

3. **Width 194px**: All content elements (sections, items, card) are exactly 194px wide.

4. **Footer asymmetric padding**: `padding: 6px 12px 6px 4px` - different left (4px) and right (12px).

5. **Color difference**: Active `#181818` vs Inactive `#282828` - subtle but intentional.

