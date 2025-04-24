'use client';

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Typography, 
  Paper,
  FormHelperText,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Task, TaskFormData, StatusLabels, PriorityLabels } from '@/types/task';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskFormData) => void;
  isLoading?: boolean;
}

export default function TaskForm({ initialData, onSubmit, isLoading = false }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'TODO',
    priority: initialData?.priority || 2,
    dueDate: initialData?.dueDate || null,
    category: initialData?.category || '',
    tags: initialData?.tags || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle select field changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle priority change
  const handlePriorityChange = (e: SelectChangeEvent) => {
    const priority = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, priority }));
  };
  
  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Task' : 'Create New Task'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              error={!!errors.title}
              helperText={errors.title}
              disabled={isLoading}
              autoFocus
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              multiline
              rows={4}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                label="Status"
                disabled={isLoading}
              >
                {Object.entries(StatusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority.toString()}
                onChange={handlePriorityChange}
                label="Priority"
                disabled={isLoading}
              >
                {Object.entries(PriorityLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date (Optional)"
                value={formData.dueDate ? new Date(formData.dueDate) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: isLoading
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Category (Optional)"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tags (Optional, comma separated)"
              name="tags"
              value={formData.tags || ''}
              onChange={handleChange}
              placeholder="work, personal, urgent"
              disabled={isLoading}
            />
            {formData.tags && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.tags.split(',').map((tag, index) => (
                  <Chip key={index} label={tag.trim()} size="small" />
                ))}
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
            </Button>
          </Grid>
          
        </Grid>
      </Box>
    </Paper>
  );
}