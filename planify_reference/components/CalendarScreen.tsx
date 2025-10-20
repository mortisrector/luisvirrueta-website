'use client';

import { useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight,
  Plus, Search, Stethoscope, 
  FileText, Repeat, Star, Bell, Settings
} from 'lucide-react';
import InlineNavigationBar from '@/components/InlineNavigationBar';
// Local minimal types to avoid coupling with global types
type NavigationView = 'home' | 'folders' | 'ideas' | 'calendar' | 'reminders' | 'profile';
type CalendarView = 'month' | 'week' | 'day' | 'year';
type ReminderType = 'appointment' | 'note' | 'task' | 'recurring' | string;
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
  type?: ReminderType | string;
  reminderId?: string;
  color?: string;
  icon?: string;
  recurrence?: any;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
interface Reminder {
  id: string;
  title: string;
  description?: string;
  // Legacy fields used by this screen
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  type?: ReminderType | string;
  priority?: string;
  recurrence?: any;
  createdAt?: string;
  updatedAt?: string;
  // Other common fields from app
  date?: string;
  time?: string;
  completed?: boolean;
  projectId?: string;
  folderId?: string;
}

// Helper function to get React component from icon name
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'stethoscope': return Stethoscope;
    case 'file-text': return FileText;
    case 'star': return Star;
    case 'repeat': return Repeat;
    default: return Bell;
  }
};

interface CalendarScreenProps {
  reminders: Reminder[];
  onAddEvent?: () => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onBack?: () => void;
  onNavigate?: (view: NavigationView) => void;
}

export default function CalendarScreen({
  reminders,
  onAddEvent,
  onEventClick,
  onNavigate
}: CalendarScreenProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ReminderType | 'all'>('all');
  const [showSidebar, setShowSidebar] = useState(false);

  // Funciones auxiliares
  const getEventColor = (type: string, priority: string) => {
    if (type === 'appointment') return 'bg-blue-500';
    if (type === 'note') return 'bg-green-500';
    if (type === 'task') return 'bg-purple-500';
    if (priority === 'urgent') return 'bg-red-500';
    if (priority === 'high') return 'bg-orange-500';
    return 'bg-indigo-500';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Stethoscope;
      case 'note': return FileText;
      case 'task': return Star;
      case 'recurring': return Repeat;
      default: return Bell;
    }
  };

  const getEventIconName = (type: string) => {
    switch (type) {
      case 'appointment': return 'stethoscope';
      case 'note': return 'file-text';
      case 'task': return 'star';
      case 'recurring': return 'repeat';
      default: return 'bell';
    }
  };

  // Convertir recordatorios a eventos de calendario
  const calendarEvents: CalendarEvent[] = reminders.map(reminder => ({
    id: reminder.id,
    title: reminder.title,
    description: reminder.description,
  startDate: new Date(reminder.startDate || reminder.date || new Date().toISOString()),
    endDate: reminder.endDate ? new Date(reminder.endDate) : undefined,
    allDay: reminder.allDay || false,
    type: reminder.type === 'note' ? 'note' : 
          reminder.type === 'appointment' ? 'appointment' : 
          reminder.type === 'task' ? 'task' : 'reminder',
    reminderId: reminder.id,
  color: getEventColor(reminder.type || 'reminder', reminder.priority || 'normal'),
  icon: getEventIconName(reminder.type || 'reminder'),
    recurrence: reminder.recurrence,
    createdAt: reminder.createdAt,
    updatedAt: reminder.updatedAt
  }));

  // Filtrar eventos
  const filteredEvents = calendarEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Navegación de fechas
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric'
    };
    
    switch (view) {
      case 'day':
        return currentDate.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      case 'month':
        return currentDate.toLocaleDateString('es-ES', options);
      case 'year':
        return currentDate.getFullYear().toString();
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Premium */}
      <div className="relative px-4 pt-8 pb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        
        <div className="relative">
          {/* Título y controles principales */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Calendario</h1>
                <p className="text-white/70 text-sm">Organiza tu tiempo</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación de fechas */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateDate('prev')}
              className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-white capitalize">
                {formatDateRange()}
              </h2>
              <p className="text-white/60 text-sm">
                {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <button
              onClick={() => navigateDate('next')}
              className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de vista */}
          <div className="flex gap-2 mb-6">
            {(['day', 'week', 'month', 'year'] as CalendarView[]).map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  view === viewType
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-lg border border-white/20 text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                {viewType === 'day' ? 'Día' :
                 viewType === 'week' ? 'Semana' :
                 viewType === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="px-4 mb-6">
        <div className="flex gap-3 mb-4">
          {/* Buscador */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-white/40 focus:bg-white/20 transition-all duration-300"
            />
          </div>
          
          {/* Filtro de tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ReminderType | 'all')}
            className="px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white focus:border-white/40 focus:bg-white/20 transition-all duration-300"
          >
            <option value="all">Todos</option>
            <option value="appointment">Citas</option>
            <option value="note">Notas</option>
            <option value="task">Tareas</option>
            <option value="recurring">Recurrentes</option>
            <option value="one-time">Ocasionales</option>
          </select>
        </div>
      </div>

      {/* Vista del calendario */}
      <div className="px-4">
        {view === 'month' && <MonthView events={filteredEvents} currentDate={currentDate} onEventClick={onEventClick} />}
        {view === 'week' && <WeekView events={filteredEvents} />}
        {view === 'day' && <DayView events={filteredEvents} />}
        {view === 'year' && <YearView events={filteredEvents} />}
      </div>

      {/* Botón flotante para agregar evento */}
      <button
        onClick={onAddEvent}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Panel lateral de configuración */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowSidebar(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-lg border-l border-white/20 p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-6">Configuración</h3>
            
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{filteredEvents.length}</div>
                <div className="text-white/60 text-sm">Eventos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">
                  {filteredEvents.filter(e => e.type === 'appointment').length}
                </div>
                <div className="text-white/60 text-sm">Citas</div>
              </div>
            </div>
            
            {/* Vista rápida de próximos eventos */}
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Próximos Eventos</h4>
              <div className="space-y-2">
                {filteredEvents
                  .filter(event => event.startDate >= new Date())
                  .slice(0, 5)
                  .map((event) => {
                    const Icon = getEventIcon(event.type || 'reminder');
                    return (
                      <div key={event.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <Icon className="w-4 h-4 text-white/60" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{event.title}</div>
                          <div className="text-white/60 text-xs">
                            {event.startDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Componente para vista mensual
function MonthView({ events, currentDate, onEventClick }: { 
  events: CalendarEvent[], 
  currentDate: Date,
  onEventClick?: (event: CalendarEvent) => void 
}) {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay());
  
  const weeks = [];
  const current = new Date(startOfCalendar);
  
  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const getDayEvents = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
      {/* Encabezado de días de la semana */}
      <div className="grid grid-cols-7 bg-white/5">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="p-4 text-center text-white/80 font-medium border-r border-white/10 last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      {/* Días del mes */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 border-b border-white/10 last:border-b-0">
          {week.map((date, dayIndex) => {
            const dayEvents = getDayEvents(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={dayIndex} 
                className={`min-h-[120px] p-2 border-r border-white/10 last:border-r-0 ${
                  isCurrentMonth ? 'bg-white/5' : 'bg-white/2'
                } hover:bg-white/10 transition-colors duration-200`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday 
                    ? 'w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs' 
                    : isCurrentMonth ? 'text-white' : 'text-white/40'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const Icon = getIconComponent(event.icon || 'bell');
                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className={`${event.color} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                      >
                        <Icon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-white/60 px-1">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Componentes para otras vistas (simplificados)
function WeekView({ events }: { 
  events: CalendarEvent[]
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <div className="text-center text-white/60">
        Vista Semanal - {events.length} eventos
      </div>
    </div>
  );
}

function DayView({ events }: { 
  events: CalendarEvent[]
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <div className="text-center text-white/60">
        Vista Diaria - {events.length} eventos
      </div>
    </div>
  );
}

function YearView({ events }: { 
  events: CalendarEvent[]
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <div className="text-center text-white/60">
        Vista Anual - {events.length} eventos
      </div>
    </div>
  );
}