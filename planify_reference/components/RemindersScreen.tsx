'use client';

import { useState } from 'react';
import { Reminder, ReminderStatus, ReminderPriority, ReminderType, NavigationView } from '@/types';
import { 
  ArrowLeft, Bell, Search, Filter, Plus, 
  Clock, AlertTriangle, AlertCircle, Zap, Check,
  Calendar, Target, FolderOpen, Trash2, Edit3,
  BellRing, BellOff, Sparkles, TrendingUp, FileText,
  Stethoscope, Repeat, Star, Users, MapPin, Tag,
  Home, User
} from 'lucide-react';
import InlineNavigationBar from '@/components/InlineNavigationBar';

interface RemindersScreenProps {
  reminders: Reminder[];
  onBack: () => void;
  onAddReminder: () => void;
  onEditReminder: (reminder: Reminder) => void;
  onDeleteReminder: (reminderId: string) => void;
  onToggleComplete: (reminderId: string) => void;
  onToggleAlarm: (reminderId: string) => void;
  onNavigate?: (view: NavigationView) => void;
}

type FilterType = 'all' | 'pending' | 'completed' | 'with-alarms' | 'high-priority' | 'notes' | 'appointments' | 'recurring' | 'one-time';

export default function RemindersScreen({
  reminders,
  onBack,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
  onToggleComplete,
  onToggleAlarm,
  onNavigate
}: RemindersScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter reminders
  const getFilteredReminders = () => {
    let filtered = reminders;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(reminder =>
        reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status and type filters
    switch (activeFilter) {
      case 'pending':
        filtered = filtered.filter(r => r.status === 'pending');
        break;
      case 'completed':
        filtered = filtered.filter(r => r.status === 'completed');
        break;
      case 'with-alarms':
        filtered = filtered.filter(r => r.alarm?.enabled);
        break;
      case 'high-priority':
        filtered = filtered.filter(r => r.priority === 'high' || r.priority === 'urgent');
        break;
      case 'notes':
        filtered = filtered.filter(r => r.type === 'note');
        break;
      case 'appointments':
        filtered = filtered.filter(r => r.type === 'appointment');
        break;
      case 'recurring':
        filtered = filtered.filter(r => r.type === 'recurring');
        break;
      case 'one-time':
        filtered = filtered.filter(r => r.type === 'one-time');
        break;
    }

    return filtered.sort((a, b) => {
      // Urgent first
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
      
      // Then by alarm time
      if (a.alarm?.dateTime && b.alarm?.dateTime) {
        return new Date(a.alarm.dateTime).getTime() - new Date(b.alarm.dateTime).getTime();
      }
      
      // Finally by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const getPriorityConfig = (priority: ReminderPriority) => {
    switch (priority) {
      case 'urgent':
        return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: Zap };
      case 'high':
        return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: AlertTriangle };
      case 'medium':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: AlertCircle };
      case 'low':
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30', icon: Clock };
    }
  };

  const getReminderTypeConfig = (type: ReminderType) => {
    switch (type) {
      case 'note':
        return { icon: FileText, color: 'text-green-400', label: 'Nota', bg: 'bg-green-500/20' };
      case 'appointment':
        return { icon: Stethoscope, color: 'text-blue-400', label: 'Cita', bg: 'bg-blue-500/20' };
      case 'recurring':
        return { icon: Repeat, color: 'text-purple-400', label: 'Recurrente', bg: 'bg-purple-500/20' };
      case 'one-time':
        return { icon: Star, color: 'text-yellow-400', label: 'Ocasional', bg: 'bg-yellow-500/20' };
      case 'task':
        return { icon: Check, color: 'text-indigo-400', label: 'Tarea', bg: 'bg-indigo-500/20' };
      case 'event':
        return { icon: Calendar, color: 'text-pink-400', label: 'Evento', bg: 'bg-pink-500/20' };
      default:
        return { icon: Bell, color: 'text-gray-400', label: 'Recordatorio', bg: 'bg-gray-500/20' };
    }
  };

  const getDestinationConfig = (destination: string) => {
    switch (destination) {
      case 'project':
        return { icon: Target, color: 'text-blue-400', label: 'Proyecto' };
      case 'folder':
        return { icon: FolderOpen, color: 'text-purple-400', label: 'Carpeta' };
      case 'calendar':
        return { icon: Calendar, color: 'text-green-400', label: 'Calendario' };
      default:
        return { icon: Bell, color: 'text-amber-400', label: 'Recordatorio' };
    }
  };

  const filteredReminders = getFilteredReminders();

  const stats = {
    total: reminders.length,
    pending: reminders.filter(r => r.status === 'pending').length,
    withAlarms: reminders.filter(r => r.alarm?.enabled).length,
    urgent: reminders.filter(r => r.priority === 'urgent').length
  };

  const filterOptions = [
    { id: 'all' as FilterType, label: 'Todos', count: stats.total },
    { id: 'pending' as FilterType, label: 'Pendientes', count: stats.pending },
    { id: 'completed' as FilterType, label: 'Completados', count: reminders.length - stats.pending },
    { id: 'with-alarms' as FilterType, label: 'Con alarma', count: stats.withAlarms },
    { id: 'high-priority' as FilterType, label: 'Prioritarios', count: stats.urgent },
    { id: 'notes' as FilterType, label: '📝 Notas', count: reminders.filter(r => r.type === 'note').length },
    { id: 'appointments' as FilterType, label: '🩺 Citas', count: reminders.filter(r => r.type === 'appointment').length },
    { id: 'recurring' as FilterType, label: '🔄 Recurrentes', count: reminders.filter(r => r.type === 'recurring').length },
    { id: 'one-time' as FilterType, label: '⭐ Ocasionales', count: reminders.filter(r => r.type === 'one-time').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative px-4 py-6 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        
        <div className="relative flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              Recordatorios
            </h1>
            <p className="text-white/70 text-sm">
              Nunca olvides lo importante
            </p>
          </div>
          
          <button
            onClick={onAddReminder}
            className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: Bell, color: 'from-amber-500 to-orange-500' },
            { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'from-blue-500 to-cyan-500' },
            { label: 'Con alarma', value: stats.withAlarms, icon: BellRing, color: 'from-green-500 to-emerald-500' },
            { label: 'Urgentes', value: stats.urgent, icon: Zap, color: 'from-red-500 to-pink-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
              <div className={`w-8 h-8 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-white/60 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Buscar recordatorios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <Filter className="w-4 h-4 text-white" />
          </button>
          
          <div className="flex-1 flex gap-2 overflow-x-auto">
            {filterOptions.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
                  activeFilter === id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-medium">{label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeFilter === id ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-medium mb-2">
              {searchQuery ? 'Sin resultados' : 'Sin recordatorios'}
            </h3>
            <p className="text-white/60 text-sm mb-6">
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea tu primer recordatorio para empezar'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={onAddReminder}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Crear recordatorio
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => {
              const priorityConfig = getPriorityConfig(reminder.priority);
              const destConfig = getDestinationConfig(reminder.destination);
              const typeConfig = getReminderTypeConfig(reminder.type);
              const PriorityIcon = priorityConfig.icon;
              const DestIcon = destConfig.icon;
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={reminder.id}
                  className={`p-4 backdrop-blur-xl bg-white/5 border rounded-2xl transition-all duration-300 ${
                    reminder.status === 'completed' 
                      ? 'border-green-500/30 bg-green-500/10' 
                      : reminder.priority === 'urgent'
                        ? 'border-red-500/30 bg-red-500/5 shadow-lg shadow-red-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Checkbox */}
                    <button
                      onClick={() => onToggleComplete(reminder.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        reminder.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      {reminder.status === 'completed' && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-medium ${
                          reminder.status === 'completed' 
                            ? 'text-white/60 line-through' 
                            : 'text-white'
                        }`}>
                          {reminder.title}
                        </h3>
                        
                        <div className="flex items-center gap-2">
                          {/* Type Badge */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${typeConfig.bg} border border-white/10`}>
                            <TypeIcon className={`w-3 h-3 ${typeConfig.color}`} />
                            <span className={`text-xs font-medium ${typeConfig.color}`}>
                              {typeConfig.label}
                            </span>
                          </div>

                          {/* Priority Badge */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${priorityConfig.bg} ${priorityConfig.border} border`}>
                            <PriorityIcon className={`w-3 h-3 ${priorityConfig.color}`} />
                            <span className={`text-xs font-medium ${priorityConfig.color}`}>
                              {reminder.priority}
                            </span>
                          </div>

                          {/* Alarm Status */}
                          {reminder.alarm?.enabled && (
                            <button
                              onClick={() => onToggleAlarm(reminder.id)}
                              className="p-1 rounded-lg bg-amber-500/20 border border-amber-500/30"
                            >
                              <BellRing className="w-3 h-3 text-amber-400" />
                            </button>
                          )}
                        </div>
                      </div>

                      {reminder.description && (
                        <p className={`text-sm mb-3 ${
                          reminder.status === 'completed' ? 'text-white/40' : 'text-white/70'
                        }`}>
                          {reminder.description}
                        </p>
                      )}

                      {/* Patient Info for appointments */}
                      {reminder.type === 'appointment' && reminder.patientInfo && (
                        <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-300">
                              {reminder.patientInfo.name}
                            </span>
                          </div>
                          {reminder.patientInfo.phone && (
                            <div className="text-xs text-white/60 mb-1">
                              📞 {reminder.patientInfo.phone}
                            </div>
                          )}
                          {reminder.patientInfo.notes && (
                            <div className="text-xs text-white/60">
                              📋 {reminder.patientInfo.notes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recurrence info */}
                      {reminder.recurrence && (
                        <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Repeat className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-purple-300">
                              Se repite {reminder.recurrence.type === 'daily' ? 'diariamente' :
                                        reminder.recurrence.type === 'weekly' ? 'semanalmente' :
                                        reminder.recurrence.type === 'monthly' ? 'mensualmente' : 'anualmente'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {reminder.tags && reminder.tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {reminder.tags.map((tag: string, index: number) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white/70"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Destination */}
                          <div className="flex items-center gap-1">
                            <DestIcon className={`w-4 h-4 ${destConfig.color}`} />
                            <span className="text-xs text-white/60">{destConfig.label}</span>
                          </div>

                          {/* Alarm Time */}
                          {reminder.alarm?.enabled && reminder.alarm.dateTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-white/50" />
                              <span className="text-xs text-white/60">
                                {new Date(reminder.alarm.dateTime).toLocaleString('es-ES', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditReminder(reminder)}
                            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteReminder(reminder.id)}
                            className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}