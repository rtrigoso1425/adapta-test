import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, reset, getInstitutions } from "../features/auth/authSlice";
import { Input } from "../components/ui/input";
import { Mail, Lock, Building2 } from "lucide-react";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BlurFade } from "../components/ui/blur-fade";
import { Text_03 } from "../components/ui/wave-text";

// Importando los nuevos componentes de shadcn/ui
import { BlurFade } from "../components/ui/blur-fade";
import { Text_03 } from "../components/ui/wave-text";
import { Mail, Lock, Building2 } from "lucide-react";
import "../components/ui/select-custom.css";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
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
    if (isError) {
      alert(message);
    }
    if (isSuccess || user) {
      navigate("/dashboard");
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!institutionId) {
      alert("Por favor, selecciona tu institución.");
      return;
    }
    dispatch(login(formData));
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative"
      style={{
        margin: 0,
        padding: "20px",
      }}
    >
      <div className="absolute top-4 right-4">
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
                    <Select
                      value={institutionId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          institutionId: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full bg-white dark:bg-gray-700 border dark:border-gray-600 focus:ring-0 focus-visible:ring-0 text-gray-900 dark:text-gray-100">
                        <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <SelectValue
                          placeholder="Elige una institución"
                          className="select-value"
                        />
                      </SelectTrigger>
                      <SelectContent
                        className="z-50 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                        position="popper"
                        sideOffset={5}
                      >
                        <div className="max-h-[200px] overflow-y-auto">
                          {institutions && institutions.length > 0 ? (
                            institutions.map((inst) => (
                              <SelectItem
                                key={inst._id}
                                value={inst._id}
                                className="text-gray-900 dark:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700/50"
                              >
                                <span className="block truncate">
                                  {inst.name} (
                                  {inst.type === "university"
                                    ? "Universidad"
                                    : "Colegio"}
                                  )
                                </span>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No hay instituciones disponibles
                            </SelectItem>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
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