import { useMemo } from 'react';
import clsx from 'clsx';

/**
 * Component to display password strength and requirements
 */
const PasswordStrengthIndicator = ({ password = '' }) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // Calculate score
    if (checks.length) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    // Determine strength level
    let label = '';
    let color = '';
    let bgColor = '';
    
    if (score <= 20) {
      label = 'Muy débil';
      color = 'text-red-600';
      bgColor = 'bg-red-500';
    } else if (score <= 40) {
      label = 'Débil';
      color = 'text-orange-600';
      bgColor = 'bg-orange-500';
    } else if (score <= 60) {
      label = 'Aceptable';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-500';
    } else if (score <= 80) {
      label = 'Fuerte';
      color = 'text-blue-600';
      bgColor = 'bg-blue-500';
    } else {
      label = 'Muy fuerte';
      color = 'text-green-600';
      bgColor = 'bg-green-500';
    }

    return { score, label, color, bgColor, checks };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Seguridad de la contraseña
          </span>
          <span className={clsx('text-xs font-medium', strength.color)}>
            {strength.label}
          </span>
        </div>
        
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all duration-300 ease-out',
              strength.bgColor
            )}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          Requisitos:
        </p>
        
        <div className="space-y-1">
          <RequirementItem
            met={strength.checks?.length}
            label="Mínimo 8 caracteres"
          />
          <RequirementItem
            met={strength.checks?.uppercase}
            label="Al menos una mayúscula"
          />
          <RequirementItem
            met={strength.checks?.lowercase}
            label="Al menos una minúscula"
          />
          <RequirementItem
            met={strength.checks?.number}
            label="Al menos un número"
          />
          <RequirementItem
            met={strength.checks?.special}
            label="Al menos un carácter especial (!@#$%^&*...)"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Individual requirement item with check/cross icon
 */
const RequirementItem = ({ met, label }) => {
  return (
    <div className="flex items-center text-xs">
      {met ? (
        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className={met ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
        {label}
      </span>
    </div>
  );
};

export default PasswordStrengthIndicator;
