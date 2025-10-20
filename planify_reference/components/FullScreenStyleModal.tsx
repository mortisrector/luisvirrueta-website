'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { X, Check, Search, Palette, Briefcase, GraduationCap, Home, Heart, DollarSign, Plane, Camera, MessageCircle, Settings, Crown, Trophy, Target, Zap, Code, Dumbbell } from 'lucide-react';
import { ALL_COLOR_SCHEMES, getSoftColorScheme, getColorSchemeGradient } from '@/lib/colorSchemes';

type ModalType = 'project' | 'folder';

interface FullScreenStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  title?: string;
  currentIcon?: string;
  currentColorScheme?: string;
  onSave: (data: { icon: string; colorScheme: string; title?: string }) => void;
}

export default function FullScreenStyleModal({
  isOpen,
  onClose,
  type,
  title,
  currentIcon = 'FolderOpen',
  currentColorScheme = 'default',
  onSave,
}: FullScreenStyleModalProps) {
  const [tab, setTab] = useState<'colors' | 'icons'>('colors');
  const [selectedColor, setSelectedColor] = useState<string>(currentColorScheme);
  const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon);
  const [iconQuery, setIconQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTab('colors');
      setIconQuery('');
      setSelectedColor(currentColorScheme);
      setSelectedIcon(currentIcon);
      // Bloquear scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, currentColorScheme, currentIcon]);

  // Lista de iconos simplificada y más robusta
  const ICON_NAMES = useMemo(() => {
    try {
      const names = Object.keys(Icons).filter((k) => {
        if (!/^[A-Z]/.test(k)) return false;
        const val: any = (Icons as any)[k];
        const t = typeof val;
        return (t === 'function' || (t === 'object' && val && (val.render || val.$$typeof)));
      });
      
      if (!names || names.length === 0) {
        // Iconos básicos como fallback
        return [
          'Crown','Trophy','Star','Diamond','Award','Rocket','Heart','Shield','Target',
          'Briefcase','Calendar','Clock','Check','BookOpen','Folder','DollarSign','Code',
          'Settings','Music','Camera','Dumbbell','Plane','Home','GraduationCap','MessageCircle'
        ];
      }
      
      return names;
    } catch (error) {
      console.warn('Error loading icons:', error);
      return [
        'Crown','Trophy','Star','Diamond','Award','Rocket','Heart','Shield','Target',
        'Briefcase','Calendar','Clock','Check','BookOpen','Folder','DollarSign','Code',
        'Settings','Music','Camera','Dumbbell','Plane','Home','GraduationCap','MessageCircle'
      ];
    }
  }, []);

  // Colección exclusiva de 50 iconos únicos, vistosos y elegantes
  const allBeautifulIcons = useMemo(() => [
    // 💎 PREMIUM Y ELEGANTES (10 iconos)
    'Crown',        // Corona real
    'Diamond',      // Diamante brillante
    'Gem',          // Gema preciosa
    'Trophy',       // Trofeo de oro
    'Award',        // Premio elegante
    'Shield',       // Escudo protector
    'Key',          // Llave dorada
    'Ring',         // Anillo de compromiso
    'Watch',        // Reloj de lujo
    'Briefcase',    // Maletín ejecutivo

    // ✨ MÁGICOS Y MÍSTICOS (10 iconos)
    'Sparkles',     // Destellos mágicos
    'Star',         // Estrella brillante
    'Moon',         // Luna creciente
    'Sun',          // Sol radiante
    'Zap',          // Rayo eléctrico
    'Flame',        // Llama ardiente
    'Eye',          // Ojo místico
    'Atom',         // Átomo científico
    'Infinity',     // Símbolo infinito
    'Wand2',        // Varita mágica

    // 🌸 NATURALEZA HERMOSA (10 iconos)
    'Rose',         // Rosa elegante
    'Butterfly',    // Mariposa colorida
    'Tree',         // Árbol frondoso
    'Flower',       // Flor delicada
    'Leaf',         // Hoja natural
    'Mountain',     // Montaña majestuosa
    'Waves',        // Olas del mar
    'Rainbow',      // Arcoíris colorido
    'Snowflake',    // Copo de nieve
    'Cherry',       // Cereza dulce

    // � CREATIVOS Y ARTÍSTICOS (10 iconos)
    'Palette',      // Paleta de pintor
    'Camera',       // Cámara fotográfica
    'Music',        // Nota musical
    'Paintbrush',   // Pincel artístico
    'Film',         // Película de cine
    'Headphones',   // Auriculares modernos
    'Mic',          // Micrófono profesional
    'Guitar',       // Guitarra acústica
    'Image',        // Marco de imagen
    'Video',        // Cámara de video

    // 🚀 MODERNOS Y TECNOLÓGICOS (10 iconos)
    'Rocket',       // Cohete espacial
    'Smartphone',   // Teléfono inteligente
    'Laptop',       // Computadora portátil
    'Cloud',        // Nube digital
    'Wifi',         // Señal inalámbrica
    'Battery',      // Batería cargada
    'Lightbulb',    // Bombilla innovadora
    'Globe',        // Globo terráqueo
    'Satellite',    // Satélite espacial
    'Code',         // Código de programación

    // 🎯 DEPORTES Y AVENTURA (10 iconos)
    'Target',       // Diana de tiro
    'Dumbbell',     // Pesa de gimnasio
    'Activity',     // Monitor de actividad
    'Compass',      // Brújula de aventura
    'Tent',         // Carpa de campamento
    'Anchor',       // Ancla marina
    'Plane',        // Avión de viaje
    'Ship',         // Barco navegante
    'Bike',         // Bicicleta deportiva
    'Gamepad2',     // Control de videojuegos

    // 🏠 HOGAR Y LIFESTYLE (10 iconos)
    'Home',         // Casa familiar
    'Coffee',       // Taza de café
    'Wine',         // Copa de vino
    'Cake',         // Pastel de celebración
    'Gift',         // Regalo envuelto
    'Book',         // Libro abierto
    'Sofa',         // Sofá cómodo
    'Bed',          // Cama confortable
    'Utensils',     // Cubiertos elegantes
    'ChefHat',      // Gorro de chef

    // 💼 NEGOCIOS Y FINANZAS (10 iconos)
    'TrendingUp',   // Gráfico ascendente
    'PieChart',     // Gráfico circular
    'BarChart3',    // Gráfico de barras
    'Calculator',   // Calculadora
    'CreditCard',   // Tarjeta de crédito
    'Wallet',       // Billetera
    'Building2',    // Edificio corporativo
    'Handshake',    // Apretón de manos
    'FileText',     // Documento
    'Stamp',        // Sello oficial

    // 🎭 ENTRETENIMIENTO Y CULTURA (10 iconos)
    'Masks',        // Máscaras teatrales
    'Drama',        // Teatro dramático
    'Popcorn',      // Palomitas de cine
    'Tickets',      // Boletos de evento
    'PartyPopper',  // Confeti de fiesta
    'Balloon',      // Globo de celebración
    'Disco',        // Bola de discoteca
    'Clapperboard', // Claqueta de cine
    'Microphone',   // Micrófono de escenario
    'Trumpet',      // Trompeta musical

    // ⚕️ SALUD Y BIENESTAR (10 iconos)
    'Heart',        // Corazón saludable
    'Stethoscope',  // Estetoscopio médico
    'Pill',         // Pastilla medicinal
    'Syringe',      // Jeringa médica
    'Thermometer',  // Termómetro
    'Brain',        // Cerebro pensante
    'Accessibility', // Accesibilidad
    'Smile',        // Sonrisa feliz
    'Yoga',         // Postura de yoga
    'Meditation',   // Meditación zen

    // 🌟 SÍMBOLOS Y FORMAS (10 iconos)
    'Hexagon',      // Hexágono geométrico
    'Pentagon',     // Pentágono
    'Octagon',      // Octágono
    'Triangle',     // Triángulo
    'Square',       // Cuadrado
    'Circle',       // Círculo perfecto
    'Hash',         // Símbolo de hashtag
    'AtSign',       // Símbolo arroba
    'Percent',      // Símbolo porcentaje
    'Plus',         // Símbolo más

    // 🚗 TRANSPORTE Y MOVILIDAD (10 iconos)
    'Car',          // Automóvil
    'Bus',          // Autobús público
    'Train',        // Tren de pasajeros
    'Truck',        // Camión de carga
    'Motorcycle',   // Motocicleta
    'Scooter',      // Scooter eléctrico
    'Taxi',         // Taxi amarillo
    'PlaneTakeoff', // Avión despegando
    'PlaneLanding', // Avión aterrizando
    'MapPin'        // Pin de ubicación
  ], []);

  // Filtrar iconos basado en búsqueda - SIN categorías
  const iconNamesForUI = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    const filtered = q ? allBeautifulIcons.filter((name: string) => name.toLowerCase().includes(q)) : allBeautifulIcons;
    return filtered;
  }, [allBeautifulIcons, iconQuery]);

  // Colección de colores vibrantes inspirada en las tarjetas de la imagen
  const vibrantColorSchemes = useMemo(() => [
    // Colores base de la imagen - Morado vibrante y Cyan
    { name: 'vibrant-purple', gradient: 'from-purple-500 via-purple-600 to-violet-700', category: 'Vibrantes' },
    { name: 'vibrant-cyan', gradient: 'from-cyan-400 via-cyan-500 to-teal-600', category: 'Vibrantes' },
    
    // Variaciones de morados vibrantes
    { name: 'electric-purple', gradient: 'from-purple-400 via-violet-500 to-purple-700', category: 'Morados' },
    { name: 'royal-purple', gradient: 'from-indigo-500 via-purple-600 to-violet-700', category: 'Morados' },
    { name: 'cosmic-purple', gradient: 'from-violet-500 via-purple-600 to-fuchsia-700', category: 'Morados' },
    { name: 'neon-purple', gradient: 'from-purple-400 via-fuchsia-500 to-purple-600', category: 'Morados' },
    { name: 'deep-violet', gradient: 'from-violet-600 via-purple-700 to-indigo-800', category: 'Morados' },
    
    // Variaciones de cyans y turquesas
    { name: 'electric-cyan', gradient: 'from-cyan-300 via-cyan-500 to-blue-600', category: 'Cyans' },
    { name: 'ocean-turquoise', gradient: 'from-teal-400 via-cyan-500 to-blue-600', category: 'Cyans' },
    { name: 'neon-teal', gradient: 'from-emerald-400 via-teal-500 to-cyan-600', category: 'Cyans' },
    { name: 'aqua-blue', gradient: 'from-sky-400 via-cyan-500 to-teal-600', category: 'Cyans' },
    { name: 'tropical-cyan', gradient: 'from-cyan-400 via-teal-500 to-emerald-600', category: 'Cyans' },
    
    // Rosas y magentas vibrantes
    { name: 'hot-pink', gradient: 'from-pink-400 via-pink-500 to-rose-600', category: 'Rosas' },
    { name: 'electric-magenta', gradient: 'from-fuchsia-400 via-pink-500 to-purple-600', category: 'Rosas' },
    { name: 'neon-rose', gradient: 'from-rose-400 via-pink-500 to-fuchsia-600', category: 'Rosas' },
    { name: 'vibrant-pink', gradient: 'from-pink-500 via-rose-500 to-red-600', category: 'Rosas' },
    
    // Azules eléctricos
    { name: 'electric-blue', gradient: 'from-blue-400 via-blue-500 to-indigo-600', category: 'Azules' },
    { name: 'neon-blue', gradient: 'from-sky-400 via-blue-500 to-violet-600', category: 'Azules' },
    { name: 'royal-blue', gradient: 'from-blue-500 via-indigo-600 to-purple-700', category: 'Azules' },
    { name: 'sapphire-blue', gradient: 'from-blue-600 via-blue-700 to-indigo-800', category: 'Azules' },
    
    // Verdes vibrantes
    { name: 'electric-green', gradient: 'from-green-400 via-emerald-500 to-teal-600', category: 'Verdes' },
    { name: 'neon-lime', gradient: 'from-lime-400 via-green-500 to-emerald-600', category: 'Verdes' },
    { name: 'forest-emerald', gradient: 'from-emerald-500 via-green-600 to-teal-700', category: 'Verdes' },
    { name: 'jade-green', gradient: 'from-teal-400 via-emerald-500 to-green-600', category: 'Verdes' },
    
    // Naranjas y amarillos eléctricos
    { name: 'electric-orange', gradient: 'from-orange-400 via-orange-500 to-red-600', category: 'Cálidos' },
    { name: 'sunset-orange', gradient: 'from-yellow-400 via-orange-500 to-red-600', category: 'Cálidos' },
    { name: 'golden-yellow', gradient: 'from-yellow-400 via-amber-500 to-orange-600', category: 'Cálidos' },
    { name: 'fire-orange', gradient: 'from-orange-500 via-red-500 to-pink-600', category: 'Cálidos' },
    
    // Gradientes únicos y especiales
    { name: 'aurora-borealis', gradient: 'from-green-400 via-cyan-500 to-purple-600', category: 'Especiales' },
    { name: 'sunset-dream', gradient: 'from-orange-400 via-pink-500 to-purple-600', category: 'Especiales' },
    { name: 'ocean-sunset', gradient: 'from-cyan-400 via-blue-500 to-purple-600', category: 'Especiales' },
    { name: 'rainbow-bridge', gradient: 'from-pink-400 via-purple-500 to-cyan-600', category: 'Especiales' },
    { name: 'cosmic-nebula', gradient: 'from-indigo-400 via-purple-500 to-pink-600', category: 'Especiales' },
    { name: 'electric-storm', gradient: 'from-blue-400 via-cyan-500 to-teal-600', category: 'Especiales' },
    { name: 'neon-nights', gradient: 'from-fuchsia-400 via-purple-500 to-blue-600', category: 'Especiales' },
    { name: 'crystal-prism', gradient: 'from-violet-400 via-blue-500 to-cyan-600', category: 'Especiales' },

    // Colores tierra y naturales
    { name: 'mountain-stone', gradient: 'from-slate-400 via-gray-500 to-zinc-600', category: 'Naturales' },
    { name: 'forest-moss', gradient: 'from-stone-400 via-green-600 to-emerald-700', category: 'Naturales' },
    { name: 'desert-sand', gradient: 'from-amber-300 via-yellow-400 to-orange-500', category: 'Naturales' },
    { name: 'ocean-depth', gradient: 'from-slate-600 via-blue-700 to-indigo-800', category: 'Naturales' },
    { name: 'autumn-leaves', gradient: 'from-orange-600 via-red-600 to-yellow-600', category: 'Naturales' },
    { name: 'winter-frost', gradient: 'from-blue-100 via-slate-200 to-gray-300', category: 'Naturales' },

    // Colores urbanos y modernos
    { name: 'neon-city', gradient: 'from-purple-500 via-pink-400 to-cyan-400', category: 'Urbanos' },
    { name: 'chrome-steel', gradient: 'from-gray-400 via-slate-500 to-zinc-600', category: 'Urbanos' },
    { name: 'led-blue', gradient: 'from-blue-300 via-cyan-400 to-sky-500', category: 'Urbanos' },
    { name: 'traffic-light', gradient: 'from-red-500 via-yellow-400 to-green-500', category: 'Urbanos' },
    { name: 'hologram', gradient: 'from-purple-300 via-blue-400 to-cyan-300', category: 'Urbanos' },
    { name: 'matrix-green', gradient: 'from-green-600 via-lime-500 to-emerald-400', category: 'Urbanos' },

    // Colores food & lifestyle
    { name: 'strawberry-cream', gradient: 'from-red-300 via-pink-300 to-rose-200', category: 'Lifestyle' },
    { name: 'mint-chocolate', gradient: 'from-green-300 via-emerald-400 to-stone-600', category: 'Lifestyle' },
    { name: 'caramel-latte', gradient: 'from-amber-400 via-orange-300 to-yellow-200', category: 'Lifestyle' },
    { name: 'blueberry-pie', gradient: 'from-blue-400 via-indigo-500 to-purple-400', category: 'Lifestyle' },
    { name: 'lavender-honey', gradient: 'from-purple-200 via-violet-300 to-yellow-200', category: 'Lifestyle' },
    { name: 'mango-passion', gradient: 'from-yellow-400 via-orange-400 to-red-400', category: 'Lifestyle' },

    // Colores místicos y espirituales
    { name: 'moonlight-silver', gradient: 'from-slate-300 via-blue-200 to-indigo-300', category: 'Místicos' },
    { name: 'golden-aura', gradient: 'from-yellow-500 via-amber-400 to-orange-400', category: 'Místicos' },
    { name: 'crystal-meditation', gradient: 'from-violet-200 via-purple-300 to-blue-200', category: 'Místicos' },
    { name: 'sage-wisdom', gradient: 'from-green-300 via-teal-400 to-cyan-300', category: 'Místicos' },
    { name: 'phoenix-fire', gradient: 'from-red-600 via-orange-500 to-yellow-400', category: 'Místicos' },
    { name: 'deep-space', gradient: 'from-indigo-900 via-purple-800 to-blue-900', category: 'Místicos' },

    // Colores artísticos y creativos
    { name: 'watercolor-dream', gradient: 'from-blue-200 via-purple-200 to-pink-200', category: 'Artísticos' },
    { name: 'oil-painting', gradient: 'from-red-500 via-orange-600 to-yellow-500', category: 'Artísticos' },
    { name: 'pastel-rainbow', gradient: 'from-pink-200 via-blue-200 to-green-200', category: 'Artísticos' },
    { name: 'graffiti-wall', gradient: 'from-lime-400 via-cyan-500 to-fuchsia-500', category: 'Artísticos' },
    { name: 'vintage-sepia', gradient: 'from-amber-600 via-orange-700 to-red-800', category: 'Artísticos' },
    { name: 'neon-art', gradient: 'from-green-400 via-pink-500 to-blue-500', category: 'Artísticos' },

    // Colores premium y lujo
    { name: 'diamond-white', gradient: 'from-gray-100 via-slate-200 to-zinc-300', category: 'Premium' },
    { name: 'platinum-silver', gradient: 'from-slate-400 via-gray-300 to-zinc-400', category: 'Premium' },
    { name: 'rose-gold', gradient: 'from-pink-300 via-rose-400 to-orange-300', category: 'Premium' },
    { name: 'champagne-bubbles', gradient: 'from-yellow-200 via-amber-300 to-orange-200', category: 'Premium' },
    { name: 'black-pearl', gradient: 'from-gray-800 via-slate-700 to-zinc-800', category: 'Premium' },
    { name: 'royal-velvet', gradient: 'from-purple-800 via-indigo-700 to-violet-800', category: 'Premium' },

    // Colores futuristas y tech
    { name: 'cyber-punk', gradient: 'from-fuchsia-500 via-purple-600 to-cyan-500', category: 'Futuristas' },
    { name: 'quantum-blue', gradient: 'from-blue-600 via-indigo-700 to-purple-600', category: 'Futuristas' },
    { name: 'laser-red', gradient: 'from-red-600 via-pink-500 to-rose-500', category: 'Futuristas' },
    { name: 'plasma-green', gradient: 'from-lime-500 via-green-600 to-emerald-600', category: 'Futuristas' },
    { name: 'holographic', gradient: 'from-cyan-400 via-purple-500 to-pink-400', category: 'Futuristas' },
    { name: 'digital-orange', gradient: 'from-orange-500 via-red-500 to-pink-500', category: 'Futuristas' }
  ], []);

  // Usar la nueva colección vibrante
  const filteredColorSchemes = vibrantColorSchemes;

  const SelectedIconComponent = (Icons as any)[selectedIcon] || (Icons as any)['FolderOpen'];

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 animate-in fade-in duration-300" style={{ position: 'fixed', width: '100vw', height: '100vh' }}>

      
      {/* Particulas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-violet-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="flex flex-col h-full w-full overflow-hidden relative z-10" style={{ maxHeight: '100vh' }}>
        {/* Header Premium con vista previa en tiempo real */}
        <div className="flex flex-col items-center text-center px-6 pt-8 pb-6">
          {/* Vista previa del ícono con color seleccionado */}
          <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${getColorSchemeGradient(selectedColor)} flex items-center justify-center mb-4 shadow-2xl transition-all duration-500`}>
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${getSoftColorScheme(selectedColor)} blur-xl opacity-50 transition-all duration-500`}></div>
            <div className="relative z-10 transition-all duration-300">
              {SelectedIconComponent && <SelectedIconComponent className="w-10 h-10 text-white" />}
            </div>
          </div>
          
          {/* Título más compacto */}
          <h1 className="text-xl font-bold text-white mb-1">
            Personalizar {type === 'folder' ? 'Carpeta' : 'Proyecto'}
          </h1>
          <p className="text-white/50 text-sm mb-6">
            Toca para seleccionar
          </p>
          
          {/* Botón cerrar elegante */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
          >
            <X className="w-5 h-5 text-white group-hover:text-white/90" />
          </button>
        </div>

        {/* Tabs elegantes con estilo premium */}
        <div className="mx-6 mb-6 p-1.5 rounded-2xl bg-black/30 backdrop-blur-xl flex gap-2 border border-white/10 overflow-hidden">
          <button
            className={`flex-1 py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group ${
              tab === 'colors' 
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/30' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setTab('colors')}
            title="Seleccionar Colores"
          >
            {tab === 'colors' && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            )}
            <Palette className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Colores</span>
          </button>
          <button
            className={`flex-1 py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group ${
              tab === 'icons' 
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/30' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setTab('icons')}
            title="Seleccionar Íconos"
          >
            {tab === 'icons' && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            )}
            <Settings className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Íconos</span>
          </button>
        </div>

        {/* Content area sin scroll; todo filtrado */}
        <div className="flex-1 px-4 flex flex-col min-h-0">
          {tab === 'colors' ? (
            <div className="flex flex-col h-full">
              {/* Grid de colores elegante y compacto */}
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-3 pb-4">
                  {filteredColorSchemes.map((scheme: any) => (
                    <button
                      key={scheme.name}
                      onClick={() => setSelectedColor(scheme.name)}
                      className={`relative aspect-square rounded-2xl border-2 transition-all duration-300 group ${
                        selectedColor === scheme.name 
                          ? 'border-white ring-2 ring-white/40 scale-95 shadow-xl' 
                          : 'border-white/20 hover:border-white/40 hover:scale-110 hover:shadow-lg'
                      } bg-gradient-to-br ${scheme.gradient} flex items-center justify-center overflow-hidden`}
                      title={scheme.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    >
                      {/* Efecto de brillo sutil */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Checkmark elegante */}
                      {selectedColor === scheme.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-gray-800 font-bold" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Búsqueda elegante y minimalista */}
              <div className="mb-4 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                  <Search className="w-4 h-4 text-white/40" />
                </div>
                <input
                  value={iconQuery}
                  onChange={(e) => setIconQuery(e.target.value)}
                  placeholder="Buscar ícono..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/15 text-white placeholder-white/40 outline-none focus:bg-white/12 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                />
                {iconQuery && (
                  <button
                    onClick={() => setIconQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                )}
              </div>

              {/* Sin categorías - todos los iconos en una pantalla */}

              {/* Grid masivo de 100 iconos únicos */}
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-12 gap-3 pb-4 max-w-6xl mx-auto">
                  {iconNamesForUI.map((name: string) => {
                    const IconComp = (Icons as any)[name];
                    if (!IconComp) return null;
                    const active = selectedIcon === name;
                    return (
                      <button
                        key={name}
                        onClick={() => setSelectedIcon(name)}
                        className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-300 group ${
                          active 
                            ? `bg-gradient-to-br ${getColorSchemeGradient(selectedColor)} text-white border-white/40 scale-95 shadow-xl ring-2 ring-white/30` 
                            : 'bg-white/8 text-white/70 border-white/15 hover:bg-white/15 hover:border-white/25 hover:scale-110 hover:text-white/90'
                        }`}
                        title={name.replace(/([A-Z])/g, ' $1').trim()}
                      >
                        <IconComp className={`transition-all duration-300 ${
                          active ? 'w-7 h-7 scale-110' : 'w-6 h-6 group-hover:scale-125'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer minimalista y elegante */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl p-4">
          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-medium transition-all duration-200 border border-white/20 hover:border-white/30 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={() => onSave({ icon: selectedIcon, colorScheme: selectedColor })}
              className={`relative flex-1 py-3 px-4 bg-gradient-to-r ${getColorSchemeGradient(selectedColor)} hover:opacity-90 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg flex items-center justify-center gap-2 overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <Check className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Aplicar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar usando Portal para salir del DOM tree del componente padre
  return createPortal(modalContent, document.body);
}
