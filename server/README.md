# Flashcard App - Backend Server

## 🚀 Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** 
- **JWT** for authentication
- **Bcrypt** for password hashing

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.ts        # Entry point
├── uploads/             # User uploaded files
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Start MongoDB service
# Windows: MongoDB runs as a service automatically
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env` file

### 3. Environment Variables

Create `.env` file (copy from `.env.example`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flashcard-app
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 4. Run Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 📝 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Flashcard Sets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/flashcards` | Get all sets | Yes |
| GET | `/api/flashcards/:id` | Get single set | Yes |
| POST | `/api/flashcards` | Create new set | Yes |
| PUT | `/api/flashcards/:id` | Update set | Yes |
| DELETE | `/api/flashcards/:id` | Delete set | Yes |
| POST | `/api/flashcards/:id/study` | Update study progress | Yes |

## 🔐 Authentication

API uses JWT tokens. Include token in request headers:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User
```typescript
{
  username: string;
  email: string;
  password: string (hashed);
  displayName: string;
  avatar?: string;
  totalStudyTime: number;
  totalCardsStudied: number;
}
```

### FlashcardSet
```typescript
{
  name: string;
  description?: string;
  cards: Flashcard[];
  userId: ObjectId;
  isPublic: boolean;
  tags: string[];
  color?: string;
}
```

### Flashcard
```typescript
{
  term: string;
  definition: string;
  image?: string;
  starred: boolean;
  box: number (1-5 for spaced repetition);
  nextReview?: Date;
}
```

## 🚦 Running in Production

1. Build TypeScript:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## 📦 Available Scripts

- `npm run dev` - Run development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## 🔍 Testing API

Use **Postman**, **Thunder Client**, or **curl**:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"123456","displayName":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 🐛 Common Issues

**MongoDB connection error:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`

**Port already in use:**
- Change `PORT` in `.env`
- Or kill the process using port 5000

**JWT errors:**
- Make sure `JWT_SECRET` is set in `.env`
- Token might be expired, login again

---

Made with ❤️ for learning
