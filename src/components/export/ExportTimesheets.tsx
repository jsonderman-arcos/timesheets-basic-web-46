import { useState, useEffect } from 'react';
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
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCrew, setSelectedCrew] = useState<string>('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [crews, setCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('active', true);
      setCompanies(data || []);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchCrews = async () => {
      let query = supabase
        .from('crews')
        .select('id, crew_name, company_id')
        .eq('active', true);
      
      if (selectedCompany) {
        query = query.eq('company_id', selectedCompany);
      }
      
      const { data } = await query;
      setCrews(data || []);
      
      // Reset crew selection if the current selection is not in the new list
      if (selectedCrew && data) {
        const crewExists = data.some(crew => crew.id === selectedCrew);
        if (!crewExists) {
          setSelectedCrew('');
        }
      }
    };
    fetchCrews();
  }, [selectedCompany, selectedCrew]);

  const exportTimesheets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('time_entries')
        .select(`
          *,
          crews!inner (crew_name, company_id, companies!inner(name))
        `)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);

      if (selectedCompany) {
        query = query.eq('crews.company_id', selectedCompany);
      }
      
      if (selectedCrew) {
        query = query.eq('crew_id', selectedCrew);
      }

      const { data: timesheets, error } = await query.order('date', { ascending: false });

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
        <div className="space-y-4">
          <div className="flex items-end gap-4">
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
              <InputLabel id="company-label">Filter by Company</InputLabel>
              <Select
                labelId="company-label"
                value={selectedCompany}
                label="Filter by Company"
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedCrew(''); // Reset crew selection when company changes
                }}
              >
                <MenuItem value="">All Companies</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" className="w-64">
              <InputLabel id="crew-label">Filter by Crew</InputLabel>
              <Select
                labelId="crew-label"
                value={selectedCrew}
                label="Filter by Crew"
                onChange={(e) => setSelectedCrew(e.target.value)}
              >
                <MenuItem value="">All Crews</MenuItem>
                {crews.map((crew) => (
                  <MenuItem key={crew.id} value={crew.id}>
                    {crew.crew_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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