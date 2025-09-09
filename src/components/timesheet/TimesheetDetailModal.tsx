import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Crew {
  id: string;
  crew_name: string;
  company_id: string;
  companies?: {
    name: string;
  };
}

interface Timesheet {
  id: string;
  crew_id: string;
  date: string;
  start_time: string;
  end_time: string;
  hours_regular: number;
  hours_overtime: number;
  work_description: string;
  status: string;
}

interface TimesheetDetailModalProps {
  timesheet: Timesheet | null;
  crew: Crew | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const statusToChipColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'submitted':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

export function TimesheetDetailModal({
  timesheet,
  crew,
  open,
  onOpenChange,
  onUpdate,
}: TimesheetDetailModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const modalDate = timesheet?.date || new Date().toISOString().split('T')[0];
  
  // Form state
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    work_description: '',
    status: 'draft' as string,
    location: '',
  });

  // Reset form when timesheet or crew changes
  useEffect(() => {
    if (timesheet) {
      setFormData({
        start_time: timesheet.start_time || '',
        end_time: timesheet.end_time || '',
        work_description: timesheet.work_description || '',
        status: timesheet.status || 'draft',
        location: (timesheet as any).location || '',
      });
    } else {
      setFormData({
        start_time: '',
        end_time: '',
        work_description: '',
        status: 'draft',
        location: '',
      });
    }
    setIsEditing(false);
  }, [timesheet, open]);

  if (!crew) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not recorded';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return { regular: 0, overtime: 0 };
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end <= start) return { regular: 0, overtime: 0 };
    
    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const regular = Math.min(totalHours, 8);
    const overtime = Math.max(0, totalHours - 8);
    
    return { regular, overtime };
  };

  const handleSave = async () => {
    if (!formData.start_time || !formData.end_time) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both start and end times.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { regular, overtime } = calculateHours(formData.start_time, formData.end_time);
      
      const timesheetData = {
        crew_id: crew.id,
        date: modalDate,
        start_time: formData.start_time,
        end_time: formData.end_time,
        hours_regular: regular,
        hours_overtime: overtime,
        work_description: formData.work_description,
        status: formData.status,
        location: formData.location,
      };

      if (timesheet) {
        // Update existing timesheet
        const { error } = await supabase
          .from('time_entries')
          .update(timesheetData)
          .eq('id', timesheet.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Timesheet updated successfully.',
        });
      } else {
        // Create new timesheet
        const { error } = await supabase
          .from('time_entries')
          .insert(timesheetData);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Timesheet created successfully.',
        });
      }
      
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (timesheet) {
      setFormData({
        start_time: timesheet.start_time || '',
        end_time: timesheet.end_time || '',
        work_description: timesheet.work_description || '',
        status: timesheet.status || 'draft',
        location: (timesheet as any).location || '',
      });
    }
    setIsEditing(false);
  };

  const currentHours = calculateHours(formData.start_time, formData.end_time);

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <PersonIcon fontSize="small" />
            <Box>
              <Typography component="span" variant="h6" fontWeight={600}>
                {crew.crew_name}
              </Typography>
              {crew.companies?.name && (
                <Typography 
                  component="div" 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ lineHeight: 1.2 }}
                >
                  {crew.companies.name}
                </Typography>
              )}
            </Box>
          </Box>
          <Box className="flex items-center gap-2">
            <Typography component="span" variant="h6" fontWeight={600}>
              {formatDate(modalDate)}
            </Typography>
            {timesheet && (
              <Chip 
                label={timesheet.status} 
                color={statusToChipColor(timesheet.status)} 
                size="small" 
              />
            )}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <div className="space-y-6">
          {timesheet || isEditing ? (
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center gap-2">
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="subtitle1">
                        {isEditing ? 'Edit Timesheet' : 'Timesheet Details'}
                      </Typography>
                    </Box>
                    {timesheet && !isEditing && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                }
              />
              <CardContent>
                {isEditing ? (
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        size="small"
                        value={formData.start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        size="small"
                        value={formData.end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Regular Hours: {currentHours.regular.toFixed(2)} | Overtime Hours: {currentHours.overtime.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="submitted">Submitted</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Location"
                      size="small"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                    
                    <TextField
                      fullWidth
                      label="Work Description"
                      multiline
                      rows={3}
                      size="small"
                      value={formData.work_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, work_description: e.target.value }))}
                    />
                  </Stack>
                ) : timesheet ? (
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">Start Time</Typography>
                        <Typography variant="body1">{formatTime(timesheet.start_time)}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">End Time</Typography>
                        <Typography variant="body1">{formatTime(timesheet.end_time)}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">Regular Hours</Typography>
                        <Typography variant="body1">{timesheet.hours_regular.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">Overtime Hours</Typography>
                        <Typography variant="body1">{timesheet.hours_overtime.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                    {(timesheet as any).location && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Location</Typography>
                        <Typography variant="body1">{(timesheet as any).location}</Typography>
                      </Box>
                    )}
                    {timesheet.work_description && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Work Description</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {timesheet.work_description}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <Box className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" sx={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                    <CalendarMonthIcon sx={{ color: 'rgba(211, 47, 47, 1)' }} fontSize="large" />
                  </Box>
                  <div>
                    <Typography variant="subtitle1" fontWeight={600}>No Timesheet Submitted</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {crew.crew_name} has not submitted a timesheet for {formatDate(modalDate)}.
                    </Typography>
                  </div>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Create Timesheet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
      
      {isEditing && (
        <DialogActions>
          <Button 
            onClick={handleCancel} 
            startIcon={<CancelIcon />}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : timesheet ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}