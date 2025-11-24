import { forwardRef } from 'react';
import clsx from 'clsx';
import { useFieldValidation } from '../../hooks/useFieldValidation';

/**
 * Input component with real-time validation and visual feedback
 */
const ValidatedInput = forwardRef(
  (
    {
      label,
      error: externalError,
      warning,
      placeholder,
      type = 'text',
      disabled = false,
      className,
      fieldName,
      value,
      onChange,
      onBlur,
      showValidationIcon = true,
      customValidator = null,
      ...props
    },
    ref
  ) => {
    // Use validation hook only if fieldName is provided
    const validation = fieldName && value !== undefined
      ? useFieldValidation(fieldName, value, customValidator)
      : { error: null, warning: null, isValid: false, isValidating: false };

    // Use external error if provided, otherwise use validation error
    const displayError = externalError || validation.error;
    const displayWarning = warning || validation.warning;
    const showSuccess = !displayError && !displayWarning && validation.isValid && value && value.length > 0;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={clsx(
              'w-full px-4 py-2 pr-10 rounded-lg border transition-all duration-200',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'focus:outline-none focus:ring-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              {
                // Error state
                'border-red-500 focus:ring-red-500 focus:border-red-500': displayError,
                // Warning state
                'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500': 
                  !displayError && displayWarning,
                // Success state
                'border-green-500 focus:ring-green-500 focus:border-green-500': showSuccess,
                // Default state
                'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500':
                  !displayError && !displayWarning && !showSuccess,
              },
              className
            )}
            {...props}
          />

          {/* Validation Icons */}
          {showValidationIcon && !disabled && value && value.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validation.isValidating && (
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              )}
              
              {!validation.isValidating && displayError && (
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}

              {!validation.isValidating && !displayError && displayWarning && (
                <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}

              {!validation.isValidating && showSuccess && (
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {displayError && (
          <p className="text-red-500 text-sm mt-1 animate-fade-in flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {displayError}
          </p>
        )}

        {/* Warning Message */}
        {!displayError && displayWarning && (
          <p className="text-yellow-600 text-sm mt-1 animate-fade-in flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {displayWarning}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;
