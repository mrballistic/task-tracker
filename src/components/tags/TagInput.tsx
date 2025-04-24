'use client';

import React, { useState, useEffect } from 'react';
import {
  Chip,
  TextField,
  Box,
  Autocomplete,
  AutocompleteRenderInputParams
} from '@mui/material';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Get all unique tags used across tasks
const fetchAllTags = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    
    const tasks = await response.json();
    const allTags = new Set<string>();
    
    tasks.forEach((task: any) => {
      if (task.tags) {
        task.tags.split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag)
          .forEach((tag: string) => allTags.add(tag));
      }
    });
    
    return Array.from(allTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

export default function TagInput({ value, onChange, disabled = false }: TagInputProps) {
  // Current tag input value
  const [inputValue, setInputValue] = useState('');
  // All previously used tags for autocomplete
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  // Current tags displayed as chips
  const [tags, setTags] = useState<string[]>([]);

  // Load all previously used tags for autocomplete
  useEffect(() => {
    fetchAllTags().then(tags => setAvailableTags(tags));
  }, []);

  // Initialize tags from comma-separated string
  useEffect(() => {
    if (value) {
      setTags(value.split(',').map(tag => tag.trim()).filter(tag => tag));
    } else {
      setTags([]);
    }
  }, [value]);

  // Add a new tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag || tags.includes(trimmedTag)) return;
    
    const newTags = [...tags, trimmedTag];
    setTags(newTags);
    onChange(newTags.join(', '));
    setInputValue('');
    
    // Add to available tags if it's not already there
    if (!availableTags.includes(trimmedTag)) {
      setAvailableTags(prev => [...prev, trimmedTag]);
    }
  };

  // Delete a tag
  const deleteTag = (tagToDelete: string) => {
    const newTags = tags.filter(tag => tag !== tagToDelete);
    setTags(newTags);
    onChange(newTags.join(', '));
  };

  // Handle key press for adding tags
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <Box>
      <Autocomplete
        multiple
        freeSolo
        disabled={disabled}
        options={availableTags.filter(tag => !tags.includes(tag))}
        value={tags}
        inputValue={inputValue}
        onInputChange={(event, newValue) => {
          // Remove commas as we handle them separately
          setInputValue(newValue.replace(/,/g, ''));
        }}
        onChange={(event, newValue) => {
          setTags(newValue);
          onChange(newValue.join(', '));
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              size="small"
              {...getTagProps({ index })}
              key={index}
            />
          ))
        }
        renderInput={(params: AutocompleteRenderInputParams) => (
          <TextField
            {...params}
            label="Tags"
            placeholder="Add tags..."
            variant="outlined"
            fullWidth
            onKeyPress={handleKeyPress}
            helperText="Press Enter or comma to add a tag"
          />
        )}
      />
    </Box>
  );
}