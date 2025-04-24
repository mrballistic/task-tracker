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
  SelectChangeEvent,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Task, TaskFormData, StatusLabels, PriorityLabels } from '@/types/task';
import { useCategories } from '@/contexts/CategoryContext';
import TagInput from '@/components/tags/TagInput';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskFormData) => void;
  isLoading?: boolean;
}

export default function TaskForm({ initialData, onSubmit, isLoading = false }: TaskFormProps) {
  const { categories, getCategoryColor, addCategory } = useCategories();
  
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

  // Handle category change
  const handleCategoryChange = (event: React.SyntheticEvent, value: string | null) => {
    setFormData(prev => ({ ...prev, category: value || '' }));
  };

  // Handle tag change
  const handleTagsChange = (value: string) => {
    setFormData(prev => ({ ...prev, tags: value }));
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
    
    // If a new category is entered, add it to the category context
    if (formData.category && 
        !categories.some(cat => cat.name === formData.category)) {
      addCategory({
        name: formData.category,
        color: generateRandomColor()
      });
    }

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Generate a random color for new categories
  const generateRandomColor = (): string => {
    const colors = [
      '#4caf50', '#2196f3', '#f44336', '#ff9800', 
      '#9c27b0', '#795548', '#009688', '#607d8b',
      '#e91e63', '#673ab7', '#3f51b5', '#00bcd4',
      '#cddc39', '#8bc34a', '#ffc107', '#ff5722'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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
            <Autocomplete
              freeSolo
              options={categories.map(cat => cat.name)}
              value={formData.category || null}
              onChange={handleCategoryChange}
              disabled={isLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category (Optional)"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      mr: 1,
                      backgroundColor: getCategoryColor(option)
                    }}
                  />
                  {option}
                </li>
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TagInput
              value={formData.tags || ''}
              onChange={handleTagsChange}
              disabled={isLoading}
            />
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