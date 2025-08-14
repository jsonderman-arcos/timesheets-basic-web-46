import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { TimesheetDetailModal } from './TimesheetDetailModal';
import { useToast } from '@/hooks/use-toast';

interface Crew {
  id: string;
  name: string;
  utility: string;
}

interface Timesheet {
  id: string;
  crew_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
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
  }, []);

  const fetchData = async () => {
    try {
      // Fetch crews
      const { data: crewData, error: crewError } = await supabase
        .from('crews')
        .select('*')
        .order('name');

      if (crewError) throw crewError;
      setCrews(crewData || []);

      // Fetch timesheets for the last 7 days
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheets')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (timesheetError) throw timesheetError;

      // Organize timesheets by crew and date
      const organized: TimesheetGridData = {};
      (timesheetData || []).forEach((timesheet) => {
        if (!organized[timesheet.crew_id]) {
          organized[timesheet.crew_id] = {};
        }
        organized[timesheet.crew_id][timesheet.date] = timesheet;
      });

      setTimesheets(organized);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
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
          <div className="text-center">Loading timesheet data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Timesheet Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Crew</TableHead>
                  {dates.map((date) => (
                    <TableHead key={date} className="text-center min-w-24">
                      {formatDate(date)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {crews.map((crew) => (
                  <TableRow key={crew.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{crew.name}</div>
                        <div className="text-sm text-muted-foreground">{crew.utility}</div>
                      </div>
                    </TableCell>
                    {dates.map((date) => {
                      const hasTimesheet = !!timesheets[crew.id]?.[date];
                      return (
                        <TableCell
                          key={date}
                          className="text-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleCellClick(crew, date)}
                        >
                          {hasTimesheet ? (
                            <Check className="w-6 h-6 text-success mx-auto" />
                          ) : (
                            <X className="w-6 h-6 text-error mx-auto" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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