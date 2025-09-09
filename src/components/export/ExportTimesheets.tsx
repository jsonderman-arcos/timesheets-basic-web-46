import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableViewIcon from '@mui/icons-material/TableView';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ExportTimesheets() {
  const [exportType, setExportType] = useState<'csv' | 'excel'>('csv');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportTimesheets = async () => {
    setLoading(true);
    try {
      const { data: timesheets, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          crews!inner (crew_name, companies!inner(name))
        `)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: false });

      if (error) throw error;

      if (!timesheets || timesheets.length === 0) {
        toast({
          title: "No data found",
          description: "No timesheets found for the selected date range.",
          variant: "destructive",
        });
        return;
      }

      // Convert to CSV format
      const headers = [
        'Date',
        'Crew Name',
        'Utility',
        'Start Time',
        'End Time',
        'Total Hours',
        'Work Description',
        'Status',
        'Submitted By'
      ];

      const csvData = timesheets.map(entry => [
        entry.date,
        entry.crews?.crew_name || '',
        entry.crews?.companies?.name || '',
        entry.start_time || '',
        entry.end_time || '',
        (entry.hours_regular || 0) + (entry.hours_overtime || 0),
        entry.work_description || '',
        entry.status,
        'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `timesheets_${dateRange.start}_to_${dateRange.end}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `Exported ${timesheets.length} timesheet records.`,
      });

    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TableViewIcon fontSize="small" />
          <Typography variant="h6">Export Timesheets</Typography>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          <TextField
            id="start-date"
            label="Start Date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            size="small"
            className="w-64"
          />
          <TextField
            id="end-date"
            label="End Date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            size="small"
            className="w-64"
          />
        </div>

        <div className="flex items-end gap-4">
          <FormControl size="small" className="w-64">
            <InputLabel id="export-type-label">Export Format</InputLabel>
            <Select
              labelId="export-type-label"
              id="export-type"
              value={exportType}
              label="Export Format"
              onChange={(e) => setExportType(e.target.value as 'csv' | 'excel')}
            >
              <MenuItem value="csv">CSV Format</MenuItem>
              <MenuItem value="excel" disabled>Excel Format (Coming Soon)</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            onClick={exportTimesheets}
            disabled={loading || exportType === 'excel'}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
          >
            {loading ? 'Exporting…' : 'Export Timesheets'}
          </Button>
        </div>

        {exportType === 'excel' && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            Excel export functionality is coming soon. Please use CSV format for now.
          </div>
        )}
      </CardContent>
    </Card>
  );
}