import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
              <div className="border rounded-lg p-4 bg-muted/10">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  GPS Trail Points
                </h3>
                
                {loading ? (
                  <div className="text-center py-4">Loading GPS data...</div>
                ) : gpsPoints.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No GPS tracking data available for this timesheet.</p>
                    <p className="text-sm">GPS tracking is recorded from the mobile app during work hours.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {gpsPoints.map((point, index) => (
                        <div key={point.id} className="bg-background border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Point {index + 1}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(point.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>Lat: {point.latitude.toFixed(6)}</div>
                            <div>Lng: {point.longitude.toFixed(6)}</div>
                            {point.accuracy && (
                              <div className="text-xs text-muted-foreground">
                                Accuracy: ±{point.accuracy.toFixed(1)}m
                              </div>
                            )}
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${point.latitude},${point.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-2 inline-block"
                          >
                            View on Maps →
                          </a>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Total GPS points recorded: {gpsPoints.length}
                      </p>
                      {gpsPoints.length > 1 && (
                        <a
                          href={`https://www.google.com/maps/dir/${gpsPoints.map(p => `${p.latitude},${p.longitude}`).join('/')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View complete route on Google Maps →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}