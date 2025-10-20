'use client';

import { useState, useRef } from 'react';
import { X, Camera, Save, User, MapPin, Mail, Crown } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    avatar: string | null;
    title: string;
    bio: string;
    location: string;
  };
  onSave: (userData: any) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState(user);
  const [previewImage, setPreviewImage] = useState<string | null>(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className={`w-24 h-24 ${previewImage ? 'bg-transparent' : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700'} rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl border-2 border-white/20 overflow-hidden`}>
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                formData.name.split(' ').map(n => n[0]).join('')
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Título profesional
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              placeholder="ej. Desarrollador Senior, Diseñador UX..."
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Biografía
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 resize-none"
              placeholder="Cuéntanos un poco sobre ti..."
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              placeholder="Ciudad, País"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Correo electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white/80 font-medium hover:bg-white/20 hover:text-white transition-all duration-300"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}