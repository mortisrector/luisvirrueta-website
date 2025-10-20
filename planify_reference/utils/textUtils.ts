/**
 * Utilidades para formateo de texto
 */

/**
 * Capitaliza la primera letra de un texto automáticamente
 * @param text El texto a capitalizar
 * @returns El texto con la primera letra en mayúscula
 */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  
  // Eliminar espacios al inicio
  const trimmedText = text.trimStart();
  if (!trimmedText) return text;
  
  // Capitalizar solo la primera letra real del texto
  const firstChar = trimmedText.charAt(0).toUpperCase();
  const restOfText = trimmedText.slice(1);
  
  // Mantener los espacios originales al inicio si los había
  const leadingSpaces = text.slice(0, text.length - text.trimStart().length);
  
  return leadingSpaces + firstChar + restOfText;
}

/**
 * Hook personalizado para input con capitalización automática
 * @param initialValue Valor inicial del input
 * @returns [value, setValue, handleChange] - donde handleChange aplica capitalización automática
 */
export function useCapitalizedInput(initialValue: string = '') {
  const [value, setValue] = React.useState(initialValue);
  
  const handleChange = (newValue: string) => {
    setValue(capitalizeFirst(newValue));
  };
  
  return [value, setValue, handleChange] as const;
}

// Para proyectos y carpetas, podemos importar React si se necesita el hook
import React from 'react';