import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ChevronRight, FileBarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface CompanyReport {
  utility: string;
  totalHours: number;
  crewCount: number;
}

interface TeamReport {
  crewId: string;
  crewName: string;
  totalHours: number;
  timesheetCount: number;
}

interface DailyReport {
  date: string;
  timesheetId: string;
  hours: number;
  workDescription: string;
  status: string;
}

type DrillDownLevel = 'company' | 'team' | 'daily';

interface DrillDownState {
  level: DrillDownLevel;
  company?: string;
  teamId?: string;
  teamName?: string;
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(() => format(startOfWeek(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(endOfWeek(new Date()), 'yyyy-MM-dd'));
  const [drillDown, setDrillDown] = useState<DrillDownState>({ level: 'company' });

  // Company-level report
  const { data: companyReports, isLoading: isLoadingCompanies } = useQuery<CompanyReport[]>({
    queryKey: ['company-reports', startDate, endDate],
    queryFn: async (): Promise<CompanyReport[]> => {
      const { data, error } = await supabase
        .from('timesheets')
        .select(`
          total_hours,
          crews!inner(utility, name)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .not('total_hours', 'is', null);

      if (error) throw error;

      const companyMap = new Map<string, { totalHours: number; crewCount: Set<string> }>();
      
      data.forEach((timesheet: any) => {
        const utility = timesheet.crews.utility || 'Unknown Company';
        const existing = companyMap.get(utility) || { totalHours: 0, crewCount: new Set() };
        existing.totalHours += Number(timesheet.total_hours || 0);
        existing.crewCount.add(timesheet.crews.name);
        companyMap.set(utility, existing);
      });

      return Array.from(companyMap.entries()).map(([utility, data]) => ({
        utility,
        totalHours: data.totalHours,
        crewCount: data.crewCount.size
      }));
    },
    enabled: drillDown.level === 'company'
  });

  // Team-level report
  const { data: teamReports, isLoading: isLoadingTeams } = useQuery<TeamReport[]>({
    queryKey: ['team-reports', startDate, endDate, drillDown.company],
    queryFn: async (): Promise<TeamReport[]> => {
      const { data, error } = await supabase
        .from('timesheets')
        .select(`
          total_hours,
          crew_id,
          crews!inner(name, utility)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('crews.utility', drillDown.company)
        .not('total_hours', 'is', null);

      if (error) throw error;

      const teamMap = new Map<string, { totalHours: number; timesheetCount: number; crewName: string }>();
      
      data.forEach((timesheet: any) => {
        const crewId = timesheet.crew_id;
        const existing = teamMap.get(crewId) || { totalHours: 0, timesheetCount: 0, crewName: timesheet.crews.name };
        existing.totalHours += Number(timesheet.total_hours || 0);
        existing.timesheetCount += 1;
        teamMap.set(crewId, existing);
      });

      return Array.from(teamMap.entries()).map(([crewId, data]) => ({
        crewId,
        crewName: data.crewName,
        totalHours: data.totalHours,
        timesheetCount: data.timesheetCount
      }));
    },
    enabled: drillDown.level === 'team' && !!drillDown.company
  });

  // Daily report
  const { data: dailyReports, isLoading: isLoadingDaily } = useQuery<DailyReport[]>({
    queryKey: ['daily-reports', startDate, endDate, drillDown.teamId],
    queryFn: async (): Promise<DailyReport[]> => {
      const { data, error } = await supabase
        .from('timesheets')
        .select(`
          id,
          date,
          total_hours,
          work_description,
          status
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('crew_id', drillDown.teamId)
        .not('total_hours', 'is', null)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map((timesheet: any) => ({
        date: timesheet.date,
        timesheetId: timesheet.id,
        hours: Number(timesheet.total_hours || 0),
        workDescription: timesheet.work_description || 'No description',
        status: timesheet.status
      }));
    },
    enabled: drillDown.level === 'daily' && !!drillDown.teamId
  });

  const handleCompanyDrillDown = (company: string) => {
    setDrillDown({ level: 'team', company });
  };

  const handleTeamDrillDown = (teamId: string, teamName: string) => {
    setDrillDown({ level: 'daily', company: drillDown.company, teamId, teamName });
  };

  const handleBack = () => {
    if (drillDown.level === 'daily') {
      setDrillDown({ level: 'team', company: drillDown.company });
    } else if (drillDown.level === 'team') {
      setDrillDown({ level: 'company' });
    }
  };

  const getBreadcrumb = () => {
    if (drillDown.level === 'company') return 'Companies';
    if (drillDown.level === 'team') return `${drillDown.company} > Teams`;
    return `${drillDown.company} > ${drillDown.teamName} > Daily Reports`;
  };

  const getTotalHours = () => {
    if (drillDown.level === 'company' && companyReports) {
      return companyReports.reduce((sum, report) => sum + report.totalHours, 0);
    }
    if (drillDown.level === 'team' && teamReports) {
      return teamReports.reduce((sum, report) => sum + report.totalHours, 0);
    }
    if (drillDown.level === 'daily' && dailyReports) {
      return dailyReports.reduce((sum, report) => sum + report.hours, 0);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {drillDown.level !== 'company' && (
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <span>{getBreadcrumb()}</span>
            </div>
            <Badge variant="secondary">
              Total: {getTotalHours().toFixed(1)} hours
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {drillDown.level === 'company' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCompanies ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  companyReports?.map((report) => (
                    <TableRow key={report.utility}>
                      <TableCell className="font-medium">{report.utility}</TableCell>
                      <TableCell>{report.totalHours.toFixed(1)} hrs</TableCell>
                      <TableCell>{report.crewCount} teams</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompanyDrillDown(report.utility)}
                        >
                          View Teams <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {drillDown.level === 'team' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Timesheets</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTeams ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  teamReports?.map((report) => (
                    <TableRow key={report.crewId}>
                      <TableCell className="font-medium">{report.crewName}</TableCell>
                      <TableCell>{report.totalHours.toFixed(1)} hrs</TableCell>
                      <TableCell>{report.timesheetCount} submissions</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTeamDrillDown(report.crewId, report.crewName)}
                        >
                          View Daily <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {drillDown.level === 'daily' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Work Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDaily ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  dailyReports?.map((report) => (
                    <TableRow key={report.timesheetId}>
                      <TableCell>{format(new Date(report.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{report.hours.toFixed(1)} hrs</TableCell>
                      <TableCell className="max-w-xs truncate">{report.workDescription}</TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'approved' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}