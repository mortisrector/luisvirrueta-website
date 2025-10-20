'use client';

import { useState } from 'react';
import { X, Trophy, Star, Award, Crown, Sparkles, CheckCircle, Lock, Calendar } from 'lucide-react';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'productivity' | 'consistency' | 'mastery' | 'social';
  progress?: number;
  maxProgress?: number;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export default function AchievementsModal({ isOpen, onClose, achievements }: AchievementsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: 'Todos', icon: Trophy },
    { key: 'productivity', label: 'Productividad', icon: Star },
    { key: 'consistency', label: 'Constancia', icon: Award },
    { key: 'mastery', label: 'Maestría', icon: Crown },
    { key: 'social', label: 'Social', icon: Sparkles },
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return { bg: 'bg-gradient-to-r from-yellow-500 to-orange-500', text: 'text-white', label: 'Legendario' };
      case 'epic': return { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-white', label: 'Épico' };
      case 'rare': return { bg: 'bg-gradient-to-r from-blue-500 to-indigo-500', text: 'text-white', label: 'Raro' };
      default: return { bg: 'bg-white/20', text: 'text-white/80', label: 'Común' };
    }
  };

  const completedCount = achievements.filter(a => a.unlocked).length;
  const completionPercentage = (completedCount / achievements.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Reconocimientos</h2>
                <p className="text-white/70 text-sm">Tu colección de logros</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Overview */}
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Progreso General</span>
              <span className="text-white/80 text-sm">{completedCount} / {achievements.length}</span>
            </div>
            
            <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="text-white/60">0%</span>
              <span className="text-yellow-400 font-semibold">{Math.round(completionPercentage)}% completado</span>
              <span className="text-white/60">100%</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 gap-4">
            {filteredAchievements.map((achievement) => {
              const rarityBadge = getRarityBadge(achievement.rarity);
              
              return (
                <div 
                  key={achievement.id}
                  className={`relative group ${achievement.unlocked ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {/* Achievement Glow */}
                  {achievement.unlocked && (
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${achievement.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                  )}
                  
                  <div className={`relative backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-white/15 to-white/10 border-white/30 group-hover:border-white/40' 
                      : 'bg-black/30 border-white/10'
                  }`}>
                    <div className="flex items-start gap-4">
                      {/* Achievement Icon */}
                      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 ${
                        achievement.unlocked 
                          ? `bg-gradient-to-r ${achievement.gradient} border-white/20 shadow-lg` 
                          : 'bg-black/50 border-white/10 grayscale'
                      }`}>
                        {achievement.icon}
                        
                        {/* Rarity Border */}
                        {achievement.unlocked && (
                          <div className={`absolute -inset-1 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-2xl -z-10 opacity-50`}></div>
                        )}
                        
                        {/* Lock Icon for Locked Achievements */}
                        {!achievement.unlocked && (
                          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                            <Lock className="w-6 h-6 text-white/60" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-bold text-lg ${achievement.unlocked ? 'text-white' : 'text-white/40'}`}>
                            {achievement.name}
                          </h3>
                          
                          {/* Rarity Badge */}
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${rarityBadge.bg} ${rarityBadge.text}`}>
                            {rarityBadge.label}
                          </span>
                        </div>
                        
                        <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-white/70' : 'text-white/40'}`}>
                          {achievement.description}
                        </p>
                        
                        {/* Progress Bar (if applicable) */}
                        {achievement.progress !== undefined && achievement.maxProgress && (
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white/60 text-xs">Progreso</span>
                              <span className="text-white/80 text-xs">{achievement.progress} / {achievement.maxProgress}</span>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${achievement.gradient} rounded-full transition-all duration-500`}
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {/* Unlock Status */}
                        <div className="flex items-center justify-between">
                          {achievement.unlocked ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-xs font-semibold">Desbloqueado</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-white/40" />
                              <span className="text-white/40 text-xs">Bloqueado</span>
                            </div>
                          )}
                          
                          {achievement.unlocked && achievement.unlockedAt && (
                            <div className="flex items-center gap-1 text-white/50 text-xs">
                              <Calendar className="w-3 h-3" />
                              {achievement.unlockedAt}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}