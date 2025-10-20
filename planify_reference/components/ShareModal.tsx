'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Users, 
  Mail, 
  Copy, 
  Share2, 
  Globe, 
  Lock, 
  Eye,
  UserPlus,
  Crown,
  Shield,
  CheckCircle,
  Link,
  QrCode,
  Download,
  Clock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Project, Folder, DailyTask } from '@/types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Project | Folder | DailyTask | null;
  itemType: 'project' | 'folder' | 'task';
  onShare: (shareData: ShareData) => void;
}

interface ShareData {
  itemId: string;
  itemType: 'project' | 'folder' | 'task';
  shareType: 'public-link' | 'private-invite' | 'team-collaboration' | 'qr-code';
  permissions: 'view' | 'edit' | 'admin';
  invitedUsers: string[];
  publicAccess: boolean;
  expiresAt?: Date;
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
}

export default function ShareModal({ isOpen, onClose, item, itemType, onShare }: ShareModalProps) {
  const [shareType, setShareType] = useState<'public-link' | 'private-invite' | 'team-collaboration' | 'qr-code'>('private-invite');
  const [permissions, setPermissions] = useState<'view' | 'edit' | 'admin'>('view');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [publicAccess, setPublicAccess] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [qrMode, setQrMode] = useState<'share' | 'scan'>('share'); // Nuevo estado para QR
  const [scannedData, setScannedData] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Asegurar que solo se renderiza en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generar token QR único cuando se abre el modal
  useEffect(() => {
    if (isOpen && item) {
      const token = `planify-invite-${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setQrToken(token);
    }
  }, [isOpen, item]);

  if (!isOpen || !item || !mounted) return null;

  const itemTitle = 'title' in item ? item.title : 'name' in item ? item.name : 'Item';

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const shareId = `${Date.now()}-${itemTitle.length}-${item.id}`;
    return `${baseUrl}/shared/${itemType}/${item.id}?share=${shareId}`;
  };

  const generateQRData = () => {
    // Genera un objeto JSON con toda la información necesaria para la invitación
    const qrData = {
      type: 'planify-invitation',
      itemId: item.id,
      itemType: itemType,
      itemName: itemTitle,
      permissions: permissions,
      token: qrToken,
      timestamp: Date.now(),
      expiresAt: Date.now() + (expirationDays * 24 * 60 * 60 * 1000)
    };
    return JSON.stringify(qrData);
  };

  const handleCopyLink = async () => {
    const link = generateShareLink();
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleInviteUser = () => {
    if (!inviteEmail || !inviteFirstName) return;
    
    const fullName = `${inviteFirstName.trim()} ${inviteLastName.trim()}`.trim();
    
    const newUser: User = {
      id: `${Date.now()}-${inviteEmail.length}`,
      name: fullName,
      email: inviteEmail,
      role: permissions as 'admin' | 'editor' | 'viewer'
    };
    
    setInvitedUsers([...invitedUsers, newUser]);
    setInviteEmail('');
    setInviteFirstName('');
    setInviteLastName('');
  };

  const handleRemoveUser = (userId: string) => {
    setInvitedUsers(invitedUsers.filter(user => user.id !== userId));
  };

  const handleShare = () => {
    const shareData: ShareData = {
      itemId: item.id,
      itemType,
      shareType,
      permissions,
      invitedUsers: invitedUsers.map(user => user.email),
      publicAccess,
      expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
      message: inviteMessage
    };
    
    onShare(shareData);
    onClose();
  };

  const getItemIcon = () => {
    switch (itemType) {
      case 'project':
        return <Share2 className="w-6 h-6 text-blue-500" />;
      case 'folder':
        return <Users className="w-6 h-6 text-purple-500" />;
      case 'task':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Share2 className="w-6 h-6 text-gray-500" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  // Renderizar usando portal para que escape cualquier contenedor padre
  const modalContent = (
    <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 animate-in fade-in duration-300">
      {/* Overlay con efecto de cristal y animación */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl animate-in fade-in duration-500"></div>
      
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      
      <div className="absolute inset-0 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Premium - IGUAL QUE QUICK PROJECT */}
        <div className="relative flex flex-col items-center justify-center pt-10 pb-6">
          {/* Icono principal con glow effect */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl opacity-50"></div>
            <Share2 className="w-9 h-9 text-white relative z-10" />
          </div>
          
          <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Compartir {itemType === 'project' ? 'Proyecto' : itemType === 'folder' ? 'Carpeta' : 'Tarea'}</h1>
          <p className="text-white/50 text-sm max-w-md text-center truncate px-4">
            &ldquo;{itemTitle}&rdquo;
          </p>
          
          {/* Botón flotante en esquina superior derecha */}
          <div className="absolute top-6 right-6">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - Scroll area igual que QuickProject */}
        <div className="flex-1 px-6 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
          <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
          
          {/* Share Type Selection - Con las cards elegantes */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl mb-6">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Selecciona el tipo de acceso
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setShareType('private-invite')}
                className={`
                  group relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                  ${shareType === 'private-invite' 
                    ? 'border-blue-400 bg-gradient-to-br from-blue-500/30 to-blue-600/20 shadow-xl shadow-blue-500/20' 
                    : 'border-white/10 hover:border-blue-400/50 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <Mail className={`w-7 h-7 sm:w-8 sm:h-8 mb-3 transition-all duration-300 ${
                    shareType === 'private-invite' ? 'text-blue-300' : 'text-blue-400 group-hover:scale-110'
                  }`} />
                  <h4 className="font-bold text-white text-base sm:text-lg mb-1.5">
                    Invitación privada
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    Invita personas específicas por email con permisos personalizados
                  </p>
                  {shareType === 'private-invite' && (
                    <div className="mt-3 flex items-center gap-2 text-blue-300 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Seleccionado</span>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setShareType('public-link')}
                className={`
                  group relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                  ${shareType === 'public-link' 
                    ? 'border-green-400 bg-gradient-to-br from-green-500/30 to-green-600/20 shadow-xl shadow-green-500/20' 
                    : 'border-white/10 hover:border-green-400/50 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <Link className={`w-7 h-7 sm:w-8 sm:h-8 mb-3 transition-all duration-300 ${
                    shareType === 'public-link' ? 'text-green-300' : 'text-green-400 group-hover:scale-110'
                  }`} />
                  <h4 className="font-bold text-white text-base sm:text-lg mb-1.5">
                    Enlace público
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    Genera un link compartible para cualquier persona con acceso
                  </p>
                  {shareType === 'public-link' && (
                    <div className="mt-3 flex items-center gap-2 text-green-300 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Seleccionado</span>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setShareType('team-collaboration')}
                className={`
                  group relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                  ${shareType === 'team-collaboration' 
                    ? 'border-purple-400 bg-gradient-to-br from-purple-500/30 to-purple-600/20 shadow-xl shadow-purple-500/20' 
                    : 'border-white/10 hover:border-purple-400/50 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <Users className={`w-7 h-7 sm:w-8 sm:h-8 mb-3 transition-all duration-300 ${
                    shareType === 'team-collaboration' ? 'text-purple-300' : 'text-purple-400 group-hover:scale-110'
                  }`} />
                  <h4 className="font-bold text-white text-base sm:text-lg mb-1.5">
                    Colaboración en equipo
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    Crea un espacio colaborativo en tiempo real para tu equipo
                  </p>
                  {shareType === 'team-collaboration' && (
                    <div className="mt-3 flex items-center gap-2 text-purple-300 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Seleccionado</span>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setShareType('qr-code')}
                className={`
                  group relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                  ${shareType === 'qr-code' 
                    ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 shadow-xl shadow-cyan-500/20' 
                    : 'border-white/10 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <QrCode className={`w-7 h-7 sm:w-8 sm:h-8 mb-3 transition-all duration-300 ${
                    shareType === 'qr-code' ? 'text-cyan-300' : 'text-cyan-400 group-hover:scale-110'
                  }`} />
                  <h4 className="font-bold text-white text-base sm:text-lg mb-1.5">
                    Código QR
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    Comparte o únete escaneando un código QR instantáneo
                  </p>
                  {shareType === 'qr-code' && (
                    <div className="mt-3 flex items-center gap-2 text-cyan-300 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Seleccionado</span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Permissions - Diseño mejorado */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl mb-6">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Nivel de permisos
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => setPermissions('view')}
                className={`
                  group relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                  ${permissions === 'view' 
                    ? 'border-blue-400 bg-gradient-to-br from-blue-500/30 to-blue-600/20 shadow-lg shadow-blue-500/20' 
                    : 'border-white/10 hover:border-blue-400/50 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex flex-col items-center text-center gap-2">
                  <Eye className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                    permissions === 'view' ? 'text-blue-300' : 'text-blue-400 group-hover:scale-110'
                  }`} />
                  <p className="font-bold text-white text-sm sm:text-base">Solo ver</p>
                  <p className="text-xs text-white/70">Visualizar sin editar</p>
                </div>
              </button>

              <button
                onClick={() => setPermissions('edit')}
                className={`
                  group relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                  ${permissions === 'edit' 
                    ? 'border-green-400 bg-gradient-to-br from-green-500/30 to-green-600/20 shadow-lg shadow-green-500/20' 
                    : 'border-white/10 hover:border-green-400/50 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex flex-col items-center text-center gap-2">
                  <Shield className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                    permissions === 'edit' ? 'text-green-300' : 'text-green-400 group-hover:scale-110'
                  }`} />
                  <p className="font-bold text-white text-sm sm:text-base">Editar</p>
                  <p className="text-xs text-white/70">Modificar contenido</p>
                </div>
              </button>

              <button
                onClick={() => setPermissions('admin')}
                className={`
                  group relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                  ${permissions === 'admin' 
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 shadow-lg shadow-yellow-500/20' 
                    : 'border-white/10 hover:border-yellow-400/50 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex flex-col items-center text-center gap-2">
                  <Crown className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                    permissions === 'admin' ? 'text-yellow-300' : 'text-yellow-400 group-hover:scale-110'
                  }`} />
                  <p className="font-bold text-white text-sm sm:text-base">Admin</p>
                  <p className="text-xs text-white/70">Control total</p>
                </div>
              </button>
            </div>
          </div>

          {/* Invite Users - Con cards elegantes */}
          {shareType === 'private-invite' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl mb-6">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Invitar colaboradores
                </h3>
              </div>
              
              {/* Campos de nombre y apellido - Mejorado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <span>Nombre</span>
                    <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    placeholder="Juan"
                    className="
                      w-full px-4 py-3.5 rounded-xl border-2 border-white/20
                      bg-white/10 backdrop-blur-sm text-white placeholder-white/40 text-base
                      focus:ring-2 focus:ring-pink-400 focus:border-pink-400
                      transition-all duration-200 hover:border-white/30
                    "
                  />
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    placeholder="Pérez"
                    className="
                      w-full px-4 py-3.5 rounded-xl border-2 border-white/20
                      bg-white/10 backdrop-blur-sm text-white placeholder-white/40 text-base
                      focus:ring-2 focus:ring-pink-400 focus:border-pink-400
                      transition-all duration-200 hover:border-white/30
                    "
                  />
                </div>
              </div>

              {/* Campo de email - Mejorado */}
              <div className="mb-4">
                <label className="block text-white/90 text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>Correo electrónico</span>
                  <span className="text-pink-400">*</span>
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="
                    w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border-2 border-white/20
                    bg-white/10 backdrop-blur-sm text-white placeholder-white/40 text-base sm:text-lg
                    focus:ring-2 focus:ring-pink-400 focus:border-pink-400
                    transition-all duration-200 hover:border-white/30
                  "
                  onKeyPress={(e) => e.key === 'Enter' && inviteEmail && inviteFirstName && handleInviteUser()}
                />
              </div>
              
              <button
                onClick={handleInviteUser}
                disabled={!inviteEmail || !inviteFirstName}
                className="
                  w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600
                  disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all duration-300
                  flex items-center justify-center gap-2.5 hover:shadow-xl hover:shadow-pink-500/30
                  active:scale-95 hover:scale-[1.02] border-2 border-pink-400/30
                "
              >
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base">Añadir colaborador</span>
              </button>

              {/* Invited Users List */}
              {invitedUsers.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-white/70 text-sm font-semibold mb-3">
                    {invitedUsers.length} {invitedUsers.length === 1 ? 'persona invitada' : 'personas invitadas'}
                  </p>
                  {invitedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="
                        flex items-center justify-between p-4 rounded-xl
                        bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20
                        hover:from-white/15 hover:to-white/10 transition-all duration-300 gap-3 group
                      "
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/20">
                          <span className="text-white text-base sm:text-lg font-black">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-white text-sm sm:text-base truncate">{user.name}</p>
                          <p className="text-xs sm:text-sm text-white/60 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                          {getRoleIcon(user.role)}
                          <span className="text-xs font-bold capitalize text-white">
                            {user.role === 'admin' ? 'Admin' : user.role === 'editor' ? 'Editor' : 'Visor'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 hover:border-red-400 flex items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-95"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Public Link */}
          {shareType === 'public-link' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-white">
                  Enlace público generado
                </h4>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={generateShareLink()}
                    readOnly
                    className="
                      w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border-2 border-white/20
                      bg-white/10 backdrop-blur-sm text-white font-mono text-xs sm:text-sm
                      pr-12 hover:border-white/30 transition-all duration-200
                    "
                  />
                  <Link className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                </div>
                <button
                  onClick={handleCopyLink}
                  className="
                    px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                    text-white rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300
                    hover:shadow-xl hover:shadow-green-500/30 active:scale-95 hover:scale-[1.02]
                    border-2 border-green-400/30 whitespace-nowrap
                  "
                >
                  {linkCopied ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <Copy className="w-5 h-5 sm:w-6 sm:h-6" />}
                  <span className="text-sm sm:text-base font-bold">{linkCopied ? '¡Copiado!' : 'Copiar enlace'}</span>
                </button>
              </div>
              <div className="mt-4 p-4 bg-green-500/10 border border-green-400/30 rounded-xl">
                <p className="text-green-300 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Cualquier persona con este enlace podrá acceder con permisos de <strong>{permissions === 'view' ? 'Solo Ver' : permissions === 'edit' ? 'Edición' : 'Admin'}</strong></span>
                </p>
              </div>
            </div>
          )}

          {/* QR Code Section - Diseño mejorado */}
          {shareType === 'qr-code' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-white">
                  Acceso por QR
                </h4>
              </div>

              {/* Toggle between Share and Scan - Mejorado */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setQrMode('share')}
                  className={`
                    group relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2.5 overflow-hidden
                    ${qrMode === 'share' 
                      ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 shadow-lg shadow-cyan-500/20' 
                      : 'border-white/10 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative flex flex-col items-center gap-2">
                    <Share2 className={`w-7 h-7 transition-all duration-300 ${
                      qrMode === 'share' ? 'text-cyan-300' : 'text-cyan-400 group-hover:scale-110'
                    }`} />
                    <span className="text-white font-bold text-sm">Generar código</span>
                    <span className="text-white/60 text-xs text-center leading-tight">Para compartir</span>
                  </div>
                </button>

                <button
                  onClick={() => setQrMode('scan')}
                  className={`
                    group relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2.5 overflow-hidden
                    ${qrMode === 'scan' 
                      ? 'border-purple-400 bg-gradient-to-br from-purple-500/30 to-purple-600/20 shadow-lg shadow-purple-500/20' 
                      : 'border-white/10 hover:border-purple-400/50 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative flex flex-col items-center gap-2">
                    <QrCode className={`w-7 h-7 transition-all duration-300 ${
                      qrMode === 'scan' ? 'text-purple-300' : 'text-purple-400 group-hover:scale-110'
                    }`} />
                    <span className="text-white font-bold text-sm">Escanear código</span>
                    <span className="text-white/60 text-xs text-center leading-tight">Para unirte</span>
                  </div>
                </button>
              </div>
              
              {/* Share QR Mode - Generate and display QR - Mejorado */}
              {qrMode === 'share' && (
                <div className="flex flex-col items-center gap-5 sm:gap-6">
                  <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-2xl ring-4 ring-cyan-400/20">
                    <QRCodeSVG 
                      value={generateQRData()}
                      size={220}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <div className="text-center space-y-2 px-4">
                    <p className="text-white text-base sm:text-lg font-bold">
                      📱 Escanea para acceder a "{itemTitle}"
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400/40 rounded-xl">
                      <Clock className="w-4 h-4 text-cyan-300" />
                      <p className="text-cyan-200 text-xs sm:text-sm font-semibold">
                        {expirationDays === 0 ? 'Sin expiración' : `Válido ${expirationDays} ${expirationDays === 1 ? 'día' : 'días'}`}
                      </p>
                      <span className="text-white/40">•</span>
                      <p className="text-cyan-200 text-xs sm:text-sm font-semibold">
                        {permissions === 'view' ? '👁️ Solo ver' : permissions === 'edit' ? '✏️ Editar' : '👑 Admin'}
                      </p>
                    </div>
                  </div>

                  {/* Download QR Button - Mejorado */}
                  <button
                    onClick={() => {
                      const svg = document.querySelector('svg');
                      if (svg) {
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        img.onload = () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          ctx?.drawImage(img, 0, 0);
                          const pngFile = canvas.toDataURL('image/png');
                          const downloadLink = document.createElement('a');
                          downloadLink.download = `qr-${itemTitle}.png`;
                          downloadLink.href = pngFile;
                          downloadLink.click();
                        };
                        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                      }
                    }}
                    className="
                      w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600
                      text-white rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300
                      hover:shadow-xl hover:shadow-cyan-500/30 active:scale-95 hover:scale-[1.02]
                      border-2 border-cyan-400/30
                    "
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Descargar código QR</span>
                  </button>

                  {/* Instructions - Mejorado */}
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-400/30 rounded-2xl p-5 w-full">
                    <h5 className="text-cyan-300 font-bold mb-3 text-base flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      💡 ¿Cómo funciona?
                    </h5>
                    <ul className="text-white/80 text-sm space-y-2.5">
                      <li className="flex items-start gap-2.5">
                        <span className="text-cyan-400 font-bold flex-shrink-0">1.</span>
                        <span>El usuario abre este modal en su Planify</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-cyan-400 font-bold flex-shrink-0">2.</span>
                        <span>Selecciona "Código QR" → "Escanear código"</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-cyan-400 font-bold flex-shrink-0">3.</span>
                        <span>Escanea este código con su cámara</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-cyan-400 font-bold flex-shrink-0">4.</span>
                        <span className="font-bold text-cyan-200">¡Acceso instantáneo a "{itemTitle}"! 🎉</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Scan QR Mode - Camera scanner - Mejorado */}
              {qrMode === 'scan' && (
                <div className="flex flex-col items-center gap-5 sm:gap-6">
                  {/* Camera Preview Area - Mejorado */}
                  <div className="w-full aspect-square max-w-md bg-gradient-to-br from-purple-900/50 to-black/70 rounded-3xl overflow-hidden relative border-2 border-purple-400/40 shadow-2xl shadow-purple-500/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-5 p-6">
                        <div className="relative">
                          <QrCode className="w-20 h-20 text-purple-400 mx-auto animate-pulse" />
                          <div className="absolute inset-0 bg-purple-400/20 blur-2xl rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-white text-lg font-bold mb-2">📸 Escaneo QR</p>
                          <p className="text-white/70 text-sm leading-relaxed">
                            Coloca el código QR frente a tu cámara
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            alert('🎥 Función de cámara en desarrollo.\n\nPor ahora, puedes pegar el código manualmente en el campo de abajo. 👇');
                          }}
                          className="
                            px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                            text-white rounded-xl font-bold transition-all duration-300
                            hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 hover:scale-[1.02]
                            border-2 border-purple-400/30
                          "
                        >
                          📷 Activar Cámara
                        </button>
                      </div>
                    </div>
                    
                    {/* Scanning Frame Overlay - Mejorado */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-52 h-52 border-4 border-purple-400/60 rounded-3xl shadow-xl shadow-purple-500/30">
                        {/* Corner decorations animados */}
                        <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-purple-300 rounded-tl-2xl animate-pulse"></div>
                        <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-purple-300 rounded-tr-2xl animate-pulse"></div>
                        <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-purple-300 rounded-bl-2xl animate-pulse"></div>
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-purple-300 rounded-br-2xl animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Input Alternative - Mejorado */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      <p className="text-white/70 text-sm font-semibold">O pega el código manualmente</p>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                    <input
                      type="text"
                      value={scannedData}
                      onChange={(e) => setScannedData(e.target.value)}
                      placeholder="Pega aquí el código QR..."
                      className="
                        w-full px-5 py-3.5 rounded-xl border-2 border-white/20
                        bg-white/10 backdrop-blur-sm text-white placeholder-white/40 text-sm
                        focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                        hover:border-white/30 transition-all duration-200 font-mono
                      "
                    />
                    <button
                      onClick={() => {
                        if (scannedData) {
                          try {
                            const qrData = JSON.parse(scannedData);
                            if (qrData.type === 'planify-invitation') {
                              alert(`✅ ¡Unido exitosamente a: ${qrData.itemName}!\n\n👥 Permisos: ${qrData.permissions}\n🎯 Tipo: ${qrData.itemType}`);
                              // Aquí iría la lógica para unirse realmente
                              onClose();
                            } else {
                              alert('❌ Código QR inválido\n\nAsegúrate de copiar el código completo.');
                            }
                          } catch (err) {
                            alert('❌ Error al procesar el código QR\n\nVerifica que el formato sea correcto.');
                          }
                        }
                      }}
                      disabled={!scannedData}
                      className="
                        w-full px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                        disabled:opacity-40 disabled:cursor-not-allowed
                        text-white rounded-xl font-bold transition-all duration-300
                        hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 hover:scale-[1.02]
                        border-2 border-purple-400/30
                      "
                    >
                      ✨ Unirse ahora
                    </button>
                  </div>

                  {/* Instructions - Mejorado */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-400/30 rounded-2xl p-5 w-full">
                    <h5 className="text-purple-300 font-bold mb-3 text-base flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      💡 Consejos para escanear
                    </h5>
                    <ul className="text-white/80 text-sm space-y-2.5">
                      <li className="flex items-start gap-2.5">
                        <span className="text-purple-400 flex-shrink-0">💡</span>
                        <span>Mantén el código QR bien iluminado y visible</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-purple-400 flex-shrink-0">📱</span>
                        <span>Asegúrate de que esté completamente dentro del marco</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-purple-400 flex-shrink-0">🎯</span>
                        <span>Mantén la cámara estable para mejor lectura</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-purple-400 flex-shrink-0">⚡</span>
                        <span className="font-bold text-purple-200">El código se detectará automáticamente</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invitation Message */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <label className="text-xl sm:text-2xl font-bold text-white">
                Mensaje personalizado
              </label>
            </div>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Añade un mensaje de invitación para tus colaboradores..."
              rows={4}
              className="
                w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border-2 border-white/20
                bg-white/10 backdrop-blur-sm text-white placeholder-white/40 text-sm sm:text-base
                focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
                resize-none transition-all duration-200 hover:border-white/30
              "
            />
            <p className="mt-2 text-xs sm:text-sm text-white/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              Este mensaje aparecerá en la invitación por email
            </p>
          </div>

          {/* Expiration */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <label className="text-xl sm:text-2xl font-bold text-white">
                Duración del acceso
              </label>
            </div>
            <select
              value={expirationDays}
              onChange={(e) => setExpirationDays(Number(e.target.value))}
              className="
                w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border-2 border-white/20
                bg-white/10 backdrop-blur-sm text-white text-sm sm:text-base font-semibold
                focus:ring-2 focus:ring-orange-400 focus:border-orange-400
                cursor-pointer hover:border-white/30 transition-all duration-200
              "
            >
              <option value={1} className="bg-gray-800">⏱️ 1 día</option>
              <option value={7} className="bg-gray-800">📅 7 días</option>
              <option value={30} className="bg-gray-800">🗓️ 30 días (1 mes)</option>
              <option value={365} className="bg-gray-800">📆 1 año</option>
              <option value={0} className="bg-gray-800">♾️ Sin expiración</option>
            </select>
            <p className="mt-3 text-xs sm:text-sm text-white/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              {expirationDays === 0 
                ? 'El acceso nunca expirará (puedes revocarlo manualmente)' 
                : `El acceso expirará en ${expirationDays} ${expirationDays === 1 ? 'día' : 'días'}`
              }
            </p>
          </div>
          </div>
        </div>

        {/* Footer mejorado - Igual que QuickProject */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-4xl mx-auto">
            <button
              onClick={onClose}
              className="
                px-6 sm:px-8 py-3 rounded-xl border-2 border-white/10
                text-white/70 font-semibold text-sm sm:text-base
                hover:bg-white/5 hover:text-white hover:border-white/20 
                backdrop-blur-sm transition-all duration-300
                active:scale-95
                order-2 sm:order-1
              "
            >
              Cancelar
            </button>
            <button
              onClick={handleShare}
              className="
                flex-1 px-8 py-3 rounded-xl
                bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                text-white font-bold text-sm sm:text-base
                hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
                shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50
                transition-all duration-300
                active:scale-95 hover:scale-[1.02]
                flex items-center justify-center gap-2
                order-1 sm:order-2
              "
            >
              <Share2 className="w-5 h-5" />
              <span>
                Compartir {itemType === 'project' ? 'proyecto' : itemType === 'folder' ? 'carpeta' : 'tarea'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Usar createPortal para renderizar en document.body
  return createPortal(modalContent, document.body);
}