# Sidebar States - Extracted from OpenAI Platform

## EXPANDED STATE

```
Sidebar container:
  left: 8px (from viewport)
  width: 210px
  height: calc(100vh - 54px)
  padding: 14px 0px 0px

Icon buttons (a.k-D0f._8xE3c):
  width: 194px
  height: 32px
  margin: 0px 0px 4px
  left from sidebar: 4px (menu container has margin: 0 0 0 -8px + padding: 0 12px)
  left from viewport: 12px

Content card:
  left: 226px (8px sidebar offset + 210px sidebar + 8px gap)
```

## COLLAPSED STATE

```
Sidebar container:
  left: 0px (!) - moves to viewport edge
  width: 64px
  height: calc(100vh - 54px)
  padding: 14px 0px 0px

Icon buttons (button):
  width: 40px
  height: 32px
  margin: 0px 0px 4px (NOT centered!)
  padding-left inside sidebar: 12px
  left from viewport: 12px (0 + 12px internal padding)

Content card:
  left: 64px (no gap - directly after sidebar)
```

## KEY DIFFERENCES

| Property | Expanded | Collapsed |
|----------|----------|-----------|
| sidebar.left | 8px | 0px |
| sidebar.width | 210px | 64px |
| buttons.leftFromViewport | 12px | 12px |
| content.left | 226px | 64px |
| gap | 8px | 0px |

## Button Layout in Collapsed

In collapsed state, buttons are NOT centered. They have:
- Sidebar internal padding-left: 12px
- Button margin: 0px 0px 4px (no auto centering)
- This positions buttons at 12px from viewport edge

```
Viewport edge
|
|-- 0px: Sidebar starts
|   |
|   |-- 12px padding: Button starts here
|   |   |
|   |   |-- 40px button width
|   |   |
|   |-- 52px: Button ends
|   |
|-- 64px: Sidebar ends, Content starts
```

## Collapse Button Position

Both states:
- Width: 40px
- Height: 32px
- Same left offset as menu items (12px from viewport in collapsed)
- In footer section

## Transition

- Sidebar uses opacity transition: `opacity 0.3s cubic-bezier(0.65, 0, 0.35, 1)`
- Width change is instant (no width transition)
- Content text fades out with opacity

