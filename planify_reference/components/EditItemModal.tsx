/**
 * Modal para editar proyectos y carpetas
 * Permite modificar título, descripción, icono y colores
 */

import { useState } from 'react';
import { X, Save, Folder, Briefcase } from 'lucide-react';
import { Project, Folder as FolderType } from '@/types';
import { capitalizeFirst } from '@/utils/textUtils';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    name: string;
    description: string;
    icon: string;
    colorScheme: string;
  }) => void;
  item: Project | FolderType | null;
  itemType: 'project' | 'folder';
}

const AVAILABLE_ICONS = [
  '📋', '🚀', '💼', '🎯', '📊', '🔥', '⭐', '💎',
  '🏆', '🎨', '💡', '🔧', '📱', '💻', '🌟', '⚡'
];

const COLOR_SCHEMES = [
  { name: 'Azul', value: 'blue' },
  { name: 'Verde', value: 'green' },
  { name: 'Morado', value: 'purple' },
  { name: 'Rosa', value: 'pink' },
  { name: 'Naranja', value: 'orange' },
  { name: 'Rojo', value: 'red' },
  { name: 'Cyan', value: 'cyan' },
  { name: 'Amarillo', value: 'yellow' }
];

export default function EditItemModal({
  isOpen,
  onClose,
  onSave,
  item,
  itemType
}: EditItemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📋');
  const [selectedColorScheme, setSelectedColorScheme] = useState('blue');

  // Initialize form when item changes
  useState(() => {
    if (item) {
      setTitle(itemType === 'project' ? (item as Project).title : (item as FolderType).name);
      setDescription(itemType === 'project' ? (item as Project).description || '' : (item as FolderType).description || '');
      setSelectedIcon(item.icon || '📋');
      setSelectedColorScheme(item.colorScheme || 'blue');
    }
  });

  if (!isOpen || !item) return null;

  const handleSave = () => {
    const data = {
      title: title.trim(),
      name: title.trim(), // For folders
      description: description.trim(),
      icon: selectedIcon,
      colorScheme: selectedColorScheme
    };
    
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mx-4 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              {itemType === 'project' ? (
                <Briefcase className="w-5 h-5 text-blue-400" />
              ) : (
                <Folder className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Editar {itemType === 'project' ? 'Proyecto' : 'Carpeta'}
              </h3>
              <p className="text-white/60 text-sm">
                Personaliza la información
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white/80 font-medium mb-2">
              {itemType === 'project' ? 'Nombre del proyecto' : 'Nombre de la carpeta'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(capitalizeFirst(e.target.value))}
              placeholder={itemType === 'project' ? 'Ej: Aplicación móvil' : 'Ej: Proyectos personales'}
              className="
                w-full px-4 py-3 rounded-xl border border-white/20 
                bg-white/5 backdrop-blur-sm text-white placeholder-white/40
                focus:outline-none focus:border-blue-500/50 focus:bg-white/10
                transition-all duration-200
              "
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 font-medium mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción..."
              rows={3}
              className="
                w-full px-4 py-3 rounded-xl border border-white/20 
                bg-white/5 backdrop-blur-sm text-white placeholder-white/40
                focus:outline-none focus:border-blue-500/50 focus:bg-white/10
                transition-all duration-200 resize-none
              "
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-white/80 font-medium mb-3">
              Icono
            </label>
            <div className="grid grid-cols-8 gap-2">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`
                    w-10 h-10 rounded-lg text-xl transition-all duration-200
                    ${selectedIcon === icon 
                      ? 'bg-blue-500/30 border-2 border-blue-400' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme */}
          <div>
            <label className="block text-white/80 font-medium mb-3">
              Esquema de color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_SCHEMES.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColorScheme(color.value)}
                  className={`
                    py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${selectedColorScheme === color.value 
                      ? 'bg-blue-500/30 border border-blue-400 text-blue-300' 
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                    }
                  `}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="
              flex-1 py-3 px-4 rounded-xl border border-white/20 
              bg-white/5 hover:bg-white/10 text-white/80 hover:text-white 
              font-medium transition-all duration-200
            "
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="
              flex-1 py-3 px-4 rounded-xl border border-blue-500/30 
              bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 
              font-medium transition-all duration-200 flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}