'use client';

import { Project, User } from '@/types';
import { Swords, TrendingUp, TrendingDown, Crown, Calendar, DollarSign, Users } from 'lucide-react';

interface CompetitionDashboardProps {
  project: Project;
  currentUserId: string;
  onUpdateProgress?: (userId: string, newProgress: number) => void;
}

export default function CompetitionDashboard({ 
  project, 
  currentUserId, 
  onUpdateProgress 
}: CompetitionDashboardProps) {
  if (!project.competitionConfig) return null;

  const { participants, deadline, stake, winner } = project.competitionConfig;
  
  // Find current user
  const currentUser = participants.find(p => p.userId === currentUserId);
  const opponents = participants.filter(p => p.userId !== currentUserId);
  
  // Sort participants by progress (descending)
  const sortedParticipants = [...participants].sort((a, b) => b.progress - a.progress);
  const leaderboard = sortedParticipants.map((participant, index) => ({
    ...participant,
    rank: index + 1,
    isLeader: index === 0
  }));

  const handleProgressUpdate = (userId: string, delta: number) => {
    const participant = participants.find(p => p.userId === userId);
    if (!participant) return;
    
    const newProgress = Math.max(0, Math.min(100, participant.progress + delta));
    onUpdateProgress?.(userId, newProgress);
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    return `${diffDays} días restantes`;
  };

  const getProgressColor = (progress: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'from-blue-500 to-cyan-500';
    }
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 60) return 'from-yellow-500 to-orange-500';
    if (progress >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">⚔️ Competición</h3>
            <p className="text-gray-400 text-sm">
              {participants.length} participantes
            </p>
          </div>
        </div>
        
        {deadline && (
          <div className="text-right">
            <div className="text-sm font-medium text-red-400">
              <Calendar className="w-4 h-4 inline mr-1" />
              {formatDeadline(deadline)}
            </div>
          </div>
        )}
      </div>

      {/* Competition Info */}
      {(stake || deadline) && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-4 text-sm">
            {stake && (
              <div className="flex items-center gap-1 text-yellow-400">
                <DollarSign className="w-4 h-4" />
                <span>{stake}</span>
              </div>
            )}
            {deadline && (
              <div className="flex items-center gap-1 text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Hasta: {new Date(deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="mb-4">
        <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4" />
          Clasificación
        </h4>
        <div className="space-y-2">
          {leaderboard.map((participant) => {
            const isCurrentUser = participant.userId === currentUserId;
            
            return (
              <div
                key={participant.userId}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrentUser 
                    ? 'border-blue-500/50 bg-blue-500/10' 
                    : 'border-white/10 bg-white/5'
                } ${participant.isLeader ? 'ring-2 ring-yellow-500/50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">
                      {getRankIcon(participant.rank)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                        {participant.userName.charAt(0)}
                      </div>
                      <span className={`font-medium ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                        {participant.userName}
                        {isCurrentUser && ' (Tú)'}
                      </span>
                      {participant.isLeader && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">
                      {participant.progress.toFixed(1)}%
                    </span>
                    
                    {/* Control buttons for current user */}
                    {isCurrentUser && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleProgressUpdate(participant.userId, -5)}
                          className="w-6 h-6 rounded bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 text-xs transition-colors"
                          title="Decrementar 5%"
                        >
                          <TrendingDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleProgressUpdate(participant.userId, 5)}
                          className="w-6 h-6 rounded bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center text-green-400 text-xs transition-colors"
                          title="Incrementar 5%"
                        >
                          <TrendingUp className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`bg-gradient-to-r ${getProgressColor(participant.progress, isCurrentUser)} h-3 rounded-full transition-all duration-500 relative overflow-hidden`}
                    style={{ width: `${participant.progress}%` }}
                  >
                    {/* Shine effect for leader */}
                    {participant.isLeader && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    )}
                  </div>
                </div>
                
                {/* Last Update */}
                {participant.lastUpdate && (
                  <div className="text-xs text-gray-400 mt-1">
                    Última actualización: {new Date(participant.lastUpdate).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Winner Announcement */}
      {winner && (
        <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">
              🎉 Ganador: {participants.find(p => p.userId === winner)?.userName}
            </span>
          </div>
        </div>
      )}

      {/* Quick Instructions */}
      {currentUser && !winner && (
        <div className="mt-4 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-xs">
            💡 Usa los botones ⬆️⬇️ para actualizar tu progreso. Los demás participantes podrán ver tus cambios.
          </p>
        </div>
      )}
    </div>
  );
}