import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ChevronRight, FileBarChart, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { TextField } from '@mui/material';
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
  workingHours: number;
  travelingHours: number;
  standbyHours: number;
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
        .from('time_entries')
        .select(`
          hours_regular,
          hours_overtime,
          crews!inner(crew_name, companies!inner(name))
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .not('hours_regular', 'is', null);

      if (error) throw error;

      const companyMap = new Map<string, { totalHours: number; crewCount: Set<string> }>();
      
      data.forEach((entry: any) => {
        const company = entry.crews.companies?.name || 'Unknown Company';
        const existing = companyMap.get(company) || { totalHours: 0, crewCount: new Set() };
        existing.totalHours += Number(entry.hours_regular || 0) + Number(entry.hours_overtime || 0);
        existing.crewCount.add(entry.crews.crew_name);
        companyMap.set(company, existing);
      });

      return Array.from(companyMap.entries()).map(([company, data]) => ({
        utility: company,
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
        .from('time_entries')
        .select(`
          hours_regular,
          hours_overtime,
          crew_id,
          crews!inner(crew_name, companies!inner(name))
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('crews.companies.name', drillDown.company)
        .not('hours_regular', 'is', null);

      if (error) throw error;

      const teamMap = new Map<string, { totalHours: number; timesheetCount: number; crewName: string }>();
      
      data.forEach((entry: any) => {
        const crewId = entry.crew_id;
        const existing = teamMap.get(crewId) || { totalHours: 0, timesheetCount: 0, crewName: entry.crews.crew_name };
        existing.totalHours += Number(entry.hours_regular || 0) + Number(entry.hours_overtime || 0);
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
        .from('time_entries')
        .select(`
          id,
          date,
          hours_regular,
          hours_overtime,
          working_hours,
          traveling_hours,
          standby_hours,
          work_description,
          status
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('crew_id', drillDown.teamId)
        .not('hours_regular', 'is', null)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map((entry: any) => ({
        date: entry.date,
        timesheetId: entry.id,
        hours: Number(entry.hours_regular || 0) + Number(entry.hours_overtime || 0),
        workingHours: Number(entry.working_hours || 0),
        travelingHours: Number(entry.traveling_hours || 0),
        standbyHours: Number(entry.standby_hours || 0),
        workDescription: entry.work_description || 'No description',
        status: entry.status
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

  const renderBreadcrumb = () => {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {drillDown.level === 'company' ? (
            <BreadcrumbItem>
              <BreadcrumbPage>Reports</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => setDrillDown({ level: 'company' })}
                  className="cursor-pointer hover:text-foreground"
                >
                  Reports
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {drillDown.level === 'team' ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{drillDown.company}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => setDrillDown({ level: 'team', company: drillDown.company })}
                      className="cursor-pointer hover:text-foreground"
                    >
                      {drillDown.company}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{drillDown.teamName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
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
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileBarChart className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
        </div>
        
        {renderBreadcrumb()}
        
        {drillDown.level !== 'company' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent className="space-y-4 bg-white">
          {drillDown.level === 'company' && (
            <Table className="bg-white">
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
            <Table className="bg-white">
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
            <Table className="bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Working</TableHead>
                  <TableHead>Traveling</TableHead>
                  <TableHead>Standby</TableHead>
                  <TableHead>Work Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDaily ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  dailyReports?.map((report) => (
                    <TableRow key={report.timesheetId}>
                      <TableCell>{format(new Date(report.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{report.hours.toFixed(1)} hrs</TableCell>
                      <TableCell>{report.workingHours.toFixed(1)} hrs</TableCell>
                      <TableCell>{report.travelingHours.toFixed(1)} hrs</TableCell>
                      <TableCell>{report.standbyHours.toFixed(1)} hrs</TableCell>
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
    </>
  );
}