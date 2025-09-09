import * as React from 'react';
import { useState } from 'react';
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
  Divider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
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
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

interface TimesheetDetailModalProps {
  timesheet: Timesheet | null;
  crew: Crew | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const statusToChipColor = (status: 'draft' | 'submitted' | 'approved' | 'rejected'): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    work_description: string;
    start_time: string;
    end_time: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
  }>({
    work_description: '',
    start_time: '08:00',
    end_time: '17:00',
    status: 'draft',
  });
  
  const { toast } = useToast();

  React.useEffect(() => {
    if (timesheet) {
      setFormData({
        work_description: timesheet.work_description || '',
        start_time: timesheet.start_time || '08:00',
        end_time: timesheet.end_time || '17:00',
        status: timesheet.status || 'draft',
      });
    } else {
      setFormData({
        work_description: '',
        start_time: '08:00',
        end_time: '17:00',
        status: 'draft',
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

  const modalDate = timesheet?.date || new Date().toISOString().split('T')[0];

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return { regular: 0, overtime: 0 };
    
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const totalHours = Math.max(0, diffMs / (1000 * 60 * 60));
    
    const regularHours = Math.min(8, totalHours);
    const overtimeHours = Math.max(0, totalHours - 8);
    
    return { regular: regularHours, overtime: overtimeHours };
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const { regular, overtime } = calculateHours(formData.start_time, formData.end_time);
      
      const timesheetData = {
        crew_id: crew.id,
        date: modalDate,
        work_description: formData.work_description,
        start_time: formData.start_time,
        end_time: formData.end_time,
        hours_regular: regular,
        hours_overtime: overtime,
        status: formData.status,
      };

      if (timesheet) {
        // Update existing timesheet
        const { error } = await supabase
          .from('time_entries')
          .update(timesheetData)
          .eq('id', timesheet.id);
          
        if (error) throw error;
      } else {
        // Create new timesheet
        const { error } = await supabase
          .from('time_entries')
          .insert([timesheetData]);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Success',
        description: `Timesheet ${timesheet ? 'updated' : 'created'} successfully`,
      });
      
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
        work_description: timesheet.work_description || '',
        start_time: timesheet.start_time || '08:00',
        end_time: timesheet.end_time || '17:00',
        status: timesheet.status || 'draft',
      });
    }
    setIsEditing(false);
  };

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
            {timesheet && !isEditing && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <div className="space-y-6">
          {timesheet ? (
            isEditing ? (
              /* Edit Mode */
              <Box className="space-y-4">
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Start Time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>
                
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Regular Hours: {calculateHours(formData.start_time, formData.end_time).regular.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overtime Hours: {calculateHours(formData.start_time, formData.end_time).overtime.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Work Description"
                  multiline
                  rows={4}
                  value={formData.work_description}
                  onChange={(e) => setFormData({...formData, work_description: e.target.value})}
                  placeholder="Describe the work performed..."
                  fullWidth
                />
              </Box>
            ) : (
              /* View Mode */
              <Box className="space-y-4">
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="outlined">
                    <CardContent>
                      <Box className="flex items-center gap-2 mb-2">
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="subtitle2">Time</Typography>
                      </Box>
                      <Typography variant="body2">
                        {formatTime(timesheet.start_time)} - {formatTime(timesheet.end_time)}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>Hours</Typography>
                      <Typography variant="body2">
                        Regular: {timesheet.hours_regular}h | Overtime: {timesheet.hours_overtime}h
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Card variant="outlined">
                  <CardContent>
                    <Box className="flex items-center justify-between mb-2">
                      <Typography variant="subtitle2">Status</Typography>
                      <Chip 
                        label={timesheet.status} 
                        color={statusToChipColor(timesheet.status)}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>

                {timesheet.work_description && (
                  <Card variant="outlined">
                    <CardHeader
                      title={
                        <Box className="flex items-center gap-2">
                          <CalendarMonthIcon fontSize="small" />
                          <Typography variant="subtitle1">Work Description</Typography>
                        </Box>
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" lineHeight={1.7}>
                        {timesheet.work_description}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )
          ) : (
            /* No Timesheet - Create New */
            isEditing || !timesheet ? (
              <Box className="space-y-4">
                <Typography variant="h6" gutterBottom>Create New Timesheet</Typography>
                
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Start Time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>
                
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Regular Hours: {calculateHours(formData.start_time, formData.end_time).regular.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overtime Hours: {calculateHours(formData.start_time, formData.end_time).overtime.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Work Description"
                  multiline
                  rows={4}
                  value={formData.work_description}
                  onChange={(e) => setFormData({...formData, work_description: e.target.value})}
                  placeholder="Describe the work performed..."
                  fullWidth
                />
              </Box>
            ) : (
              <Card variant="outlined">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <Box className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" sx={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                      <CalendarMonthIcon sx={{ color: 'rgba(211, 47, 47, 1)' }} fontSize="large" />
                    </Box>
                    <div>
                      <Typography variant="subtitle1" fontWeight={600}>No Timesheet Submitted</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {crew.crew_name} has not submitted a timesheet for {formatDate(modalDate)}.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditing(true)}
                        sx={{ mt: 2 }}
                      >
                        Create Timesheet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </DialogContent>
      
      {(isEditing || !timesheet) && (
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
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Timesheet'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}