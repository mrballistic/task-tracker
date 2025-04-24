'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Grid, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Pagination,
  Paper
} from '@mui/material';
import TaskCard from './TaskCard';
import { Task, StatusLabels, PriorityLabels } from '@/types/task';
import { useCategories } from '@/contexts/CategoryContext';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
};

export default function TaskList() {
  // Get categories from context
  const { categories, getCategoryColor } = useCategories();
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const tasksPerPage = 5;

  // Construct the API URL with filters
  const getApiUrl = () => {
    let url = '/api/tasks';
    const params = new URLSearchParams();
    
    if (statusFilter) {
      params.append('status', statusFilter);
    }
    
    if (priorityFilter) {
      params.append('priority', priorityFilter);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return url;
  };

  // Fetch tasks with SWR
  const { data, error, isLoading, mutate } = useSWR<Task[]>(
    getApiUrl(),
    fetcher
  );

  // Handle filter changes
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handlePriorityFilterChange = (event: SelectChangeEvent<string>) => {
    setPriorityFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent<string>) => {
    setCategoryFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  // Handle task status change
  const handleStatusChange = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Refetch tasks to update the list
      mutate();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete task');
        }

        // Refetch tasks to update the list
        mutate();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Filter tasks by search term and category
  const filteredTasks = data
    ? data.filter((task) => {
        // Text search filter
        const matchesSearch = 
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase()));
          
        // Category filter
        const matchesCategory = !categoryFilter || task.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
      })
    : [];

  // Pagination
  const pageCount = Math.ceil(filteredTasks.length / tasksPerPage);
  const displayedTasks = filteredTasks.slice(
    (page - 1) * tasksPerPage,
    page * tasksPerPage
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Tasks
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search tasks"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title, description, or category"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    {Object.entries(StatusLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    onChange={handlePriorityFilterChange}
                    label="Priority"
                  >
                    <MenuItem value="">All</MenuItem>
                    {Object.entries(PriorityLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.name} value={category.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            component="span" 
                            sx={{ 
                              display: 'inline-block',
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              mr: 1,
                              backgroundColor: category.color
                            }}
                          />
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error loading tasks. Please try again.
        </Alert>
      )}

      {!isLoading && !error && displayedTasks.length === 0 && (
        <Alert severity="info" sx={{ my: 2 }}>
          No tasks found. Try adjusting your filters or create a new task.
        </Alert>
      )}

      {displayedTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteTask}
          onEdit={(task) => window.location.href = `/tasks/${task.id}/edit`}
        />
      ))}

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}