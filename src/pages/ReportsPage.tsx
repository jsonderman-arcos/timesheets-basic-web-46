import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ChevronRight, FileBarChart, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  // Generate consistent rates for companies
  const companyRates = useMemo(() => {
    const rates = new Map<string, number>();
    return rates;
  }, []);

  // Company-level report
  const { data: companyReports, isLoading: isLoadingCompanies } = useQuery<CompanyReport[]>({
    queryKey: ['company-reports-cumulative'],
    queryFn: async (): Promise<CompanyReport[]> => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          hours_regular,
          hours_overtime,
          crews!inner(crew_name, companies!inner(name))
        `)
        .lte('date', new Date().toISOString().split('T')[0])
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
    queryKey: ['team-reports-cumulative', drillDown.company],
    queryFn: async (): Promise<TeamReport[]> => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          hours_regular,
          hours_overtime,
          crew_id,
          crews!inner(crew_name, companies!inner(name))
        `)
        .lte('date', new Date().toISOString().split('T')[0])
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
    queryKey: ['daily-reports-cumulative', drillDown.teamId],
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
        .lte('date', new Date().toISOString().split('T')[0])
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
        
      </div>

      <Card>
        <CardContent className="space-y-4 bg-white">
          {drillDown.level === 'company' && (
            <Table className="bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Company</TableHead>
                  <TableHead className="font-bold">Total Hours</TableHead>
                  <TableHead className="font-bold">Rate</TableHead>
                  <TableHead className="font-bold">Total Cost</TableHead>
                  <TableHead className="font-bold">Teams</TableHead>
                  <TableHead className="font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCompanies ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  companyReports?.map((report) => {
                    // Get or generate a consistent rate for this company
                    if (!companyRates.has(report.utility)) {
                      companyRates.set(report.utility, Math.floor(Math.random() * (165 - 140 + 1)) + 140);
                    }
                    const rate = companyRates.get(report.utility)!;
                    const totalCost = report.totalHours * rate;
                    return (
                      <TableRow key={report.utility}>
                        <TableCell className="font-medium">{report.utility}</TableCell>
                        <TableCell>{report.totalHours.toFixed(1)} hrs</TableCell>
                        <TableCell>${rate}/hr</TableCell>
                        <TableCell>${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</TableCell>
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
                    );
                  })
                )}
              </TableBody>
              <TableFooter>
                {!isLoadingCompanies && companyReports && (
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="font-bold">
                      {companyReports.reduce((sum, report) => sum + report.totalHours, 0).toFixed(1)} hrs
                    </TableCell>
                    <TableCell className="font-bold">
                      ${Math.round(Array.from(companyRates.values()).reduce((sum, rate) => sum + rate, 0) / companyRates.size)}/hr
                    </TableCell>
                    <TableCell className="font-bold">
                      ${companyReports.reduce((sum, report) => {
                        // Use the same consistent rate that was generated for each company
                        const rate = companyRates.get(report.utility)!;
                        return sum + (report.totalHours * rate);
                      }, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="font-bold">
                      {companyReports.reduce((sum, report) => sum + report.crewCount, 0)} teams
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableFooter>
            </Table>
          )}

          {drillDown.level === 'team' && (
            <Table className="bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Team Name</TableHead>
                  <TableHead className="font-bold">Total Hours</TableHead>
                  <TableHead className="font-bold">Timesheets</TableHead>
                  <TableHead className="font-bold">Action</TableHead>
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
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Total Hours</TableHead>
                  <TableHead className="font-bold">Working</TableHead>
                  <TableHead className="font-bold">Traveling</TableHead>
                  <TableHead className="font-bold">Standby</TableHead>
                  <TableHead className="font-bold">Work Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDaily ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
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