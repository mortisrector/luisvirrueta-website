'use client';

import React, { useState } from 'react';
import PremiumDailyTasksSection from './PremiumDailyTasksSection';
import PremiumCreateTaskModal from './PremiumCreateTaskModal';
import { DailyTask } from '@/types';

interface PremiumDailyTasksProps {
  tasks: DailyTask[];
  onToggleTask?: (taskId: string, value?: number) => void;
  onUpdateTask?: (taskId: string, value: number) => void;
  onEditTask?: (task: DailyTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onCreateTask?: (taskData: DailyTask) => void;
  onViewStats?: () => void;
}

export default function PremiumDailyTasks({
  tasks,
  onToggleTask,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  onCreateTask,
  onViewStats
}: PremiumDailyTasksProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleAddTask = () => {
    setShowCreateModal(true);
  };

  const handleCreateTask = (taskData: any) => {
    // Convertir los datos del modal premium a formato DailyTask
    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      type: taskData.type || 'subjective',
      target: taskData.target,
      unit: taskData.unit,
      completed: false,
      current: 0,
      score0to1: 0,
      streak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCreateTask?.(newTask);
    setShowCreateModal(false);
  };

  return (
    <>
      <PremiumDailyTasksSection
        tasks={tasks}
        onToggleTask={onToggleTask}
        onUpdateTask={onUpdateTask}
        onAddTask={handleAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onViewStats={onViewStats}
      />

      <PremiumCreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTask={handleCreateTask}
      />
    </>
  );
}