import { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetService } from '../../services/newFeatures';
import { useNotification } from '../../hooks/useNotification';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showNotification('Por favor ingresa tu email', 'error');
      return;
    }

    setLoading(true);

    try {
      await passwordResetService.forgotPassword(email);
      setSent(true);
      showNotification('Si el email existe, recibirás instrucciones para restablecer tu contraseña', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.response?.data?.message || 'Error al procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Enviado
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Por favor revisa tu bandeja de entrada y spam.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Recuperar Contraseña
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ingresa tu email y te enviaremos instrucciones
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Instrucciones'}
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

export default ForgotPassword;
