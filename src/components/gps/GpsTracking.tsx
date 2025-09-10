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
import { showErrorToast } from '@/lib/toast-utils';
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

interface Company {
  id: string;
  name: string;
}

export function GpsTracking() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
    fetchCrews();
  }, []);

  useEffect(() => {
    fetchCrews();
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedCrew && selectedDate) {
      fetchGpsData();
    }
  }, [selectedCrew, selectedDate]);

  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies for GPS...');
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('active', true)
        .order('name');

      console.log('Companies result:', { data, error, count: data?.length });
      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      showErrorToast(
        "Error loading companies",
        error.message
      );
    }
  };

  const fetchCrews = async () => {
    try {
      console.log('Fetching crews for GPS...');
      let query = supabase
        .from('crews')
        .select('id, crew_name, company_id')
        .eq('active', true);

      if (selectedCompany) {
        query = query.eq('company_id', selectedCompany);
      }

      const { data, error } = await query.order('crew_name');

      console.log('Crews result:', { data, error, count: data?.length });
      if (error) throw error;
      setCrews(data || []);
      
      // Reset crew selection if the current selection is not in the new list
      if (selectedCrew && data) {
        const crewExists = data.some(crew => crew.id === selectedCrew);
        if (!crewExists) {
          setSelectedCrew('');
        }
      }
    } catch (error: any) {
      console.error('Error fetching crews:', error);
      showErrorToast(
        "Error loading crews",
        error.message
      );
    }
  };

  const fetchGpsData = async () => {
    setLoading(true);
    try {
      console.log('Fetching GPS data for crew:', selectedCrew, 'date:', selectedDate.toISOString().split('T')[0]);
      
      // Fetch time entries for this crew and date with GPS locations
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select('id, gps_locations, created_at')
        .eq('crew_id', selectedCrew)
        .eq('date', selectedDate.toISOString().split('T')[0]);

      if (error) throw error;

      if (!timeEntries || timeEntries.length === 0) {
        console.log('No time entries found for this crew and date');
        setGpsPoints([]);
        return;
      }

      // Extract GPS points from time entries
      const allGpsPoints: GpsPoint[] = [];
      
      timeEntries.forEach((entry, entryIndex) => {
        const gpsLocations = entry.gps_locations as any[];
        console.log(`Processing entry ${entryIndex + 1}:`, entry.id, 'GPS locations count:', gpsLocations?.length || 0);
        
        if (gpsLocations && Array.isArray(gpsLocations)) {
          gpsLocations.forEach((location: any, locationIndex: number) => {
            console.log(`  Location ${locationIndex + 1}:`, location);
            if (location.latitude && location.longitude) {
              allGpsPoints.push({
                id: `${entry.id}-${locationIndex}`,
                latitude: parseFloat(location.latitude),
                longitude: parseFloat(location.longitude),
                timestamp: location.timestamp || new Date(entry.created_at || new Date()).toISOString(),
                accuracy: location.accuracy || 5
              });
            }
          });
        }
      });

      // Sort GPS points by timestamp
      allGpsPoints.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      console.log(`Total GPS points found: ${allGpsPoints.length}`);
      console.log('GPS points:', allGpsPoints.map((p, i) => `${i+1}: ${new Date(p.timestamp).toLocaleTimeString()}`));
      setGpsPoints(allGpsPoints);
    } catch (error: any) {
      console.error('Error fetching GPS data:', error);
      showErrorToast(
        "Error loading GPS data",
        error.message
      );
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
            {/* Company, Crew and Date Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Company Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Company</label>
                <FormControl size="small" className="w-full">
                  <InputLabel id="company-label">Company</InputLabel>
                  <Select
                    labelId="company-label"
                    id="company-select"
                    value={selectedCompany}
                    label="Company"
                    onChange={(e) => {
                      setSelectedCompany(e.target.value as string);
                      setSelectedCrew(''); // Reset crew selection when company changes
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          zIndex: 1400,
                          backgroundColor: 'white'
                        }
                      }
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
              </div>

              {/* Crew Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Crew</label>
                <FormControl size="small" className="w-full">
                  <InputLabel id="crew-label">Crew</InputLabel>
                  <Select
                    labelId="crew-label"
                    id="crew-select"
                    value={selectedCrew}
                    label="Crew"
                    onChange={(e) => setSelectedCrew(e.target.value as string)}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          zIndex: 1400,
                          backgroundColor: 'white'
                        }
                      }
                    }}
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
              <div>
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
                    className="min-w-[150px]"
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