import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Navigation, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
  name: string;
  utility: string;
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
        .select('id, name, utility')
        .order('name');

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
      
      // First, get the timesheet for this crew and date
      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheets')
        .select('id')
        .eq('crew_id', selectedCrew)
        .eq('date', selectedDate.toISOString().split('T')[0])
        .maybeSingle();

      if (timesheetError) throw timesheetError;

      if (!timesheetData) {
        console.log('No timesheet found for this crew and date');
        setGpsPoints([]);
        return;
      }

      // Now get GPS data for this timesheet
      const { data, error } = await supabase
        .from('gps_tracking')
        .select('*')
        .eq('timesheet_id', timesheetData.id)
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
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            GPS Breadcrumb Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Crew Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Crew</label>
              <Select value={selectedCrew} onValueChange={setSelectedCrew}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a crew to view GPS trail" />
                </SelectTrigger>
                <SelectContent>
                  {crews.map((crew) => (
                    <SelectItem key={crew.id} value={crew.id}>
                      {crew.name} - {crew.utility}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousDay}
                  className="px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "min-w-[200px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextDay}
                  className="px-3"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {selectedCrew && selectedDate && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading GPS data...</p>
                  </div>
                ) : gpsPoints.length > 0 ? (
                  <MapView gpsPoints={gpsPoints} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No GPS data found for {crews.find(c => c.id === selectedCrew)?.name} on {format(selectedDate, "PPP")}</p>
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