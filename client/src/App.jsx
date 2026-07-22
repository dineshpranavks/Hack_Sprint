import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage    from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import ProblemPage from './pages/ProblemPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<HomePage />} />
        <Route path="/results"       element={<ResultsPage />} />
        <Route path="/problem/:slug" element={<ProblemPage />} />
        <Route path="/profile"       element={<ProfilePage />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

