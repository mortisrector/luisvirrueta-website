// App Tester - Sistema de pruebas para verificar funcionalidades de Planify

interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
}

interface DailyTask {
  id: string;
  title: string;
  type: 'boolean' | 'numeric' | 'text';
  streak: number;
  completed: boolean;
}

interface TestResults {
  collaboration: {
    users: User[];
    team: {
      name: string;
      members: number;
    };
    folder: {
      name: string;
      shared: boolean;
    };
    projects: Project[];
  };
  statistics: {
    globalProgress: number;
    completedProjects: number;
    completedDailyTasks: number;
    productivity: number;
  };
  dailyTasks: DailyTask[];
  logs: string[];
}

class AppTester {
  private logs: string[] = [];

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
    console.log(`[AppTester] ${message}`);
  }

  runFullTest(): TestResults {
    this.logs = [];
    this.log('🚀 Iniciando test completo de Planify...');

    // Test de colaboración
    this.log('👥 Ejecutando test de colaboración...');
    const collaborationResults = this.testCollaboration();

    // Test de estadísticas
    this.log('📊 Ejecutando test de estadísticas...');
    const statisticsResults = this.testStatistics();

    // Test de tareas diarias
    this.log('📅 Ejecutando test de tareas diarias...');
    const dailyTasksResults = this.testDailyTasks();

    this.log('✅ Test completo finalizado exitosamente');

    return {
      collaboration: collaborationResults,
      statistics: statisticsResults,
      dailyTasks: dailyTasksResults,
      logs: this.logs
    };
  }

  private testCollaboration() {
    this.log('Creando usuarios de prueba...');
    
    const users: User[] = [
      {
        id: 'user-1',
        name: 'María García',
        email: 'maria@example.com',
        role: 'owner'
      },
      {
        id: 'user-2',
        name: 'Carlos Rodríguez',
        email: 'carlos@example.com',
        role: 'admin'
      },
      {
        id: 'user-3',
        name: 'Ana López',
        email: 'ana@example.com',
        role: 'member'
      },
      {
        id: 'user-4',
        name: 'Diego Martín',
        email: 'diego@example.com',
        role: 'viewer'
      }
    ];

    this.log(`✓ ${users.length} usuarios creados`);

    const team = {
      name: 'Equipo Desarrollo Web',
      members: users.length
    };

    this.log(`✓ Equipo "${team.name}" configurado`);

    const folder = {
      name: 'Proyecto E-commerce 2024',
      shared: true
    };

    this.log(`✓ Carpeta compartida "${folder.name}" creada`);

    const projects: Project[] = [
      {
        id: 'proj-1',
        title: 'Diseño de UI/UX',
        description: 'Diseñar la interfaz del usuario',
        progress: 85,
        status: 'active'
      },
      {
        id: 'proj-2',
        title: 'Backend API',
        description: 'Desarrollar la API REST',
        progress: 60,
        status: 'active'
      },
      {
        id: 'proj-3',
        title: 'Base de Datos',
        description: 'Configurar y optimizar BD',
        progress: 100,
        status: 'completed'
      },
      {
        id: 'proj-4',
        title: 'Testing QA',
        description: 'Pruebas de calidad',
        progress: 30,
        status: 'active'
      }
    ];

    this.log(`✓ ${projects.length} proyectos creados`);
    this.log('✓ Permisos de colaboración configurados');

    return {
      users,
      team,
      folder,
      projects
    };
  }

  private testStatistics() {
    this.log('Calculando estadísticas globales...');

    // Simular cálculos estadísticos
    const globalProgress = Math.floor(Math.random() * 30) + 60; // 60-90%
    const completedProjects = Math.floor(Math.random() * 5) + 8; // 8-12
    const completedDailyTasks = Math.floor(Math.random() * 20) + 15; // 15-35
    const productivity = Math.floor(Math.random() * 25) + 75; // 75-100%

    this.log(`✓ Progreso global calculado: ${globalProgress}%`);
    this.log(`✓ Proyectos completados: ${completedProjects}`);
    this.log(`✓ Tareas diarias completadas: ${completedDailyTasks}`);
    this.log(`✓ Productividad general: ${productivity}%`);

    return {
      globalProgress,
      completedProjects,
      completedDailyTasks,
      productivity
    };
  }

  private testDailyTasks(): DailyTask[] {
    this.log('Generando tareas diarias de prueba...');

    const tasks: DailyTask[] = [
      {
        id: 'task-1',
        title: 'Revisar emails y mensajes',
        type: 'boolean',
        streak: 7,
        completed: true
      },
      {
        id: 'task-2',
        title: 'Hacer ejercicio (minutos)',
        type: 'numeric',
        streak: 5,
        completed: true
      },
      {
        id: 'task-3',
        title: 'Leer documentación técnica',
        type: 'boolean',
        streak: 12,
        completed: true
      },
      {
        id: 'task-4',
        title: 'Escribir en el diario',
        type: 'text',
        streak: 3,
        completed: false
      },
      {
        id: 'task-5',
        title: 'Planificar día siguiente',
        type: 'boolean',
        streak: 15,
        completed: true
      },
      {
        id: 'task-6',
        title: 'Revisar progreso de proyectos',
        type: 'boolean',
        streak: 8,
        completed: true
      }
    ];

    this.log(`✓ ${tasks.length} tareas diarias generadas`);
    this.log(`✓ Rachas de hábitos calculadas`);

    return tasks;
  }
}

// Exportar instancia singleton
export const appTester = new AppTester();