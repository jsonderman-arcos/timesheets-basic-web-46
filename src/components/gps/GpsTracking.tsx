import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MapView } from './MapView';

interface GpsPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
}

interface Timesheet {
  id: string;
  date: string;
  crews: {
    name: string;
    utility: string;
  };
}

export function GpsTracking() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState<string>('');
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimesheets();
  }, []);

  useEffect(() => {
    if (selectedTimesheet) {
      fetchGpsData(selectedTimesheet);
    }
  }, [selectedTimesheet]);

  const fetchTimesheets = async () => {
    try {
      console.log('Fetching timesheets for GPS...');
      const { data, error } = await supabase
        .from('timesheets')
        .select(`
          id,
          date,
          crews (name, utility)
        `)
        .order('date', { ascending: false })
        .limit(50);

      console.log('Timesheets result:', { data, error, count: data?.length });
      if (error) throw error;
      setTimesheets(data || []);
    } catch (error: any) {
      console.error('Error fetching timesheets:', error);
      toast({
        title: "Error loading timesheets",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchGpsData = async (timesheetId: string) => {
    setLoading(true);
    try {
      console.log('Fetching GPS data for timesheet:', timesheetId);
      const { data, error } = await supabase
        .from('gps_tracking')
        .select('*')
        .eq('timesheet_id', timesheetId)
        .order('timestamp');

      console.log('GPS data result:', { data, error, count: data?.length });
      if (error) throw error;
      setGpsPoints(data || []);
    } catch (error: any) {
      console.error('Error fetching GPS data:', error);
      toast({
        title: "Error loading GPS data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            GPS Breadcrumb Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Timesheet</label>
              <Select value={selectedTimesheet} onValueChange={setSelectedTimesheet}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a timesheet to view GPS trail" />
                </SelectTrigger>
                <SelectContent>
                  {timesheets.map((timesheet) => (
                    <SelectItem key={timesheet.id} value={timesheet.id}>
                      {timesheet.crews?.name} - {new Date(timesheet.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTimesheet && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading GPS data...</p>
                  </div>
                ) : (
                  <MapView gpsPoints={gpsPoints} />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}