# Quiz System Implementation Plan

## 📋 Overview
Hệ thống thi trắc nghiệm cho phép giáo viên tạo bài thi và học sinh tham gia phòng thi để làm bài.

## 🎯 Core Features

### 1. Tạo Bài Thi (Quiz Creation)
- Giáo viên tạo bài thi với:
  - Tiêu đề, mô tả
  - Thời gian làm bài (phút)
  - Câu hỏi trắc nghiệm (multiple choice)
  - Đáp án đúng cho mỗi câu
  - Điểm số cho mỗi câu

### 2. Phòng Thi (Quiz Session/Room)
- Giáo viên tạo phòng thi từ bài thi đã tạo
- Mã phòng (room code) để học sinh join
- Trạng thái: waiting, active, finished
- Danh sách học sinh đã join
- Thời gian bắt đầu/kết thúc

### 3. Tham Gia Thi (Student Participation)
- Học sinh nhập mã phòng để join
- Chờ giáo viên start
- Làm bài trong thời gian quy định
- Submit tự động khi hết giờ

### 4. Chấm Điểm & Kết Quả
- Tự động chấm điểm khi submit
- Hiển thị kết quả ngay lập tức
- Leaderboard (bảng xếp hạng)
- Xem lại đáp án

---

## 🗄️ Database Schema

### Quiz Model
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  createdBy: ObjectId (ref: User),
  duration: number, // minutes
  questions: [
    {
      _id: ObjectId,
      text: string,
      options: [string],
      correctAnswer: number, // index of correct option
      points: number,
      explanation?: string
    }
  ],
  tags: [string],
  isPublic: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### QuizSession Model
```typescript
{
  _id: ObjectId,
  quizId: ObjectId (ref: Quiz),
  hostId: ObjectId (ref: User),
  roomCode: string, // 6-digit code
  status: 'waiting' | 'active' | 'finished',
  participants: [
    {
      userId: ObjectId (ref: User),
      joinedAt: Date,
      answers: [
        {
          questionId: ObjectId,
          selectedAnswer: number,
          answeredAt: Date
        }
      ],
      score: number,
      submittedAt: Date,
      completed: boolean
    }
  ],
  startedAt: Date,
  scheduledEndAt: Date,
  actualEndedAt: Date,
  settings: {
    shuffleQuestions: boolean,
    shuffleOptions: boolean,
    showAnswersAfter: boolean
  },
  createdAt: Date
}
```

---

## 🛣️ API Endpoints

### Quiz Management
- `POST /api/quizzes` - Tạo bài thi mới
- `GET /api/quizzes` - Lấy danh sách bài thi (của user hoặc public)
- `GET /api/quizzes/:id` - Lấy chi tiết bài thi
- `PUT /api/quizzes/:id` - Sửa bài thi
- `DELETE /api/quizzes/:id` - Xóa bài thi

### Quiz Session
- `POST /api/quiz-sessions` - Tạo phòng thi mới
- `POST /api/quiz-sessions/join` - Join phòng bằng room code
- `GET /api/quiz-sessions/:id` - Lấy thông tin phòng
- `POST /api/quiz-sessions/:id/start` - Giáo viên bắt đầu thi
- `POST /api/quiz-sessions/:id/end` - Giáo viên kết thúc thi
- `POST /api/quiz-sessions/:id/submit` - Học sinh nộp bài
- `GET /api/quiz-sessions/:id/results` - Xem kết quả
- `GET /api/quiz-sessions/:id/leaderboard` - Bảng xếp hạng

---

## 🎨 Frontend Pages & Components

### Pages
1. **Quiz List** (`/quizzes`)
   - Danh sách bài thi đã tạo
   - Nút "Tạo bài thi mới"
   - Nút "Tham gia phòng thi"

2. **Quiz Creator** (`/quizzes/create`, `/quizzes/:id/edit`)
   - Form tạo/sửa bài thi
   - Thêm/sửa/xóa câu hỏi
   - Preview

3. **Quiz Detail** (`/quizzes/:id`)
   - Thông tin bài thi
   - Nút "Tạo phòng thi"
   - Lịch sử các phòng thi

4. **Session Lobby** (`/sessions/:id/lobby`)
   - Màn hình chờ cho giáo viên (host)
   - Danh sách học sinh đã join
   - Nút "Start"

5. **Student Waiting** (`/sessions/:id/wait`)
   - Màn hình chờ cho học sinh
   - Hiển thị "Đang chờ giáo viên bắt đầu..."

6. **Quiz Taking** (`/sessions/:id/take`)
   - Giao diện làm bài
   - Timer đếm ngược
   - Đánh dấu câu hỏi
   - Nút Submit

7. **Results** (`/sessions/:id/results`)
   - Điểm số cá nhân
   - So sánh với đáp án đúng
   - Leaderboard

### Key Components
- `QuizCard` - Card hiển thị bài thi trong list
- `QuestionEditor` - Component tạo/sửa câu hỏi
- `QuestionDisplay` - Hiển thị câu hỏi khi làm bài
- `Timer` - Đồng hồ đếm ngược
- `Leaderboard` - Bảng xếp hạng
- `RoomCodeInput` - Nhập mã phòng
- `ParticipantsList` - Danh sách người tham gia

---

## 🚀 Implementation Phases

### Phase 1: Backend Foundation (2-3 hours)
- [ ] Tạo Models: Quiz, QuizSession
- [ ] CRUD operations cho Quiz
- [ ] Session management APIs
- [ ] Room code generator
- [ ] Auto-grading logic

### Phase 2: Quiz Creation UI (2 hours)
- [ ] Quiz list page
- [ ] Quiz creator form
- [ ] Question editor component
- [ ] Validation

### Phase 3: Session Management (2-3 hours)
- [ ] Create session from quiz
- [ ] Join session with code
- [ ] Lobby/waiting room
- [ ] Start/end session controls

### Phase 4: Quiz Taking Experience (2 hours)
- [ ] Quiz taking interface
- [ ] Timer integration
- [ ] Answer submission
- [ ] Navigation between questions

### Phase 5: Results & Analytics (1-2 hours)
- [ ] Score calculation & display
- [ ] Leaderboard
- [ ] Answer review
- [ ] Statistics

### Phase 6: Polish & Features (1-2 hours)
- [ ] Real-time updates (WebSocket/polling)
- [ ] Mobile responsive
- [ ] Export results
- [ ] Quiz templates

---

## 🔐 Security Considerations
- Validate room codes
- Prevent cheating (randomize questions/options)
- Rate limit submissions
- Authenticate all requests
- Hide correct answers until session ends

---

## 📊 Future Enhancements
- Question banks
- Different question types (true/false, fill-in-blank)
- Quiz analytics for teachers
- Practice mode (unlimited attempts)
- Scheduled quizzes
- Integration with Groups (group quizzes)

---

## 🎯 Success Metrics
- Teachers can create a quiz in < 5 minutes
- Students can join a session in < 30 seconds
- Auto-grading instant (< 1 second)
- Support 50+ concurrent participants per session
