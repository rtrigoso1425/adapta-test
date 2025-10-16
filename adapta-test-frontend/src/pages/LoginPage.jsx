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
      dispatch(reset());
    }
    if (isSuccess && user) {
      navigate("/dashboard");
    }
  }, [isError, isSuccess, user, message, navigate, dispatch]);
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!institutionId) {
      alert("Por favor, selecciona tu institución.");
      return;
    }

    if (!email.trim()) {
      alert("Por favor, ingresa tu correo electrónico.");
      return;
    }

    if (!password.trim()) {
      alert("Por favor, ingresa tu contraseña.");
      return;
    }

    const userData = { 
      email: email.trim(), 
      password, 
      institutionId 
    };
    dispatch(login(userData));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">Verificando credenciales...</h1>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px 0',
      marginTop: '-7rem',
      paddingTop: '7rem'
    }}>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200 bg-gray-50">
          <CardHeader>
            <div>
              <Link 
                to="/" 
                style={{ 
                  textDecoration: 'none', 
                  color: 'Black', 
                  fontSize: '1.5rem' 
                }}
              >
                <Text_03 text='AdaptaTest'/>
              </Link>
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-gray-800">
              Inicio de Sesión
            </CardTitle>
            <p className="text-center text-sm text-gray-500 mt-1">
              Inicia sesión para acceder a tu cuenta y explorar nuestras funciones.
            </p>
          </CardHeader>
          <CardContent style={{ pointerEvents: 'auto', position: 'relative' }}>
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <Label style={{color:"#000000"}}>Correo</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Ingresa tu email"
                    value={email}
                    onChange={onChange}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                  />
                </div>
              </div>
              <div>
                <Label style={{color:"#000000"}}>Contraseña</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={onChange}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                  />
                </div>
              </div>
              <div>
                <Label style={{color:"#000000"}}>Selecciona tu institución</Label>
                {isLoadingInstitutions ? (
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white mt-2">
                    <p className="text-sm text-gray-500">Cargando instituciones...</p>
                  </div>
                ) : isErrorInstitutions ? (
                  <div className="flex items-center gap-2 border border-red-300 rounded-lg px-3 py-2 bg-red-50 mt-2">
                    <p className="text-sm text-red-600">
                      Error al cargar instituciones. Por favor, recarga la página.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white mt-2">
                    <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <select
                      id="institutionId"
                      name="institutionId"
                      value={institutionId}
                      onChange={onChange}
                      required
                      className="w-full border-0 focus:ring-0 focus:outline-none bg-transparent text-black"
                    >
                      <option value="">-- Elige una opción --</option>
                      {institutions && institutions.length > 0 ? (
                        institutions.map((inst) => (
                          <option key={inst._id} value={inst._id}>
                            {inst.name} ({inst.type === "university" ? "Universidad" : "Colegio"})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No hay instituciones disponibles
                        </option>
                      )}
                    </select>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl hover:cursor-pointer text-white bg-black font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Iniciando sesión...' : 'Loguearse'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
};

export default LoginPage;