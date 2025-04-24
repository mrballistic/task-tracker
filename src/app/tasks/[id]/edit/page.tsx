'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Snackbar, Alert, Button, CircularProgress, Typography } from '@mui/material';
import TaskForm from '@/components/tasks/TaskForm';
import AppLayout from '@/components/layout/AppLayout';
import { Task, TaskFormData } from '@/types/task';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch task');
  }
  return res.json();
};

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch task data
  const { data: task, error: fetchError, isLoading: isFetching } = useSWR<Task>(
    `/api/tasks/${taskId}`,
    fetcher
  );

  const handleSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      setSuccess(true);
      
      // Navigate back to tasks list after successful update
      setTimeout(() => {
        router.push('/tasks');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/tasks')}
        >
          Back to Tasks
        </Button>
      </Box>
      
      {isFetching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {fetchError && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error loading task. The task may have been deleted or does not exist.
        </Alert>
      )}
      
      {!isFetching && !fetchError && !task && (
        <Alert severity="warning" sx={{ my: 2 }}>
          Task not found
        </Alert>
      )}
      
      {task && (
        <TaskForm 
          initialData={task} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      )}
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Task updated successfully!
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}