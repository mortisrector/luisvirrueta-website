// Archivo centralizado para todos los esquemas de colores
// Esto asegura consistencia entre todos los componentes

export interface ColorScheme {
  name: string;
  gradient: string;
  category?: string;
  icon?: string;
}

// ✨ Sistema de colores completamente renovado - Comenzando con MORADOS ✨
export const ALL_COLOR_SCHEMES: ColorScheme[] = [
  
  // ==================== 🟣 MORADOS PLANOS VIBRANTES ====================
  { name: 'purple-vivid', gradient: 'from-purple-500 to-purple-600', category: 'Morado', icon: '●' },
  { name: 'purple-rich', gradient: 'from-purple-600 to-purple-700', category: 'Morado', icon: '●' },
  { name: 'purple-deep', gradient: 'from-purple-700 to-purple-800', category: 'Morado', icon: '●' },
  { name: 'violet-vivid', gradient: 'from-violet-500 to-violet-600', category: 'Morado', icon: '●' },
  { name: 'violet-rich', gradient: 'from-violet-600 to-violet-700', category: 'Morado', icon: '●' },
  { name: 'fuchsia-vivid', gradient: 'from-fuchsia-500 to-fuchsia-600', category: 'Morado', icon: '●' },
  { name: 'fuchsia-rich', gradient: 'from-fuchsia-600 to-fuchsia-700', category: 'Morado', icon: '●' },
  { name: 'indigo-vivid', gradient: 'from-indigo-500 to-indigo-600', category: 'Morado', icon: '●' },
  { name: 'indigo-rich', gradient: 'from-indigo-600 to-indigo-700', category: 'Morado', icon: '●' },
  { name: 'purple-bright', gradient: 'from-purple-400 to-purple-500', category: 'Morado', icon: '●' },
  { name: 'violet-bright', gradient: 'from-violet-400 to-violet-500', category: 'Morado', icon: '●' },
  { name: 'fuchsia-bright', gradient: 'from-fuchsia-400 to-fuchsia-500', category: 'Morado', icon: '●' },

  // ==================== 🌸 MORADOS PASTEL ====================
  { name: 'purple-pastel', gradient: 'from-purple-200 to-purple-300', category: 'Morado', icon: '◐' },
  { name: 'purple-soft', gradient: 'from-purple-300 to-purple-400', category: 'Morado', icon: '◐' },
  { name: 'violet-pastel', gradient: 'from-violet-200 to-violet-300', category: 'Morado', icon: '◐' },
  { name: 'violet-soft', gradient: 'from-violet-300 to-violet-400', category: 'Morado', icon: '◐' },
  { name: 'fuchsia-pastel', gradient: 'from-fuchsia-200 to-fuchsia-300', category: 'Morado', icon: '◐' },
  { name: 'fuchsia-soft', gradient: 'from-fuchsia-300 to-fuchsia-400', category: 'Morado', icon: '◐' },
  { name: 'indigo-pastel', gradient: 'from-indigo-200 to-indigo-300', category: 'Morado', icon: '◐' },
  { name: 'indigo-soft', gradient: 'from-indigo-300 to-indigo-400', category: 'Morado', icon: '◐' },
  { name: 'lavender-dream', gradient: 'from-purple-100 via-violet-200 to-purple-200', category: 'Morado', icon: '◐' },
  { name: 'lilac-mist', gradient: 'from-violet-100 via-purple-200 to-fuchsia-200', category: 'Morado', icon: '◐' },

  // ==================== ⚡ MORADOS NEÓN ====================
  { name: 'purple-neon', gradient: 'from-purple-400 via-violet-400 to-fuchsia-500', category: 'Morado', icon: '⚡' },
  { name: 'violet-neon', gradient: 'from-violet-400 via-purple-500 to-fuchsia-600', category: 'Morado', icon: '⚡' },
  { name: 'fuchsia-neon', gradient: 'from-fuchsia-400 via-pink-500 to-purple-600', category: 'Morado', icon: '⚡' },
  { name: 'indigo-neon', gradient: 'from-indigo-400 via-violet-500 to-purple-600', category: 'Morado', icon: '⚡' },
  { name: 'electric-purple', gradient: 'from-purple-400 via-fuchsia-500 to-pink-600', category: 'Morado', icon: '⚡' },
  { name: 'plasma-purple', gradient: 'from-violet-300 via-purple-400 to-fuchsia-500', category: 'Morado', icon: '⚡' },
  { name: 'cyber-purple', gradient: 'from-indigo-400 via-purple-500 to-violet-600', category: 'Morado', icon: '⚡' },
  { name: 'glow-purple', gradient: 'from-purple-300 via-fuchsia-400 to-violet-500', category: 'Morado', icon: '⚡' },

  // ==================== 🌈 DEGRADADOS MORADOS ====================
  { name: 'purple-sunset', gradient: 'from-purple-400 via-pink-500 to-orange-500', category: 'Morado', icon: '🌈' },
  { name: 'purple-ocean', gradient: 'from-purple-500 via-blue-500 to-cyan-500', category: 'Morado', icon: '🌈' },
  { name: 'purple-forest', gradient: 'from-purple-500 via-violet-500 to-emerald-500', category: 'Morado', icon: '🌈' },
  { name: 'purple-fire', gradient: 'from-fuchsia-500 via-purple-600 to-red-600', category: 'Morado', icon: '🌈' },
  { name: 'purple-aurora', gradient: 'from-indigo-400 via-purple-500 to-pink-500', category: 'Morado', icon: '🌈' },
  { name: 'purple-galaxy', gradient: 'from-violet-600 via-purple-500 to-indigo-600', category: 'Morado', icon: '🌈' },
  { name: 'purple-twilight', gradient: 'from-purple-600 via-indigo-600 to-blue-700', category: 'Morado', icon: '🌈' },
  { name: 'purple-dawn', gradient: 'from-fuchsia-400 via-purple-400 to-yellow-400', category: 'Morado', icon: '🌈' },
  { name: 'purple-cosmos', gradient: 'from-purple-700 via-indigo-800 to-blue-900', category: 'Morado', icon: '🌈' },
  { name: 'purple-magic', gradient: 'from-violet-400 via-fuchsia-500 to-cyan-500', category: 'Morado', icon: '🌈' },

  // ==================== ✨ MORADOS CON EFECTOS ESPECIALES ====================
  { name: 'purple-chrome', gradient: 'from-purple-300 via-violet-200 to-purple-300', category: 'Morado', icon: '✨' },
  { name: 'purple-hologram', gradient: 'from-purple-200 via-fuchsia-300 to-violet-200', category: 'Morado', icon: '✨' },
  { name: 'purple-metallic', gradient: 'from-purple-400 via-violet-600 to-purple-800', category: 'Morado', icon: '✨' },
  { name: 'purple-crystal', gradient: 'from-violet-300 via-purple-400 to-fuchsia-400', category: 'Morado', icon: '✨' },
  { name: 'purple-diamond', gradient: 'from-purple-100 via-violet-300 to-purple-500', category: 'Morado', icon: '✨' },
  { name: 'purple-pearl', gradient: 'from-violet-200 via-purple-300 to-indigo-400', category: 'Morado', icon: '✨' },
  { name: 'purple-opal', gradient: 'from-fuchsia-200 via-purple-300 to-blue-300', category: 'Morado', icon: '✨' },
  { name: 'purple-amethyst', gradient: 'from-purple-400 via-violet-500 to-purple-700', category: 'Morado', icon: '✨' },
  { name: 'purple-sapphire', gradient: 'from-indigo-400 via-violet-500 to-blue-600', category: 'Morado', icon: '✨' },
  { name: 'purple-mystic', gradient: 'from-purple-500 via-fuchsia-600 to-indigo-700', category: 'Morado', icon: '✨' },
  
  // ==================== FINANZAS & INVERSIONES ====================
  { name: 'electric-gold', gradient: 'from-yellow-400 to-orange-500', category: 'Finanzas', icon: '⚡' },
  { name: 'electric-amber', gradient: 'from-amber-400 to-orange-500', category: 'Finanzas', icon: '⚡' },
  { name: 'gold', gradient: 'from-yellow-500 to-amber-500', category: 'Finanzas', icon: '▲' },
  
  // ==================== SALUD & BIENESTAR ====================
  { name: 'electric-teal', gradient: 'from-teal-400 to-cyan-500', category: 'Salud', icon: '⚡' },
  { name: 'electric-lime', gradient: 'from-lime-400 to-green-500', category: 'Salud', icon: '⚡' },
  { name: 'neon-cyan', gradient: 'from-cyan-300 to-teal-400', category: 'Salud', icon: '◈' },
  { name: 'mint', gradient: 'from-emerald-400 to-cyan-400', category: 'Salud', icon: '■' },
  
  // ==================== TECNOLOGÍA & REDES ====================
  { name: 'void', gradient: 'from-purple-800 to-black', category: 'Tecnología', icon: '◇' },
  { name: 'cosmic', gradient: 'from-purple-500 to-indigo-500', category: 'Tecnología', icon: '✦' },
  { name: 'royal', gradient: 'from-indigo-500 to-purple-500', category: 'Tecnología', icon: '▲' },
  
  // ==================== PERSONAL & FAMILIA ====================
  { name: 'sunset', gradient: 'from-orange-500 to-pink-500', category: 'Personal', icon: '▲' },
  { name: 'ocean', gradient: 'from-blue-500 to-cyan-500', category: 'Personal', icon: '●' },
  { name: 'forest', gradient: 'from-green-500 to-emerald-500', category: 'Personal', icon: '■' },
  { name: 'fire', gradient: 'from-red-500 to-orange-500', category: 'Personal', icon: '▼' },
  
  // ==================== EDUCACIÓN & APRENDIZAJE ====================
  { name: 'default', gradient: 'from-indigo-500 to-purple-500', category: 'Educación', icon: '◆' },
  
  // ==================== COLORES ESPECIALES ====================
  { name: 'aurora', gradient: 'from-purple-400 via-pink-400 to-cyan-400', category: 'Especiales', icon: '◈' },
  { name: 'neon', gradient: 'from-cyan-400 via-blue-500 to-purple-600', category: 'Especiales', icon: '⬢' },
  { name: 'crystal', gradient: 'from-blue-300 via-purple-400 to-pink-400', category: 'Especiales', icon: '◇' },
  { name: 'galaxy', gradient: 'from-violet-600 via-purple-500 to-indigo-600', category: 'Especiales', icon: '✧' },
  { name: 'hologram', gradient: 'from-cyan-300 via-purple-300 to-pink-300', category: 'Especiales', icon: '◑' },
  
  // ==================== METÁLICOS ====================
  { name: 'silver', gradient: 'from-gray-300 via-slate-400 to-gray-500', category: 'Metálicos', icon: '○' },
  { name: 'copper', gradient: 'from-orange-400 via-red-400 to-amber-600', category: 'Metálicos', icon: '□' },
  { name: 'platinum', gradient: 'from-slate-200 via-gray-300 to-slate-400', category: 'Metálicos', icon: '◇' },
  
  // ==================== GEMAS ====================
  { name: 'emerald', gradient: 'from-emerald-400 via-green-500 to-teal-600', category: 'Gemas', icon: '◈' },
  { name: 'ruby', gradient: 'from-red-400 via-rose-500 to-pink-600', category: 'Gemas', icon: '♦' },
  { name: 'sapphire', gradient: 'from-blue-400 via-indigo-500 to-blue-600', category: 'Gemas', icon: '◆' },
  { name: 'amethyst', gradient: 'from-purple-300 via-violet-400 to-purple-600', category: 'Gemas', icon: '◇' },
  { name: 'topaz', gradient: 'from-amber-300 via-yellow-400 to-orange-500', category: 'Gemas', icon: '◈' },
  { name: 'aquamarine', gradient: 'from-cyan-300 via-blue-300 to-teal-400', category: 'Gemas', icon: '◐' },
  
  // Colores Neón Eléctricos
  { name: 'neon-green', gradient: 'from-lime-400 via-green-400 to-emerald-500', category: 'Neón', icon: '⚡' },
  { name: 'neon-pink', gradient: 'from-pink-400 via-fuchsia-400 to-purple-500', category: 'Neón', icon: '◈' },
  { name: 'neon-blue', gradient: 'from-cyan-300 via-blue-400 to-indigo-500', category: 'Neón', icon: '◇' },
  { name: 'neon-yellow', gradient: 'from-yellow-300 via-amber-400 to-orange-400', category: 'Neón', icon: '✧' },
  { name: 'electric-purple-neon', gradient: 'from-violet-400 via-purple-500 to-fuchsia-600', category: 'Neón', icon: '⬢' },
  { name: 'electric-cyan', gradient: 'from-cyan-300 via-sky-400 to-blue-500', category: 'Neón', icon: '◐' },
  
  // Colores Oscuros y Elegantes
  { name: 'dark-matter', gradient: 'from-gray-800 via-gray-900 to-black', category: 'Oscuro', icon: '●' },
  { name: 'shadow', gradient: 'from-slate-700 via-gray-800 to-slate-900', category: 'Oscuro', icon: '◆' },
  { name: 'midnight-blue', gradient: 'from-blue-900 via-indigo-900 to-black', category: 'Oscuro', icon: '◇' },
  { name: 'obsidian-deep', gradient: 'from-gray-900 via-black to-gray-800', category: 'Oscuro', icon: '■' },
  { name: 'carbon', gradient: 'from-neutral-800 via-stone-900 to-black', category: 'Oscuro', icon: '◈' },
  { name: 'deep-void', gradient: 'from-purple-900 via-black to-indigo-900', category: 'Oscuro', icon: '✦' },
  
  // Más Gemas
  { name: 'diamond', gradient: 'from-white via-gray-100 to-slate-200', category: 'Gemas', icon: '◆' },
  { name: 'onyx', gradient: 'from-black via-gray-900 to-slate-800', category: 'Gemas', icon: '■' },
  { name: 'bronze', gradient: 'from-amber-600 via-orange-600 to-yellow-700', category: 'Metálicos', icon: '◈' },
  { name: 'titanium', gradient: 'from-slate-400 via-gray-500 to-zinc-600', category: 'Metálicos', icon: '◐' },
  
  // Colores Fantasía
  { name: 'unicorn', gradient: 'from-pink-300 via-purple-300 via-blue-300 to-cyan-300', category: 'Fantasía', icon: '✦' },
  { name: 'phoenix', gradient: 'from-red-400 via-orange-400 via-yellow-400 to-red-500', category: 'Fantasía', icon: '◆' },
  { name: 'dragon', gradient: 'from-green-400 via-emerald-500 to-teal-600', category: 'Fantasía', icon: '▲' },
  { name: 'mermaid', gradient: 'from-teal-300 via-cyan-400 to-blue-500', category: 'Fantasía', icon: '◑' },
  { name: 'fairy', gradient: 'from-pink-200 via-purple-200 to-indigo-300', category: 'Fantasía', icon: '✧' },
  { name: 'wizard', gradient: 'from-indigo-400 via-purple-500 to-violet-600', category: 'Fantasía', icon: '◇' },

  // ==================== COLORES VIBRANTES ADICIONALES ====================
  { name: 'coral-sunset', gradient: 'from-orange-400 to-pink-400', category: 'Vibrantes', icon: '●' },
  { name: 'ocean-blue', gradient: 'from-blue-400 to-blue-600', category: 'Vibrantes', icon: '●' },
  { name: 'forest-green', gradient: 'from-green-400 to-green-600', category: 'Vibrantes', icon: '●' },
  { name: 'sunset-orange', gradient: 'from-orange-500 to-red-500', category: 'Vibrantes', icon: '●' },
  { name: 'royal-purple', gradient: 'from-purple-500 to-purple-700', category: 'Vibrantes', icon: '●' },
  { name: 'sky-blue', gradient: 'from-sky-400 to-blue-500', category: 'Vibrantes', icon: '●' },
  { name: 'lime-green', gradient: 'from-lime-400 to-green-500', category: 'Vibrantes', icon: '●' },
  { name: 'magenta-pink', gradient: 'from-fuchsia-500 to-pink-500', category: 'Vibrantes', icon: '●' },
  { name: 'turquoise', gradient: 'from-teal-400 to-cyan-500', category: 'Vibrantes', icon: '●' },
  { name: 'lavender', gradient: 'from-purple-300 to-violet-400', category: 'Vibrantes', icon: '●' },

  // ==================== COLORES PROFESIONALES ====================
  { name: 'corporate-blue', gradient: 'from-blue-700 to-blue-900', category: 'Profesional', icon: '■' },
  { name: 'executive-gray', gradient: 'from-slate-600 to-gray-700', category: 'Profesional', icon: '■' },
  { name: 'business-green', gradient: 'from-emerald-600 to-green-700', category: 'Profesional', icon: '■' },
  { name: 'professional-navy', gradient: 'from-blue-800 to-indigo-900', category: 'Profesional', icon: '■' },
  { name: 'modern-teal', gradient: 'from-teal-600 to-cyan-700', category: 'Profesional', icon: '■' },

  // ==================== COLORES PASTEL ====================
  { name: 'soft-pink', gradient: 'from-pink-200 to-rose-300', category: 'Pastel', icon: '◐' },
  { name: 'soft-blue', gradient: 'from-blue-200 to-sky-300', category: 'Pastel', icon: '◐' },
  { name: 'soft-green', gradient: 'from-green-200 to-emerald-300', category: 'Pastel', icon: '◐' },
  { name: 'soft-purple', gradient: 'from-purple-200 to-violet-300', category: 'Pastel', icon: '◐' },
  { name: 'soft-yellow', gradient: 'from-yellow-200 to-amber-300', category: 'Pastel', icon: '◐' },

  // ==================== COLORES INTENSOS ====================
  { name: 'intense-red', gradient: 'from-red-600 to-red-800', category: 'Intenso', icon: '▲' },
  { name: 'intense-blue', gradient: 'from-blue-600 to-blue-800', category: 'Intenso', icon: '▲' },
  { name: 'intense-green', gradient: 'from-green-600 to-green-800', category: 'Intenso', icon: '▲' },
  { name: 'intense-purple', gradient: 'from-purple-600 to-purple-800', category: 'Intenso', icon: '▲' },
  { name: 'intense-orange', gradient: 'from-orange-600 to-red-700', category: 'Intenso', icon: '▲' },

  // ==================== COLORES NEÓN NUEVOS ====================
  { name: 'neon-hot-pink', gradient: 'from-hot-pink-400 via-pink-500 to-rose-500', category: 'Neón', icon: '⚡' },
  { name: 'neon-electric-blue', gradient: 'from-blue-400 via-cyan-400 to-sky-500', category: 'Neón', icon: '⚡' },
  { name: 'neon-toxic-green', gradient: 'from-lime-300 via-green-400 to-emerald-500', category: 'Neón', icon: '⚡' },
  { name: 'neon-laser-red', gradient: 'from-red-400 via-rose-400 to-pink-500', category: 'Neón', icon: '⚡' },
  { name: 'neon-cyber-yellow', gradient: 'from-yellow-300 via-amber-400 to-orange-500', category: 'Neón', icon: '⚡' },
  { name: 'neon-plasma-purple', gradient: 'from-purple-400 via-violet-400 to-fuchsia-500', category: 'Neón', icon: '⚡' },
  { name: 'neon-aqua', gradient: 'from-cyan-300 via-teal-400 to-blue-500', category: 'Neón', icon: '⚡' },
  
  // ==================== COLORES CHICLE Y DULCES ====================
  { name: 'bubblegum-pink', gradient: 'from-pink-300 via-pink-400 to-rose-400', category: 'Dulces', icon: '🍭' },
  { name: 'cotton-candy', gradient: 'from-pink-200 via-blue-200 to-purple-300', category: 'Dulces', icon: '🍭' },
  { name: 'strawberry-milk', gradient: 'from-pink-200 via-rose-300 to-red-300', category: 'Dulces', icon: '🍭' },
  { name: 'mint-cream', gradient: 'from-green-200 via-teal-200 to-cyan-300', category: 'Dulces', icon: '🍭' },
  { name: 'lemon-drop', gradient: 'from-yellow-200 via-yellow-300 to-amber-300', category: 'Dulces', icon: '🍭' },
  { name: 'grape-soda', gradient: 'from-purple-300 via-violet-400 to-indigo-400', category: 'Dulces', icon: '🍭' },
  { name: 'blue-raspberry', gradient: 'from-blue-300 via-indigo-400 to-purple-400', category: 'Dulces', icon: '🍭' },
  { name: 'orange-creamsicle', gradient: 'from-orange-200 via-orange-300 to-yellow-300', category: 'Dulces', icon: '🍭' },
  
  // ==================== GRADIENTES RAROS Y EXPERIMENTALES ====================
  { name: 'aurora-borealis', gradient: 'from-green-300 via-blue-400 via-purple-400 to-pink-400', category: 'Experimental', icon: '🌈' },
  { name: 'sunset-mars', gradient: 'from-red-400 via-orange-500 via-yellow-400 to-pink-500', category: 'Experimental', icon: '🌈' },
  { name: 'deep-space', gradient: 'from-indigo-900 via-purple-800 via-blue-900 to-black', category: 'Experimental', icon: '🌈' },
  { name: 'toxic-waste', gradient: 'from-lime-400 via-green-500 via-yellow-400 to-green-600', category: 'Experimental', icon: '🌈' },
  { name: 'galaxy-swirl', gradient: 'from-purple-600 via-blue-500 via-teal-400 to-green-500', category: 'Experimental', icon: '🌈' },
  { name: 'lava-flow', gradient: 'from-red-600 via-orange-500 via-yellow-400 to-red-700', category: 'Experimental', icon: '🌈' },
  { name: 'ocean-depths', gradient: 'from-blue-900 via-teal-800 via-cyan-700 to-blue-800', category: 'Experimental', icon: '🌈' },
  { name: 'rainbow-prism', gradient: 'from-red-400 via-orange-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400', category: 'Experimental', icon: '🌈' },
  
  // ==================== COLORES METÁLICOS ESPECIALES ====================
  { name: 'chrome-shine', gradient: 'from-gray-300 via-slate-200 to-zinc-300', category: 'Metálico', icon: '✨' },
  { name: 'gold-rush', gradient: 'from-yellow-400 via-amber-500 to-orange-600', category: 'Metálico', icon: '✨' },
  { name: 'silver-moon', gradient: 'from-slate-300 via-gray-200 to-zinc-300', category: 'Metálico', icon: '✨' },
  { name: 'copper-penny', gradient: 'from-orange-500 via-amber-600 to-red-600', category: 'Metálico', icon: '✨' },
  { name: 'rose-gold', gradient: 'from-pink-300 via-rose-400 to-orange-400', category: 'Metálico', icon: '✨' },
  { name: 'black-pearl', gradient: 'from-gray-800 via-slate-700 to-zinc-800', category: 'Metálico', icon: '✨' },
  
  // ==================== COLORES CYBERPUNK ====================
  { name: 'cyber-punk-blue', gradient: 'from-cyan-400 via-blue-500 to-indigo-600', category: 'Cyberpunk', icon: '⚙️' },
  { name: 'cyber-punk-pink', gradient: 'from-fuchsia-400 via-pink-500 to-rose-600', category: 'Cyberpunk', icon: '⚙️' },
  { name: 'cyber-punk-green', gradient: 'from-lime-400 via-green-500 to-emerald-600', category: 'Cyberpunk', icon: '⚙️' },
  { name: 'matrix-green', gradient: 'from-green-400 via-lime-500 to-green-600', category: 'Cyberpunk', icon: '⚙️' },
  { name: 'neon-city', gradient: 'from-purple-500 via-pink-500 to-cyan-500', category: 'Cyberpunk', icon: '⚙️' },
  { name: 'digital-dreams', gradient: 'from-blue-500 via-purple-500 to-pink-500', category: 'Cyberpunk', icon: '⚙️' },
  
  // ==================== COLORES RETRO WAVE ====================
  { name: 'retro-wave-purple', gradient: 'from-purple-600 via-fuchsia-500 to-pink-500', category: 'Retro', icon: '📼' },
  { name: 'retro-wave-cyan', gradient: 'from-cyan-400 via-blue-500 to-purple-600', category: 'Retro', icon: '📼' },
  { name: 'synthwave-sunset', gradient: 'from-pink-500 via-purple-500 to-cyan-500', category: 'Retro', icon: '📼' },
  { name: 'vaporwave-aesthetic', gradient: 'from-purple-400 via-pink-400 to-cyan-400', category: 'Retro', icon: '📼' },
  { name: 'neon-80s', gradient: 'from-fuchsia-500 via-purple-500 to-blue-500', category: 'Retro', icon: '📼' },
  
  // ==================== COLORES NATURALES VIBRANTES ====================
  { name: 'tropical-sunset', gradient: 'from-orange-400 via-pink-500 to-purple-600', category: 'Natural', icon: '🌺' },
  { name: 'amazon-jungle', gradient: 'from-green-600 via-emerald-500 to-teal-600', category: 'Natural', icon: '🌺' },
  { name: 'coral-reef', gradient: 'from-orange-300 via-pink-400 to-red-500', category: 'Natural', icon: '🌺' },
  { name: 'northern-lights', gradient: 'from-green-400 via-teal-500 to-blue-600', category: 'Natural', icon: '🌺' },
  { name: 'desert-bloom', gradient: 'from-yellow-400 via-orange-500 to-red-600', category: 'Natural', icon: '🌺' },
  { name: 'ocean-wave', gradient: 'from-blue-400 via-cyan-500 to-teal-600', category: 'Natural', icon: '🌺' },
  
  // ==================== MÁS MORADOS (Tonalidades puras) ====================
  { name: 'purple-light', gradient: 'from-purple-200 to-purple-300', category: 'Morado', icon: '●' },
  { name: 'purple-soft', gradient: 'from-purple-300 to-purple-400', category: 'Morado', icon: '●' },
  { name: 'purple-medium', gradient: 'from-purple-400 to-purple-500', category: 'Morado', icon: '●' },
  { name: 'purple-vibrant', gradient: 'from-purple-500 to-purple-600', category: 'Morado', icon: '●' },
  { name: 'purple-deep', gradient: 'from-purple-600 to-purple-700', category: 'Morado', icon: '●' },
  { name: 'purple-dark', gradient: 'from-purple-700 to-purple-800', category: 'Morado', icon: '●' },
  { name: 'purple-midnight', gradient: 'from-purple-800 to-purple-900', category: 'Morado', icon: '●' },
  { name: 'violet-pastel', gradient: 'from-violet-200 to-violet-300', category: 'Morado', icon: '●' },
  { name: 'violet-soft', gradient: 'from-violet-300 to-violet-400', category: 'Morado', icon: '●' },
  { name: 'violet-bright', gradient: 'from-violet-400 to-violet-500', category: 'Morado', icon: '●' },
  { name: 'violet-rich', gradient: 'from-violet-500 to-violet-600', category: 'Morado', icon: '●' },
  { name: 'violet-deep', gradient: 'from-violet-600 to-violet-700', category: 'Morado', icon: '●' },
  { name: 'indigo-light', gradient: 'from-indigo-300 to-indigo-400', category: 'Morado', icon: '●' },
  { name: 'indigo-medium', gradient: 'from-indigo-400 to-indigo-500', category: 'Morado', icon: '●' },
  { name: 'indigo-vibrant', gradient: 'from-indigo-500 to-indigo-600', category: 'Morado', icon: '●' },
  { name: 'indigo-dark', gradient: 'from-indigo-600 to-indigo-700', category: 'Morado', icon: '●' },
  { name: 'indigo-midnight', gradient: 'from-indigo-700 to-indigo-800', category: 'Morado', icon: '●' },
  
  // ==================== MÁS AMARILLOS ====================
  { name: 'yellow-pastel', gradient: 'from-yellow-200 to-yellow-300', category: 'Amarillo', icon: '●' },
  { name: 'yellow-soft', gradient: 'from-yellow-300 to-yellow-400', category: 'Amarillo', icon: '●' },
  { name: 'yellow-bright', gradient: 'from-yellow-400 to-yellow-500', category: 'Amarillo', icon: '●' },
  { name: 'yellow-vibrant', gradient: 'from-yellow-500 to-yellow-600', category: 'Amarillo', icon: '●' },
  { name: 'amber-pastel', gradient: 'from-amber-200 to-amber-300', category: 'Amarillo', icon: '●' },
  { name: 'amber-soft', gradient: 'from-amber-300 to-amber-400', category: 'Amarillo', icon: '●' },
  { name: 'amber-bright', gradient: 'from-amber-400 to-amber-500', category: 'Amarillo', icon: '●' },
  { name: 'amber-rich', gradient: 'from-amber-500 to-amber-600', category: 'Amarillo', icon: '●' },
  { name: 'amber-deep', gradient: 'from-amber-600 to-amber-700', category: 'Amarillo', icon: '●' },
  { name: 'gold-shine', gradient: 'from-yellow-400 via-amber-400 to-yellow-500', category: 'Amarillo', icon: '✨' },
  { name: 'gold-bright', gradient: 'from-amber-400 via-yellow-500 to-amber-500', category: 'Amarillo', icon: '✨' },
  
  // ==================== MÁS NARANJAS ====================
  { name: 'orange-pastel', gradient: 'from-orange-200 to-orange-300', category: 'Naranja', icon: '●' },
  { name: 'orange-soft', gradient: 'from-orange-300 to-orange-400', category: 'Naranja', icon: '●' },
  { name: 'orange-bright', gradient: 'from-orange-400 to-orange-500', category: 'Naranja', icon: '●' },
  { name: 'orange-vibrant', gradient: 'from-orange-500 to-orange-600', category: 'Naranja', icon: '●' },
  { name: 'orange-deep', gradient: 'from-orange-600 to-orange-700', category: 'Naranja', icon: '●' },
  { name: 'orange-dark', gradient: 'from-orange-700 to-orange-800', category: 'Naranja', icon: '●' },
  
  // ==================== MÁS VERDES ====================
  { name: 'green-pastel', gradient: 'from-green-200 to-green-300', category: 'Verde', icon: '●' },
  { name: 'green-soft', gradient: 'from-green-300 to-green-400', category: 'Verde', icon: '●' },
  { name: 'green-bright', gradient: 'from-green-400 to-green-500', category: 'Verde', icon: '●' },
  { name: 'green-vibrant', gradient: 'from-green-500 to-green-600', category: 'Verde', icon: '●' },
  { name: 'green-deep', gradient: 'from-green-600 to-green-700', category: 'Verde', icon: '●' },
  { name: 'green-dark', gradient: 'from-green-700 to-green-800', category: 'Verde', icon: '●' },
  { name: 'emerald-pastel', gradient: 'from-emerald-200 to-emerald-300', category: 'Verde', icon: '●' },
  { name: 'emerald-soft', gradient: 'from-emerald-300 to-emerald-400', category: 'Verde', icon: '●' },
  { name: 'emerald-bright', gradient: 'from-emerald-400 to-emerald-500', category: 'Verde', icon: '●' },
  { name: 'emerald-rich', gradient: 'from-emerald-500 to-emerald-600', category: 'Verde', icon: '●' },
  { name: 'emerald-deep', gradient: 'from-emerald-600 to-emerald-700', category: 'Verde', icon: '●' },
  { name: 'lime-pastel', gradient: 'from-lime-200 to-lime-300', category: 'Verde', icon: '●' },
  { name: 'lime-bright', gradient: 'from-lime-300 to-lime-400', category: 'Verde', icon: '●' },
  { name: 'lime-vibrant', gradient: 'from-lime-400 to-lime-500', category: 'Verde', icon: '●' },
  
  // ==================== MÁS AZULES ====================
  { name: 'blue-pastel', gradient: 'from-blue-200 to-blue-300', category: 'Azul', icon: '●' },
  { name: 'blue-soft', gradient: 'from-blue-300 to-blue-400', category: 'Azul', icon: '●' },
  { name: 'blue-bright', gradient: 'from-blue-400 to-blue-500', category: 'Azul', icon: '●' },
  { name: 'blue-vibrant', gradient: 'from-blue-500 to-blue-600', category: 'Azul', icon: '●' },
  { name: 'blue-deep', gradient: 'from-blue-600 to-blue-700', category: 'Azul', icon: '●' },
  { name: 'blue-dark', gradient: 'from-blue-700 to-blue-800', category: 'Azul', icon: '●' },
  { name: 'blue-midnight', gradient: 'from-blue-800 to-blue-900', category: 'Azul', icon: '●' },
  { name: 'sky-pastel', gradient: 'from-sky-200 to-sky-300', category: 'Azul', icon: '●' },
  { name: 'sky-soft', gradient: 'from-sky-300 to-sky-400', category: 'Azul', icon: '●' },
  { name: 'sky-bright', gradient: 'from-sky-400 to-sky-500', category: 'Azul', icon: '●' },
  { name: 'sky-vibrant', gradient: 'from-sky-500 to-sky-600', category: 'Azul', icon: '●' },
  
  // ==================== MÁS CYANS ====================
  { name: 'cyan-pastel', gradient: 'from-cyan-200 to-cyan-300', category: 'Cyan', icon: '●' },
  { name: 'cyan-soft', gradient: 'from-cyan-300 to-cyan-400', category: 'Cyan', icon: '●' },
  { name: 'cyan-bright', gradient: 'from-cyan-400 to-cyan-500', category: 'Cyan', icon: '●' },
  { name: 'cyan-vibrant', gradient: 'from-cyan-500 to-cyan-600', category: 'Cyan', icon: '●' },
  { name: 'cyan-deep', gradient: 'from-cyan-600 to-cyan-700', category: 'Cyan', icon: '●' },
  { name: 'teal-pastel', gradient: 'from-teal-200 to-teal-300', category: 'Cyan', icon: '●' },
  { name: 'teal-soft', gradient: 'from-teal-300 to-teal-400', category: 'Cyan', icon: '●' },
  { name: 'teal-bright', gradient: 'from-teal-400 to-teal-500', category: 'Cyan', icon: '●' },
  { name: 'teal-vibrant', gradient: 'from-teal-500 to-teal-600', category: 'Cyan', icon: '●' },
  { name: 'teal-deep', gradient: 'from-teal-600 to-teal-700', category: 'Cyan', icon: '●' },
  
  // ==================== MÁS ROSAS ====================
  { name: 'pink-pastel', gradient: 'from-pink-200 to-pink-300', category: 'Rosa', icon: '●' },
  { name: 'pink-soft', gradient: 'from-pink-300 to-pink-400', category: 'Rosa', icon: '●' },
  { name: 'pink-bright', gradient: 'from-pink-400 to-pink-500', category: 'Rosa', icon: '●' },
  { name: 'pink-vibrant', gradient: 'from-pink-500 to-pink-600', category: 'Rosa', icon: '●' },
  { name: 'pink-deep', gradient: 'from-pink-600 to-pink-700', category: 'Rosa', icon: '●' },
  { name: 'rose-pastel', gradient: 'from-rose-200 to-rose-300', category: 'Rosa', icon: '●' },
  { name: 'rose-soft', gradient: 'from-rose-300 to-rose-400', category: 'Rosa', icon: '●' },
  { name: 'rose-bright', gradient: 'from-rose-400 to-rose-500', category: 'Rosa', icon: '●' },
  { name: 'rose-vibrant', gradient: 'from-rose-500 to-rose-600', category: 'Rosa', icon: '●' },
  { name: 'fuchsia-pastel', gradient: 'from-fuchsia-200 to-fuchsia-300', category: 'Rosa', icon: '●' },
  { name: 'fuchsia-soft', gradient: 'from-fuchsia-300 to-fuchsia-400', category: 'Rosa', icon: '●' },
  { name: 'fuchsia-bright', gradient: 'from-fuchsia-400 to-fuchsia-500', category: 'Rosa', icon: '●' },
  { name: 'fuchsia-vibrant', gradient: 'from-fuchsia-500 to-fuchsia-600', category: 'Rosa', icon: '●' },
  { name: 'fuchsia-deep', gradient: 'from-fuchsia-600 to-fuchsia-700', category: 'Rosa', icon: '●' },
  { name: 'magenta-soft', gradient: 'from-fuchsia-300 via-pink-400 to-fuchsia-400', category: 'Rosa', icon: '●' },
  { name: 'magenta-bright', gradient: 'from-fuchsia-400 via-pink-500 to-fuchsia-500', category: 'Rosa', icon: '●' },
  
  // ==================== MÁS ROJOS ====================
  { name: 'red-pastel', gradient: 'from-red-200 to-red-300', category: 'Rojo', icon: '●' },
  { name: 'red-soft', gradient: 'from-red-300 to-red-400', category: 'Rojo', icon: '●' },
  { name: 'red-bright', gradient: 'from-red-400 to-red-500', category: 'Rojo', icon: '●' },
  { name: 'red-vibrant', gradient: 'from-red-500 to-red-600', category: 'Rojo', icon: '●' },
  { name: 'red-deep', gradient: 'from-red-600 to-red-700', category: 'Rojo', icon: '●' },
  { name: 'red-dark', gradient: 'from-red-700 to-red-800', category: 'Rojo', icon: '●' },
  { name: 'red-crimson', gradient: 'from-red-800 to-red-900', category: 'Rojo', icon: '●' },
  
  // ==================== MÁS GRISES ====================
  { name: 'gray-light', gradient: 'from-gray-100 to-gray-200', category: 'Gris', icon: '●' },
  { name: 'gray-soft', gradient: 'from-gray-200 to-gray-300', category: 'Gris', icon: '●' },
  { name: 'gray-medium', gradient: 'from-gray-300 to-gray-400', category: 'Gris', icon: '●' },
  { name: 'gray-steel', gradient: 'from-gray-400 to-gray-500', category: 'Gris', icon: '●' },
  { name: 'gray-dark', gradient: 'from-gray-500 to-gray-600', category: 'Gris', icon: '●' },
  { name: 'gray-charcoal', gradient: 'from-gray-600 to-gray-700', category: 'Gris', icon: '●' },
  { name: 'gray-deep', gradient: 'from-gray-700 to-gray-800', category: 'Gris', icon: '●' },
  { name: 'gray-night', gradient: 'from-gray-800 to-gray-900', category: 'Gris', icon: '●' },
  { name: 'slate-light', gradient: 'from-slate-200 to-slate-300', category: 'Gris', icon: '●' },
  { name: 'slate-medium', gradient: 'from-slate-300 to-slate-400', category: 'Gris', icon: '●' },
  { name: 'slate-steel', gradient: 'from-slate-400 to-slate-500', category: 'Gris', icon: '●' },
  { name: 'slate-dark', gradient: 'from-slate-500 to-slate-600', category: 'Gris', icon: '●' },
  { name: 'slate-charcoal', gradient: 'from-slate-600 to-slate-700', category: 'Gris', icon: '●' },
  { name: 'slate-deep', gradient: 'from-slate-700 to-slate-800', category: 'Gris', icon: '●' },
];

// Crear un mapa por nombre para búsqueda rápida
export const COLOR_SCHEME_MAP = ALL_COLOR_SCHEMES.reduce((map, scheme) => {
  map[scheme.name] = scheme;
  return map;
}, {} as Record<string, ColorScheme>);

// Funciones de utilidad
export function getColorSchemeGradient(schemeName: string): string {
  const scheme = COLOR_SCHEME_MAP[schemeName];
  return scheme ? scheme.gradient : COLOR_SCHEME_MAP['cosmic']?.gradient || 'from-purple-500 to-indigo-500';
}

// Función para obtener gradientes con opacidad (para fondos de tarjetas)
export function getColorSchemeWithOpacity(schemeName: string, opacity: number = 20): string {
  const baseGradient = getColorSchemeGradient(schemeName);
  // Agregar opacidad a cada color en el gradiente
  return baseGradient.replace(/(from-[a-z-]+)-(\d+)/g, `$1-$2/${opacity}`)
                    .replace(/(via-[a-z-]+)-(\d+)/g, `$1-$2/${opacity}`)
                    .replace(/(to-[a-z-]+)-(\d+)/g, `$1-$2/${opacity}`);
}

// Función para obtener colores de acento (para iconos, bordes, etc.)
export function getAccentColors(schemeName: string) {
  const scheme = COLOR_SCHEME_MAP[schemeName];
  if (!scheme) {
    return { primary: 'purple-400', secondary: 'pink-400', text: 'purple-200' };
  }
  
  // Extraer el primer color del gradiente para usarlo como acento
  const gradient = scheme.gradient;
  const firstColorMatch = gradient.match(/from-([a-z-]+)-(\d+)/);
  
  if (firstColorMatch) {
    const colorName = firstColorMatch[1];
    const intensity = parseInt(firstColorMatch[2]);
    
    return {
      primary: `${colorName}-${Math.min(intensity + 100, 600)}`,
      secondary: `${colorName}-${Math.max(intensity - 100, 200)}`,
      text: `${colorName}-${Math.max(intensity - 200, 100)}`
    };
  }
  
  // Fallback
  return { primary: 'purple-400', secondary: 'pink-400', text: 'purple-200' };
}

// Función para obtener variante más suave del gradiente (para encabezados)
export function getSoftColorScheme(schemeName: string): string {
  const baseGradient = getColorSchemeGradient(schemeName);
  
  // Hacer el gradiente más suave reduciendo la intensidad
  return baseGradient.replace(/-(\d+)/g, (match, intensity) => {
    const newIntensity = Math.max(200, parseInt(intensity) - 200);
    return `-${newIntensity}`;
  });
}