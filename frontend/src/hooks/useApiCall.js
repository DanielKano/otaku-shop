import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';

/**
 * Hook personalizado para manejar llamadas a la API con manejo de errores consistente
 * 
 * @example
 * const { execute, loading } = useApiCall();
 * 
 * const handleSubmit = async () => {
 *   await execute(
 *     () => services.productService.create(data),
 *     {
 *       successMessage: 'Producto creado exitosamente',
 *       errorMessage: 'Error al crear producto',
 *       onSuccess: (result) => navigate('/dashboard')
 *     }
 *   );
 * };
 */
export const useApiCall = () => {
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();

    const execute = useCallback(async (apiCall, options = {}) => {
        const {
            successMessage,
            errorMessage = 'Ha ocurrido un error inesperado',
            onSuccess,
            onError,
            showSuccessNotification = true,
            showErrorNotification = true
        } = options;

        try {
            setLoading(true);
            const result = await apiCall();
            
            if (successMessage && showSuccessNotification) {
                addNotification({ 
                    type: 'success', 
                    message: successMessage 
                });
            }
            
            if (onSuccess) {
                onSuccess(result);
            }
            
            return result;
            
        } catch (error) {
            const message = error.response?.data?.message || 
                           error.response?.data?.error ||
                           errorMessage;
            
            if (showErrorNotification) {
                addNotification({ 
                    type: 'error', 
                    message 
                });
            }
            
            if (onError) {
                onError(error);
            }
            
            throw error;
            
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    return { execute, loading };
};

export default useApiCall;
