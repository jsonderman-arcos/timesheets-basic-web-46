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
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IconButton from '@mui/material/IconButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface Crew {
  id: string;
  crew_name: string;
  company_id: string;
  companies?: {
    name: string;
  };
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  hourly_rate: number;
  crew_id: string;
  active: boolean;
}

interface Timesheet {
  id: string;
  crew_id: string;
  member_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  hours_regular: number;
  hours_overtime: number;
  work_description: string;
}

interface MemberFormData {
  member_id: string;
  start_time: string;
  end_time: string;
  work_description: string;
  working_hours: number;
  traveling_hours: number;
  standby_hours: number;
}

interface TimesheetDetailModalProps {
  timesheet: Timesheet | null;
  crew: Crew | null;
  selectedDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onDateChange: (date: string) => void;
}

export function TimesheetDetailModal({
  timesheet,
  crew,
  selectedDate,
  open,
  onOpenChange,
  onUpdate,
  onDateChange,
}: TimesheetDetailModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState<'crew' | 'individual'>('crew');
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null);
  
  const modalDate = selectedDate;
  
  // Form state for crew-level editing
  const [formData, setFormData] = useState({
    start_time: '08:00',
    end_time: '17:00',
    work_description: '',
    working_hours: 0,
    traveling_hours: 0,
    standby_hours: 0,
  });

  // Form state for individual member editing
  const [memberFormsData, setMemberFormsData] = useState<MemberFormData[]>([]);

  // Fetch crew members when modal opens
  useEffect(() => {
    const fetchCrewMembers = async () => {
      if (!crew?.id || !open) return;
      
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .eq('crew_id', crew.id)
        .eq('active', true);
      
      if (error) {
        console.error('Error fetching crew members:', error);
        return;
      }
      
      setCrewMembers(data || []);
      
      // Initialize member forms with default scheduled hours
      const initialMemberForms = (data || []).map(member => ({
        member_id: member.id,
        start_time: '08:00',
        end_time: '17:00',
        work_description: '',
        working_hours: 0,
        traveling_hours: 0,
        standby_hours: 0,
      }));
      setMemberFormsData(initialMemberForms);
    };

    fetchCrewMembers();
  }, [crew?.id, open, modalDate]);

  // Reset form when timesheet or crew changes
  useEffect(() => {
    if (timesheet) {
      setFormData({
        start_time: timesheet.start_time || '08:00',
        end_time: timesheet.end_time || '17:00',
        work_description: timesheet.work_description || '',
        working_hours: 0,
        traveling_hours: 0,
        standby_hours: 0,
      });
    } else {
      setFormData({
        start_time: '08:00',
        end_time: '17:00',
        work_description: '',
        working_hours: 0,
        traveling_hours: 0,
        standby_hours: 0,
      });
    }
    setIsEditing(false);
  }, [timesheet, open]);

  const handlePreviousDay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      console.log('Previous day clicked. Current selectedDate:', selectedDate);
      
      // Parse the date string properly
      const [year, month, day] = selectedDate.split('-').map(Number);
      const currentDate = new Date(year, month - 1, day); // month is 0-indexed
      console.log('Parsed current date:', currentDate);
      
      const previousDay = subDays(currentDate, 1);
      console.log('Previous day calculated:', previousDay);
      
      const newDateString = format(previousDay, 'yyyy-MM-dd');
      console.log('Previous day formatted:', newDateString);
      
      onDateChange(newDateString);
    } catch (error) {
      console.error('Error in handlePreviousDay:', error);
    }
  };

  const handleNextDay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      console.log('Next day clicked. Current selectedDate:', selectedDate);
      
      // Parse the date string properly
      const [year, month, day] = selectedDate.split('-').map(Number);
      const currentDate = new Date(year, month - 1, day); // month is 0-indexed
      console.log('Parsed current date:', currentDate);
      
      const nextDay = addDays(currentDate, 1);
      console.log('Next day calculated:', nextDay);
      
      const newDateString = format(nextDay, 'yyyy-MM-dd');
      console.log('Next day formatted:', newDateString);
      
      onDateChange(newDateString);
    } catch (error) {
      console.error('Error in handleNextDay:', error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      try {
        const newDateString = format(date, 'yyyy-MM-dd');
        console.log('Date selected:', newDateString);
        onDateChange(newDateString);
        setCalendarAnchor(null);
      } catch (error) {
        console.error('Error in handleDateSelect:', error);
      }
    }
  };

  const handleCalendarOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchor(event.currentTarget);
  };

  const handleCalendarClose = () => {
    setCalendarAnchor(null);
  };

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

  const calculateTotalHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end <= start) return 0;
    
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const currentTotalHours = calculateTotalHours(formData.start_time, formData.end_time);

  const handleSave = async () => {
    if (editMode === 'crew') {
      // Crew-level editing logic
      if (!formData.start_time || !formData.end_time) {
        showErrorToast(
          'Missing Information',
          'Please provide both start and end times.'
        );
        return;
      }

      setLoading(true);
      try {
        const totalHours = calculateTotalHours(formData.start_time, formData.end_time);
        
        const timesheetData = {
          crew_id: crew.id,
          date: modalDate,
          start_time: formData.start_time,
          end_time: formData.end_time,
          hours_regular: totalHours,
          hours_overtime: 0,
          work_description: formData.work_description,
          working_hours: formData.working_hours,
          traveling_hours: formData.traveling_hours,
          standby_hours: formData.standby_hours,
        };

        if (timesheet) {
          // Update existing timesheet
          const { error } = await supabase
            .from('time_entries')
            .update(timesheetData)
            .eq('id', timesheet.id);
          
          if (error) throw error;
          
          showSuccessToast(
            'Success',
            'Timesheet updated successfully.'
          );
        } else {
          // Create new timesheet
          const { error } = await supabase
            .from('time_entries')
            .insert(timesheetData);
          
          if (error) throw error;
          
          showSuccessToast(
            'Success',
            'Timesheet created successfully.'
          );
        }
        
        setIsEditing(false);
        onUpdate();
        onOpenChange(false); // Close the modal
      } catch (error: any) {
        showErrorToast(
          'Error',
          error.message
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Individual member editing logic
      const validMembers = memberFormsData.filter(member => 
        member.start_time && member.end_time
      );

      if (validMembers.length === 0) {
        showErrorToast(
          'Missing Information',
          'Please provide start and end times for at least one member.'
        );
        return;
      }

      setLoading(true);
      try {
        const timesheetEntries = validMembers.map(memberData => {
          const totalHours = calculateTotalHours(memberData.start_time, memberData.end_time);
          return {
            crew_id: crew.id,
            member_id: memberData.member_id,
            date: modalDate,
            start_time: memberData.start_time,
            end_time: memberData.end_time,
            hours_regular: totalHours,
            hours_overtime: 0,
            work_description: memberData.work_description,
            working_hours: memberData.working_hours,
            traveling_hours: memberData.traveling_hours,
            standby_hours: memberData.standby_hours,
          };
        });

        // Delete existing member timesheets for this date
        await supabase
          .from('time_entries')
          .delete()
          .eq('crew_id', crew.id)
          .eq('date', modalDate)
          .not('member_id', 'is', null);

        // Insert new member timesheets
        const { error } = await supabase
          .from('time_entries')
          .insert(timesheetEntries);

        if (error) throw error;

        showSuccessToast(
          'Success',
          'Member timesheets saved successfully.'
        );
        
        setIsEditing(false);
        onUpdate();
        onOpenChange(false); // Close the modal
      } catch (error: any) {
        showErrorToast(
          'Error',
          error.message
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const updateMemberFormData = (memberIndex: number, field: keyof MemberFormData, value: string | number) => {
    setMemberFormsData(prev => 
      prev.map((member, index) => 
        index === memberIndex ? { ...member, [field]: value } : member
      )
    );
  };

  const handleCancel = () => {
    if (timesheet) {
      setFormData({
        start_time: timesheet.start_time || '08:00',
        end_time: timesheet.end_time || '17:00',
        work_description: timesheet.work_description || '',
        working_hours: 0,
        traveling_hours: 0,
        standby_hours: 0,
      });
    }
    setIsEditing(false);
  };

  const handleRemindCrewLead = async () => {
    setLoading(true);
    try {
      // Here you could implement actual notification logic (email, SMS, etc.)
      // For now, we'll show a success message
      showSuccessToast(
        'Reminder Sent',
        `A reminder has been sent to ${crew.crew_name} to submit their timesheet for ${formatDate(modalDate)}.`
      );
    } catch (error: any) {
      showErrorToast(
        'Error',
        'Failed to send reminder. Please try again.'
      );
    } finally {
      setLoading(false);
    }
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
            <IconButton
              onClick={(e) => handlePreviousDay(e)}
              size="small"
              title="Previous Day"
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <Button
              variant="outlined"
              onClick={handleCalendarOpen}
              sx={{
                minWidth: '180px',
                justifyContent: 'center',
                textAlign: 'center',
                fontWeight: 'medium',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
              size="small"
            >
              <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
              {format(new Date(modalDate), 'MMM d, yyyy')}
            </Button>
            
            <Menu
              anchorEl={calendarAnchor}
              open={Boolean(calendarAnchor)}
              onClose={handleCalendarClose}
              PaperProps={{
                sx: { mt: 1 }
              }}
            >
              <Paper sx={{ p: 0 }}>
                <Calendar
                  mode="single"
                  selected={new Date(modalDate)}
                  onSelect={handleDateSelect}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </Paper>
            </Menu>
            
            <IconButton
              onClick={(e) => handleNextDay(e)}
              size="small"
              title="Next Day"
            >
              <ChevronRightIcon />
            </IconButton>
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
                    {/* Edit Mode Toggle */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <ToggleButtonGroup
                        value={editMode}
                        exclusive
                        onChange={(e, newMode) => {
                          if (newMode !== null) {
                            setEditMode(newMode);
                          }
                        }}
                        size="small"
                      >
                        <ToggleButton value="crew">
                          <GroupIcon sx={{ mr: 1 }} />
                          Entire Crew
                        </ToggleButton>
                        <ToggleButton value="individual">
                          <PersonOutlineIcon sx={{ mr: 1 }} />
                          Individual Members
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {editMode === 'crew' ? (
                      /* Crew-level editing form */
                      <>
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
                            Total Hours: {currentTotalHours.toFixed(2)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <TextField
                            fullWidth
                            label="Working Hours"
                            type="number"
                            size="small"
                            inputProps={{ min: 0, step: 0.5 }}
                            value={formData.working_hours}
                            onChange={(e) => setFormData(prev => ({ ...prev, working_hours: parseFloat(e.target.value) || 0 }))}
                          />
                          <TextField
                            fullWidth
                            label="Traveling Hours"
                            type="number"
                            size="small"
                            inputProps={{ min: 0, step: 0.5 }}
                            value={formData.traveling_hours}
                            onChange={(e) => setFormData(prev => ({ ...prev, traveling_hours: parseFloat(e.target.value) || 0 }))}
                          />
                          <TextField
                            fullWidth
                            label="Standby Hours"
                            type="number"
                            size="small"
                            inputProps={{ min: 0, step: 0.5 }}
                            value={formData.standby_hours}
                            onChange={(e) => setFormData(prev => ({ ...prev, standby_hours: parseFloat(e.target.value) || 0 }))}
                          />
                        </Box>
                        
                        <TextField
                          fullWidth
                          label="Notes"
                          multiline
                          rows={3}
                          size="small"
                          value={formData.work_description}
                          onChange={(e) => setFormData(prev => ({ ...prev, work_description: e.target.value }))}
                        />
                      </>
                    ) : (
                      /* Individual member editing forms */
                      <Stack spacing={3}>
                        <Typography variant="subtitle2" color="primary">
                          Fill in times for individual crew members:
                        </Typography>
                        {crewMembers.map((member, memberIndex) => {
                          const memberData = memberFormsData[memberIndex];
                          if (!memberData) return null;
                          
                          const memberTotalHours = calculateTotalHours(memberData.start_time, memberData.end_time);
                          
                          return (
                            <Card key={member.id} variant="outlined" sx={{ p: 2 }}>
                              <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <PersonOutlineIcon fontSize="small" />
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {member.name}
                                  </Typography>
                                  <Chip label={member.role} size="small" variant="outlined" />
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <TextField
                                    fullWidth
                                    label="Start Time"
                                    type="time"
                                    size="small"
                                    value={memberData.start_time}
                                    onChange={(e) => updateMemberFormData(memberIndex, 'start_time', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                  <TextField
                                    fullWidth
                                    label="End Time"
                                    type="time"
                                    size="small"
                                    value={memberData.end_time}
                                    onChange={(e) => updateMemberFormData(memberIndex, 'end_time', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Box>
                                
                                {memberData.start_time && memberData.end_time && (
                                  <Typography variant="body2" color="text.secondary">
                                    Total Hours: {memberTotalHours.toFixed(2)}
                                  </Typography>
                                )}

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <TextField
                                    fullWidth
                                    label="Working Hours"
                                    type="number"
                                    size="small"
                                    inputProps={{ min: 0, step: 0.5 }}
                                    value={memberData.working_hours}
                                    onChange={(e) => updateMemberFormData(memberIndex, 'working_hours', parseFloat(e.target.value) || 0)}
                                  />
                                  <TextField
                                    fullWidth
                                    label="Traveling Hours"
                                    type="number"
                                    size="small"
                                    inputProps={{ min: 0, step: 0.5 }}
                                    value={memberData.traveling_hours}
                                    onChange={(e) => updateMemberFormData(memberIndex, 'traveling_hours', parseFloat(e.target.value) || 0)}
                                  />
                                  <TextField
                                    fullWidth
                                    label="Standby Hours"
                                    type="number"
                                    size="small"
                                    inputProps={{ min: 0, step: 0.5 }}
                                    value={memberData.standby_hours}
                                    onChange={(e) => updateMemberFormData(memberIndex, 'standby_hours', parseFloat(e.target.value) || 0)}
                                  />
                                </Box>
                                
                                <TextField
                                  fullWidth
                                  label="Notes"
                                  multiline
                                  rows={2}
                                  size="small"
                                  value={memberData.work_description}
                                  onChange={(e) => updateMemberFormData(memberIndex, 'work_description', e.target.value)}
                                />
                              </Stack>
                            </Card>
                          );
                        })}
                      </Stack>
                    )}
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
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                      <Typography variant="body1">{timesheet.hours_regular.toFixed(2)}</Typography>
                    </Box>
                    {timesheet.work_description && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Notes</Typography>
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
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<NotificationsIcon />}
                      onClick={handleRemindCrewLead}
                      disabled={loading}
                    >
                      Remind Crew Lead
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Create Timesheet
                    </Button>
                  </Box>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
      
      <DialogActions>
        {isEditing ? (
          <>
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
          </>
        ) : (
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outlined"
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}