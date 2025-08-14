import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, User, Calendar } from 'lucide-react';

interface Crew {
  id: string;
  name: string;
  utility: string;
}

interface Timesheet {
  id: string;
  crew_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
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
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not recorded';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-warning text-warning-foreground';
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Get the date for the modal (either from timesheet or we'll need to pass it)
  const modalDate = timesheet?.date || new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {crew.name} - {formatDate(modalDate)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Crew Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Crew Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Crew Name:</span>
                <span>{crew.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Utility:</span>
                <span>{crew.utility}</span>
              </div>
            </CardContent>
          </Card>

          {timesheet ? (
            /* Timesheet Details */
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Work Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Start Time</span>
                      <p className="text-lg">{formatTime(timesheet.start_time)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">End Time</span>
                      <p className="text-lg">{formatTime(timesheet.end_time)}</p>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Total Hours</span>
                    <p className="text-2xl font-bold text-primary">{timesheet.total_hours} hours</p>
                  </div>
                  <div className="pt-2">
                    <Badge className={getStatusColor(timesheet.status)}>
                      {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {timesheet.work_description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Work Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{timesheet.work_description}</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* No Timesheet Submitted */
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-error" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">No Timesheet Submitted</h3>
                    <p className="text-muted-foreground">
                      {crew.name} has not submitted a timesheet for {formatDate(modalDate)}.
                    </p>
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