import { Navigate, Route, Routes } from 'react-router-dom';
import { HelpSeekerRegisterPage } from './pages/auth/HelpSeekerRegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { StudentRegisterPage } from './pages/auth/StudentRegisterPage';
import { VerifyStudentEmailPage } from './pages/auth/VerifyStudentEmailPage';
import { HelpSeekerHomePage } from './pages/help-seeker/HelpSeekerHomePage';
import { HomePage } from './pages/HomePage';
import { StudentSkillsPage } from './pages/student/StudentSkillsPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register/student" element={<StudentRegisterPage />} />
      <Route path="/register/help-seeker" element={<HelpSeekerRegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/help-seeker" element={<HelpSeekerHomePage />} />
      <Route path="/student/skills" element={<StudentSkillsPage />} />
      <Route path="/verify-email/success" element={<VerifyStudentEmailPage success />} />
      <Route path="/verify-email" element={<VerifyStudentEmailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
