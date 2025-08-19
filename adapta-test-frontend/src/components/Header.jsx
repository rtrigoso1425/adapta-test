import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <header style={{ padding: '20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <Link to="/" style={{ textDecoration: 'none', color: 'black', fontSize: '1.5rem' }}>AdaptaTest</Link>
            </div>
            <nav>
                <ul style={{ listStyle: 'none', margin: 0, display: 'flex', gap: '20px' }}>
                    {user ? (
                        // Si el usuario está logueado
                        <>
                            <li>
                                <Link to="/dashboard">Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/courses">Cursos</Link>
                            </li>
                            <li>
                                <button onClick={onLogout}>Logout</button>
                            </li>
                        </>
                    ) : (
                        // Si el usuario NO está logueado
                        <>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;