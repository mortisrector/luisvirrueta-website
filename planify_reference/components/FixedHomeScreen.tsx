'use client';

import { useState, useEffect } from 'react';
import { Project, Folder, DailyTask, ReminderDestination, Reminder } from '@/types';
import PremiumDailyTasksSection from '@/components/PremiumDailyTasksSection';
import PremiumDailyTasksPage from '@/components/PremiumDailyTasksPage';
import TarProyectos from './TarProyectos';
import TarCarpetas from './TarCarpetas';
import RemindersScreen from '@/components/RemindersScreen';
import CalendarScreen from '@/components/CalendarScreen';
import IdeasScreen from '@/components/IdeasScreen';
import EnhancedQuickCaptureBar from '@/components/EnhancedQuickCaptureBar';
import PremiumQuickCaptureModal from '@/components/PremiumQuickCaptureModal';
import UltraPremiumMetrics from '@/components/UltraPremiumMetrics';
import TarTareas from '@/components/TarTareas';
import InlineNavigationBar from '@/components/InlineNavigationBar';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import UltraPremiumFolderModal from '@/components/UltraPremiumFolderModal';
import { Home, Award, BarChart3, User } from 'lucide-react';
import { useProgressCalculation } from '@/hooks/useProgressCalculation';
import { TEAMS } from '@/lib/centralizedData';

// Local navigation view type (projects view removed)
type NavigationView = 'home' | 'folders' | 'ideas' | 'calendar' | 'reminders' | 'profile';

interface HomeScreenProps {
  folders: Folder[];
  dailyTasks: DailyTask[];
  projects: Project[];
  reminders: Reminder[];
  globalStreak: number;
  onProjectOpen?: (project: Project) => void;
  onFolderOpen?: (folder: Folder) => void;
  onAddTask?: (projectId: string, taskData?: any) => void;
  onMarkOnePercent?: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onArchiveProject?: (project: Project) => void;
  onQuickCapture?: (destination: ReminderDestination, text: string, data: any) => void;
  onCustomizeProject?: (projectId: string, icon: string, colorScheme: string, title?: string) => void;
  onCustomizeFolder?: (folderId: string, icon: string, colorScheme: string) => void;
  onToggleDailyTask?: (taskId: string, value?: number) => void;
  onUpdateDailyTask?: (taskId: string, value: number) => void;
  onAddDailyTask?: () => void;
  newRecognitionsCount?: number;
  onChestOpen?: () => void;
  onAnalyticsOpen?: () => void;
  onProfileOpen?: () => void;
  // Reminder handlers
  onAddReminder?: () => void;
  onEditReminder?: (reminder: Reminder) => void;
  onDeleteReminder?: (reminderId: string) => void;
  onToggleCompleteReminder?: (reminderId: string) => void;
  onToggleAlarmReminder?: (reminderId: string) => void;
  // New CRUD handlers
  onCreateFolder?: (folderData: any) => void;
  onEditFolder?: (folderId: string, folderData: any) => void;
  onDeleteFolder?: (folderId: string) => void;
  onCreateProject?: (projectData: any) => void;
  onDeleteProject?: (projectId: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  onCreateDailyTask?: (taskData: any) => void;
  onEditDailyTask?: (taskId: string, taskData: any) => void;
  onDeleteDailyTask?: (taskId: string) => void;
  // Edit title handlers
  onEditProjectTitle?: (projectId: string, newTitle: string) => void;
  onEditFolderTitle?: (folderId: string, newTitle: string) => void;
  onTeamUpdate?: (folderId: string, updates: any) => void;
  onModeChange?: (folderId: string, mode: 'fixed' | 'cyclic' | 'ephemeral') => void;
  onProjectModeChange?: (projectId: string, mode: 'normal' | 'challenge' | 'competition', config?: any) => void;
  onUpdateCompetitionProgress?: (projectId: string, userId: string, progress: number) => void;
  // Share handlers
  onShareProject?: (project: Project) => void;
  onShareFolder?: (folder: Folder) => void;
  onShareTask?: (task: DailyTask) => void;
  onNavigateToDailyTasksPage?: () => void;
}

export default function HomeScreen({
  folders,
  dailyTasks,
  projects,
  reminders,
  globalStreak,
  onProjectOpen,
  onFolderOpen,
  onAddTask,
  onMarkOnePercent,
  onEditProject,
  onArchiveProject,
  onQuickCapture,
  onCustomizeProject,
  onCustomizeFolder,
  onToggleDailyTask,
  onUpdateDailyTask,
  onAddDailyTask,
  newRecognitionsCount = 0,
  onChestOpen,
  onAnalyticsOpen,
  onProfileOpen,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
  onToggleCompleteReminder,
  onToggleAlarmReminder,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onCreateProject,
  onDeleteProject,
  onUpdateProject,
  onCreateDailyTask,
  onEditDailyTask,
  onDeleteDailyTask,
  onEditProjectTitle,
  onEditFolderTitle,
  onTeamUpdate,
  onModeChange,
  onProjectModeChange,
  onUpdateCompetitionProgress,
  onShareProject,
  onShareFolder,
  onShareTask,
  onNavigateToDailyTasksPage
}: HomeScreenProps) {
  // Debug - Verificar que el componente se está renderizando
  console.log('🏠 FixedHomeScreen renderizado');

  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [captureText, setCaptureText] = useState('');
  const [autoStartVoice, setAutoStartVoice] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [currentView, setCurrentView] = useState<NavigationView>('home');
  const [showPremiumCreateFolder, setShowPremiumCreateFolder] = useState(false);
  const [showDailyTasksPage, setShowDailyTasksPage] = useState(false);

  // Estados para el sistema de notas
  const [notes, setNotes] = useState<any[]>([
    {
      id: 'note1',
      title: 'Ideas para la app de productividad',
      content: 'Necesito implementar:\n- Sistema de tags\n- Búsqueda avanzada\n- Integración con calendario\n- Modo oscuro',
      type: 'text',
      tags: ['tag1', 'tag2'],
      linkedProjects: ['proj1'],
      linkedFolders: [],
      linkedTasks: [],
      isPinned: true,
      isArchived: false,
      isFavorite: true,
      backgroundColor: '#fef3c7',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'note2',
      title: 'Lista de compras',
      content: '',
      type: 'checklist',
      tags: ['tag3'],
      linkedProjects: [],
      linkedFolders: [],
      linkedTasks: [],
      isPinned: false,
      isArchived: false,
      isFavorite: false,
      checklist: [
        { id: 'item1', text: 'Leche', completed: false, createdAt: new Date().toISOString() },
        { id: 'item2', text: 'Pan', completed: true, createdAt: new Date().toISOString() },
        { id: 'item3', text: 'Huevos', completed: false, createdAt: new Date().toISOString() }
      ],
      backgroundColor: '#d1fae5',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  
  const [categories, setCategories] = useState<any[]>([
    {
      id: 'cat1',
      name: 'Trabajo',
      color: '#3b82f6',
      icon: 'Briefcase',
      description: 'Notas relacionadas con el trabajo',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cat2',
      name: 'Personal',
      color: '#10b981',
      icon: 'User',
      description: 'Notas personales',
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [noteTags, setNoteTags] = useState<any[]>([
    {
      id: 'tag1',
      name: 'ideas',
      color: '#8b5cf6',
      useCount: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'tag2',
      name: 'desarrollo',
      color: '#06b6d4',
      useCount: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'tag3',
      name: 'personal',
      color: '#f59e0b',
      useCount: 2,
      createdAt: new Date().toISOString()
    }
  ]);
  
  // Helper to change view and reset appropriate context
  const handleViewChange = (newView: NavigationView | 'projects') => {
    // Map legacy 'projects' view to 'folders'
    const targetView: NavigationView = newView === 'projects' ? 'folders' : newView;
    // Reset context based on view change
    if (targetView === 'folders') {
      // When going to Folders tab, clear any selected project but keep folder selection if coming from folders
      if (currentView !== 'folders') {
        setSelectedProject(null);
      }
    } else if (targetView === 'home' || targetView === 'calendar' || targetView === 'reminders' || targetView === 'profile' || targetView === 'ideas') {
      // When going to other tabs, clear everything
      setSelectedProject(null);
      setSelectedFolder(null);
    }
    
    setCurrentView(targetView);
  };
  
  // Delete confirmation modal states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemName: string;
    itemType: 'proyecto' | 'carpeta' | 'tarea' | 'recordatorio';
    onConfirm: () => void;
    warningMessage?: string;
  }>({
    isOpen: false,
    itemName: '',
    itemType: 'proyecto',
    onConfirm: () => {},
    warningMessage: ''
  });
  
  // Usar el sistema dinámico de progreso global
  const { globalStats } = useProgressCalculation({ projects, folders, tasks: dailyTasks });
  const globalProgress = Math.round(globalStats.overallProgress * 10) / 10; // 1 decimal exacto
  
  // Delete confirmation helpers
  const showDeleteConfirmation = (
    itemName: string, 
    itemType: 'proyecto' | 'carpeta' | 'tarea' | 'recordatorio', 
    onConfirm: () => void,
    warningMessage?: string
  ) => {
    setDeleteModal({
      isOpen: true,
      itemName,
      itemType,
      onConfirm,
      warningMessage
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      itemName: '',
      itemType: 'proyecto',
      onConfirm: () => {},
      warningMessage: ''
    });
  };

  // Handlers para el sistema de notas
  const handleCreateNote = (noteData: any) => {
    const newNote: any = {
      id: `note_${Date.now()}`,
      title: noteData.title || 'Nueva nota',
      content: noteData.content || '',
      type: noteData.type || 'text',
      tags: noteData.tags || [],
      linkedProjects: noteData.linkedProjects || [],
      linkedFolders: noteData.linkedFolders || [],
      linkedTasks: noteData.linkedTasks || [],
      isPinned: noteData.isPinned || false,
      isArchived: noteData.isArchived || false,
      isFavorite: noteData.isFavorite || false,
      backgroundColor: noteData.backgroundColor,
      checklist: noteData.checklist,
      categoryId: noteData.categoryId,
      reminderDate: noteData.reminderDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setNotes(prev => [newNote, ...prev]);
  };

  const handleEditNote = (noteId: string, updates: any) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleCreateCategory = (categoryData: any) => {
    const newCategory: any = {
      id: `cat_${Date.now()}`,
      name: categoryData.name || 'Nueva categoría',
      color: categoryData.color || '#6b7280',
      icon: categoryData.icon || 'Folder',
      description: categoryData.description,
      createdAt: new Date().toISOString()
    };
    
    setCategories(prev => [...prev, newCategory]);
  };

  const handleCreateTag = (tagData: any) => {
    const newTag: any = {
      id: `tag_${Date.now()}`,
      name: tagData.name || 'nueva-etiqueta',
      color: tagData.color || '#6b7280',
      useCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setNoteTags(prev => [...prev, newTag]);
  };

  // Función para generar el siguiente nombre de proyecto secuencial
  const getNextProjectName = (folderId: string): string => {
    // Filtrar proyectos de la carpeta actual
    const folderProjects = projects.filter(p => p.folderId === folderId);
    
    if (folderProjects.length === 0) {
      return 'Proyecto 1';
    }

    // Extraer números de proyectos con formato "Proyecto N" o solo "N"
    const numbers = new Set<number>();
    folderProjects.forEach(proj => {
      const match = proj.title.match(/^(?:Proyecto\s+)?(\d+)$/i);
      if (match) {
        numbers.add(parseInt(match[1], 10));
      }
    });

    // Empezar desde el número total de proyectos + 1, luego buscar el primer disponible
    let n = Math.max(1, folderProjects.length + 1);
    while (numbers.has(n)) n++;

    return `Proyecto ${n}`;
  };
  
  // If daily tasks page is selected, show premium daily tasks page
  if (showDailyTasksPage) {
    return (
      <PremiumDailyTasksPage
        dailyTasks={dailyTasks}
        onBack={() => setShowDailyTasksPage(false)}
        onToggleTask={onToggleDailyTask}
        onUpdateTask={onUpdateDailyTask}
        onEditTask={(task: DailyTask) => {
          if (onEditDailyTask) {
            onEditDailyTask(task.id, task);
          }
        }}
        onDeleteTask={onDeleteDailyTask}
        onCreateTask={onAddDailyTask}
      />
    );
  }
  
  // If a project is selected, show project detail
  if (selectedProject) {
    // Obtener el equipo del proyecto
    const projectTeam = selectedProject.teamId 
      ? Object.values(TEAMS).find(team => team.id === selectedProject.teamId)
      : TEAMS.DESARROLLO; // Fallback por defecto

    // Obtener la carpeta padre para herencia de colores
    const parentFolder = folders.find(folder => folder.id === selectedProject.folderId);

    return (
      <TarTareas
        project={selectedProject}
        dailyTasks={dailyTasks}
        team={projectTeam}
        parentFolder={parentFolder} // Pasar carpeta padre para herencia de colores
        onBack={() => setSelectedProject(null)}
        onAddTask={onAddTask}
        onToggleTask={onToggleDailyTask}
        onUpdateTask={onUpdateDailyTask}
        onEditTask={(task: DailyTask) => {
          if (onEditDailyTask) {
            onEditDailyTask(task.id, task);
          }
        }}
        onDeleteTask={onDeleteDailyTask}
        onUpdateTaskAssignment={(taskId: string, assignedUsers) => {
          // Aquí podrías implementar la lógica para actualizar las asignaciones
          console.log('Actualizando asignación de tarea:', taskId, assignedUsers);
        }}
        onEditProjectTitle={(projectId: string, newTitle: string) => {
          // Actualiza estado global
          if (onEditProjectTitle) onEditProjectTitle(projectId, newTitle);
          // Refresca inmediatamente el encabezado del detalle
          setSelectedProject(prev => (prev && prev.id === projectId) ? { ...prev, title: newTitle } : prev);
        }}
        onCustomizeProject={(projectId: string, icon: string, colorScheme: string, title?: string) => {
          // Actualiza estado global
          if (onCustomizeProject) onCustomizeProject(projectId, icon, colorScheme, title);
          // Refresca inmediatamente el proyecto seleccionado para que se reflejen los cambios
          setSelectedProject(prev => (prev && prev.id === projectId) ? { 
            ...prev, 
            icon, 
            colorScheme,
            ...(title ? { title } : {})
          } : prev);
        }}
      />
    );
  }
  
  // Projects view has been removed - now accessible through Folders > "Ver Todos los Proyectos"

  // Vista de Ideas/Notas
  if (currentView === 'ideas') {
    return (
      <>
        <IdeasScreen
          notes={notes}
          categories={categories}
          tags={noteTags}
          projects={projects}
          folders={folders}
          onCreateNote={handleCreateNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onCreateCategory={handleCreateCategory}
          onCreateTag={handleCreateTag}
          currentView={currentView}
          onNavigate={(view) => {
            handleViewChange(view);
          }}
        />
      </>
    );
  }
  
  // If a folder is selected (and we're in folders view), show projects filtered by that folder
  if (selectedFolder && currentView === 'folders') {
    // Filter projects by the selected folder
    const folderProjects = projects.filter(p => p.folderId === selectedFolder.id);
    
    return (
      <>
        <TarProyectos
          folder={selectedFolder}
          projects={folderProjects}
          dailyTasks={dailyTasks}
          allFolders={folders}
          onBack={() => setSelectedFolder(null)}
          onOpenProject={(project: Project) => {
            setSelectedProject(project);
          }}
          onCustomizeProject={onCustomizeProject}
          onCustomizeFolder={onCustomizeFolder}
          onDeleteProject={(projectId: string) => {
            const project = projects.find(p => p.id === projectId);
            if (project) {
              showDeleteConfirmation(
                project.title,
                'proyecto',
                () => {
                  if (onDeleteProject) {
                    onDeleteProject(projectId);
                  }
                },
                'Esta acción eliminará el proyecto y todas sus tareas'
              );
            }
          }}
          onEditProjectTitle={onEditProjectTitle}
          onEditFolderTitle={onEditFolderTitle}
          onAddTask={onAddTask}
          onUpdateProject={onUpdateProject}
          onProjectModeChange={onProjectModeChange}
          onShareProject={(projectId: string, shareData: any) => {
            const project = projects.find(p => p.id === projectId);
            if (project && onShareProject) {
              onShareProject(project);
            }
          }}
          onCreateProject={() => {
            // Crear proyecto en la carpeta seleccionada
            if (onCreateProject) {
              const newProject = {
                title: getNextProjectName(selectedFolder.id),
                description: 'Proyecto creado en ' + selectedFolder.name,
                folderId: selectedFolder.id,
                colorScheme: (selectedFolder.colorScheme && typeof selectedFolder.colorScheme === 'string') ? selectedFolder.colorScheme : 'default', // Heredar color de la carpeta
                modules: [],
                priority: 'medium' as const,
                tags: [selectedFolder.name]
              };
              onCreateProject(newProject);
            }
          }}
        />
        
        {/* Modales globales que deben aparecer en cualquier vista */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={deleteModal.onConfirm}
          itemName={deleteModal.itemName}
          itemType={deleteModal.itemType}
          warningMessage={deleteModal.warningMessage}
        />
        
        <UltraPremiumFolderModal
          isOpen={showPremiumCreateFolder}
          onClose={() => setShowPremiumCreateFolder(false)}
          onSave={(folderData: any) => {
            if (onCreateFolder) {
              onCreateFolder(folderData);
            }
            setShowPremiumCreateFolder(false);
          }}
        />
        
        <PremiumQuickCaptureModal
          isOpen={showCaptureModal}
          onClose={() => {
            setShowCaptureModal(false);
            setCaptureText('');
            setAutoStartVoice(false);
          }}
          autoStartVoice={autoStartVoice}
          initialText={captureText}
          projects={projects}
          folders={folders}
          onSave={(destination, text, data) => {
            if (onQuickCapture) {
              onQuickCapture(destination, text, data);
            }
            setShowCaptureModal(false);
            setCaptureText('');
            setAutoStartVoice(false);
          }}
        />
      </>
    );
  }

  // If folders view is selected, show all folders
  if (currentView === 'folders') {
    return (
      <>
        <TarCarpetas
          folders={folders}
          projects={projects}
          dailyTasks={dailyTasks}
          onFolderOpen={(folder: Folder) => {
            setSelectedFolder(folder);
          }}
          onCustomizeFolder={onCustomizeFolder}
          onEditFolderTitle={onEditFolderTitle}
          onTeamUpdate={onTeamUpdate}
          onModeChange={onModeChange}
          onCreateFolder={onCreateFolder}
          onCreateProject={onCreateProject}
          onCreateDailyTask={onCreateDailyTask}
          onDeleteFolder={(folder: Folder) => {
            showDeleteConfirmation(
              folder.name,
              'carpeta',
              () => {
                if (onDeleteFolder) {
                  onDeleteFolder(folder.id);
                }
              },
              `Esta carpeta contiene ${projects.filter(p => p.folderId === folder.id).length} proyecto${projects.filter(p => p.folderId === folder.id).length !== 1 ? 's' : ''}. Al eliminarla, también se eliminarán todos los proyectos.`
            );
          }}
          currentView={currentView}
          onNavigate={(view: 'home' | 'folders' | 'projects' | 'calendar' | 'reminders' | 'profile' | 'ideas') => {
            handleViewChange(view);
          }}
        />
        
        {/* Modales globales que deben aparecer en cualquier vista */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={deleteModal.onConfirm}
          itemName={deleteModal.itemName}
          itemType={deleteModal.itemType}
          warningMessage={deleteModal.warningMessage}
        />
        
        <UltraPremiumFolderModal
          isOpen={showPremiumCreateFolder}
          onClose={() => setShowPremiumCreateFolder(false)}
          onSave={(folderData: any) => {
            if (onCreateFolder) {
              onCreateFolder(folderData);
            }
            setShowPremiumCreateFolder(false);
          }}
        />
        
        <PremiumQuickCaptureModal
          isOpen={showCaptureModal}
          onClose={() => {
            setShowCaptureModal(false);
            setCaptureText('');
            setAutoStartVoice(false);
          }}
          initialText={captureText}
          autoStartVoice={autoStartVoice}
          projects={projects}
          folders={folders}
          onSave={(destination: ReminderDestination, text: string, data: any) => {
            onQuickCapture?.(destination, text, data);
            setCaptureText('');
          }}
        />
      </>
    );
  }

  // If reminders view is selected, show reminders screen
  if (currentView === 'reminders') {
    return (
      <>
        <RemindersScreen
          reminders={reminders || []}
          onBack={() => setCurrentView('home')}
          onAddReminder={() => {
            setCurrentView('home');
            setShowCaptureModal(true);
          }}
          onEditReminder={(reminder) => {
            onEditReminder?.(reminder);
          }}
          onDeleteReminder={(reminderId) => {
            onDeleteReminder?.(reminderId);
          }}
          onToggleComplete={(reminderId) => {
            onToggleCompleteReminder?.(reminderId);
          }}
          onToggleAlarm={(reminderId) => {
            onToggleAlarmReminder?.(reminderId);
          }}
          onNavigate={(view) => {
            // 'projects' is not a valid NavigationView option anymore
            setCurrentView(view);
          }}
        />
        
        {/* Modales globales que deben aparecer en cualquier vista */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={deleteModal.onConfirm}
          itemName={deleteModal.itemName}
          itemType={deleteModal.itemType}
          warningMessage={deleteModal.warningMessage}
        />
        
        <UltraPremiumFolderModal
          isOpen={showPremiumCreateFolder}
          onClose={() => setShowPremiumCreateFolder(false)}
          onSave={(folderData: any) => {
            if (onCreateFolder) {
              onCreateFolder(folderData);
            }
            setShowPremiumCreateFolder(false);
          }}
        />
        
        <PremiumQuickCaptureModal
          isOpen={showCaptureModal}
          onClose={() => {
            setShowCaptureModal(false);
            setCaptureText('');
            setAutoStartVoice(false);
          }}
          initialText={captureText}
          autoStartVoice={autoStartVoice}
          projects={projects}
          folders={folders}
          onSave={(destination: ReminderDestination, text: string, data: any) => {
            onQuickCapture?.(destination, text, data);
            setCaptureText('');
          }}
        />
      </>
    );
  }

  // If calendar view is selected, show calendar screen
  if (currentView === 'calendar') {
    return (
      <>
        <CalendarScreen
          reminders={reminders || []}
          onAddEvent={() => {
            setCurrentView('home');
            setShowCaptureModal(true);
          }}
          onEditEvent={(event) => {
            if (onEditReminder && event.id) {
              onEditReminder(event as any);
            }
          }}
          onDeleteEvent={(eventId) => {
            if (onDeleteReminder) {
              onDeleteReminder(eventId);
            }
          }}
          onEventClick={(event) => {
            // TODO: Show event details
            console.log('Event clicked:', event);
          }}
          onBack={() => setCurrentView('home')}
          onNavigate={(view) => handleViewChange(view)}
        />
        
        {/* Modales globales que deben aparecer en cualquier vista */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={deleteModal.onConfirm}
          itemName={deleteModal.itemName}
          itemType={deleteModal.itemType}
          warningMessage={deleteModal.warningMessage}
        />
        
        <UltraPremiumFolderModal
          isOpen={showPremiumCreateFolder}
          onClose={() => setShowPremiumCreateFolder(false)}
          onSave={(folderData: any) => {
            if (onCreateFolder) {
              onCreateFolder(folderData);
            }
            setShowPremiumCreateFolder(false);
          }}
        />
        
        <PremiumQuickCaptureModal
          isOpen={showCaptureModal}
          onClose={() => {
            setShowCaptureModal(false);
            setCaptureText('');
            setAutoStartVoice(false);
          }}
          initialText={captureText}
          autoStartVoice={autoStartVoice}
          projects={projects}
          folders={folders}
          onSave={(destination: ReminderDestination, text: string, data: any) => {
            onQuickCapture?.(destination, text, data);
            setCaptureText('');
          }}
        />
      </>
    );
  }

  // Perfil ahora es un modal, no una vista completa
  
  // If daily tasks page view is selected
  if (showDailyTasksPage) {
    return (
      <>
        <PremiumDailyTasksPage
          dailyTasks={dailyTasks}
          onBack={() => setShowDailyTasksPage(false)}
          onToggleTask={onToggleDailyTask}
          onUpdateTask={onUpdateDailyTask}
          onEditTask={(task: DailyTask) => {
            if (onEditDailyTask) {
              onEditDailyTask(task.id, task);
            }
          }}
          onDeleteTask={onDeleteDailyTask}
        />
      </>
    );
  }

  // Resto del código de las otras vistas...
  
  // If profile view is selected (ahora removido, se maneja como modal)
  /* CÓDIGO ELIMINADO - PROFILE ES MODAL AHORA */
  
  if (false) { // Dummy condition para mantener estructura
    return (
      <>
        {/* Modales globales que deben aparecer en cualquier vista */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={deleteModal.onConfirm}
          itemName={deleteModal.itemName}
          itemType={deleteModal.itemType}
          warningMessage={deleteModal.warningMessage}
        />
        
        <UltraPremiumFolderModal
          isOpen={showPremiumCreateFolder}
          onClose={() => setShowPremiumCreateFolder(false)}
          onSave={(folderData: any) => {
            if (onCreateFolder) {
              onCreateFolder(folderData);
            }
            setShowPremiumCreateFolder(false);
          }}
        />
        
        <PremiumQuickCaptureModal
          isOpen={showCaptureModal}
          onClose={() => {
            setShowCaptureModal(false);
            setCaptureText('');
            setAutoStartVoice(false);
          }}
          initialText={captureText}
          autoStartVoice={autoStartVoice}
          projects={projects}
          folders={folders}
          onSave={(destination: ReminderDestination, text: string, data: any) => {
            onQuickCapture?.(destination, text, data);
            setCaptureText('');
          }}
        />
      </>
    );
  }
  
  const handleQuickCapture = (text: string, startVoice?: boolean) => {
    setCaptureText(text);
    setAutoStartVoice(!!startVoice);
    setShowCaptureModal(true);
  };
  
  const handleModalSave = (destination: ReminderDestination, text: string, data: any) => {
    onQuickCapture?.(destination, text, data);
    setCaptureText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative px-4 pt-8 pb-4">
        {/* Elegant background with subtle pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-cyan-600/20"></div>
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)`
            }}
          />
        </div>
        
        {/* Header UX/UI con espaciado profesional optimizado */}
        <div className="relative mb-8">
          {/* Badges superiores - tamaño reducido para mejor alineación con título */}
          <div className="flex items-center justify-center gap-3 mb-6 mt-4">
            {/* Recognition chest con énfasis visual - MORADO */}
            {newRecognitionsCount > 0 && (
              <button
                onClick={onChestOpen}
                className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                  boxShadow: '0 20px 40px rgba(139, 92, 246, 0.5), 0 10px 20px rgba(168, 85, 247, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.25)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              >
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
                {/* Badge premium rediseñado */}
                <div 
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center border-2 sm:border-3 border-white shadow-lg"
                  style={{
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <span className="text-xs sm:text-sm text-white font-black tracking-tight">{newRecognitionsCount}</span>
                </div>
              </button>
            )}

            {/* Analytics Dashboard Button */}
            <button
              onClick={onAnalyticsOpen}
              className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4), 0 10px 20px rgba(59, 130, 246, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.25)'
              }}
              title="Analíticas de Productividad"
            >
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
            </button>

            {/* Profile Panel Button - NARANJA */}
            <button
              onClick={() => {
                console.log('🔥 Botón naranja clickeado');
                if (onProfileOpen) {
                  console.log('✅ Llamando a onProfileOpen del padre');
                  onProfileOpen();
                } else {
                  console.warn('⚠️ onProfileOpen no está definido');
                }
              }}
              className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                boxShadow: '0 20px 40px rgba(251, 146, 60, 0.4), 0 10px 20px rgba(249, 115, 22, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.25)'
              }}
              title="Perfil y Configuración"
            >
              <User className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
            </button>
          </div>
          
          {/* Tipografía premium con estilo elegante y profesional */}
          <div className="text-center space-y-2 mb-8">
            <h1 
              className="text-7xl sm:text-8xl font-black text-white tracking-tight leading-none mb-1"
              style={{ 
                textShadow: '0 0 50px rgba(168, 85, 247, 0.4), 0 0 25px rgba(139, 92, 246, 0.35), 0 4px 20px rgba(0, 0, 0, 0.3)',
                fontFamily: 'system-ui, -apple-system, "SF Pro Display", sans-serif',
                letterSpacing: '-0.04em',
                filter: 'drop-shadow(0 0 18px rgba(168, 85, 247, 0.5))'
              }}
            >
              Planify
            </h1>
            <p 
              className="text-white/50 text-xs sm:text-sm font-medium max-w-xs mx-auto uppercase"
              style={{ 
                letterSpacing: '0.2em'
              }}
            >
              1% mejor cada día
            </p>
          </div>
        </div>
        
        {/* Quick Capture Bar - Centered and prominent */}
        <div className="mb-10 max-w-2xl mx-auto">
          <EnhancedQuickCaptureBar
            onCapture={handleQuickCapture}
            placeholder="Captura tu próxima gran idea"
          />
        </div>
        
        {/* Inline Navigation Bar - Más espacio respecto a la barra de captura */}
        <div className="mb-8">
          <InlineNavigationBar
            currentView={currentView}
            onNavigate={handleViewChange}
          />
        </div>
        
      </header>

      {/* Main content */}
      <main className="flex-1 px-4">
        {/* Daily Tasks - Nueva sección premium - MOVIDO MÁS ARRIBA PARA MEJOR UX */}
        <div className="mb-6">
          <PremiumDailyTasksSection
          tasks={dailyTasks}
          onToggleTask={onToggleDailyTask}
          onUpdateTask={onUpdateDailyTask}
          onAddTask={onAddDailyTask}
          onEditTask={(task: DailyTask) => {
            if (onEditDailyTask) {
              onEditDailyTask(task.id, task);
            }
          }}
          onDeleteTask={(taskId: string) => {
            if (onDeleteDailyTask) {
              onDeleteDailyTask(taskId);
            }
          }}
          onViewStats={() => {
            // Navegar a la página PRO de tareas diarias
            setShowDailyTasksPage(true);
          }}
          onNavigateToDailyTasksPage={() => {
            setShowDailyTasksPage(true);
          }}
        />
        </div>
        
        {/* Premium Metrics Grid - Espaciado optimizado - MOVIDO DESPUÉS DE TAREAS DIARIAS */}
        <div className="mb-6 max-w-7xl mx-auto px-2">
          <UltraPremiumMetrics 
            projects={projects}
            folders={folders}
            dailyTasks={dailyTasks}
          />
        </div>

        {/* Botón de Perfil Adicional - Debajo de los 4 iconos principales */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => {
              console.log('🔥 Botón grande de perfil clickeado');
              if (onProfileOpen) {
                console.log('✅ Llamando a onProfileOpen del padre');
                onProfileOpen();
              } else {
                console.warn('⚠️ onProfileOpen no está definido');
              }
            }}
            className="relative group flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-red-500/20 backdrop-blur-sm border border-amber-400/30 rounded-2xl hover:bg-gradient-to-br hover:from-amber-400/30 hover:via-orange-500/30 hover:to-red-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              boxShadow: '0 8px 32px rgba(251, 146, 60, 0.2), 0 4px 16px rgba(249, 115, 22, 0.15)'
            }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-400/40 transition-all duration-300">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold text-lg">Mi Perfil</h3>
              <p className="text-white/70 text-sm">Configuración y estadísticas</p>
            </div>
          </button>
        </div>
        
      </main>
      
      {/* Premium Quick Capture Modal */}
      <PremiumQuickCaptureModal
        isOpen={showCaptureModal}
        onClose={() => {
          setShowCaptureModal(false);
          setCaptureText('');
          setAutoStartVoice(false);
        }}
        initialText={captureText}
        autoStartVoice={autoStartVoice}
        projects={projects}
        folders={folders}
        onSave={handleModalSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteModal.onConfirm}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        warningMessage={deleteModal.warningMessage}
      />

      {/* Ultra Premium Folder Modal */}
      <UltraPremiumFolderModal
        isOpen={showPremiumCreateFolder}
        onClose={() => setShowPremiumCreateFolder(false)}
        onSave={(folderData: any) => {
          if (onCreateFolder) {
            onCreateFolder(folderData);
          }
          setShowPremiumCreateFolder(false);
        }}
      />

      {/* Profile Modal - Se maneja en NewAppContainer, no aquí */}
    </div>
  );
}