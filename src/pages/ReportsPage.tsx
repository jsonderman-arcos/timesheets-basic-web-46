import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AssessmentIcon from '@mui/icons-material/Assessment';
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
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  // Sorting helpers
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = <T,>(data: T[], getValue: (item: T) => any): T[] => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const renderBreadcrumb = () => {
    return (
      <Breadcrumb className="mb-4" style={{ marginBottom: '16px' }}>
        <BreadcrumbList>
          {drillDown.level === 'company' ? (
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold">Report Overview</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => setDrillDown({ level: 'company' })}
                  className="cursor-pointer hover:text-foreground"
                >
                  Report Overview
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {drillDown.level === 'team' ? (
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-bold">{drillDown.company}</BreadcrumbPage>
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
                    <BreadcrumbPage className="font-bold">{drillDown.teamName}</BreadcrumbPage>
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
            <AssessmentIcon className="w-6 h-6" fontSize="inherit" />
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
        </div>
        
        {renderBreadcrumb()}
        
      </div>

      <Card className="rounded-md" style={{ backgroundColor: 'var(--theme-base-background-elevations-level-5)', borderRadius: '8px', overflow: 'hidden' }}>
        <CardContent className="p-0" style={{ backgroundColor: 'var(--theme-base-background-elevations-level-5)' }}>
          {drillDown.level === 'company' && (
            <Table className="w-full" style={{ width: '100%' }}>
              <TableHeader>
                <TableRow style={{ backgroundColor: 'var(--theme-base-background-elevations-level-4)' }}>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Company')}
                  >
                    Company
                    {sortColumn === 'Company' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Total Hours')}
                  >
                    Total Hours
                    {sortColumn === 'Total Hours' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead className="font-bold">Rate</TableHead>
                  <TableHead className="font-bold">Total Cost</TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Teams')}
                  >
                    Teams
                    {sortColumn === 'Teams' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead className="font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCompanies ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  sortData(
                    companyReports ?? [],
                    (r) => {
                      switch (sortColumn) {
                        case 'Company': return r.utility;
                        case 'Total Hours': return r.totalHours;
                        case 'Teams': return r.crewCount;
                        default: return r.utility;
                      }
                    }
                  ).map((report) => {
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
                          View Teams <ChevronRightIcon className="w-4 h-4 ml-1" />
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
                      ${Math.round(Array.from(companyRates.values()).reduce((sum, rate) => sum + rate, 0) / companyRates.size)}/hr (avg)
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
            <Table className="w-full rounded-none" style={{ backgroundColor: 'var(--theme-base-background-elevations-level-5)', width: '100%' }}>
              <TableHeader>
                <TableRow style={{ backgroundColor: 'var(--theme-base-background-elevations-level-4)' }}>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Team Name')}
                  >
                    Team Name
                    {sortColumn === 'Team Name' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Total Hours')}
                  >
                    Total Hours
                    {sortColumn === 'Total Hours' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Timesheets')}
                  >
                    Timesheets
                    {sortColumn === 'Timesheets' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead className="font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTeams ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  sortData(
                    teamReports ?? [],
                    (r) => {
                      switch (sortColumn) {
                        case 'Team Name': return r.crewName;
                        case 'Total Hours': return r.totalHours;
                        case 'Timesheets': return r.timesheetCount;
                        default: return r.crewName;
                      }
                    }
                  ).map((report) => (
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
                          View Daily <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {drillDown.level === 'daily' && (
            <Table className="w-full rounded-none" style={{ backgroundColor: 'var(--theme-base-background-elevations-level-5)', width: '100%' }}>
              <TableHeader>
                <TableRow style={{ backgroundColor: 'var(--theme-base-background-elevations-level-4)' }}>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Date')}
                  >
                    Date
                    {sortColumn === 'Date' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Total Hours')}
                  >
                    Total Hours
                    {sortColumn === 'Total Hours' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Working')}
                  >
                    Working
                    {sortColumn === 'Working' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Traveling')}
                  >
                    Traveling
                    {sortColumn === 'Traveling' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Standby')}
                  >
                    Standby
                    {sortColumn === 'Standby' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead
                    className="font-bold cursor-pointer"
                    onClick={() => handleSort('Work Description')}
                  >
                    Work Description
                    {sortColumn === 'Work Description' && (
                      sortDirection === 'asc'
                        ? <ArrowUpwardIcon className="inline w-4 h-4 ml-1" />
                        : <ArrowDownwardIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDaily ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  sortData(
                    dailyReports ?? [],
                    (r) => {
                      switch (sortColumn) {
                        case 'Date': return r.date;
                        case 'Total Hours': return r.hours;
                        case 'Working': return r.workingHours;
                        case 'Traveling': return r.travelingHours;
                        case 'Standby': return r.standbyHours;
                        case 'Work Description': return r.workDescription;
                        default: return r.date;
                      }
                    }
                  ).map((report) => (
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
