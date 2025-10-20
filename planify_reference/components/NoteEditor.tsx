'use client';

import { useState, useEffect, useRef } from 'react';
import { Note, NoteCategory, NoteTag, ChecklistItem, Project, Folder } from '@/types';
import { 
  ArrowLeft, Save, MoreHorizontal, Pin, Star, Archive, Trash2, 
  Share2, Bell, Link2, Palette, Tag, FolderOpen, Target,
  Plus, Minus, Check, Type, Image, Mic, Edit3, Brain,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, CheckSquare, Quote, Code, Heading1, Heading2
} from 'lucide-react';

interface NoteEditorProps {
  note?: Note;
  categories: NoteCategory[];
  tags: NoteTag[];
  projects: Project[];
  folders: Folder[];
  isNew?: boolean;
  onSave: (noteData: Partial<Note>) => void;
  onClose: () => void;
  onDelete?: (noteId: string) => void;
}

export default function NoteEditor({
  note,
  categories = [],
  tags = [],
  projects = [],
  folders = [],
  isNew = false,
  onSave,
  onClose,
  onDelete
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [noteType, setNoteType] = useState(note?.type || 'text');
  const [selectedCategory, setSelectedCategory] = useState(note?.categoryId || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags || []);
  const [linkedProjects, setLinkedProjects] = useState<string[]>(note?.linkedProjects || []);
  const [linkedFolders, setLinkedFolders] = useState<string[]>(note?.linkedFolders || []);
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);
  const [reminderDate, setReminderDate] = useState(note?.reminderDate || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(note?.checklist || []);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(note?.backgroundColor || '');
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isNew && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isNew]);

  const handleSave = () => {
    const noteData: Partial<Note> = {
      title: title || 'Nota sin título',
      content,
      type: noteType as any,
      categoryId: selectedCategory || undefined,
      tags: selectedTags,
      linkedProjects,
      linkedFolders,
      isPinned,
      isFavorite,
      reminderDate: reminderDate || undefined,
      backgroundColor,
      checklist: noteType === 'checklist' ? checklist : undefined,
      updatedAt: new Date().toISOString(),
      ...(isNew && { 
        id: `note_${Date.now()}`,
        createdAt: new Date().toISOString(),
        isArchived: false
      })
    };

    onSave(noteData);
    onClose();
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      text: '',
      completed: false,
      createdAt: new Date().toISOString()
    };
    setChecklist([...checklist, newItem]);
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleProject = (projectId: string) => {
    setLinkedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleFolder = (folderId: string) => {
    setLinkedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const backgroundColors = [
    { name: 'Blanco', value: '#ffffff', gradient: 'from-white to-gray-50' },
    { name: 'Amarillo', value: '#fef3c7', gradient: 'from-yellow-100 to-yellow-200' },
    { name: 'Verde', value: '#d1fae5', gradient: 'from-green-100 to-green-200' },
    { name: 'Azul', value: '#dbeafe', gradient: 'from-blue-100 to-blue-200' },
    { name: 'Rosa', value: '#fce7f3', gradient: 'from-pink-100 to-pink-200' },
    { name: 'Púrpura', value: '#e9d5ff', gradient: 'from-purple-100 to-purple-200' },
    { name: 'Naranja', value: '#fed7aa', gradient: 'from-orange-100 to-orange-200' },
    { name: 'Gris', value: '#f3f4f6', gradient: 'from-gray-100 to-gray-200' }
  ];

  const selectedBgColor = backgroundColors.find(bg => bg.value === backgroundColor) || backgroundColors[0];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Header optimizado para móvil */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200 ${
                isPinned ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 hover:bg-white/20 text-white/60'
              }`}
            >
              <Pin className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200 ${
                isFavorite ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 hover:bg-white/20 text-white/60'
              }`}
            >
              <Star className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => setShowConnections(!showConnections)}
            className="w-8 h-8 md:w-auto md:h-auto md:px-4 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl text-white text-sm transition-all duration-200 flex items-center justify-center md:gap-2"
          >
            <Link2 className="w-4 h-4" />
            <span className="hidden md:inline">Conexiones</span>
          </button>
          
          <button
            onClick={handleSave}
            className="w-8 h-8 md:w-auto md:h-auto md:px-6 md:py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-lg md:rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center md:gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="hidden md:inline">Guardar</span>
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)]">
        {/* Panel principal */}
        <div className="flex-1 flex flex-col">
          {/* Área de contenido */}
          <div className={`flex-1 p-3 md:p-6 bg-gradient-to-br ${selectedBgColor.gradient} overflow-y-auto`}>
            <div className="max-w-3xl mx-auto">
              {/* Título */}
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la nota..."
                className="w-full text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 bg-transparent border-none outline-none placeholder-gray-500 mb-4 md:mb-6"
              />

              {/* Selector de tipo optimizado para móvil */}
              <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
                {[
                  { id: 'text', label: 'Texto', icon: Type },
                  { id: 'checklist', label: 'Lista', icon: CheckSquare },
                  { id: 'image', label: 'Imagen', icon: Image },
                  { id: 'voice', label: 'Audio', icon: Mic },
                  { id: 'mindmap', label: 'Mapa', icon: Brain }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setNoteType(type.id as any)}
                    className={`flex items-center justify-center md:gap-2 px-2.5 md:px-3 py-2 rounded-lg md:rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-[2.5rem] md:min-w-auto ${
                      noteType === type.id
                        ? 'bg-violet-500 text-white shadow-lg'
                        : 'bg-white/50 text-gray-700 hover:bg-white/70'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="hidden md:inline ml-1">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Contenido específico por tipo */}
              {noteType === 'checklist' ? (
                <div className="space-y-2 md:space-y-3">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 md:gap-3 group">
                      <button
                        onClick={() => updateChecklistItem(item.id, { completed: !item.completed })}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          item.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3 md:w-4 md:h-4" />}
                      </button>
                      
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateChecklistItem(item.id, { text: e.target.value })}
                        placeholder="Elemento de la lista..."
                        className={`flex-1 p-1.5 md:p-2 bg-transparent border-none outline-none text-gray-800 text-sm md:text-base ${
                          item.completed ? 'line-through text-gray-500' : ''
                        }`}
                      />
                      
                      <button
                        onClick={() => removeChecklistItem(item.id)}
                        className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Minus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={addChecklistItem}
                    className="flex items-center gap-2 p-2 text-violet-600 hover:bg-violet-50 rounded-lg md:rounded-xl transition-all duration-200 text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir elemento
                  </button>
                </div>
              ) : (
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Comienza a escribir tu idea..."
                  className="w-full h-64 md:h-96 text-gray-800 bg-transparent border-none outline-none resize-none placeholder-gray-500 text-base md:text-lg leading-relaxed"
                />
              )}

              {/* Tags seleccionados */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 md:gap-2 mt-4 md:mt-6">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <span
                        key={tagId}
                        className="px-2 md:px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs md:text-sm font-medium flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        {tag.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Toolbar flotante optimizado para móvil */}
          <div className="p-3 md:p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                {/* Selector de color de fondo */}
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Palette className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                  <div className="flex gap-1">
                    {backgroundColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBackgroundColor(color.value)}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-all duration-200 ${
                          backgroundColor === color.value ? 'border-violet-500 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Categoría */}
                {selectedCategory && (
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <FolderOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                    <span className="text-xs md:text-sm text-gray-700">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500">
                <span>
                  {isNew ? 'Nueva nota' : `Modificado ${new Date(note?.updatedAt || '').toLocaleDateString()}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral de conexiones - Modal en móvil */}
        {showConnections && (
          <>
            {/* Overlay para móvil */}
            <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowConnections(false)} />
            
            <div className="fixed md:relative top-0 right-0 md:top-auto md:right-auto w-full max-w-sm md:w-80 h-full md:h-auto bg-black/90 md:bg-black/20 backdrop-blur-xl border-l border-white/10 p-4 md:p-6 overflow-y-auto z-50">
              {/* Header del modal en móvil */}
              <div className="md:hidden flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Conexiones</h3>
                <button
                  onClick={() => setShowConnections(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <h3 className="hidden md:block text-lg font-bold text-white mb-6">Conexiones</h3>

              {/* Categorías */}
              <div className="mb-4 md:mb-6">
                <h4 className="text-sm font-medium text-white/80 mb-2 md:mb-3 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Categoría
                </h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 md:p-3 bg-white/10 border border-white/20 rounded-lg md:rounded-xl text-white text-sm md:text-base"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="text-gray-800">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="mb-4 md:mb-6">
                <h4 className="text-sm font-medium text-white/80 mb-2 md:mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Etiquetas
                </h4>
                <div className="space-y-1.5 md:space-y-2 max-h-32 md:max-h-40 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="w-4 h-4 text-violet-500 rounded"
                      />
                      <span className="text-white text-sm">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Proyectos vinculados */}
              <div className="mb-4 md:mb-6">
                <h4 className="text-sm font-medium text-white/80 mb-2 md:mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Proyectos
                </h4>
                <div className="space-y-1.5 md:space-y-2 max-h-32 md:max-h-40 overflow-y-auto">
                  {projects.map((project) => (
                    <label key={project.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkedProjects.includes(project.id)}
                        onChange={() => toggleProject(project.id)}
                        className="w-4 h-4 text-violet-500 rounded"
                      />
                      <span className="text-white text-sm">{project.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Carpetas vinculadas */}
              <div className="mb-4 md:mb-6">
                <h4 className="text-sm font-medium text-white/80 mb-2 md:mb-3 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Carpetas
                </h4>
                <div className="space-y-1.5 md:space-y-2 max-h-32 md:max-h-40 overflow-y-auto">
                  {folders.map((folder) => (
                    <label key={folder.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkedFolders.includes(folder.id)}
                        onChange={() => toggleFolder(folder.id)}
                        className="w-4 h-4 text-violet-500 rounded"
                      />
                      <span className="text-white text-sm">{folder.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recordatorio */}
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2 md:mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Recordatorio
                </h4>
                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full p-2.5 md:p-3 bg-white/10 border border-white/20 rounded-lg md:rounded-xl text-white text-sm md:text-base"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}