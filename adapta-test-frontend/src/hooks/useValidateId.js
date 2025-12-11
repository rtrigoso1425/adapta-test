import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook que valida si un ID es un ObjectId válido de MongoDB
 * Si no es válido, redirige al dashboard
 * @param {string} id - El ID a validar
 * @returns {boolean} - true si es válido, false si es inválido (pero redirige automáticamente)
 */
export const useValidateId = (id) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Validar formato ObjectId de MongoDB (24 caracteres hexadecimales)
    const objectIdRegex = /^[0-9a-f]{24}$/i;

    if (!id || !objectIdRegex.test(id)) {
      // ID inválido → redirigir al dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [id, navigate]);

  // Retornar si es válido para que el componente pueda hacer lógica adicional si lo necesita
  const objectIdRegex = /^[0-9a-f]{24}$/i;
  return id && objectIdRegex.test(id);
};
