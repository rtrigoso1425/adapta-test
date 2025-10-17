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
    navigate("/login");
  };

  return (
    <header style={{ 
      padding: '20px', 
      borderBottom: '1px solid #2a2a2aff', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' // Esto alinea verticalmente todos los hijos
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ 
          textDecoration: 'none', 
          color: 'white', 
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Text_03 text='AdaptaTest'/>
        </Link>
      </div>
      <nav>
        <ul style={{ 
          listStyle: 'none', 
          margin: 0, 
          padding: 0,
          display: 'flex', 
          gap: '20px',
          alignItems: 'center' // Alinea los items de la lista
        }}>
          {user ? (
            <>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <HoverButton as={Link} to="/dashboard">
                  Dashboard
                </HoverButton>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <HoverButton as={Link} to="/courses">
                  Cursos
                </HoverButton>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <HoverButton onClick={onLogout}>
                  Logout
                </HoverButton>
              </li>
            </>
          ) : (
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <HoverButton as={Link} to="/login">
                Login
              </HoverButton>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;