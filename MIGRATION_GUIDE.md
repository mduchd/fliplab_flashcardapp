# Migration Guide: Vanilla JS → React + TypeScript

## Tổng quan

Tài liệu này hướng dẫn chi tiết về cách code từ dự án Vanilla JS đã được chuyển đổi sang React + TypeScript.

## 1. State Management

### ❌ Vanilla JS (Cũ)
```javascript
// app.js
let flashcardSets = [];

function loadFlashcardSets() {
  const data = localStorage.getItem('flashcardSets');
  flashcardSets = data ? JSON.parse(data) : [];
  renderFlashcardList();
}

function addFlashcardSet(set) {
  flashcardSets.push(set);
  localStorage.setItem('flashcardSets', JSON.stringify(flashcardSets));
  renderFlashcardList();
}

function renderFlashcardList() {
  const container = document.getElementById('flashcard-grid');
  container.innerHTML = '';
  
  flashcardSets.forEach(set => {
    const card = document.createElement('div');
    card.innerHTML = `...`;
    container.appendChild(card);
  });
}
```

### ✅ React (Mới)
```typescript
// hooks/useFlashcardSets.ts
export const useFlashcardSets = () => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);

  // Auto-load từ localStorage
  useEffect(() => {
    const loaded = getFlashcardSets();
    setSets(loaded);
  }, []);

  // Auto-save khi thay đổi
  useEffect(() => {
    saveFlashcardSets(sets);
  }, [sets]);

  const addSet = (set) => {
    setSets(prev => [...prev, set]);
    // Không cần render thủ công, React tự động re-render!
  };

  return { sets, addSet };
};

// App.tsx
const { sets, addSet } = useFlashcardSets();

// React tự động render khi sets thay đổi
{sets.map(set => <FlashcardCard key={set.id} set={set} />)}
```

**Lợi ích:**
- Không cần `innerHTML` hoặc DOM manipulation thủ công
- React tự động re-render khi state thay đổi
- Code dễ đọc, dễ test hơn

---

## 2. Components

### ❌ Vanilla JS (Cũ)
```javascript
// Cùng một đoạn HTML copy-paste nhiều nơi
function createFlashcardHTML(set) {
  return `
    <div class="flashcard-grid-item">
      <div class="set-card">
        <h3>${set.name}</h3>
        <p>${set.description}</p>
        <button onclick="editSet('${set.id}')">Sửa</button>
        <button onclick="deleteSet('${set.id}')">Xóa</button>
      </div>
    </div>
  `;
}
```

### ✅ React (Mới)
```typescript
// components/FlashcardCard.tsx
interface FlashcardCardProps {
  set: FlashcardSet;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FlashcardCard: React.FC<FlashcardCardProps> = ({ 
  set, onEdit, onDelete 
}) => {
  return (
    <div className="flashcard-grid-item">
      <div className="set-card">
        <h3>{set.name}</h3>
        <p>{set.description}</p>
        <button onClick={() => onEdit(set.id)}>Sửa</button>
        <button onClick={() => onDelete(set.id)}>Xóa</button>
      </div>
    </div>
  );
};

// Sử dụng
<FlashcardCard 
  set={set} 
  onEdit={handleEdit} 
  onDelete={handleDelete} 
/>
```

**Lợi ích:**
- Tái sử dụng được khắp nơi
- Props có type checking
- Dễ maintain và test

---

## 3. Event Handling

### ❌ Vanilla JS (Cũ)
```javascript
// Phải attach event listener thủ công
document.getElementById('add-card-btn').addEventListener('click', () => {
  addCard();
});

// Hoặc dùng inline onclick (không tốt)
<button onclick="addCard()">Thêm</button>
```

### ✅ React (Mới)
```typescript
// Inline event handler với arrow function
<button onClick={() => addCard()}>Thêm</button>

// Hoặc tách ra function
const handleAddCard = () => {
  addCard();
};

<button onClick={handleAddCard}>Thêm</button>
```

**Lợi ích:**
- Không cần `getElementById`
- Event cleanup tự động
- Type-safe event handlers

---

## 4. Type Safety

### ❌ Vanilla JS (Cũ)
```javascript
// Không có type checking
function calculateStreak(user) {
  return user.studyDates.length; // Lỗi runtime nếu studyDates = undefined
}

calculateStreak({ name: "John" }); // Chạy được nhưng lỗi runtime
```

### ✅ TypeScript (Mới)
```typescript
interface User {
  name: string;
  studyDates: string[];
}

function calculateStreak(user: User): number {
  return user.studyDates.length;
}

calculateStreak({ name: "John" }); 
// ❌ Lỗi compile ngay: Property 'studyDates' is missing
```

**Lợi ích:**
- Bắt lỗi TRƯỚC KHI chạy
- IDE autocomplete thông minh
- Refactor an toàn hơn

---

## 5. LocalStorage Management

### ❌ Vanilla JS (Cũ)
```javascript
// Scattered localStorage calls
localStorage.setItem('flashcardSets', JSON.stringify(sets));
const sets = JSON.parse(localStorage.getItem('flashcardSets'));

// Không có error handling
// Không có type safety
```

### ✅ React + TypeScript (Mới)
```typescript
// utils/localStorage.ts
export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },
  
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
    }
  }
};

// Sử dụng
const sets = storage.get<FlashcardSet[]>('flashcardSets');
```

**Lợi ích:**
- Centralized storage logic
- Error handling built-in
- Type safety

---

## 6. Toast Notifications

### ❌ Vanilla JS (Cũ)
```javascript
// toast.js
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Gọi từ bất kỳ đâu
showToast('Success!', 'success');
```

### ✅ React (Mới)
```typescript
// hooks/useToast.ts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => removeToast(id), 3000);
  };

  return { toasts, showToast };
};

// App.tsx
const { toasts, showToast } = useToast();

<ToastContainer toasts={toasts} />
<button onClick={() => showToast('Success!', 'success')}>Test</button>
```

**Lợi ích:**
- Quản lý state của toasts dễ dàng
- Có thể render multiple toasts
- Dễ thêm features (undo, animation, etc.)

---

## 7. Code Organization

### ❌ Vanilla JS
```
├── index.html (1000 dòng)
├── js/
│   ├── app.js (500 dòng)
│   ├── flashcard.js (300 dòng)
│   └── streak.js (200 dòng)
```

### ✅ React + TypeScript
```
├── src/
│   ├── components/       # UI components
│   ├── hooks/            # Business logic
│   ├── utils/            # Helper functions
│   └── types/            # Type definitions
```

**Lợi ích:**
- Separation of concerns
- Dễ tìm code
- Dễ làm việc nhóm

---

## Bước tiếp theo

1. **Học React Hooks**: `useState`, `useEffect`, `useCallback`, `useMemo`
2. **Học TypeScript basics**: Interfaces, Types, Generics
3. **Implement routing**: Thêm React Router
4. **Component library**: Xem xét Material-UI hoặc Ant Design
5. **State management**: Nếu app lớn hơn, dùng Zustand hoặc Redux

## Tài liệu

- [React Beta Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite](https://vitejs.dev)
