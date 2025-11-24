import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { passwordResetService } from '../../services/newFeatures';
import { useNotification } from '../../hooks/useNotification';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      showNotification('Token inválido o faltante', 'error');
      navigate('/login');
      return;
    }

    setToken(tokenParam);
    validateToken(tokenParam);
  }, [searchParams, navigate, showNotification]);

  const validateToken = async (tokenValue) => {
    try {
      const response = await passwordResetService.validateResetToken(tokenValue);
      if (response.valid) {
        setValidToken(true);
      } else {
        showNotification('El enlace ha expirado o es inválido', 'error');
        setTimeout(() => navigate('/forgot-password'), 3000);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      showNotification('Error al validar el token', 'error');
      setTimeout(() => navigate('/forgot-password'), 3000);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    if (password.length < 8) {
      showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    // Validar complejidad
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      showNotification('La contraseña debe contener mayúsculas, minúsculas y números', 'error');
      return;
    }

    setLoading(true);

    try {
      await passwordResetService.resetPassword(token, password);
      showNotification('Contraseña restablecida exitosamente', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.response?.data?.message || 'Error al restablecer contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Validando token...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Token Inválido
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            El enlace ha expirado o es inválido
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Nueva Contraseña
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nueva Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoFocus
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-medium">La contraseña debe contener:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li className={password.length >= 8 ? 'text-success-600' : ''}>
                Mínimo 8 caracteres
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-success-600' : ''}>
                Una letra mayúscula
              </li>
              <li className={/[a-z]/.test(password) ? 'text-success-600' : ''}>
                Una letra minúscula
              </li>
              <li className={/\d/.test(password) ? 'text-success-600' : ''}>
                Un número
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
