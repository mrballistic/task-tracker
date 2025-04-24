'use client';

import React from 'react';
import TaskList from '@/components/tasks/TaskList';
import AppLayout from '@/components/layout/AppLayout';

export default function TasksPage() {
  return (
    <AppLayout>
      <TaskList />
    </AppLayout>
  );
}