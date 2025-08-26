import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  TableContainer,
  Paper,
  Box,
  CircularProgress,
  IconButton,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import { TimesheetDetailModal } from './TimesheetDetailModal';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';

interface Crew {
  id: string;
  crew_name: string;
  company_id: string;
}

interface Timesheet {
  id: string;
  crew_id: string;
  date: string;
  start_time: string;
  end_time: string;
  hours_regular: number;
  hours_overtime: number;
  work_description: string;
  status: string;
}

interface TimesheetGridData {
  [crewId: string]: {
    [date: string]: Timesheet;
  };
}

export function TimesheetGrid() {
  const [searchParams] = useSearchParams();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetGridData>({});
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { toast } = useToast();
  
  const companyFilter = searchParams.get('company');

  // Generate dates for the current week (Monday to Sunday)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeek, i);
    return format(date, 'yyyy-MM-dd');
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek, companyFilter]);

  const fetchData = async () => {
    try {
      let crewQuery = supabase
        .from('crews')
        .select('id, crew_name, company_id, companies!inner(name)')
        .order('crew_name');
      
      // Filter by company if specified
      if (companyFilter) {
        crewQuery = crewQuery.eq('companies.name', companyFilter);
      }

      const { data: crewData, error: crewError } = await crewQuery;
      if (crewError) throw crewError;
      setCrews(crewData || []);

      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      const { data: timesheetData, error: timesheetError } = await supabase
        .from('time_entries')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (timesheetError) throw timesheetError;

      const organized: TimesheetGridData = {};
      (timesheetData || []).forEach((t) => {
        if (!organized[t.crew_id]) organized[t.crew_id] = {};
        organized[t.crew_id][t.date] = t;
      });

      setTimesheets(organized);
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (crew: Crew, date: string) => {
    const timesheet = timesheets[crew.id]?.[date];
    setSelectedCrew(crew);
    setSelectedTimesheet(timesheet || null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const getWeekRange = () => {
    const endOfWeek = addDays(currentWeek, 6);
    return `${format(currentWeek, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Box className="flex items-center justify-center">
            <CircularProgress size={24} className="mr-2" />
            <Typography>Loading timesheet data...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader 
          title={
            <Box>
              <Typography variant="h6">Timesheet Overview</Typography>
              {companyFilter && (
                <Typography variant="body2" color="text.secondary">
                  Filtered by: {companyFilter}
                </Typography>
              )}
            </Box>
          }
          action={
            <Box className="flex items-center gap-2">
              <IconButton onClick={goToPreviousWeek} size="small">
                <ChevronLeftIcon />
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                onClick={goToCurrentWeek}
                startIcon={<TodayIcon />}
                className="min-w-[140px]"
              >
                This Week
              </Button>
              <IconButton onClick={goToNextWeek} size="small">
                <ChevronRightIcon />
              </IconButton>
            </Box>
          }
        />
        <CardContent>
          <Box className="mb-4">
            <Typography variant="subtitle1" className="text-center font-medium">
              {getWeekRange()}
            </Typography>
          </Box>
          <TableContainer component={Paper} className="overflow-x-auto">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="w-48"><Typography variant="subtitle2">Crew</Typography></TableCell>
                  {dates.map((date) => (
                    <TableCell key={date} align="center">
                      <Typography variant="caption">{formatDate(date)}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {crews.map((crew) => (
                  <TableRow key={crew.id} hover>
                    <TableCell>
                      <div>
                        <Typography variant="body2" fontWeight={600}>{crew.crew_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(crew as any).companies?.name || 'Company'}
                        </Typography>
                      </div>
                    </TableCell>
                    {dates.map((date) => {
                      const hasTimesheet = !!timesheets[crew.id]?.[date];
                      return (
                        <TableCell
                          key={date}
                          align="center"
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => handleCellClick(crew, date)}
                        >
                          {hasTimesheet ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <CancelIcon color="error" fontSize="small" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <TimesheetDetailModal
        timesheet={selectedTimesheet}
        crew={selectedCrew}
        open={!!selectedCrew}
        onOpenChange={() => {
          setSelectedCrew(null);
          setSelectedTimesheet(null);
        }}
        onUpdate={fetchData}
      />
    </>
  );
}