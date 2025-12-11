// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, reset, getInstitutions } from "../features/auth/authSlice";
import { toast } from "sonner";

// Importando los nuevos componentes de shadcn/ui
import { BlurFade } from "../components/ui/blur-fade";
import { Text_03 } from "../components/ui/wave-text";
import { Mail, Lock, Building2 } from "lucide-react";
import "../components/ui/select-custom.css";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { AsyncSelect } from "../components/ui/async-select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    institutionId: "",
  });
  const { email, password, institutionId } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    user,
    isLoading,
    isError,
    isSuccess,
    message,
    institutions,
    isLoadingInstitutions,
    isErrorInstitutions,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getInstitutions());
  }, [dispatch]);

  useEffect(() => {
    let toastId;
    
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
    
    if (isSuccess && user) {
      toastId = toast.loading("Iniciando sesión...", {
        description: "Verificando credenciales y preparando tu sesión"
      });
      const timer = setTimeout(() => {
        toast.success("¡Bienvenido de nuevo!", {
          id: toastId,
          description: `Te damos la bienvenida, ${user.name || 'Usuario'}`,
        });
        navigate("/dashboard");
        dispatch(reset());
      }, 1500);
      
      return () => {
        clearTimeout(timer);
        if (toastId) {
          toast.dismiss(toastId);
        }
      };
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleInstitutionChange = (value) => {
    setFormData((prevState) => ({
      ...prevState,
      institutionId: value,
    }));
  };
  
  const fetchInstitutions = async (query) => {
    // Asegurarnos de que institutions esté disponible
    const availableInstitutions = institutions || [];
  
    // Si no hay query, devolver todas
    if (!query || query.trim() === "") {
      return availableInstitutions;
    }
  
    // Filtrar según el query
    const filtered = availableInstitutions.filter(inst =>
      inst.name.toLowerCase().includes(query.toLowerCase()) ||
      (inst.type === "university" ? "universidad" : "colegio").includes(query.toLowerCase())
    );
  
    return filtered;
  };

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // --- CAMBIO: Eliminamos el bloqueo estricto ---
    // Si no hay institución, permitimos continuar. El backend decidirá si es un superadmin válido.
    
    // Opcional: Podrías limpiar institutionId del formData si es una cadena vacía
    const loginPayload = {
        email: formData.email,
        password: formData.password,
        institutionId: formData.institutionId || null // Enviar null si está vacío
    };

    dispatch(login(loginPayload));
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative"
      style={{
        margin: 0,
        padding: "20px",
      }}
    >
      <div className="absolute top-4 left-4 h-10 w-10">
        <ThemeToggle />
      </div>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <CardHeader>
            <div>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "Black",
                  fontSize: "1.5rem",
                }}
              >
                <Text_03 text="AdaptaTest" />
              </Link>
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
              Inicio de Sesión
            </CardTitle>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              Inicia sesión para acceder a tu cuenta y explorar nuestras
              funciones.
            </p>
          </CardHeader>
          <CardContent style={{ pointerEvents: "auto", position: "relative" }}>
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Correo
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Ingresa tu email"
                    value={email}
                    onChange={onChange}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black dark:text-white dark:bg-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Contraseña
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600">
                  <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={onChange}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black dark:text-white dark:bg-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Selecciona tu institución
                </Label>
                {isLoadingInstitutions ? (
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cargando instituciones...
                    </p>
                  </div>
                ) : isErrorInstitutions ? (
                  <div className="flex items-center gap-2 border border-red-300 dark:border-red-500 rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/20 mt-2">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Error al cargar instituciones. Por favor, recarga la
                      página.
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <AsyncSelect
                      fetcher={fetchInstitutions}
                      renderOption={(inst) => (
                        <div className="w-full flex items-center gap-2 border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                          <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900 dark:text-white">{inst.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              {inst.type === "university" ? "Universidad" : "Colegio"}
                            </div>
                          </div>
                        </div>
                      )}
                    
                      getOptionValue={(inst) => inst._id}
                    
                      getDisplayValue={(inst) => (
                      <div className="flex items-center gap-2 text-left">
                        <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">{inst.name}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {inst.type === "university" ? "Universidad" : "Colegio"}
                          </span>
                        </div>
                      </div>
                      )}
                    
                      notFound={
                        <div className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
                          No se encontraron instituciones
                        </div>
                      }
                    
                      label="Institución"
                      placeholder="Encuentra tu institución"
                      value={institutionId}
                      onChange={handleInstitutionChange}
                      width="100%"
                      preload={true}
                      filterFn={(inst, query) =>
                      inst.name.toLowerCase().includes(query.toLowerCase()) ||
                      (inst.type === "university" ? "universidad" : "colegio").includes(query.toLowerCase())
                      }
                    />
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl hover:cursor-pointer text-white dark:text-gray-100 bg-black dark:bg-gray-900 hover:bg-gray-800 dark:hover:bg-gray-950 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Iniciando sesión..." : "Loguearse"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
};

export default LoginPage;
