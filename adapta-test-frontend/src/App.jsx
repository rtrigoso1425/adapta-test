import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import PrivateRoute from "./components/PrivateRoute";
import SectionManagementPage from './pages/SectionManagementPage';
import LearningPage from './pages/LearningPage';
import EvaluationPage from "./pages/EvaluationPage";
import CurriculumViewPage from "./pages/CurriculumViewPage";
import { Footer } from "./components/footer-section";

import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Header />}
      <main style={{ padding: isLoginPage ? "0" : "20px" }}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas Privadas */}
          <Route path="" element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route
              path="/manage/section/:id"
              element={<SectionManagementPage />}
            />
            <Route path="/learn/section/:id" element={<LearningPage />} /> {/* <-- AÑADIR RUTA */}
            <Route path="/modules/:moduleId/evaluation" element={<EvaluationPage />} /> {/* <-- AÑADIR RUTA */}
            <Route path="/career/:id/curriculum" element={<CurriculumViewPage />} /> {/* <-- AÑADIR RUTA */}
          </Route>
          
        </Routes>
      </main>
    </>
  );
}
export default App;