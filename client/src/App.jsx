import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ConversationProvider } from './contexts/ConversationContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage           from './pages/HomePage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import ResultsPage        from './pages/ResultsPage';
import ProblemPage        from './pages/ProblemPage';
import ProfilePage        from './pages/ProfilePage';
import Login              from './pages/Login';
import Signup             from './pages/Signup';

export default function App() {
  return (
    <AuthProvider>
      <ConversationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/"                 element={<HomePage />} />
            <Route path="/question/:id"     element={<QuestionDetailPage />} />
            <Route path="/question-detail"  element={<QuestionDetailPage />} />
            <Route path="/login"            element={<Login />} />
            <Route path="/signup"           element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/results"       element={<ResultsPage />} />
              <Route path="/problem/:slug" element={<ProblemPage />} />
              <Route path="/profile"       element={<ProfilePage />} />
            </Route>

            <Route path="*"                 element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConversationProvider>
    </AuthProvider>
  );
}
