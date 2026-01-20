# Flashcard App - React + TypeScript Version

## 🚀 Tổng quan

Đây là phiên bản **React + TypeScript + Vite** được chuyển đổi từ dự án vanilla JavaScript ban đầu. Dự án này được xây dựng với mục đích mở rộng quy mô (scalability) và dễ bảo trì hơn.

## 📁 Cấu trúc dự án

```
flashcard-react/
├── src/
│   ├── components/          # React components
│   │   ├── Toast.tsx
│   │   ├── ToastContainer.tsx
│   │   └── FlashcardCard.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useFlashcardSets.ts
│   │   ├── useStreak.ts
│   │   └── useToast.ts
│   ├── utils/               # Utility functions
│   │   ├── localStorage.ts
│   │   └── helpers.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Entry point
│   └── styles.css           # CSS từ dự án vanilla (giữ nguyên)
├── public/                  # Static assets
└── package.json
```

## 🔄 So sánh với dự án cũ

### Dự án cũ (Vanilla JS)
- **HTML**: 1 file lớn `index.html` với toàn bộ giao diện
- **JS**: Nhiều file JS riêng lẻ (`app.js`, `flashcard.js`, `streak.js`,...)
- **State Management**: Thủ công bằng `localStorage` và DOM manipulation
- **Vấn đề**: Khó mở rộng, khó maintain khi app lớn

### Dự án mới (React + TypeScript)
- **Components**: Chia nhỏ thành các component tái sử dụng được
- **Custom Hooks**: Quản lý state logic riêng biệt, dễ test
- **TypeScript**: Type safety, bắt lỗi ngay khi code
- **Vite**: Build tool hiện đại, HMR (Hot Module Replacement) cực nhanh

## 🛠️ Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Những gì đã chuyển đổi

### ✅ Hoàn thành
1. **Types Definition** (`src/types/index.ts`)
   - Định nghĩa tất cả interfaces: `FlashcardSet`, `User`, `Streak`, `DailyGoal`, `ToastMessage`

2. **Utilities** (`src/utils/`)
   - `localStorage.ts`: Các hàm đọc/ghi localStorage với type safety
   - `helpers.ts`: Utility functions như `generateId`, `shuffleArray`, `formatDate`

3. **Custom Hooks** (`src/hooks/`)
   - `useFlashcardSets`: Quản lý danh sách flashcard sets
   - `useStreak`: Quản lý streak system
   - `useToast`: Quản lý toast notifications

4. **Components** (`src/components/`)
   - `Toast.tsx`: Single toast notification
   - `ToastContainer.tsx`: Container hiển thị tất cả toasts
   - `FlashcardCard.tsx`: Card hiển thị một flashcard set

5. **Main App** (`src/App.tsx`)
   - Tích hợp tất cả components và hooks
   - Hiển thị danh sách flashcard sets
   - Search functionality

### 🚧 Cần phát triển tiếp
1. **Study Screens**: Chuyển đổi màn hình học thẻ (Flashcard mode, Quiz, Match)
2. **Edit Screen**: Màn hình tạo/chỉnh sửa bộ thẻ
3. **Profile**: Màn hình profile người dùng
4. **Daily Goal Widget**: Component hiển thị mục tiêu hàng ngày
5. **Routing**: Thêm React Router để điều hướng giữa các màn hình
6. **Authentication**: Tích hợp đăng nhập/đăng ký

## 🎯 Lộ trình phát triển tiếp theo

### Phase 1: Core Features
- [ ] Implement routing với React Router
- [ ] Chuyển đổi Edit Screen (tạo/sửa bộ thẻ)
- [ ] Chuyển đổi các Study modes (Flashcard, Quiz, Match)
- [ ] Implement Daily Goal widget

### Phase 2: Advanced Features
- [ ] Backend API (Node.js + Express)
- [ ] Database (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] Cloud sync
- [ ] Statistics & Analytics

### Phase 3: UI/UX Enhancement
- [ ] Thêm Tailwind CSS (optional)
- [ ] Dark mode toggle
- [ ] Animations & Transitions
- [ ] Responsive design improvements

## 🔑 Điểm khác biệt chính

### Component-based Architecture
Thay vì một file HTML khổng lồ, giờ mỗi phần của UI là một component độc lập:
```tsx
// Dễ tái sử dụng
<FlashcardCard 
  set={set} 
  onClick={handleOpen}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Type Safety với TypeScript
```typescript
// Lỗi sẽ bị bắt ngay khi compile
interface FlashcardSet {
  id: string;
  name: string;
  cards: Flashcard[];
}

// IDE sẽ gợi ý tự động
const set: FlashcardSet = {
  // ... TypeScript sẽ bắt lỗi nếu thiếu field
};
```

### State Management
```typescript
// Hook quản lý state tự động
const { sets, addSet, deleteSet } = useFlashcardSets();

// Tự động sync với localStorage
addSet(newSet); // Không cần gọi saveToLocalStorage thủ công
```

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vite.dev/guide/)
- [React Hooks](https://react.dev/reference/react)

## 👥 Contributors

- Chuyển đổi từ vanilla JS sang React + TypeScript
- Maintained by: [Your Name]

---

**Lưu ý**: Dự án vanilla JS gốc vẫn được giữ trong folder `flashcard-basic` để tham khảo.
