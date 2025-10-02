import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { HoverButton } from './ui/hover-button';
import { Text_03 } from '../components/ui/wave-text';

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
        <header style={{ padding: '20px', borderBottom: '1px solid #2a2a2aff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
                <Link to="/" style={{ textDecoration: 'none', color: 'white', fontSize: '1.5rem' }}><Text_03 text='AdaptaTest'/></Link>
            </div>
            <nav>
                <ul style={{ listStyle: 'none', margin: 0, display: 'flex', gap: '20px' }}>
                    {user ? (
                        // Si el usuario está logueado
                        <>
                            <HoverButton>
                                <Link to="/dashboard">Dashboard</Link>
                            </HoverButton>
                            <HoverButton>
                                <Link to="/courses">Cursos</Link>
                            </HoverButton>
                            <HoverButton>
                                <button onClick={onLogout}>Logout</button>
                            </HoverButton>
                        </>
                    ) : (
                        // Si el usuario NO está logueado
                        <>
                            <HoverButton>
                                <Link to="/login">Login</Link>
                            </HoverButton>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;