import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { format, endOfWeek, startOfWeek } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

type DrillDownLevel = 'company' | 'team' | 'daily';

type SortDirection = 'asc' | 'desc';

interface DrillDownState {
  level: DrillDownLevel;
  company?: string;
  teamId?: string;
  teamName?: string;
}

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

export default function ReportsPage() {
  const [drillDown, setDrillDown] = useState<DrillDownState>({ level: 'company' });
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [startDate] = useState(() => format(startOfWeek(new Date()), 'yyyy-MM-dd'));
  const [endDate] = useState(() => format(endOfWeek(new Date()), 'yyyy-MM-dd'));

  const companyRates = useMemo(() => new Map<string, number>(), []);

  const { data: companyReports, isLoading: isLoadingCompanies } = useQuery<CompanyReport[]>({
    queryKey: ['company-reports-cumulative'],
    queryFn: async () => {
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
        const existing = companyMap.get(company) || { totalHours: 0, crewCount: new Set<string>() };
        existing.totalHours += Number(entry.hours_regular || 0) + Number(entry.hours_overtime || 0);
        existing.crewCount.add(entry.crews.crew_name);
        companyMap.set(company, existing);
      });

      return Array.from(companyMap.entries()).map(([company, data]) => ({
        utility: company,
        totalHours: data.totalHours,
        crewCount: data.crewCount.size,
      }));
    },
    enabled: drillDown.level === 'company',
  });

  const { data: teamReports, isLoading: isLoadingTeams } = useQuery<TeamReport[]>({
    queryKey: ['team-reports-cumulative', drillDown.company],
    queryFn: async () => {
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
        const existing =
          teamMap.get(crewId) || {
            totalHours: 0,
            timesheetCount: 0,
            crewName: entry.crews.crew_name,
          };
        existing.totalHours += Number(entry.hours_regular || 0) + Number(entry.hours_overtime || 0);
        existing.timesheetCount += 1;
        teamMap.set(crewId, existing);
      });

      return Array.from(teamMap.entries()).map(([crewId, data]) => ({
        crewId,
        crewName: data.crewName,
        totalHours: data.totalHours,
        timesheetCount: data.timesheetCount,
      }));
    },
    enabled: drillDown.level === 'team' && !!drillDown.company,
  });

  const { data: dailyReports, isLoading: isLoadingDaily } = useQuery<DailyReport[]>({
    queryKey: ['daily-reports-cumulative', drillDown.teamId],
    queryFn: async () => {
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
        status: entry.status,
      }));
    },
    enabled: drillDown.level === 'daily' && !!drillDown.teamId,
  });

  const handleCompanyDrillDown = (company: string) => {
    setDrillDown({ level: 'team', company });
  };

  const handleTeamDrillDown = (teamId: string, teamName: string) => {
    setDrillDown({ level: 'daily', company: drillDown.company, teamId, teamName });
  };

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

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ArrowUpwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
    ) : (
      <ArrowDownwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
    );
  };

  const sortableHeaderSx = {
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap' as const,
  };

  const tableHeadSx = {
    backgroundColor: 'var(--theme-base-background-elevations-level-4)',
  };

  const tableContainerSx = {
    '& table': {
      width: '100%',
    },
  };

  const renderBreadcrumb = () => (
    <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
      {drillDown.level === 'company' ? (
        <Typography fontWeight={600}>Report Overview</Typography>
      ) : (
        <>
          <Link
            color="inherit"
            underline="hover"
            sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setDrillDown({ level: 'company' })}
          >
            Report Overview
          </Link>
          {drillDown.level === 'team' ? (
            <Typography fontWeight={600}>{drillDown.company}</Typography>
          ) : (
            <>
              <Link
                color="inherit"
                underline="hover"
                sx={{ cursor: 'pointer', fontWeight: 500 }}
                onClick={() => setDrillDown({ level: 'team', company: drillDown.company })}
              >
                {drillDown.company}
              </Link>
              <Typography fontWeight={600}>{drillDown.teamName}</Typography>
            </>
          )}
        </>
      )}
    </Breadcrumbs>
  );

  const renderCompanyTable = () => (
    <TableContainer component={Box} sx={tableContainerSx}>
      <Table>
        <TableHead sx={tableHeadSx}>
          <TableRow>
            <TableCell
              onClick={() => handleSort('Company')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Company
                {renderSortIcon('Company')}
              </Box>
            </TableCell>
            <TableCell
              onClick={() => handleSort('Total Hours')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Total Hours
                {renderSortIcon('Total Hours')}
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Total Cost</TableCell>
            <TableCell
              onClick={() => handleSort('Teams')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Teams
                {renderSortIcon('Teams')}
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoadingCompanies ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            sortData(companyReports ?? [], (report) => {
              switch (sortColumn) {
                case 'Company':
                  return report.utility;
                case 'Total Hours':
                  return report.totalHours;
                case 'Teams':
                  return report.crewCount;
                default:
                  return report.utility;
              }
            }).map((report) => {
              if (!companyRates.has(report.utility)) {
                companyRates.set(
                  report.utility,
                  Math.floor(Math.random() * (165 - 140 + 1)) + 140,
                );
              }
              const rate = companyRates.get(report.utility)!;
              const totalCost = report.totalHours * rate;

              return (
                <TableRow key={report.utility}>
                  <TableCell sx={{ fontWeight: 500 }}>{report.utility}</TableCell>
                  <TableCell>{report.totalHours.toFixed(1)} hrs</TableCell>
                  <TableCell>${rate}/hr</TableCell>
                  <TableCell>
                    ${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell>{report.crewCount} teams</TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleCompanyDrillDown(report.utility)}
                      endIcon={<ChevronRightIcon fontSize="small" />}
                      sx={{ textTransform: 'none' }}
                    >
                      View Teams
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        {!isLoadingCompanies && companyReports && companyReports.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {companyReports
                  .reduce((sum, report) => sum + report.totalHours, 0)
                  .toFixed(1)}{' '}
                hrs
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                ${(() => {
                  const size = companyRates.size || 1;
                  const average =
                    Array.from(companyRates.values()).reduce((sum, rate) => sum + rate, 0) / size;
                  return Math.round(average);
                })()}/hr (avg)
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                ${companyReports
                  .reduce((sum, report) => {
                    const rate = companyRates.get(report.utility) ?? 0;
                    return sum + report.totalHours * rate;
                  }, 0)
                  .toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {companyReports.reduce((sum, report) => sum + report.crewCount, 0)} teams
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </TableContainer>
  );

  const renderTeamTable = () => (
    <TableContainer component={Box} sx={tableContainerSx}>
      <Table>
        <TableHead sx={tableHeadSx}>
          <TableRow>
            <TableCell
              onClick={() => handleSort('Team Name')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Team Name
                {renderSortIcon('Team Name')}
              </Box>
            </TableCell>
            <TableCell
              onClick={() => handleSort('Total Hours')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Total Hours
                {renderSortIcon('Total Hours')}
              </Box>
            </TableCell>
            <TableCell
              onClick={() => handleSort('Timesheets')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Timesheets
                {renderSortIcon('Timesheets')}
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoadingTeams ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            sortData(teamReports ?? [], (report) => {
              switch (sortColumn) {
                case 'Team Name':
                  return report.crewName;
                case 'Total Hours':
                  return report.totalHours;
                case 'Timesheets':
                  return report.timesheetCount;
                default:
                  return report.crewName;
              }
            }).map((report) => (
              <TableRow key={report.crewId}>
                <TableCell sx={{ fontWeight: 500 }}>{report.crewName}</TableCell>
                <TableCell>{report.totalHours.toFixed(1)} hrs</TableCell>
                <TableCell>{report.timesheetCount} submissions</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleTeamDrillDown(report.crewId, report.crewName)}
                    endIcon={<ChevronRightIcon fontSize="small" />}
                    sx={{ textTransform: 'none' }}
                  >
                    View Daily
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDailyTable = () => (
    <TableContainer component={Box} sx={tableContainerSx}>
      <Table>
        <TableHead sx={tableHeadSx}>
          <TableRow>
            <TableCell
              onClick={() => handleSort('Date')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Date
                {renderSortIcon('Date')}
              </Box>
            </TableCell>
            <TableCell
              onClick={() => handleSort('Total Hours')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Total Hours
                {renderSortIcon('Total Hours')}
              </Box>
            </TableCell>
            <TableCell
              onClick={() => handleSort('Working')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Working
                {renderSortIcon('Working')}
              </Box>
            </TableCell>
            <TableCell
              onClick={() => handleSort('Traveling')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Traveling
                {renderSortIcon('Traveling')}
              </Box>
            </TableCell>
            <TableCell
              onClick={() => handleSort('Standby')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Standby
                {renderSortIcon('Standby')}
              </Box>
            </TableCell>
            <TableCell
              onClick={() => handleSort('Work Description')}
              sx={sortableHeaderSx}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Work Description
                {renderSortIcon('Work Description')}
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoadingDaily ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            sortData(dailyReports ?? [], (report) => {
              switch (sortColumn) {
                case 'Date':
                  return report.date;
                case 'Total Hours':
                  return report.hours;
                case 'Working':
                  return report.workingHours;
                case 'Traveling':
                  return report.travelingHours;
                case 'Standby':
                  return report.standbyHours;
                case 'Work Description':
                  return report.workDescription;
                default:
                  return report.date;
              }
            }).map((report) => (
              <TableRow key={report.timesheetId}>
                <TableCell>{format(new Date(report.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{report.hours.toFixed(1)} hrs</TableCell>
                <TableCell>{report.workingHours.toFixed(1)} hrs</TableCell>
                <TableCell>{report.travelingHours.toFixed(1)} hrs</TableCell>
                <TableCell>{report.standbyHours.toFixed(1)} hrs</TableCell>
                <TableCell sx={{ maxWidth: 240 }}>
                  <Typography variant="body2" noWrap title={report.workDescription}>
                    {report.workDescription}
                  </Typography>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssessmentIcon sx={{ fontSize: 28 }} />
          <Typography variant="h4" component="h1" fontWeight={700}>
            Reports
          </Typography>
        </Box>
        {renderBreadcrumb()}
      </Box>

      <Card
        sx={{
          borderRadius: 2,
          backgroundColor: 'var(--theme-base-background-elevations-level-5)',
          overflow: 'hidden',
        }}
      >
        <CardHeader
          title={`Reporting period: ${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(
            new Date(endDate),
            'MMM dd, yyyy',
          )}`}
          titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
          sx={{
            backgroundColor: 'var(--theme-base-background-elevations-level-4)',
            borderBottom: '1px solid var(--theme-component-navigation-sidebar-bar-border-stroke)',
          }}
        />
        <CardContent sx={{ p: 0 }}>
          {drillDown.level === 'company' && renderCompanyTable()}
          {drillDown.level === 'team' && renderTeamTable()}
          {drillDown.level === 'daily' && renderDailyTable()}
        </CardContent>
      </Card>
    </>
  );
}
