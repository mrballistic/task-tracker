'use client';

import React, { useState, useEffect } from 'react';
import {
  Chip,
  TextField,
  Box,
  Autocomplete,
  AutocompleteRenderInputParams,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Popover,
  Grid
} from '@mui/material';
import {
  Label as LabelIcon,
  Add as AddIcon,
  ColorLens as ColorLensIcon
} from '@mui/icons-material';

// Standard set of tag colors for consistent visual identification
const TAG_COLORS = [
  '#3f51b5', // indigo
  '#f50057', // pink
  '#00bcd4', // cyan
  '#4caf50', // green
  '#ff9800', // orange
  '#9c27b0', // purple
  '#f44336', // red
  '#2196f3', // blue
  '#ff5722', // deep orange
  '#607d8b'  // blue grey
];

// Interface for tags with color information
interface TagWithColor {
  name: string;
  color: string;
}

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Get all unique tags used across tasks with their assigned colors
const fetchAllTags = async (): Promise<TagWithColor[]> => {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    
    const tasks = await response.json();
    const tagMap = new Map<string, string>();
    
    tasks.forEach((task: any) => {
      if (task.tags) {
        task.tags.split(',')
          .map((tagInfo: string) => tagInfo.trim())
          .filter((tagInfo: string) => tagInfo)
          .forEach((tagInfo: string) => {
            // Check if the tag has a color code in the format "tag:#color"
            const [name, color] = tagInfo.includes(':') ? tagInfo.split(':') : [tagInfo, ''];
            if (!tagMap.has(name)) {
              tagMap.set(name, color);
            }
          });
      }
    });
    
    // Convert map to array of objects
    return Array.from(tagMap).map(([name, color]) => ({
      name,
      color: color || getRandomTagColor(name)
    }));
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

// Generate a consistent color based on tag name
const getRandomTagColor = (tagName: string): string => {
  // Use a simple hash function to always get the same color for the same tag name
  const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
};

export default function TagInput({ value, onChange, disabled = false }: TagInputProps) {
  // Current tag input value
  const [inputValue, setInputValue] = useState('');
  // All previously used tags for autocomplete
  const [availableTags, setAvailableTags] = useState<TagWithColor[]>([]);
  // Current tags displayed as chips
  const [tags, setTags] = useState<TagWithColor[]>([]);
  
  // Color picker state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number>(-1);

  // Load all previously used tags for autocomplete
  useEffect(() => {
    fetchAllTags().then(tags => setAvailableTags(tags));
  }, []);

  // Initialize tags from comma-separated string
  useEffect(() => {
    if (value) {
      const tagNames = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      const tagObjects = tagNames.map(tagName => {
        // Check if the tag has a color code
        const [name, color] = tagName.includes(':') ? tagName.split(':') : [tagName, ''];
        
        // Try to find the tag in available tags to get its color
        const existingTag = availableTags.find(t => t.name === name);
        return {
          name,
          color: color || (existingTag ? existingTag.color : getRandomTagColor(name))
        };
      });
      
      setTags(tagObjects);
    } else {
      setTags([]);
    }
  }, [value, availableTags]);

  // Convert tags to the format used in the database
  const serializeTags = (tagsList: TagWithColor[]): string => {
    return tagsList.map(tag => `${tag.name}:${tag.color}`).join(', ');
  };

  // Add a new tag
  const addTag = (tagName: string) => {
    const trimmedTagName = tagName.trim();
    if (!trimmedTagName || tags.some(tag => tag.name === trimmedTagName)) return;
    
    // Check if this tag already exists in available tags
    const existingTag = availableTags.find(tag => tag.name === trimmedTagName);
    const newTag = existingTag || {
      name: trimmedTagName,
      color: getRandomTagColor(trimmedTagName)
    };
    
    const newTags = [...tags, newTag];
    setTags(newTags);
    onChange(serializeTags(newTags));
    setInputValue('');
    
    // Add to available tags if it's not already there
    if (!existingTag) {
      setAvailableTags(prev => [...prev, newTag]);
    }
  };

  // Delete a tag
  const deleteTag = (tagToDelete: string) => {
    const newTags = tags.filter(tag => tag.name !== tagToDelete);
    setTags(newTags);
    onChange(serializeTags(newTags));
  };

  // Handle key press for adding tags
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(inputValue);
    }
  };

  // Handle color picker open
  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedTagIndex(index);
  };

  // Handle color picker close
  const handleColorPickerClose = () => {
    setAnchorEl(null);
    setSelectedTagIndex(-1);
  };

  // Change tag color
  const handleColorChange = (color: string) => {
    if (selectedTagIndex >= 0) {
      const newTags = [...tags];
      newTags[selectedTagIndex] = {
        ...newTags[selectedTagIndex],
        color
      };
      setTags(newTags);
      onChange(serializeTags(newTags));
      handleColorPickerClose();
    }
  };

  return (
    <Box>
      <Autocomplete
        multiple
        freeSolo
        disabled={disabled}
        options={availableTags.map(tag => tag.name)}
        filterOptions={(options, params) => {
          const filtered = options.filter(
            option => !tags.some(tag => tag.name === option) &&
              option.toLowerCase().includes(params.inputValue.toLowerCase())
          );
          return filtered;
        }}
        value={tags.map(tag => tag.name)}
        inputValue={inputValue}
        onInputChange={(event, newValue) => {
          // Remove commas as we handle them separately
          setInputValue(newValue.replace(/,/g, ''));
        }}
        onChange={(event, newValues) => {
          const newTags = newValues.map(name => {
            // Check if this tag already exists
            const existingTag = [...tags, ...availableTags].find(tag => tag.name === name);
            return existingTag || { name, color: getRandomTagColor(name) };
          });
          setTags(newTags);
          onChange(serializeTags(newTags));
        }}
        renderTags={(value, getTagProps) =>
          tags.map((tag, index) => (
            <Chip
              label={tag.name}
              size="small"
              {...getTagProps({ index })}
              key={index}
              sx={{ 
                backgroundColor: tag.color,
                color: theme => 
                  // Calculate contrast color (white or black) based on background color
                  parseInt(tag.color.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff'
              }}
              deleteIcon={
                <Box sx={{ display: 'flex' }}>
                  <Tooltip title="Change color">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorPickerOpen(e, index);
                      }}
                      sx={{ mr: -0.5 }}
                    >
                      <ColorLensIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
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
      
      {/* Color picker popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleColorPickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Select tag color
          </Typography>
          <Grid container spacing={1}>
            {TAG_COLORS.map((color) => (
              <Grid item key={color}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: color,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 0 0 2px rgba(0,0,0,0.2)',
                    },
                  }}
                  onClick={() => handleColorChange(color)}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Popover>
    </Box>
  );
}