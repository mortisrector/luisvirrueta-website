import { useState, useEffect, useCallback } from 'react';

interface Achievement {
  id: string;
  type: 'task' | 'project' | 'folder' | 'milestone' | 'streak';
  title: string;
  description: string;
  icon: string;
  value?: number;
  maxValue?: number;
  unit?: string;
  timestamp: Date;
}

interface UseAchievementsProps {
  projects: any[];
  folders: any[];
  dailyTasks: any[];
}

export const useAchievements = ({ projects, folders, dailyTasks }: UseAchievementsProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Generate achievement messages
  const createAchievement = useCallback((
    type: Achievement['type'], 
    title: string, 
    description: string, 
    icon?: string,
    value?: number,
    maxValue?: number,
    unit?: string
  ): Achievement => ({
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    title,
    description,
    icon: icon || getDefaultIcon(type),
    value,
    maxValue,
    unit,
    timestamp: new Date()
  }), []);

  // Get default icon based on type
  const getDefaultIcon = (type: Achievement['type']): string => {
    switch (type) {
      case 'task': return '✅';
      case 'project': return '🚀';
      case 'folder': return '📁';
      case 'milestone': return '🎯';
      case 'streak': return '🔥';
      default: return '⭐';
    }
  };

  // Check for new achievements
  const checkAchievements = useCallback(() => {
    const newAchievements: Achievement[] = [];
    const now = new Date();
    const today = now.toDateString();

    // Check completed tasks
    const completedTasks = dailyTasks.filter((task: any) => {
      if (task.type === 'boolean') return task.completed;
      if (task.type === 'numeric') return task.current >= task.target;
      if (task.type === 'subjective') return task.score0to1 >= 0.8;
      return false;
    });

    // Check completed projects
    const completedProjects = projects.filter((project: any) => project.progress >= 100);

    // Check completed folders
    const completedFolders = folders.filter((folder: any) => {
      const folderProjects = projects.filter((p: any) => p.folderId === folder.id);
      return folderProjects.length > 0 && folderProjects.every((p: any) => p.progress >= 100);
    });

    // Generate achievements for recent completions
    completedTasks.forEach((task: any) => {
      const taskUpdate = new Date(task.updatedAt);
      if (taskUpdate.toDateString() === today) {
        let description = '';
        if (task.type === 'numeric') {
          description = `Completaste ${task.current}/${task.target} ${task.unit || 'unidades'}`;
        } else if (task.type === 'subjective') {
          description = `Calificación: ${Math.round(task.score0to1 * 10)}/10`;
        } else {
          description = `¡Tarea completada con éxito!`;
        }

        newAchievements.push(createAchievement(
          'task',
          `✨ ${task.title}`,
          description,
          task.icon || '✅',
          task.type === 'numeric' ? task.current : undefined,
          task.type === 'numeric' ? task.target : undefined,
          task.unit
        ));
      }
    });

    completedProjects.forEach((project: any) => {
      const projectUpdate = new Date(project.updatedAt);
      if (projectUpdate.toDateString() === today) {
        newAchievements.push(createAchievement(
          'project',
          `🚀 Proyecto "${project.title}" completado`,
          `${project.items} tareas finalizadas - ¡Increíble trabajo!`,
          project.icon || '🚀'
        ));
      }
    });

    completedFolders.forEach((folder: any) => {
      const folderProjects = projects.filter((p: any) => p.folderId === folder.id);
      newAchievements.push(createAchievement(
        'folder',
        `📁 Carpeta "${folder.name}" completada`,
        `${folderProjects.length} proyectos finalizados - ¡Eres imparable!`,
        folder.icon || '📁'
      ));
    });

    // Check for milestones
    const totalProgress = Math.round(
      projects.reduce((sum: number, p: any) => sum + p.progress, 0) / (projects.length || 1)
    );

    const milestones = [25, 50, 75, 90, 100];
    milestones.forEach(milestone => {
      if (totalProgress >= milestone && totalProgress < milestone + 5) {
        newAchievements.push(createAchievement(
          'milestone',
          `🎯 ${milestone}% de progreso global`,
          totalProgress === 100 
            ? '¡Todos los proyectos completados! 🎉' 
            : `¡Sigue así, vas por buen camino!`,
          '🎯'
        ));
      }
    });

    // Check streaks
    const currentStreak = calculateCurrentStreak(dailyTasks);
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      newAchievements.push(createAchievement(
        'streak',
        `🔥 ${currentStreak} días de racha`,
        currentStreak >= 30 
          ? '¡Eres una máquina de productividad!' 
          : '¡Mantén el impulso, vas genial!',
        '🔥'
      ));
    }

    // Add productivity insights
    if (completedTasks.length >= 5) {
      newAchievements.push(createAchievement(
        'milestone',
        `⚡ Super productivo hoy`,
        `${completedTasks.length} tareas completadas - ¡Día fantástico!`,
        '⚡'
      ));
    }

    return newAchievements;
  }, [projects, folders, dailyTasks, createAchievement]);

  // Calculate current streak
  const calculateCurrentStreak = (tasks: any[]): number => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i >= -30; i--) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toDateString();
      
      const dayTasks = tasks.filter((task: any) => 
        task.lastCompletedDate === checkDate.toISOString().split('T')[0]
      );
      
      if (dayTasks.length > 0) {
        if (i === 0) streak++; // Today
        else if (streak > 0) streak++; // Previous days
      } else if (i === 0) {
        break; // No tasks today, no streak
      } else if (streak === 0) {
        continue; // Haven't started counting yet
      } else {
        break; // Streak broken
      }
    }
    
    return streak;
  };

  // Update achievements when data changes
  useEffect(() => {
    const newAchievements = checkAchievements();
    if (newAchievements.length > 0) {
      setAchievements(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNew = newAchievements.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNew].slice(-10); // Keep last 10
      });
    }
    setLastUpdate(Date.now());
  }, [projects, folders, dailyTasks, checkAchievements]);

  const dismissAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => prev.filter(a => a.id !== achievementId));
  }, []);

  const clearAllAchievements = useCallback(() => {
    setAchievements([]);
  }, []);

  // Calculate global stats
  const globalStats = {
    tasksCompleted: dailyTasks.filter((task: any) => {
      if (task.type === 'boolean') return task.completed;
      if (task.type === 'numeric') return task.current >= task.target;
      if (task.type === 'subjective') return task.score0to1 >= 0.8;
      return false;
    }).length,
    projectsCompleted: projects.filter((p: any) => p.progress >= 100).length,
    foldersCompleted: folders.filter((folder: any) => {
      const folderProjects = projects.filter((p: any) => p.folderId === folder.id);
      return folderProjects.length > 0 && folderProjects.every((p: any) => p.progress >= 100);
    }).length,
    currentStreak: calculateCurrentStreak(dailyTasks),
    totalProgress: Math.round(
      projects.reduce((sum: number, p: any) => sum + p.progress, 0) / (projects.length || 1)
    )
  };

  return {
    achievements,
    dismissAchievement,
    clearAllAchievements,
    globalStats,
    lastUpdate
  };
};