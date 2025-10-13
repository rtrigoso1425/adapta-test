import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, reset, getInstitutions } from "../features/auth/authSlice";
import { HoverButton } from "../components/ui/hover-button";
import { Input } from "../components/ui/input";
import { Mail, Lock } from "lucide-react";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { color } from "framer-motion";
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

    const userData = { email, password, institutionId };
    dispatch(login(userData));
  };

  if (isLoading) {
    return <h1>Verificando credenciales...</h1>;
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
                <Link to="/" style={{ textDecoration: 'none', color: 'Black', fontSize: '1.5rem' }}><Text_03 text='AdaptaTest'/></Link>
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-gray-800">
              Inicio de Sesion
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
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"/>
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
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"/>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full rounded-xl hover:cursor-pointer text-white bg-black font-medium shadow-md">
                Loguearse
              </Button>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
};

export default LoginPage;