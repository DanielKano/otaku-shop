/**
 * Logger condicional para producción
 * Solo muestra logs en desarrollo, excepto errores que siempre se muestran
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const logger = {
    /**
     * Log general - solo en desarrollo
     */
    log: (...args) => {
        if (isDev) {
            console.log(...args);
        }
    },

    /**
     * Log de información - solo en desarrollo
     */
    info: (...args) => {
        if (isDev) {
            console.info(...args);
        }
    },

    /**
     * Log de debug - solo en desarrollo
     */
    debug: (...args) => {
        if (isDev) {
            console.debug(...args);
        }
    },

    /**
     * Advertencias - siempre se muestran
     */
    warn: (...args) => {
        console.warn(...args);
    },

    /**
     * Errores - siempre se muestran
     */
    error: (...args) => {
        console.error(...args);
    },

    /**
     * Log de tabla - solo en desarrollo
     */
    table: (data) => {
        if (isDev) {
            console.table(data);
        }
    },

    /**
     * Agrupar logs - solo en desarrollo
     */
    group: (label) => {
        if (isDev) {
            console.group(label);
        }
    },

    groupEnd: () => {
        if (isDev) {
            console.groupEnd();
        }
    }
};

export default logger;
