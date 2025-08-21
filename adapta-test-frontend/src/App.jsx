import { Routes, Route } from "react-router-dom";
import Header from "./components/Header"; // <-- IMPORTAR
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage"; // <-- 3. IMPORTAR
import CourseDetailPage from "./pages/CourseDetailPage";
import PrivateRoute from "./components/PrivateRoute"; // <-- 1. IMPORTAR RUTA PRIVADA
//import CourseManagementPage from "./pages/CourseManagementPage"; // <-- 2. IMPORTAR NUEVA PÁGINA
import SectionManagementPage from './pages/SectionManagementPage.jsx'; // <-- 1. IMPORTA LA PÁGINA RENOMBRADA
import LearningPage from './pages/LearningPage'; // <-- IMPORTAR
import EvaluationPage from "./pages/EvaluationPage.jsx";

function App() {
  return (
    <>
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
            <Route path="/learn/section/:id" element={<LearningPage />} /> {/* <-- AÑADIR RUTA */}
            <Route path="/modules/:moduleId/evaluation" element={<EvaluationPage />} /> {/* <-- AÑADIR RUTA */}
          </Route>
          
        </Routes>
      </main>
    </>
  );
}
export default App;
