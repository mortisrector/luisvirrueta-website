'use client';

import { useState, useEffect, useRef } from 'react';
import { ReminderDestination, ReminderPriority, Project, Folder } from '@/types';
import { 
  X, Bell, Target, FolderOpen, Calendar, 
  Clock, AlertTriangle, AlertCircle, Zap,
  Plus, Sparkles, ChevronDown, CheckSquare, Mic, MicOff
} from 'lucide-react';

interface PremiumQuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  autoStartVoice?: boolean;
  projects: Project[];
  folders: Folder[];
  onSave: (destination: ReminderDestination, text: string, data: any) => void;
}

export default function PremiumQuickCaptureModal({
  isOpen, 
  onClose, 
  initialText,
  autoStartVoice = false,
  projects,
  folders, 
  onSave 
}: PremiumQuickCaptureModalProps) {
  const [text, setText] = useState(initialText);
  const [destination, setDestination] = useState<ReminderDestination>('reminder');
  const [priority, setPriority] = useState<ReminderPriority>('medium');
  const [hasAlarm, setHasAlarm] = useState(false);
  const [alarmTime, setAlarmTime] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [taskType, setTaskType] = useState<'boolean' | 'numeric'>('boolean');
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Update text when initialText changes
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'es-ES';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setText(prev => prev + (prev ? ' ' : '') + transcript);
          stopListening();
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          stopListening();
        };

        recognitionRef.current.onend = () => {
          stopListening();
        };
      }
    }

    return () => {
      stopListening();
    };
  }, []);

  // Auto start voice recognition when modal opens
  useEffect(() => {
    if (isOpen && autoStartVoice && isSupported && !isListening) {
      // Pequeño delay para que el modal se renderice completamente
      const timer = setTimeout(() => {
        if (recognitionRef.current && !isListening) {
          setIsListening(true);
          recognitionRef.current.start();
          
          // Start audio analysis for voice waves
          navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            setMediaStream(stream);
            
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(context);
            
            const analyser = context.createAnalyser();
            const microphone = context.createMediaStreamSource(stream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;
            microphone.connect(analyser);
            
            const updateVoiceLevel = () => {
              analyser.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              setVoiceLevel(Math.min(100, (average / 128) * 100));
              
              if (isListening) {
                animationFrameRef.current = requestAnimationFrame(updateVoiceLevel);
              }
            };
            
            updateVoiceLevel();
          }).catch((error) => {
            console.error('Error accessing microphone:', error);
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoStartVoice, isSupported]);

  const startListening = async () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
      
      // Start audio analysis for voice waves
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaStream(stream);
        
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
        
        const analyser = context.createAnalyser();
        const microphone = context.createMediaStreamSource(stream);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;
        microphone.connect(analyser);
        
        const updateVoiceLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVoiceLevel(Math.min(100, (average / 128) * 100));
          
          if (isListening) {
            animationFrameRef.current = requestAnimationFrame(updateVoiceLevel);
          }
        };
        
        updateVoiceLevel();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    setIsListening(false);
    setVoiceLevel(0);
    
    // Cleanup audio
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
  };
  
  if (!isOpen) return null;
  
  const destinations = [
    { 
      key: 'reminder' as ReminderDestination, 
      label: 'Recordatorio', 
      icon: Bell, 
      color: 'from-amber-500 to-orange-500',
      description: 'Con alarma opcional'
    },
    { 
      key: 'project' as ReminderDestination, 
      label: 'Proyecto', 
      icon: Target, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Nueva tarea en proyecto'
    },
    { 
      key: 'folder' as ReminderDestination, 
      label: 'Carpeta', 
      icon: FolderOpen, 
      color: 'from-purple-500 to-pink-500',
      description: 'Organizar en carpeta'
    },
    { 
      key: 'calendar' as ReminderDestination, 
      label: 'Calendario', 
      icon: Calendar, 
      color: 'from-green-500 to-emerald-500',
      description: 'Agendar evento'
    },
  ];

  const priorities = [
    { key: 'low' as ReminderPriority, label: 'Baja', icon: Clock, color: 'text-gray-400' },
    { key: 'medium' as ReminderPriority, label: 'Media', icon: AlertCircle, color: 'text-blue-400' },
    { key: 'high' as ReminderPriority, label: 'Alta', icon: AlertTriangle, color: 'text-orange-400' },
    { key: 'urgent' as ReminderPriority, label: 'Urgente', icon: Zap, color: 'text-red-400' },
  ];

  const quickTimes = [
    { label: 'En 1 hora', value: new Date(Date.now() + 60 * 60 * 1000) },
    { label: 'En 3 horas', value: new Date(Date.now() + 3 * 60 * 60 * 1000) },
    { label: 'Mañana 9 AM', value: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    })() },
    { label: 'En 1 semana', value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  ];

  const handleSave = () => {
    if (text.trim()) {
      const data = {
        priority,
        alarm: hasAlarm ? {
          enabled: true,
          dateTime: alarmTime ? new Date(alarmTime) : undefined,
          sound: 'default',
          vibration: true
        } : undefined,
        targetProjectId: destination === 'project' ? selectedProjectId : undefined,
        targetFolderId: destination === 'folder' ? selectedFolderId : undefined,
        taskType: destination === 'project' ? taskType : undefined
      };
      
      onSave(destination, text, data);
      onClose();
      setText('');
      setPriority('medium');
      setHasAlarm(false);
      setAlarmTime('');
      setSelectedProjectId('');
      setSelectedFolderId('');
      setTaskType('boolean');
      stopListening();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Captura Rápida</h3>
              <p className="text-white/60 text-sm">Organiza tu pensamiento al instante</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Text Input with Voice */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white/80 text-sm font-medium">¿Qué tienes en mente?</label>
              {isSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300
                    ${isListening 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                    }
                  `}
                >
                  <div className="relative">
                    {isListening ? (
                      <Mic className="w-3.5 h-3.5" />
                    ) : (
                      <div className="relative">
                        <Mic className="w-3.5 h-3.5" />
                        <div className="absolute inset-0 w-4 h-0.5 bg-white rounded-full rotate-45 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    )}
                  </div>
                  {isListening ? 'Escuchando...' : 'Dictar'}
                </button>
              )}
            </div>
            
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe tu idea, tarea o recordatorio..."
                className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                autoFocus
              />
              
              {/* Voice Waves Overlay - DENTRO del textarea */}
              {isListening && (
                <div className="absolute bottom-3 right-3 flex items-end gap-1 px-3 py-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-full transition-all duration-150 ease-out"
                      style={{
                        height: `${Math.max(4, Math.min(20, (voiceLevel * (1.2 + Math.sin((Date.now() / 80) + i * 0.5) * 0.4)) / 8))}px`,
                        animationDelay: `${i * 30}ms`
                      }}
                    />
                  ))}
                  <span className="text-green-400 text-xs font-medium ml-2">🎤</span>
                </div>
              )}
            </div>
          </div>

          {/* Destination Selection */}
          <div className="space-y-3">
            <label className="text-white/80 text-sm font-medium">¿Dónde lo guardamos?</label>
            <div className="grid grid-cols-2 gap-3">
              {destinations.map(({ key, label, icon: Icon, color, description }) => (
                <button
                  key={key}
                  onClick={() => setDestination(key)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    destination === key
                      ? `bg-gradient-to-r ${color} border-white/30 text-white shadow-lg`
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs opacity-80 mt-1">{description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recordatorio Options */}
          {destination === 'reminder' && (
            <div className="space-y-4">
              {/* Priority */}
              <div className="space-y-3">
                <label className="text-white/80 text-sm font-medium">Prioridad</label>
                <div className="flex gap-2">
                  {priorities.map(({ key, label, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => setPriority(key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                        priority === key
                          ? 'bg-white/15 border-white/30 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${priority === key ? 'text-white' : color}`} />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alarm Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-white/70" />
                  <div>
                    <div className="text-white font-medium">Programar alarma</div>
                    <div className="text-white/60 text-sm">Notificación en momento específico</div>
                  </div>
                </div>
                <button
                  onClick={() => setHasAlarm(!hasAlarm)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    hasAlarm ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 top-0.5 ${
                    hasAlarm ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Alarm Time */}
              {hasAlarm && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {quickTimes.map(({ label, value }) => (
                      <button
                        key={label}
                        onClick={() => setAlarmTime(value.toISOString().slice(0, 16))}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="datetime-local"
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10"
                  />
                </div>
              )}
            </div>
          )}

          {/* Project Options */}
          {destination === 'project' && (
            <div className="space-y-4">
              {/* Project Selection */}
              <div className="space-y-3">
                <label className="text-white/80 text-sm font-medium">Selecciona el proyecto</label>
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10 appearance-none"
                  >
                    <option value="" className="bg-slate-800">Seleccionar proyecto...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id} className="bg-slate-800">
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                </div>
              </div>

              {/* Task Type */}
              <div className="space-y-3">
                <label className="text-white/80 text-sm font-medium">Tipo de tarea</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTaskType('boolean')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                      taskType === 'boolean'
                        ? 'bg-white/15 border-white/30 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium">Sí/No</div>
                      <div className="text-xs opacity-80">Completar o no</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setTaskType('numeric')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                      taskType === 'numeric'
                        ? 'bg-white/15 border-white/30 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium">Numérica</div>
                      <div className="text-xs opacity-80">Con progreso</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Folder Options */}
          {destination === 'folder' && (
            <div className="space-y-4">
              {/* Folder Selection */}
              <div className="space-y-3">
                <label className="text-white/80 text-sm font-medium">Selecciona la carpeta</label>
                <div className="relative">
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10 appearance-none"
                  >
                    <option value="" className="bg-slate-800">Seleccionar carpeta...</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id} className="bg-slate-800">
                        {folder.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                </div>
                <p className="text-white/60 text-sm">
                  Se creará un nuevo proyecto dentro de la carpeta seleccionada
                </p>
              </div>
            </div>
          )}

          {/* Calendar Options */}
          {destination === 'calendar' && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Evento de calendario</div>
                    <div className="text-white/60 text-sm">Se programará como evento</div>
                  </div>
                </div>
                <input
                  type="datetime-local"
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white/70 font-medium hover:bg-white/15 hover:text-white transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={
              !text.trim() || 
              (destination === 'project' && !selectedProjectId) ||
              (destination === 'folder' && !selectedFolderId) ||
              (destination === 'calendar' && !alarmTime)
            }
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}