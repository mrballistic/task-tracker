'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Snackbar, Alert, Button } from '@mui/material';
import TaskForm from '@/components/tasks/TaskForm';
import AppLayout from '@/components/layout/AppLayout';
import { TaskFormData } from '@/types/task';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function NewTaskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }
      
      setSuccess(true);
      
      // Navigate back to tasks list after successful creation
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
      
      <TaskForm 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
      />
      
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
          Task created successfully!
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}