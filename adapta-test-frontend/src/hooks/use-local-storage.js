import { useState, useEffect } from "react";

function getStorageValue(key, defaultValue) {
  // Obtener del localStorage
  const saved = localStorage.getItem(key);
  // Parsear el JSON guardado
  const initial = saved ? JSON.parse(saved) : null;
  
  // Si es una función (raro pero posible), ejecutarla.
  if (initial instanceof Function) {
    return initial();
  }
  
  // Devolver el valor guardado o el valor por defecto
  return initial ?? defaultValue;
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // Guardar en localStorage cada vez que el valor cambie
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};