import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import NavigationIcon from '@mui/icons-material/Navigation';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MapView } from './MapView';

interface GpsPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
}

interface Crew {
  id: string;
  crew_name: string;
  company_id: string;
}

export function GpsTracking() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCrews();
  }, []);

  useEffect(() => {
    if (selectedCrew && selectedDate) {
      fetchGpsData();
    }
  }, [selectedCrew, selectedDate]);

  const fetchCrews = async () => {
    try {
      console.log('Fetching crews for GPS...');
      const { data, error } = await supabase
        .from('crews')
        .select('id, crew_name, company_id')
        .order('crew_name');

      console.log('Crews result:', { data, error, count: data?.length });
      if (error) throw error;
      setCrews(data || []);
    } catch (error: any) {
      console.error('Error fetching crews:', error);
      toast({
        title: "Error loading crews",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchGpsData = async () => {
    setLoading(true);
    try {
      console.log('Fetching GPS data for crew:', selectedCrew, 'date:', selectedDate.toISOString().split('T')[0]);
      
      // First, get the time entry for this crew and date
      const { data: timeEntryData, error: timeEntryError } = await supabase
        .from('time_entries')
        .select('id')
        .eq('crew_id', selectedCrew)
        .eq('date', selectedDate.toISOString().split('T')[0])
        .maybeSingle();

      if (timeEntryError) throw timeEntryError;

      if (!timeEntryData) {
        console.log('No time entry found for this crew and date');
        setGpsPoints([]);
        return;
      }

      // For now, we'll simulate GPS data since gps_tracking table doesn't exist
      // In a real implementation, you would fetch from the actual GPS tracking table
      console.log('No GPS tracking data available - would need GPS tracking table');
      setGpsPoints([]);
    } catch (error: any) {
      console.error('Error fetching GPS data:', error);
      toast({
        title: "Error loading GPS data",
        description: error.message,
        variant: "destructive",
      });
      setGpsPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
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
          <div className="flex items-center gap-2">
            <NavigationIcon fontSize="small" />
            <Typography variant="h6">GPS Breadcrumb Tracking</Typography>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Crew and Date Selectors */}
            <div className="flex gap-4 items-end">
              {/* Crew Selector */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Select Crew</label>
                <FormControl size="small" className="w-full">
                  <InputLabel id="crew-label">Crew</InputLabel>
                  <Select
                    labelId="crew-label"
                    id="crew-select"
                    value={selectedCrew}
                    label="Crew"
                    onChange={(e) => setSelectedCrew(e.target.value as string)}
                  >
                    {crews.map((crew) => (
                      <MenuItem key={crew.id} value={crew.id}>
                        {crew.crew_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Date Selector */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <div className="flex items-center gap-2">
                  <Button variant="outlined" size="small" onClick={goToPreviousDay} className="px-3">
                    <ChevronLeftIcon fontSize="small" />
                  </Button>

                  <TextField
                    type="date"
                    size="small"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                    className="min-w-[200px]"
                  />

                  <Button variant="outlined" size="small" onClick={goToNextDay} className="px-3">
                    <ChevronRightIcon fontSize="small" />
                  </Button>
                </div>
              </div>
            </div>

            {selectedCrew && selectedDate && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 flex flex-col items-center gap-2">
                    <CircularProgress size={24} />
                    <p className="text-muted-foreground">Loading GPS data...</p>
                  </div>
                ) : gpsPoints.length > 0 ? (
                  <MapView gpsPoints={gpsPoints} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No GPS data found for {crews.find(c => c.id === selectedCrew)?.crew_name} on {format(selectedDate, "PPP")}</p>
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