import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // Guardar token y datos del usuario
      const email = params.get('email');
      const name = params.get('name');
      
      localStorage.setItem('token', token);
      
      // Simular datos del usuario (idealmente deberías obtenerlos del backend)
      const userData = {
        email,
        name,
        // Otros campos según tu estructura
      };
      
      login(userData);
      navigate('/');
    } else if (error) {
      console.error('Error en autenticación OAuth2:', error);
      navigate('/login', { 
        state: { error: 'Error al autenticar con proveedor externo' } 
      });
    } else {
      navigate('/login');
    }
  }, [location, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="ml-4 text-gray-600">Autenticando...</p>
    </div>
  );
};
