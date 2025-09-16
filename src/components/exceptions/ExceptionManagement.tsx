import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useToast } from '@/hooks/use-toast';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';

interface Exception {
  id: string;
  description: string;
  reason: string;
  status: string;
  created_at: string;
  flagged_by: string;
  time_entries?: {
    date: string;
    crews?: {
      crew_name: string;
      company_id: string;
    };
    crew_members?: {
      name: string;
      role: string;
    };
  };
}

export function ExceptionManagement() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [selectedException, setSelectedException] = useState<Exception | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchExceptions();
  }, []);

  const fetchExceptions = async () => {
    try {
      const { data, error } = await supabase
        .from('exceptions')
        .select(`
          id,
          description,
          reason,
          status,
          created_at,
          flagged_by,
          time_entries:time_entry_id (
            date,
            crews:crew_id (
              crew_name,
              company_id
            ),
            crew_members:member_id (
              name,
              role
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExceptions(data || []);
    } catch (error: any) {
      showErrorToast(
        "Error loading exceptions",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const updateExceptionStatus = async (exceptionId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('exceptions')
        .update({ 
          status,
          resolved_at: new Date().toISOString()
        })
        .eq('id', exceptionId);

      if (error) throw error;

      setExceptions(prev => 
        prev.map(ex => 
          ex.id === exceptionId 
            ? { ...ex, status }
            : ex
        )
      );

      const statusText = status === 'accepted' ? 'approved' : 'declined';
      showSuccessToast(
        "Exception updated",
        `Exception has been ${statusText}.`
      );

      setSelectedException(null);
    } catch (error: any) {
      showErrorToast(
        "Error updating exception",
        error.message
      );
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'pending':
        return (
          <Chip
            label="Pending"
            variant="outlined"
            className="bg-warning/10 text-warning border-warning"
            size="small"
          />
        );
      case 'accepted':
      case 'approved':
        return (
          <Chip
            label="Approved"
            variant="outlined"
            className="bg-success/10 text-success border-success"
            size="small"
          />
        );
      case 'declined':
      case 'denied':
        return (
          <Chip
            label="Declined"
            variant="outlined"
            className="bg-error/10 text-error border-error"
            size="small"
          />
        );
      default:
        return <Chip label={status} variant="outlined" size="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      hourCycle: 'h23',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-3">
          <CircularProgress size={20} />
          <Typography variant="body2">Loading exceptions...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
  
        <CardContent>
          {exceptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No exceptions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                 <TableHead sx={{ backgroundColor: 'var(--theme-base-background-elevations-level-4)' }}>
                  <TableRow>
                     <TableCell>Crew</TableCell>
                     <TableCell>Submitted By</TableCell>
                     <TableCell>Status</TableCell>
                     <TableCell>Created</TableCell>
                     <TableCell>Actions</TableCell>
                   </TableRow>
                 </TableHead>
                <TableBody>
                  {exceptions.map((exception) => (
                    <TableRow key={exception.id} hover>
                      <TableCell>
                        <div>
                          <div className="font-semibold">
                            {exception.time_entries?.crews?.crew_name || 'Unknown Crew'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {exception.time_entries?.date ? new Date(exception.time_entries.date).toLocaleDateString() : 'No date'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">
                            {exception.time_entries?.crew_members?.name || exception.flagged_by || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {exception.time_entries?.crew_members?.role || 'Supervisor'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusChip(exception.status)}</TableCell>
                      <TableCell>{formatDate(exception.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setSelectedException(exception)}
                          startIcon={<VisibilityIcon fontSize="small" />}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedException} onClose={() => setSelectedException(null)}>
        <DialogTitle>
          <div className="flex items-center justify-between">
            Exception Details
            <IconButton 
              onClick={() => setSelectedException(null)}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent className="max-w-2xl">
          {selectedException && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Exception Type</h4>
                  <p>Schedule Exception</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  {getStatusChip(selectedException.status)}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm leading-relaxed bg-muted p-3 rounded-md">
                  {selectedException.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reason</h4>
                <p className="text-sm leading-relaxed bg-muted p-3 rounded-md">
                  {selectedException.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Crew Information</h4>
                  <p className="font-medium">{selectedException.time_entries?.crews?.crew_name || 'Unknown Crew'}</p>
                  <p className="text-sm text-muted-foreground">
                    Work Date: {selectedException.time_entries?.date ? new Date(selectedException.time_entries.date).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Submitted By</h4>
                  <p className="font-medium">
                    {selectedException.time_entries?.crew_members?.name || selectedException.flagged_by || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedException.time_entries?.crew_members?.role || 'Supervisor'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Date Created</h4>
                <p>{formatDate(selectedException.created_at)}</p>
              </div>

              {(selectedException.status === 'submitted' || selectedException.status === 'under_review') && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => updateExceptionStatus(selectedException.id, 'accepted')}
                    sx={{
                      backgroundColor: 'var(--theme-base-feedback-success-main)',
                      color: 'var(--theme-base-feedback-success-contrast-text)',
                      '&:hover': {
                        backgroundColor: 'var(--theme-base-feedback-success-dark)',
                      },
                    }}
                    variant="contained"
                    startIcon={<CheckCircleIcon fontSize="small" />}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => updateExceptionStatus(selectedException.id, 'declined')}
                    sx={{
                      backgroundColor: 'var(--theme-base-feedback-error-main)',
                      color: 'var(--theme-base-feedback-error-contrast-text)',
                      '&:hover': {
                        backgroundColor: 'var(--theme-base-feedback-error-dark)',
                      },
                    }}
                    variant="contained"
                    startIcon={<CancelIcon fontSize="small" />}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
