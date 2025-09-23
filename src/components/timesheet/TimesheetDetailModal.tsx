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
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import IconButton from '@mui/material/IconButton';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';
import { format, addDays, subDays } from 'date-fns';
import { formatTimeValue } from '@/lib/time';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { enGB } from 'date-fns/locale';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

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
        start_time: formatTimeValue(timesheet.start_time, '08:00'),
        end_time: formatTimeValue(timesheet.end_time, '17:00'),
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

  const handleDateSelect = (date: Date | null) => {
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

  // Treat stored date strings as plain calendar days to avoid timezone shifts.
  const parseToLocalDate = (dateString: string) => {
    if (!dateString) return null;
    const normalized = dateString.split('T')[0];
    const [year, month, day] = normalized.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const modalParsedDate = parseToLocalDate(modalDate);

  const formatDate = (dateString: string) => {
    const date = parseToLocalDate(dateString);
    if (!date) return dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return formatTimeValue(timeString, 'Not recorded');
  };

  const timeStringToDate = (value: string | null | undefined) => {
    if (!value) return null;
    const [hours, minutes] = value.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const dateToTimeString = (value: Date | null) => {
    if (!value || Number.isNaN(value.getTime())) return '';
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
          submitted_at: new Date().toISOString(),
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
            'Timecard updated successfully.'
          );
        } else {
          // Create new timecard
          const { error } = await supabase
            .from('time_entries')
            .insert(timesheetData);
          
          if (error) throw error;
          
          showSuccessToast(
            'Success',
            'Timecard created successfully.'
          );
        }

        console.log('Timecard saved successfully, calling onUpdate');
        setIsEditing(false);
        onUpdate();
        console.log('onUpdate called, closing modal');
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
            submitted_at: new Date().toISOString(),
          };
        });

        // Delete existing member timecards for this date
        await supabase
          .from('time_entries')
          .delete()
          .eq('crew_id', crew.id)
          .eq('date', modalDate)
          .not('member_id', 'is', null);

        // Insert new member timecards
        const { error } = await supabase
          .from('time_entries')
          .insert(timesheetEntries);

        if (error) throw error;

        showSuccessToast(
          'Success',
          'Member timecards saved successfully.'
        );

        console.log('Member timecards saved successfully, calling onUpdate');
        setIsEditing(false);
        onUpdate();
        console.log('onUpdate called, closing modal');
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
        start_time: formatTimeValue(timesheet.start_time, '08:00'),
        end_time: formatTimeValue(timesheet.end_time, '17:00'),
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
        `A reminder has been sent to ${crew.crew_name} to submit their timecard for ${formatDate(modalDate)}.`
      );
      onOpenChange(false); // Close the modal
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
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
                      {modalParsedDate ? format(modalParsedDate, 'MMM d, yyyy') : modalDate}
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
                <DateCalendar
                  value={modalParsedDate ?? null}
                  onChange={handleDateSelect}
                  sx={{ p: 1 }}
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
            <IconButton
              onClick={() => onOpenChange(false)}
              size="small"
              title="Close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ backgroundColor: 'var(--theme-base-background-elevations-level-3)' }}>
        <div className="space-y-6">
          {timesheet || isEditing ? (
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center gap-2">
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="subtitle1">
                        {isEditing ? 'Edit Timecard' : 'Timecard Details'}
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
              <CardContent >
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
                          <TimePicker
                            label="Start Time"
                            ampm={false}
                            format="HH:mm"
                            value={timeStringToDate(formData.start_time)}
                            onChange={(date) =>
                              setFormData(prev => ({
                                ...prev,
                                start_time: date ? dateToTimeString(date) : '',
                              }))
                            }
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                          />
                          <TimePicker
                            label="End Time"
                            ampm={false}
                            format="HH:mm"
                            value={timeStringToDate(formData.end_time)}
                            onChange={(date) =>
                              setFormData(prev => ({
                                ...prev,
                                end_time: date ? dateToTimeString(date) : '',
                              }))
                            }
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
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
                                  <TimePicker
                                    label="Start Time"
                                    ampm={false}
                                    format="HH:mm"
                                    value={timeStringToDate(memberData.start_time)}
                                    onChange={(date) =>
                                      updateMemberFormData(
                                        memberIndex,
                                        'start_time',
                                        date ? dateToTimeString(date) : ''
                                      )
                                    }
                                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                  />
                                  <TimePicker
                                    label="End Time"
                                    ampm={false}
                                    format="HH:mm"
                                    value={timeStringToDate(memberData.end_time)}
                                    onChange={(date) =>
                                      updateMemberFormData(
                                        memberIndex,
                                        'end_time',
                                        date ? dateToTimeString(date) : ''
                                      )
                                    }
                                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
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
                    <Typography variant="subtitle1" fontWeight={600}>No Timecard Submitted</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {crew.crew_name} has not submitted a timecard for {formatDate(modalDate)}.
                    </Typography>
                  </div>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<NotificationsIcon />}
                      onClick={handleRemindCrewLead}
                      disabled={loading}
                    >
                      Send reminder
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Create timecard
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
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              color="primary"
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
            color="secondary"
          >
            Close
          </Button>
        )}
      </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
