'use client';

import { useState, useEffect, useRef } from 'react';
import { Note, NoteCategory, NoteTag, Project, Folder } from '@/types';
import NoteEditor from './NoteEditor';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { 
  Plus, Search, Filter, Grid3X3, List, Pin, Star, Archive, 
  FileText, CheckSquare, Image, Mic, Palette, Link, Brain,
  Tag, Folder as FolderIcon, Target, Clock, MoreHorizontal,
  Edit3, Trash2, Share2, Bell, Copy, Home, X, Lightbulb
} from 'lucide-react';

interface IdeasScreenProps {
  notes: Note[];
  categories: NoteCategory[];
  tags: NoteTag[];
  projects: Project[];
  folders: Folder[];
  onCreateNote?: (noteData: Partial<Note>) => void;
  onEditNote?: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote?: (noteId: string) => void;
  onCreateCategory?: (categoryData: Partial<NoteCategory>) => void;
  onCreateTag?: (tagData: Partial<NoteTag>) => void;
  currentView?: 'home' | 'folders' | 'projects' | 'calendar' | 'reminders' | 'profile' | 'ideas';
  onNavigate?: (view: 'home' | 'folders' | 'projects' | 'calendar' | 'reminders' | 'profile' | 'ideas') => void;
}

export default function IdeasScreen({
  notes = [],
  categories = [],
  tags = [],
  projects = [],
  folders = [],
  onCreateNote,
  onEditNote,
  onDeleteNote,
  onCreateCategory,
  onCreateTag,
  currentView = 'ideas',
  onNavigate
}: IdeasScreenProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Enfocar búsqueda cuando se abre
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Estadísticas dinámicas
  const totalNotes = notes.length;
  const pinnedNotes = notes.filter(note => note.isPinned).length;
  const todayNotes = notes.filter(note => {
    const today = new Date().toDateString();
    const noteDate = new Date(note.createdAt).toDateString();
    return noteDate === today;
  }).length;
  const linkedNotes = notes.filter(note => 
    note.linkedProjects?.length || note.linkedFolders?.length || note.linkedTasks?.length
  ).length;

  // Tipos de nota con iconos y colores
  const noteTypes = [
    { id: 'text', label: 'Nota de Texto', icon: FileText, color: 'from-blue-500 to-cyan-500', description: 'Notas rápidas y pensamientos' },
    { id: 'checklist', label: 'Lista de Tareas', icon: CheckSquare, color: 'from-green-500 to-emerald-500', description: 'Listas y tareas pendientes' },
    { id: 'image', label: 'Nota Visual', icon: Image, color: 'from-purple-500 to-pink-500', description: 'Imágenes y contenido visual' },
    { id: 'voice', label: 'Nota de Voz', icon: Mic, color: 'from-orange-500 to-red-500', description: 'Grabaciones de audio' },
    { id: 'sketch', label: 'Boceto', icon: Palette, color: 'from-amber-500 to-yellow-500', description: 'Dibujos y esquemas' },
    { id: 'link', label: 'Enlace', icon: Link, color: 'from-indigo-500 to-blue-500', description: 'Enlaces y recursos web' },
    { id: 'mindmap', label: 'Mapa Mental', icon: Brain, color: 'from-violet-500 to-purple-500', description: 'Mapas conceptuales' }
  ];

  // Filtros avanzados
  const filterOptions = [
    { id: 'todas', label: 'Todas las Ideas', count: notes.length, color: 'from-indigo-500 to-purple-500' },
    { id: 'favoritas', label: 'Favoritas', count: notes.filter(n => n.isFavorite).length, color: 'from-yellow-500 to-orange-500' },
    { id: 'fijadas', label: 'Fijadas', count: pinnedNotes, color: 'from-pink-500 to-rose-500' },
    { id: 'recientes', label: 'Recientes', count: todayNotes, color: 'from-green-500 to-emerald-500' },
    { id: 'vinculadas', label: 'Vinculadas', count: linkedNotes, color: 'from-cyan-500 to-blue-500' },
    { id: 'sin-categoria', label: 'Sin Categoría', count: notes.filter(n => !n.categoryId).length, color: 'from-gray-500 to-slate-500' }
  ];

  const currentFilter = filterOptions.find(f => f.id === activeFilter) || filterOptions[0];

  // Función de filtrado avanzado
  const getFilteredNotes = () => {
    let result = [...notes];

    // Filtro principal
    switch (activeFilter) {
      case 'favoritas':
        result = result.filter(n => n.isFavorite);
        break;
      case 'fijadas':
        result = result.filter(n => n.isPinned);
        break;
      case 'recientes':
        result = result.filter(n => {
          const today = new Date().toDateString();
          return new Date(n.createdAt).toDateString() === today;
        });
        break;
      case 'vinculadas':
        result = result.filter(n => n.linkedProjects?.length || n.linkedFolders?.length || n.linkedTasks?.length);
        break;
      case 'sin-categoria':
        result = result.filter(n => !n.categoryId);
        break;
    }

    // Filtro por categoría
    if (selectedCategory) {
      result = result.filter(n => n.categoryId === selectedCategory);
    }

    // Filtro por tags
    if (selectedTags.length > 0) {
      result = result.filter(n => 
        selectedTags.some(tagId => (n.tags || []).includes(tagId))
      );
    }

    // Búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        (n.title || '').toLowerCase().includes(query) ||
        (n.content || '').toLowerCase().includes(query) ||
        (n.tags || []).some(tagId => {
          const tag = tags.find(t => t.id === tagId);
          return tag?.name.toLowerCase().includes(query);
        })
      );
    }

    // Ordenar: fijadas primero, luego por fecha
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  };

  const filteredNotes = getFilteredNotes();

  const handleCreateQuickNote = (type: string) => {
    if (onCreateNote) {
      const noteType = noteTypes.find(nt => nt.id === type);
      const newNoteData = {
        type: type as any,
        title: `Nueva ${noteType?.label || 'Nota'}`,
        content: '',
        tags: [],
        isPinned: false,
        isArchived: false,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // En lugar de crear directamente, abrir el editor
      setEditingNote({
        id: `temp_${Date.now()}`,
        ...newNoteData
      } as Note);
      setIsCreatingNew(true);
    }
    setShowQuickCreate(false);
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (isCreatingNew) {
      // Crear nueva nota
      if (onCreateNote) {
        onCreateNote(noteData);
      }
      setIsCreatingNew(false);
    } else if (editingNote) {
      // Editar nota existente
      if (onEditNote) {
        onEditNote(editingNote.id, noteData);
      }
    }
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsCreatingNew(false);
  };

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete && onDeleteNote) {
      onDeleteNote(noteToDelete);
      setNoteToDelete(null);
    }
  };

  // Si estamos editando una nota, mostrar el editor
  if (editingNote) {
    return (
      <NoteEditor
        note={isCreatingNew ? undefined : editingNote}
        categories={categories}
        tags={tags}
        projects={projects}
        folders={folders}
        isNew={isCreatingNew}
        onSave={handleSaveNote}
        onClose={() => {
          setEditingNote(null);
          setIsCreatingNew(false);
        }}
        onDelete={handleDeleteNote}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 relative overflow-hidden">
      {/* Fondo estético */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(168,85,247,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),rgba(255,255,255,0))]"></div>
      </div>

      <div className="relative z-10 pt-8 md:pt-12 px-2 sm:px-3 md:px-6">
        {/* PREMIUM IDEAS HEADER - IGUAL A CARPETAS */}
        <div className="mb-8 md:mb-10">
          <div className="text-center mb-8 md:mb-10">
            {/* Icono principal con glow effect */}
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50 mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl opacity-50"></div>
              <Lightbulb className="w-9 h-9 text-white relative z-10" />
            </div>

            {/* Título y subtítulo estilo Quick Project */}
            <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Ideas</h1>
            <p className="text-white/50 text-sm">Captura tus pensamientos</p>
            
            {/* PROGRESS CHIPS - botones circulares minimalistas */}
            <div className="flex justify-center gap-3 mt-5 mb-4 md:mb-6">
              {/* Botón Home - AL INICIO */}
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('home');
                }}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                title="Volver a Inicio"
              >
                <Home className="w-4 h-4" />
              </button>

              {/* Botón Vista */}
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                title={viewMode === 'grid' ? 'Vista lista' : 'Vista cuadrícula'}
              >
                {viewMode === 'grid' ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid3X3 className="w-4 h-4" />
                )}
              </button>

              {/* Botón Fusionado: Búsqueda + Filtros - CIRCULAR */}
              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    showFilterMenu || activeFilter !== 'todas' || searchQuery
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg scale-110 ring-2 ring-white/30'
                      : 'bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white'
                  }`}
                  title="Búsqueda y Filtros"
                >
                  <Filter className="w-4 h-4" />
                  {/* Indicador activo */}
                  {(activeFilter !== 'todas' || searchQuery) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border border-white shadow-lg" />
                  )}
                </button>

                {/* Modal de Filtros - EXACTAMENTE IGUAL A QUICK PROJECT */}
                {showFilterMenu && (
                  <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 animate-in fade-in duration-300">
                    {/* Overlay con efecto de cristal y animación */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl animate-in fade-in duration-500"></div>
                    
                    {/* Patrón de fondo sutil */}
                    <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
                    
                    <div className="absolute inset-0 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
                      
                      {/* Header Premium - IGUAL A CARPETAS */}
                      <div className="relative flex flex-col items-center justify-center pt-10 pb-6">
                        {/* Icono principal con glow effect */}
                        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-500 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50">
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400 to-violet-500 blur-xl opacity-50"></div>
                          <Filter className="w-9 h-9 text-white relative z-10" />
                        </div>
                        
                        <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Filtrar Ideas</h1>
                        <p className="text-white/50 text-sm">
                          Encuentra tus notas rápidamente
                        </p>
                        
                        {/* Botón cerrar flotante en esquina superior derecha */}
                        <div className="absolute top-6 right-6">
                          <button 
                            onClick={() => setShowFilterMenu(false)}
                            className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                            title="Cerrar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content - Búsqueda y Filtros */}
                      <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <div className="max-w-md mx-auto space-y-6">
                          {/* Barra de Búsqueda - ESTILO CARPETAS */}
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Buscar notas..."
                              className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 text-base font-medium"
                            />
                            {searchQuery && (
                              <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 z-10"
                              >
                                <X className="w-4 h-4 text-white/60" />
                              </button>
                            )}
                          </div>

                          {/* Grid de filtros - SOLO SI NO HAY BÚSQUEDA - ESTILO CARPETAS */}
                          {!searchQuery && (
                            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                              {filterOptions.map((option) => {
                                const isSelected = activeFilter === option.id;
                                return (
                                  <button
                                    key={option.id}
                                    onClick={() => {
                                      setActiveFilter(option.id);
                                      setShowFilterMenu(false);
                                    }}
                                    className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                                      isSelected 
                                        ? 'bg-white/10 border-purple-400/50 hover:bg-white/15' 
                                        : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                                    }`}
                                    style={{
                                      minHeight: '110px'
                                    }}
                                  >
                                    {/* Icono centrado arriba con glow effect */}
                                    <div className="flex flex-col items-center text-center space-y-3">
                                      <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${option.color} shadow-xl`}>
                                        {/* Resplandor detrás del icono */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${option.color} rounded-2xl blur-xl opacity-50`}></div>
                                        
                                        {/* Ícono con resplandor */}
                                        <Filter className="w-6 h-6 text-white relative z-10" />
                                      </div>
                                      
                                      {/* Texto centrado debajo */}
                                      <div className="space-y-1">
                                        <div className="text-sm font-semibold text-white">
                                          {option.label}
                                        </div>
                                        <div className="text-xs text-white/60 font-medium">
                                          {option.count}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Checkmark cuando está seleccionado */}
                                    {isSelected && (
                                      <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Nueva Idea */}
              <button
                onClick={() => setShowQuickCreate(true)}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                title="Nueva idea"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="mb-6 sm:mb-8">
          {/* Lista/Grid de notas */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {searchQuery ? 'No se encontraron notas' : 'Crea tu primera idea'}
              </h3>
              <p className="text-purple-200 mb-8 text-lg max-w-md mx-auto">
                {searchQuery 
                  ? `No encontramos notas que coincidan con "${searchQuery}"`
                  : 'Captura tus ideas, pensamientos y proyectos en un lugar organizado'
                }
              </p>
              <button
                onClick={() => {
                  setEditingNote({
                    id: `temp_${Date.now()}`,
                    title: '',
                    content: '',
                    type: 'text',
                    tags: [],
                    linkedProjects: [],
                    linkedFolders: [],
                    linkedTasks: [],
                    isPinned: false,
                    isArchived: false,
                    isFavorite: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                  setIsCreatingNew(true);
                }}
                className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                Crear Primera Nota
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4" 
              : "space-y-3 md:space-y-4"
            }>
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  categories={categories}
                  tags={tags}
                  projects={projects}
                  folders={folders}
                  viewMode={viewMode}
                  onEdit={handleEditNote}
                  onToggleFavorite={(noteId: string) => onEditNote && onEditNote(noteId, { isFavorite: !notes.find(n => n.id === noteId)?.isFavorite })}
                  onTogglePin={(noteId: string) => onEditNote && onEditNote(noteId, { isPinned: !notes.find(n => n.id === noteId)?.isPinned })}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de creación rápida */}
      {showQuickCreate && (
        <QuickCreateModal
          noteTypes={noteTypes}
          categories={categories}
          onCreateNote={handleCreateQuickNote}
          onClose={() => setShowQuickCreate(false)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        isOpen={noteToDelete !== null}
        onClose={() => setNoteToDelete(null)}
        onConfirm={confirmDeleteNote}
        itemName={noteToDelete ? notes.find(n => n.id === noteToDelete)?.title || 'esta nota' : ''}
        itemType="tarea"
      />
    </div>
  );
}

// Componente para tarjetas de notas
function NoteCard({ 
  note, 
  categories, 
  tags, 
  projects, 
  folders, 
  viewMode, 
  onEdit, 
  onToggleFavorite,
  onTogglePin,
  onDelete 
}: {
  note: Note;
  categories: NoteCategory[];
  tags: NoteTag[];
  projects: Project[];
  folders: Folder[];
  viewMode: 'grid' | 'list';
  onEdit?: (note: Note) => void;
  onToggleFavorite?: (noteId: string) => void;
  onTogglePin?: (noteId: string) => void;
  onDelete?: (noteId: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  
  const category = categories.find(c => c.id === note.categoryId);
  const noteTags = tags.filter(t => (note.tags || []).includes(t.id));
  
  const getTypeIcon = (type: string) => {
    const icons = {
      text: FileText,
      checklist: CheckSquare,
      image: Image,
      voice: Mic,
      sketch: Palette,
      link: Link,
      mindmap: Brain
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const TypeIcon = getTypeIcon(note.type);

  return (
    <div className={`group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl md:rounded-2xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all duration-300 ${
      viewMode === 'list' ? 'flex items-center gap-4 p-3 md:p-4' : 'p-3 md:p-4'
    }`}>
      
      {viewMode === 'grid' ? (
        // DISEÑO GRID - Estilo Google Keep
        <>
          {/* Header: Icono + Botón eliminar elegante */}
          <div className="flex items-start justify-between mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <TypeIcon className="w-4 h-4 md:w-4.5 md:h-4.5 text-white" />
            </div>
            
            {/* Botón eliminar elegante y minimalista */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) {
                  onDelete(note.id);
                }
              }}
              className="w-5 h-5 rounded-md bg-white/0 hover:bg-red-500/10 flex items-center justify-center text-white/30 hover:text-red-400 transition-all duration-200"
              title="Eliminar nota"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Contenido clickeable */}
          <div 
            className="cursor-pointer"
            onClick={() => onEdit && onEdit(note)}
          >
            {/* Título */}
            <h3 className="font-semibold text-white text-sm md:text-base mb-1.5 md:mb-2 line-clamp-2 leading-tight">
              {note.title}
            </h3>
            
            {/* Contenido - solo si existe */}
            {note.content && note.content.trim() && (
              <p className="text-white/70 text-xs md:text-sm mb-2 md:mb-3 line-clamp-3 leading-relaxed">
                {note.content}
              </p>
            )}

            {/* Tags y categoría - solo si existen */}
            {(category || noteTags.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {category && (
                  <span 
                    className="px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium" 
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    {category.name}
                  </span>
                )}
                {noteTags.slice(0, 2).map((tag) => (
                  <span key={tag.id} className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] md:text-xs text-white/80">
                    #{tag.name}
                  </span>
                ))}
                {noteTags.length > 2 && (
                  <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] md:text-xs text-white/80">
                    +{noteTags.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Footer: Fecha + Enlaces - más compacto */}
            <div className="flex items-center justify-between text-[10px] md:text-xs text-white/50 pt-1.5 border-t border-white/5">
              <span>{new Date(note.updatedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
              {(note.linkedProjects?.length || note.linkedFolders?.length) ? (
                <div className="flex items-center gap-1">
                  {note.linkedProjects && note.linkedProjects.length > 0 && (
                    <Target className="w-3 h-3" />
                  )}
                  {note.linkedFolders && note.linkedFolders.length > 0 && (
                    <FolderIcon className="w-3 h-3" />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        // DISEÑO LISTA - Horizontal
        <>
          {/* Indicadores de estado */}
          <div className="absolute top-3 right-3 flex gap-1">
            {note.isPinned && <Pin className="w-3.5 h-3.5 text-yellow-400" />}
            {note.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />}
          </div>

          <div 
            className="flex-1 cursor-pointer"
            onClick={() => onEdit && onEdit(note)}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <TypeIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-base mb-1 truncate">{note.title}</h3>
                <p className="text-white/70 text-sm line-clamp-2">{note.content}</p>
              </div>
            </div>

            {/* Tags y categoría */}
            <div className="flex flex-wrap gap-2 mb-2 ml-13">
              {category && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: category.color + '20', color: category.color }}>
                  {category.name}
                </span>
              )}
              {noteTags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80">
                  #{tag.name}
                </span>
              ))}
              {noteTags.length > 3 && (
                <span className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80">
                  +{noteTags.length - 3}
                </span>
              )}
            </div>

            {/* Metadatos */}
            <div className="flex items-center justify-between text-xs text-white/60 ml-13">
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              <div className="flex items-center gap-1">
                {note.linkedProjects && note.linkedProjects.length > 0 && (
                  <Target className="w-3 h-3" />
                )}
                {note.linkedFolders && note.linkedFolders.length > 0 && (
                  <FolderIcon className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Acciones */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(note.id);
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? 'text-yellow-400 fill-current' : 'text-white/60'}`} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin && onTogglePin(note.id);
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'text-yellow-400' : 'text-white/60'}`} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
          >
            <MoreHorizontal className="w-4 h-4 text-white/60" />
          </button>
        </div>
      )}

      {/* Acciones adicionales para vista grid */}
      {viewMode === 'grid' && (
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(note);
            }}
            className="w-6 h-6 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center transition-all duration-200"
          >
            <Edit3 className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

// Modal de creación rápida
function QuickCreateModal({ 
  noteTypes, 
  categories, 
  onCreateNote, 
  onClose 
}: {
  noteTypes: any[];
  categories: NoteCategory[];
  onCreateNote: (type: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Idea</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {noteTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onCreateNote(type.id)}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-200 group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200`}>
                <type.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800 text-sm">{type.label}</div>
                <div className="text-gray-500 text-xs mt-1">{type.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}