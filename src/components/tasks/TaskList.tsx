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
  Paper,
  Chip,
  IconButton,
  Autocomplete,
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  FilterAlt as FilterIcon,
  DateRange as DateIcon,
  Label as LabelIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import TaskCard from './TaskCard';
import { Task, StatusLabels, PriorityLabels } from '@/types/task';
import { useCategories } from '@/contexts/CategoryContext';
import { format, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
};

// Due date filter options
type DueDateFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'overdue' | 'none';

export default function TaskList() {
  // Get categories from context
  const { categories, getCategoryColor } = useCategories();
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const tasksPerPage = 5;
  
  // State to track all available tags
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Extract all unique tags from tasks
  useEffect(() => {
    if (data) {
      const allTags = new Set<string>();
      data.forEach(task => {
        if (task.tags) {
          task.tags.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag)
            .forEach(tag => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags));
    }
  }, [data]);

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

  const handleDueDateFilterChange = (event: SelectChangeEvent) => {
    setDueDateFilter(event.target.value as DueDateFilter);
    setPage(1); // Reset to first page when filter changes
  };

  const handleTagFilterChange = (event: React.SyntheticEvent, value: string | null) => {
    setTagFilter(value || '');
    setPage(1); // Reset to first page when filter changes
  };

  const handleCompletedTasksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowCompletedTasks(event.target.checked);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const clearAllFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setDueDateFilter('all');
    setTagFilter('');
    setSearchTerm('');
    setPage(1);
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

  // Filter tasks based on all criteria
  const filteredTasks = data
    ? data.filter((task) => {
        // Text search filter
        const matchesSearch = 
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Category filter
        const matchesCategory = !categoryFilter || task.category === categoryFilter;
        
        // Completed tasks filter
        const matchesCompleted = showCompletedTasks || task.status !== 'DONE';
        
        // Tag filter
        const matchesTag = !tagFilter || (
          task.tags && 
          task.tags.split(',')
            .map(tag => tag.trim())
            .includes(tagFilter)
        );
        
        // Due date filter
        let matchesDueDate = true;
        
        if (dueDateFilter !== 'all' && task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          
          switch (dueDateFilter) {
            case 'today':
              matchesDueDate = isToday(dueDate);
              break;
            case 'tomorrow':
              matchesDueDate = isTomorrow(dueDate);
              break;
            case 'week':
              matchesDueDate = isThisWeek(dueDate, { weekStartsOn: 1 });
              break;
            case 'overdue':
              matchesDueDate = dueDate < today && !isToday(dueDate);
              break;
            case 'none':
              matchesDueDate = !task.dueDate;
              break;
          }
        } else if (dueDateFilter === 'none') {
          matchesDueDate = !task.dueDate;
        }
        
        return matchesSearch && 
               matchesCategory && 
               matchesCompleted &&
               matchesTag &&
               matchesDueDate;
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

  // Active filters count
  const activeFiltersCount = [
    statusFilter, 
    priorityFilter, 
    categoryFilter, 
    tagFilter, 
    dueDateFilter !== 'all'
  ].filter(Boolean).length;

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                <Tooltip title="Active filters">
                  <Chip 
                    icon={<FilterIcon />} 
                    label={`${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''}`}
                    color={activeFiltersCount > 0 ? "primary" : "default"}
                    onClick={clearAllFilters}
                    onDelete={activeFiltersCount > 0 ? clearAllFilters : undefined}
                    sx={{ mr: 1 }}
                  />
                </Tooltip>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={showCompletedTasks} 
                      onChange={handleCompletedTasksChange} 
                    />
                  }
                  label="Show completed"
                />
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
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
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
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
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
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
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Due Date</InputLabel>
                  <Select
                    value={dueDateFilter}
                    onChange={handleDueDateFilterChange}
                    label="Due Date"
                    startAdornment={<DateIcon sx={{ ml: 1, mr: 0.5, color: 'action.active' }} fontSize="small" />}
                  >
                    <MenuItem value="all">All Due Dates</MenuItem>
                    <MenuItem value="today">Due Today</MenuItem>
                    <MenuItem value="tomorrow">Due Tomorrow</MenuItem>
                    <MenuItem value="week">Due This Week</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                    <MenuItem value="none">No Due Date</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={availableTags}
                  value={tagFilter || null}
                  onChange={handleTagFilterChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Filter by Tag" 
                      size="small"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <LabelIcon sx={{ ml: 1, mr: 0.5, color: 'action.active' }} fontSize="small" />
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}