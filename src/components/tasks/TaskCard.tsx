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
  MenuItem,
  Divider,
  useMediaQuery,
  Badge,
  Collapse,
  Button,
  Tooltip,
  Avatar
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Flag as FlagIcon,
  Label as LabelIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  PlayArrow as PlayArrowIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { Task, PriorityLabels, StatusLabels } from '@/types/task';
import { useCategories } from '@/contexts/CategoryContext';
import { format, isAfter, isBefore, isToday, isTomorrow } from 'date-fns';
import { useTheme } from '@mui/material/styles';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const open = Boolean(anchorEl);
  const { getCategoryColor } = useCategories();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
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

  const handleExpandClick = () => {
    setExpanded(!expanded);
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO': return <AssignmentIcon fontSize="small" />;
      case 'IN_PROGRESS': return <PlayArrowIcon fontSize="small" />;
      case 'DONE': return <CheckIcon fontSize="small" />;
      default: return <AssignmentIcon fontSize="small" />;
    }
  };

  // Format date for display
  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      
      if (isToday(date)) {
        return 'Today';
      } else if (isTomorrow(date)) {
        return 'Tomorrow';
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Check if the task is overdue
  const isOverdue = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return isBefore(dueDate, today) && task.status !== 'DONE';
  };

  // Get tags as array
  const getTags = (): string[] => {
    if (!task.tags) return [];
    return task.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  // Determine if we show all content or only the most important on mobile
  const shouldCollapseContent = isMobile && task.description && task.description.length > 100;

  return (
    <Card 
      sx={{ 
        mb: 2, 
        boxShadow: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        },
        borderLeft: task.status === 'DONE' ? '4px solid #4caf50' :
                   task.status === 'IN_PROGRESS' ? '4px solid #ff9800' :
                   '4px solid #f44336',
      }}
    >
      <CardContent 
        sx={{ 
          pb: 1,
          pt: 2,
          px: { xs: 2, sm: 3 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Avatar 
              sx={{ 
                bgcolor: getStatusColor(task.status) as string + '.main',
                width: 28,
                height: 28,
                mr: 1.5,
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              {getStatusIcon(task.status)}
            </Avatar>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              component="div" 
              sx={{ 
                wordBreak: 'break-word',
                width: '100%',
                textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                color: task.status === 'DONE' ? 'text.secondary' : 'text.primary',
                fontWeight: task.status === 'DONE' ? 'normal' : 'medium',
              }}
            >
              {task.title}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            sx={{ ml: 1, flexShrink: 0 }}
            aria-label="options"
          >
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
            <Divider />
            {onEdit && (
              <MenuItem onClick={() => onEdit(task)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Edit Task
              </MenuItem>
            )}
            {onDelete && (
              <MenuItem onClick={() => onDelete(task.id)}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Delete Task
              </MenuItem>
            )}
          </Menu>
        </Box>
        
        {/* Primary task information - visible on all screen sizes */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Chip 
            size="small" 
            icon={getStatusIcon(task.status)}
            color={getStatusColor(task.status) as any}
            label={StatusLabels[task.status]} 
          />
          <Chip 
            size="small"
            icon={<FlagIcon />} 
            color={getPriorityColor(task.priority) as any}
            label={PriorityLabels[task.priority]} 
          />
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
          {task.dueDate && (
            <Tooltip title={isOverdue() ? "Overdue!" : ""}>
              <Chip 
                size="small"
                icon={<CalendarIcon />}
                label={formatDate(task.dueDate)}
                color={isOverdue() ? 'error' : 'default'}
                sx={isOverdue() ? { fontWeight: 'bold' } : {}}
              />
            </Tooltip>
          )}
        </Box>
        
        {/* Description and tags that might be collapsed on mobile */}
        {shouldCollapseContent ? (
          <>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              {task.description && (
                <Typography variant="body2" color="text.secondary" sx={{ my: 2, whiteSpace: 'pre-wrap' }}>
                  {task.description}
                </Typography>
              )}
              
              {/* Display tags if present */}
              {getTags().length > 0 && (
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
            </Collapse>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button
                size="small"
                onClick={handleExpandClick}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {expanded ? "Show Less" : "Show More"}
              </Button>
            </Box>
          </>
        ) : (
          <>
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2, whiteSpace: 'pre-wrap' }}>
                {task.description}
              </Typography>
            )}
            
            {/* Display tags if present */}
            {getTags().length > 0 && (
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
          </>
        )}
      </CardContent>
      
      {/* Action buttons */}
      <CardActions sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        px: { xs: 1, sm: 2 },
        py: 1
      }}>
        <Box>
          {/* Quick status change buttons */}
          {!isMobile && (
            <>
              {task.status !== 'DONE' && (
                <Tooltip title="Mark as Done">
                  <IconButton 
                    size="small" 
                    color="success"
                    onClick={() => handleStatusChange('DONE')}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                <Tooltip title="Mark as In Progress">
                  <IconButton 
                    size="small"
                    color="warning"
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                  >
                    <PlayArrowIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {task.status !== 'TODO' && task.status !== 'DONE' && (
                <Tooltip title="Mark as To Do">
                  <IconButton 
                    size="small"
                    color="error"
                    onClick={() => handleStatusChange('TODO')}
                  >
                    <AssignmentIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
        
        <Box>
          {onEdit && (
            <Tooltip title="Edit Task">
              <IconButton size="small" onClick={() => onEdit(task)} aria-label="edit">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete Task">
              <IconButton size="small" onClick={() => onDelete(task.id)} aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardActions>
    </Card>
  );
}