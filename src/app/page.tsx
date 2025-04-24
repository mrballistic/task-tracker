'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button,
  CircularProgress,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import Link from 'next/link';
import useSWR from 'swr';
import { Add as AddIcon } from '@mui/icons-material';
import { Task } from '@/types/task';
import AppLayout from '@/components/layout/AppLayout';
import TaskCard from '@/components/tasks/TaskCard';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
};

export default function HomePage() {
  const { data: tasks, error, isLoading } = useSWR<Task[]>('/api/tasks', fetcher);
  
  // Group tasks by status
  const todoTasks = tasks?.filter(task => task.status === 'TODO') || [];
  const inProgressTasks = tasks?.filter(task => task.status === 'IN_PROGRESS') || [];
  const doneTasks = tasks?.filter(task => task.status === 'DONE') || [];
  
  // Get high priority tasks
  const highPriorityTasks = tasks?.filter(task => task.priority === 1) || [];
  
  // Get tasks due soon (within the next 3 days)
  const today = new Date();
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);
  
  const tasksDueSoon = tasks?.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= threeDaysLater;
  }) || [];

  // Calculate task statistics
  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  return (
    <AppLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Task Dashboard
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={Link}
            href="/tasks/new"
          >
            New Task
          </Button>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            Error loading tasks. Please try refreshing the page.
          </Alert>
        )}

        {!isLoading && !error && (
          <>
            {/* Task Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h6" color="text.secondary">Total Tasks</Typography>
                  <Typography variant="h3">{totalTasks}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h6" color="text.secondary">To Do</Typography>
                  <Typography variant="h3">{todoTasks.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h6" color="text.secondary">In Progress</Typography>
                  <Typography variant="h3">{inProgressTasks.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h6" color="text.secondary">Completion Rate</Typography>
                  <Typography variant="h3">{completionRate}%</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {/* High Priority Tasks */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    High Priority Tasks {highPriorityTasks.length > 0 && `(${highPriorityTasks.length})`}
                  </Typography>
                  
                  {highPriorityTasks.length === 0 ? (
                    <Alert severity="info">No high priority tasks</Alert>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {highPriorityTasks.slice(0, 3).map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onEdit={(task) => window.location.href = `/tasks/${task.id}/edit`}
                        />
                      ))}
                      {highPriorityTasks.length > 3 && (
                        <Button 
                          component={Link} 
                          href="/tasks" 
                          fullWidth 
                          sx={{ mt: 1 }}
                        >
                          View All High Priority Tasks
                        </Button>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Due Soon Tasks */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Due Soon {tasksDueSoon.length > 0 && `(${tasksDueSoon.length})`}
                  </Typography>
                  
                  {tasksDueSoon.length === 0 ? (
                    <Alert severity="info">No tasks due in the next 3 days</Alert>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {tasksDueSoon.slice(0, 3).map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task}
                          onEdit={(task) => window.location.href = `/tasks/${task.id}/edit`}
                        />
                      ))}
                      {tasksDueSoon.length > 3 && (
                        <Button 
                          component={Link} 
                          href="/tasks" 
                          fullWidth 
                          sx={{ mt: 1 }}
                        >
                          View All Upcoming Tasks
                        </Button>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AppLayout>
  );
}
