import { Routes, Route } from "react-router-dom";
import Header from "./components/Header"; // <-- IMPORTAR
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage"; // <-- 3. IMPORTAR
import CourseDetailPage from "./pages/CourseDetailPage";
import PrivateRoute from "./components/PrivateRoute"; // <-- 1. IMPORTAR RUTA PRIVADA
import SectionManagementPage from './pages/SectionManagementPage'; // <-- 1. IMPORTA LA PÁGINA RENOMBRADA
import LearningPage from './pages/LearningPage'; // <-- IMPORTAR
import EvaluationPage from "./pages/EvaluationPage";
import CurriculumViewPage from "./pages/CurriculumViewPage";

function App() {
  return (
    <div className="bg-black text-white w-full min-h-screen space-y-28 relative max-w-screen overflow-x-hidden font-sans">
      <Header />
      <main style={{ padding: "20px" }}>
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
            <Route path="/learn/section/:id" element={<LearningPage />} />
            <Route path="/modules/:moduleId/evaluation" element={<EvaluationPage />} />
            <Route path="/career/:id/curriculum" element={<CurriculumViewPage />} />
          </Route>
        </Routes>
      </main>
      <div
        className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-blue-900/50 via-blue-600/20 to-transparent rounded-t-full opacity-80 blur-3xl"></div>
    </div>
  );
}
export default App;