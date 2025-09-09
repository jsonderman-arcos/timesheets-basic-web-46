import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  Divider,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface Crew {
  id: string;
  crew_name: string;
  company_id: string;
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
}: TimesheetDetailModalProps) {
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

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <PersonIcon fontSize="small" />
            <Typography component="span" variant="h6" fontWeight={600}>
              {crew.crew_name}
            </Typography>
          </Box>
          <Typography component="span" variant="h6" fontWeight={600}>
            {formatDate(modalDate)}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <div className="space-y-6">

          {timesheet ? (
            <>

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
            </>
          ) : (
            /* No Timesheet Submitted */
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}