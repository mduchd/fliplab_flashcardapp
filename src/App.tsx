import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home/Home';
import Create from './pages/Create/Create';
import CreateFolder from './pages/Folder/CreateFolder';
import Study from './pages/Study/Study';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Groups from './pages/Groups/Groups';
import GroupDetail from './pages/Groups/GroupDetail';
import QuizList from './pages/Quiz/QuizList';
import QuizCreator from './pages/Quiz/QuizCreator';
import JoinQuiz from './pages/Quiz/JoinQuiz';
import TakeQuiz from './pages/Quiz/TakeQuiz';
import QuizResults from './pages/Quiz/QuizResults';
import StudentQuizHistory from './pages/Quiz/StudentQuizHistory';
import Notifications from './pages/Notifications/Notifications';

// Components
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public route wrapper - redirects to home if already logged in
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-folder"
        element={
          <ProtectedRoute>
            <CreateFolder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create/:id"
        element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study/:id"
        element={
          <ProtectedRoute>
            <Study />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:id"
        element={
          <ProtectedRoute>
            <GroupDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <QuizList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/create"
        element={
          <ProtectedRoute>
            <QuizCreator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/edit/:id"
        element={
          <ProtectedRoute>
            <QuizCreator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/join"
        element={
          <ProtectedRoute>
            <JoinQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/take/:id"
        element={
          <ProtectedRoute>
            <TakeQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/results/:sessionId"
        element={
          <ProtectedRoute>
            <QuizResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/history"
        element={
          <ProtectedRoute>
            <StudentQuizHistory />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { SidebarProvider } from './contexts/SidebarContext';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
