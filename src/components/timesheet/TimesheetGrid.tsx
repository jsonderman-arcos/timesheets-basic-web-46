import { useState, useEffect } from 'react';
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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { TimesheetDetailModal } from './TimesheetDetailModal';
import { useToast } from '@/hooks/use-toast';

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
  const [crews, setCrews] = useState<Crew[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetGridData>({});
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Generate last 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const { data: crewData, error: crewError } = await supabase
        .from('crews')
        .select('id, crew_name, company_id')
        .order('crew_name');

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
        <CardHeader title={<Typography variant="h6">Timesheet Overview</Typography>} />
        <CardContent>
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
                        <Typography variant="caption" color="text.secondary">Company</Typography>
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