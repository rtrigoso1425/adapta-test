"use client";;
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux"
import { logout, reset } from '../features/auth/authSlice';
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  FileText,
  Bell,
  GraduationCap,
} from 'lucide-react';

export function Sidebar({
  className = ""
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
  };
  
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("users");

  // Definir navigationItems DENTRO del componente para tener acceso a 'user'
  const navigationItems = [
    { id: "users", name: "Gestion de Usuarios", icon: Home, href: "/dashboard?tab=users" },
    ...(user.institution.type === "university" 
      ? [{ id: "careers", name: "Gestion de Carreras", icon: GraduationCap, href: "/dashboard?tab=careers" }]
      : []
    ),
    { id: "courses", name: "Gestion de Cursos", icon: FileText, href: "/dashboard?tab=courses" },
    { id: "academic", name: "Gestion Académica", icon: Bell, href: "/dashboard?tab=academic" },
    { id: "profile", name: "Profile", icon: User, href: "/profile" },
    { id: "settings", name: "Settings", icon: Settings, href: "/settings" },
  ];

  // Detectar el tab activo desde la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveItem(tab);
    } else if (location.pathname === '/dashboard') {
      setActiveItem('users');
    }
  }, [location]);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    navigate(item.href);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <div>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg bg-white shadow-md border border-white md:hidden hover:bg-white transition-all duration-200"
        aria-label="Toggle sidebar">
        {isOpen ? 
          <X className="h-5 w-5 text-slate-600" /> : 
          <Menu className="h-5 w-5 text-slate-600" />
        }
      </button>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar} />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen border-r border-[#f0f0f0] z-40 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-28" : "w-78"}
          md:translate-x-0 md:static md:z-auto
          ${className}
        `}
        style={{background:"#ffffff"}}
        >
        {/* Header with logo and collapse button */}
        <div
          className="flex items-center justify-between p-5 border-b border[#f0f0f0] " style={{background:"#ffffff"}}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2.5">
              <div
                className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-base">{user.institution.name.slice(0,1)}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-black text-base">{user.institution.name}</span>
                <span className="text-xs text-black">{`${user.institution.type.toUpperCase().slice(0,1)}${user.institution.type.slice(1)}`}</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div
              className="w-9 h-9 bg-black rounded-lg flex items-center justify-center mx-auto shadow-sm">
              <span className="text-white font-bold text-base">{user.institution.name.slice(0,1)}</span>
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-md hover:bg-[#e8e8e8] transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-black" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-black" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group bg-[#f6f6f6]
                      ${isActive
                        ? "bg-[#e8e8e8] text-black"
                        : "text-[#121212] hover:bg-[#d8d8d8] hover:text-black"
                      }
                      ${isCollapsed ? "justify-center px-2" : ""}
                    `}
                    style={{marginBottom:5}}
                    title={isCollapsed ? item.name : undefined}>
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={`
                          h-4.5 w-4.5 flex-shrink-0
                          ${isActive 
                            ? "text-[#000000]" 
                            : "text-[#000000] group-hover:text-black"
                          }
                        `} />
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-sm ${isActive ? "font-medium" : "font-normal"}`}>{item.name}</span>
                        {item.badge && (
                          <span
                            className={`
                              px-1.5 py-0.5 text-xs font-medium rounded-full
                              ${isActive
                                ? "bg-black text-white"
                                : "bg-slate-800 text-slate-300"
                              }
                            `}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badge for collapsed state */}
                    {isCollapsed && item.badge && (
                      <div
                        className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-blue-500 border border-slate-900">
                        <span className="text-[10px] font-medium text-white">
                          {parseInt(item.badge) > 9 ? '9+' : item.badge}
                        </span>
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div
                        className="absolute left-full ml-2 px-2 py-1 bg-white text-black text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.name}
                        {item.badge && (
                          <span className="ml-1.5 px-1 py-0.5 bg-slate-600 rounded-full text-[10px]">
                            {item.badge}
                          </span>
                        )}
                        <div
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-700 rotate-45" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section with profile and logout */}
        <div className="mt-auto border-t border-white">
          {/* Profile Section */}
          <div
            className={`border-b border-white bg-white ${isCollapsed ? 'py-3 px-2' : 'p-3'}`}>
            {!isCollapsed ? (
              <div
                className="flex items-center px-3 py-2 rounded-md bg-white hover:bg-[#e4e4e4] transition-colors duration-200">
                <div
                  className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{`${user.name.slice(0,1)}${user.name.slice(user.name.indexOf(" ")).slice(1,2)}`}</span>
                </div>
                <div className="flex-1 min-w-0 ml-2.5">
                  <p className="text-sm font-medium text-black truncate">{user.name}</p>
                  <p className="text-xs text-black truncate">{user.role}</p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full ml-2" title="Online" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{`${user.name.slice(0,1)}${user.name.slice(user.name.indexOf(" ")).slice(1,2)}`}</span>
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="p-3">
            <button
              onClick={onLogout}
              className={`
                w-full flex items-center rounded-md text-left transition-all duration-200 group
                text-red-400 hover:bg-white hover:text-[#ff0000]
                ${isCollapsed ? "justify-center p-2.5" : "space-x-2.5 px-3 py-2.5"}
              `}
              title={isCollapsed ? "Logout" : undefined}>
              <div className="flex items-center justify-center min-w-[24px]">
                <LogOut
                  className="h-4.5 w-4.5 flex-shrink-0 text-red-400 group-hover:text-[#ff0000]" />
              </div>
              
              {!isCollapsed && (
                <span className="text-sm">Cerrar Sesion</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div
                  className="absolute left-full ml-2 px-2 py-1 bg-white text-[#000000] text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Cerrar Sesion
                  <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-700 rotate-45" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}