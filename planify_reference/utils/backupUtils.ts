export const downloadJSONBackup = (data: any, filename: string = 'planify-backup') => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const extractTimeTrackingData = (userId: string) => {
  const getStorageKey = (key: string) => userId ? `${key}_${userId}` : key;
  
  const folderKey = getStorageKey('folderTimeTracking');
  const projectKey = getStorageKey('projectTimeTracking');
  const taskKey = getStorageKey('taskTimeTracking');
  
  try {
    const folderTimeTracking = localStorage.getItem(folderKey);
    const projectTimeTracking = localStorage.getItem(projectKey);
    const taskTimeTracking = localStorage.getItem(taskKey);
    
    return {
      folderTimeTracking: folderTimeTracking ? JSON.parse(folderTimeTracking) : {},
      projectTimeTracking: projectTimeTracking ? JSON.parse(projectTimeTracking) : {},
      taskTimeTracking: taskTimeTracking ? JSON.parse(taskTimeTracking) : {}
    };
  } catch (error) {
    console.error('Error extracting time tracking data:', error);
    return {
      folderTimeTracking: {},
      projectTimeTracking: {},
      taskTimeTracking: {}
    };
  }
};

export const restoreTimeTrackingData = (timeTrackingData: any, userId: string) => {
  const getStorageKey = (key: string) => userId ? `${key}_${userId}` : key;
  
  try {
    if (timeTrackingData.folderTimeTracking) {
      const folderKey = getStorageKey('folderTimeTracking');
      localStorage.setItem(folderKey, JSON.stringify(timeTrackingData.folderTimeTracking));
    }
    
    if (timeTrackingData.projectTimeTracking) {
      const projectKey = getStorageKey('projectTimeTracking');
      localStorage.setItem(projectKey, JSON.stringify(timeTrackingData.projectTimeTracking));
    }
    
    if (timeTrackingData.taskTimeTracking) {
      const taskKey = getStorageKey('taskTimeTracking');
      localStorage.setItem(taskKey, JSON.stringify(timeTrackingData.taskTimeTracking));
    }
    
    console.log('✅ Time tracking data restored successfully');
    return true;
  } catch (error) {
    console.error('❌ Error restoring time tracking data:', error);
    return false;
  }
};

export const formatBackupData = (folders: any[], projects: any[], tasks: any[], timeTrackingData?: any) => {
  return {
    version: '1.1', // Incrementamos versión para incluir time tracking
    exportDate: new Date().toISOString(),
    app: 'Planify',
    data: {
      folders,
      projects,
      tasks,
      timeTracking: timeTrackingData || {}
    },
    metadata: {
      totalFolders: folders.length,
      totalProjects: projects.length,
      totalTasks: tasks.length,
      includesTimeTracking: !!timeTrackingData
    }
  };
};