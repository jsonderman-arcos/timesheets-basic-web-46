import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
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
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Export Timesheets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={exportType} onValueChange={(value: 'csv' | 'excel') => setExportType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV Format</SelectItem>
              <SelectItem value="excel">Excel Format (Coming Soon)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={exportTimesheets} 
            disabled={loading || exportType === 'excel'}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Exporting...' : 'Export Timesheets'}
          </Button>
          
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {dateRange.start} to {dateRange.end}
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