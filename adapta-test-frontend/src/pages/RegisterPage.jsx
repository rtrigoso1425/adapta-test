import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '', // Para confirmar la contraseña
    });

    const { name, email, password, password2 } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            alert(message); // En el futuro, usaremos una notificación más elegante
        }

        if (isSuccess || user) {
            navigate('/dashboard'); // Redirigir al dashboard si el registro es exitoso
        }

        dispatch(reset()); // Limpiar el estado al entrar o salir del componente
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        if (password !== password2) {
            alert('Las contraseñas no coinciden');
        } else {
            const userData = {
                name,
                email,
                password,
            };
            dispatch(register(userData));
        }
    };

    if (isLoading) {
        return <h1>Cargando...</h1>;
    }

    return (
        <div>
            <h1>Registro de Usuario</h1>
            <section>
                <form onSubmit={onSubmit}>
                    <div>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            placeholder="Ingresa tu nombre"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            placeholder="Ingresa tu email"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="Ingresa tu contraseña"
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            value={password2}
                            placeholder="Confirma tu contraseña"
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div>
                        <button type="submit">
                            Registrar
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default RegisterPage;