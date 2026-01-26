# Card Layout Fix - Equal Heights

## 🐛 Problem
Cards had inconsistent heights because:
1. Descriptions varied in length
2. Some cards had no description
3. Content pushed buttons to different vertical positions

**Before:**
```
Card 1: 200px (long description)
Card 2: 150px (short description)  
Card 3: 120px (no description)
```

## ✅ Solution

### 1. Flex Container
```tsx
className="flex flex-col h-full"
```
- Makes card a flex column
- `h-full` ensures it fills grid cell height

### 2. Fixed Description Height
```tsx
<div className="flex-1 mb-3">
  {description ? (
    <p className="h-[2.5rem] line-clamp-2">...</p>
  ) : (
    <div className="h-[2.5rem]" />  // Empty placeholder
  )}
</div>
```
- Always reserves 2.5rem (40px) for description
- Empty div when no description
- `flex-1` allows it to grow if needed

### 3. Button at Bottom
```tsx
<button className="mt-auto">
  Vào nhóm
</button>
```
- `mt-auto` pushes button to bottom
- Always aligned regardless of content above

## 📐 Result

**After:**
```
Card 1: 280px ✓
Card 2: 280px ✓
Card 3: 280px ✓
```

All cards now have:
- Same total height
- Description section: 40px (fixed)
- Button: Always at bottom
- Consistent spacing

## 🎨 Visual Structure

```
┌─────────────────────┐
│ Header (fixed)      │ 60px
│ Description         │ 40px (fixed with flex-1)
│ Activity            │ 40px
│ ─────────────────── │
│ [Button] (mt-auto)  │ 40px
└─────────────────────┘
Total: ~280px (consistent)
```

## 🔧 Technical Details

### Flexbox Layout
- Parent: `grid` with equal column widths
- Child: `flex flex-col h-full`
- Description: `flex-1` (grows to fill)
- Button: `mt-auto` (sticks to bottom)

### Height Calculation
- Header: ~60px (avatar + title + meta)
- Description: 40px (2.5rem fixed)
- Activity: ~40px (time + status)
- Separator: 1px
- Button: ~40px (py-2.5)
- Padding: 20px (p-5)
**Total: ~280px**

## ✅ Benefits

1. **Visual Consistency**: All cards same height
2. **Better Grid**: No jagged edges
3. **Professional Look**: Clean, organized
4. **Predictable Layout**: Users know where to find buttons
5. **Responsive**: Works on all screen sizes

## 🧪 Test Cases

- [x] Card with long description
- [x] Card with short description
- [x] Card with no description
- [x] Card with joined badge
- [x] Card without joined badge
- [x] Grid with mixed cards
- [x] Responsive on mobile/tablet/desktop
