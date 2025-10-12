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

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ['/login', '/register'];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);
  
  return (
    <div className="bg-black text-white w-full min-h-screen relative max-w-screen overflow-x-hidden font-sans">
      {!shouldHideHeader && (
        <div className="relative z-50">
          <Header />
        </div>
      )}
      
      <div className="relative">
        <main style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
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
          className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-blue-900/50 via-blue-600/20 to-transparent rounded-t-full opacity-80 blur-3xl -z-10"
          style={{ pointerEvents: 'none' }}
        ></div>
      </div>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
export default App;