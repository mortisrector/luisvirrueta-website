# 🚀 GUÍA RÁPIDA - COPILOT WORKFLOW

## 📋 INFORMACIÓN DEL PROYECTO
- **Tipo**: Next.js 14 + TypeScript + Tailwind
- **GitHub**: https://github.com/mortisrector/upfly
- **Rama de trabajo**: `dev` (siempre)
- **Rama de producción**: `main`

## ⚡ COMANDOS ESENCIALES

### 🔵 Empezar a trabajar:
```bash
npm run dev
# → Abre: http://localhost:3000
```

### 🟡 Guardar trabajo (reemplaza backup manual):
```bash
git add .
git commit -m "descripción del cambio"
git push
```

### 🔴 Ver qué cambió:
```bash
git status
```

### 🟢 Verificar rama actual:
```bash
git branch
# Debe mostrar: * dev
```

### 🔄 Cambiar a rama dev (si es necesario):
```bash
git checkout dev
```

## 🆘 EMERGENCIA - COPILOT ROMPIÓ ALGO

### Opción 1 - Desde GitHub (fácil):
1. Ve a: https://github.com/mortisrector/upfly
2. Tab "Commits"
3. Busca el último que funcionaba
4. Click → "Revert"

### Opción 2 - Comando rápido:
```bash
git reset --hard HEAD~1
# Vuelve 1 commit atrás
```

## 📁 ESTRUCTURA IMPORTANTE
```
/components     → Componentes React principales
/app           → Pages de Next.js  
/lib           → Utilidades y servicios
/hooks         → Custom hooks
/types         → Definiciones TypeScript
```

## 🎯 FLUJO TÍPICO CON COPILOT
1. `npm run dev` → Verificar que funciona
2. Decir a Copilot qué cambiar
3. Ver resultado en localhost:3000
4. Si funciona → `git add . && git commit -m "cambio X" && git push`
5. Si no funciona → Pedir reversión o usar comandos de emergencia

## 💡 RECORDATORIO
- ✅ NO crear más backups manuales (ZIPs)
- ✅ Siempre trabajar en rama `dev`
- ✅ GitHub guarda TODO automáticamente
- ✅ Un commit = un backup

---
**Última actualización**: Octubre 2025
**Configurado por**: Copilot workflow setup