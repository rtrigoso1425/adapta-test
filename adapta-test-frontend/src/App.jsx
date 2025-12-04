import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import SectionManagementPage from './pages/SectionManagementPage';
import LearningPage from './pages/LearningPage';
import CurriculumViewPage from "./pages/CurriculumViewPage";

function App() {
  return (
    <Routes>
      {/* Rutas Públicas (Sin Sidebar) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas Privadas (Con Sidebar y Protección) */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Rutas accesibles para todos los roles autenticados */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/settings" element={<SettingsPage/>} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/learn/section/:id" element={<LearningPage />} />

          {/* Rutas protegidas por rol: PROFESOR */}
          <Route element={<RoleBasedRoute requiredRoles={["professor"]} />}>
            <Route path="/manage/section/:id" element={<SectionManagementPage />} />
          </Route>

          <Route path="/career/:id/curriculum" element={<CurriculumViewPage />} />

          {/* Rutas protegidas por rol: ADMIN */}
          {/* (añadir aquí rutas exclusivas de admin si las hay) */}
         </Route>
        
        {/* Rutas de "Pantalla Completa" (Learning/Evaluation) 
            A veces queremos que el alumno se enfoque y no vea el sidebar.
            Si prefieres sidebar aquí también, muévelas dentro del bloque anterior. */}
        
       </Route>

       {/* Catch-all */}
       <Route path="*" element={<Navigate to="/" replace />} />
     </Routes>
   );
 }

export default App;