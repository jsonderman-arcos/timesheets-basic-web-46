import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Exception {
  id: string;
  exception_type: string;
  description: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  timesheets: {
    date: string;
    crews: {
      name: string;
      utility: string;
    };
  };
  profiles: {
    full_name: string;
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
          *,
          timesheets (
            date,
            crews (name, utility)
          ),
          profiles!submitted_by (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExceptions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading exceptions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateExceptionStatus = async (exceptionId: string, status: 'approved' | 'denied') => {
    try {
      const { error } = await supabase
        .from('exceptions')
        .update({ 
          status,
          reviewed_at: new Date().toISOString()
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

      toast({
        title: "Exception updated",
        description: `Exception has been ${status}.`,
      });

      setSelectedException(null);
    } catch (error: any) {
      toast({
        title: "Error updating exception",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Approved</Badge>;
      case 'denied':
        return <Badge variant="outline" className="bg-error/10 text-error border-error">Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading exceptions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Exception Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exceptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No exceptions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Crew</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions.map((exception) => (
                    <TableRow key={exception.id}>
                      <TableCell className="font-medium">
                        {exception.exception_type}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{exception.timesheets?.crews?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {exception.timesheets?.crews?.utility}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(exception.timesheets?.date || '').toLocaleDateString()}
                      </TableCell>
                      <TableCell>{exception.profiles?.full_name}</TableCell>
                      <TableCell>{getStatusBadge(exception.status)}</TableCell>
                      <TableCell>{formatDate(exception.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedException(exception)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
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

      <Dialog open={!!selectedException} onOpenChange={() => setSelectedException(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exception Details</DialogTitle>
          </DialogHeader>
          
          {selectedException && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Exception Type</h4>
                  <p>{selectedException.exception_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  {getStatusBadge(selectedException.status)}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm leading-relaxed bg-muted p-3 rounded-md">
                  {selectedException.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Crew Information</h4>
                  <p>{selectedException.timesheets?.crews?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedException.timesheets?.crews?.utility}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Timesheet Date</h4>
                  <p>{new Date(selectedException.timesheets?.date || '').toLocaleDateString()}</p>
                </div>
              </div>

              {selectedException.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => updateExceptionStatus(selectedException.id, 'approved')}
                    className="flex items-center gap-2 bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateExceptionStatus(selectedException.id, 'denied')}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Deny
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