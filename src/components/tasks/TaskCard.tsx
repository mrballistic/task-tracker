'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  IconButton, 
  CardActions,
  Menu,
  MenuItem 
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Flag as FlagIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { Task, PriorityLabels, StatusLabels } from '@/types/task';
import { useCategories } from '@/contexts/CategoryContext';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { getCategoryColor } = useCategories();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (onStatusChange) {
      onStatusChange(task.id, status);
    }
    handleClose();
  };
  
  // Get priority color
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'error'; // High priority - red
      case 2: return 'warning'; // Medium priority - yellow/orange
      case 3: return 'success'; // Low priority - green
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'error';
      case 'IN_PROGRESS': return 'warning';
      case 'DONE': return 'success';
      default: return 'default';
    }
  };

  // Format date for display
  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return 'No due date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get tags as array
  const getTags = (): string[] => {
    if (!task.tags) return [];
    return task.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ wordBreak: 'break-word' }}>
            {task.title}
          </Typography>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled={task.status === 'TODO'} onClick={() => handleStatusChange('TODO')}>
              Mark as To Do
            </MenuItem>
            <MenuItem disabled={task.status === 'IN_PROGRESS'} onClick={() => handleStatusChange('IN_PROGRESS')}>
              Mark as In Progress
            </MenuItem>
            <MenuItem disabled={task.status === 'DONE'} onClick={() => handleStatusChange('DONE')}>
              Mark as Done
            </MenuItem>
          </Menu>
        </Box>
        
        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {task.description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Chip 
            size="small" 
            color={getStatusColor(task.status) as any}
            label={StatusLabels[task.status]} 
          />
          <Chip 
            size="small"
            icon={<FlagIcon />} 
            color={getPriorityColor(task.priority) as any}
            label={`Priority: ${PriorityLabels[task.priority]}`} 
          />
          {task.dueDate && (
            <Chip 
              size="small"
              label={`Due: ${formatDate(task.dueDate)}`} 
            />
          )}
          {task.category && (
            <Chip 
              size="small"
              icon={<LabelIcon />}
              label={task.category}
              sx={{
                bgcolor: `${getCategoryColor(task.category)}20`,
                color: getCategoryColor(task.category),
                borderColor: getCategoryColor(task.category),
                '& .MuiChip-icon': {
                  color: getCategoryColor(task.category)
                }
              }}
              variant="outlined"
            />
          )}
        </Box>

        {/* Display tags if present */}
        {task.tags && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {getTags().map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {onEdit && (
          <IconButton size="small" onClick={() => onEdit(task)} aria-label="edit">
            <EditIcon />
          </IconButton>
        )}
        {onDelete && (
          <IconButton size="small" onClick={() => onDelete(task.id)} aria-label="delete">
            <DeleteIcon />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
}