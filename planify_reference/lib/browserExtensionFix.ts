// Suprimir warnings de hidratación causados por extensiones del navegador
if (typeof window !== 'undefined') {
  // Lista de atributos comunes agregados por extensiones del navegador
  const BROWSER_EXTENSION_ATTRIBUTES = [
    'bis_skin_checked',
    'data-lastpass-icon-root',
    'data-dashlane-rid',
    'data-1password-uuid',
    'autocomplete',
    'data-ms-editor',
    'spellcheck'
  ];

  // Función para limpiar atributos de extensiones antes de la hidratación
  const cleanBrowserExtensionAttributes = () => {
    BROWSER_EXTENSION_ATTRIBUTES.forEach(attr => {
      const elements = document.querySelectorAll(`[${attr}]`);
      elements.forEach(el => {
        el.removeAttribute(attr);
      });
    });
  };

  // Ejecutar limpieza antes de que React hidrate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanBrowserExtensionAttributes);
  } else {
    cleanBrowserExtensionAttributes();
  }

  // También ejecutar en el próximo tick para casos edge
  setTimeout(cleanBrowserExtensionAttributes, 0);
}

export {};