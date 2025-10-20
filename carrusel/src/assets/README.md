# Nueva Estructura Modular - Luis Virrueta Psychology

## Estructura Propuesta

```
/
├── src/                           # Código fuente principal
│   ├── components/                # Componentes HTML reutilizables
│   │   ├── header/
│   │   │   ├── header.html
│   │   │   ├── header.css
│   │   │   └── header.js
│   │   ├── hero/
│   │   ├── navigation/
│   │   ├── footer/
│   │   └── forms/
│   ├── styles/                    # CSS modular
│   │   ├── base/                  # Estilos base
│   │   │   ├── reset.css
│   │   │   ├── typography.css
│   │   │   ├── variables.css
│   │   │   └── utilities.css
│   │   ├── components/            # Estilos de componentes
│   │   ├── layout/               # Estilos de layout
│   │   └── themes/               # Temas y variaciones
│   ├── scripts/                   # JavaScript modular
│   │   ├── core/                 # Funcionalidad central
│   │   ├── components/           # Scripts de componentes
│   │   ├── utils/                # Utilidades
│   │   └── modules/              # Módulos específicos
│   └── assets/                   # Recursos estáticos
│       ├── images/
│       ├── icons/
│       └── fonts/
├── dist/                         # Archivos compilados/optimizados
├── blog/                         # Blog (mantener estructura actual)
├── config/                       # Configuración del proyecto
├── tools/                        # Scripts de desarrollo
└── docs/                        # Documentación
```

## Beneficios de esta estructura:

1. **Modularidad**: Cada componente es independiente y reutilizable
2. **Mantenibilidad**: Fácil localizar y modificar código específico
3. **Escalabilidad**: Estructura que crece con el proyecto
4. **Separación de responsabilidades**: CSS, JS y HTML bien organizados
5. **Mejores prácticas**: Siguiendo estándares de desarrollo web moderno
6. **Performance**: Posibilidad de carga selectiva de recursos