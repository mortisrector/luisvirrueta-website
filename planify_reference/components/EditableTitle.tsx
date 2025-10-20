'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { capitalizeFirst } from '@/utils/textUtils';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  onCancel?: () => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
}

const EditableTitle = memo(function EditableTitle({
  title,
  onSave,
  onCancel,
  className = '',
  placeholder = 'Escribe un título...',
  maxLength = 50
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(true); // Iniciar siempre en modo edición cuando se monta
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(title);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title && trimmed.length <= maxLength) {
      onSave(trimmed);
    }
    setIsEditing(false);
    setEditValue(title);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(title);
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(capitalizeFirst(e.target.value))}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          className={`${className} bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent min-w-0 flex-1`}
          placeholder={placeholder}
          maxLength={maxLength}
        />
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Guardar"
          >
            <Check className="w-4 h-4 text-green-400" />
          </button>
          <button
            onClick={handleCancel}
            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Cancelar"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-0 flex-1 group">
      <span 
        className={`${className} cursor-pointer group-hover:bg-white/10 rounded-lg px-2 py-1 transition-colors min-w-0 flex-1`}
        onClick={handleStartEdit}
        title="Hacer clic para editar"
      >
        {title}
      </span>
      <button
        onClick={handleStartEdit}
        className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Editar título"
      >
        <Edit3 className="w-3 h-3 text-white/70" />
      </button>
    </div>
  );
});

export default EditableTitle;