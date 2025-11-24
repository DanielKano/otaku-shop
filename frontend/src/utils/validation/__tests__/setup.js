/**
 * 🔧 CONFIGURACIÓN DE VITEST
 * Setup global para tests
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpieza automática después de cada test
afterEach(() => {
  cleanup();
});
