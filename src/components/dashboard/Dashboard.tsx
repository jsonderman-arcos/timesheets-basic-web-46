import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Skeleton,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import type { PieValueType } from '@mui/x-charts/models';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { showErrorToast } from '@/lib/toast-utils';

interface DashboardStats {
  totalHours: number;
  totalCrews: number;
  submittedToday: number;
  pendingExceptions: number;
  workingHours: number;
  travelingHours: number;
  standbyHours: number;
  totalCost: number;
}

interface HoursByDay {
  date: string;
  hours: number;
}

interface HoursByUtility {
  utility: string;
  fullName: string;
  hours: number;
  color: string;
}

interface HoursByType {
  type: string;
  hours: number;
  color: string;
}

interface DailyCostData {
  date: string;
  cost: number;
  hours: number;
}

const COST_PER_HOUR = 150;

const UTILITY_COLORS = [
  'var(--theme-base-primary-main)',
  'var(--theme-base-feedback-error-main)',
  'var(--theme-base-feedback-success-main)',
  'var(--theme-base-feedback-warning-main)',
  'var(--theme-base-secondary-main)',
];

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalHours: 0,
    totalCrews: 0,
    submittedToday: 0,
    pendingExceptions: 0,
    workingHours: 0,
    travelingHours: 0,
    standbyHours: 0,
    totalCost: 0,
  });
  const [hoursByDay, setHoursByDay] = useState<HoursByDay[]>([]);
  const [hoursByUtility, setHoursByUtility] = useState<HoursByUtility[]>([]);
  const [hoursByType, setHoursByType] = useState<HoursByType[]>([]);
  const [dailyCostData, setDailyCostData] = useState<DailyCostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get basic stats
      const today = new Date().toISOString().split('T')[0];
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekDate = lastWeek.toISOString().split('T')[0];

      // Total crews
      const { data: crewsData } = await supabase
        .from('crews')
        .select('id');

      // Time entries submitted today (based on submitted_at timestamp)
      const { data: todayEntries } = await supabase
        .from('time_entries')
        .select('id')
        .gte('submitted_at', today)
        .lt('submitted_at', `${today}T23:59:59.999Z`);

      // Total hours all time
      const { data: allEntries } = await supabase
        .from('time_entries')
        .select('hours_regular, hours_overtime, working_hours, traveling_hours, standby_hours');

      // Pending exceptions (including submitted status as pending)
      const { data: exceptions } = await supabase
        .from('exceptions')
        .select('id')
        .in('status', ['pending', 'submitted']);

      const totalHours = (allEntries || []).reduce(
        (sum, t) => sum + (t.hours_regular || 0) + (t.hours_overtime || 0),
        0
      );

      const workingHours = (allEntries || []).reduce(
        (sum, t) => sum + (t.working_hours || 0),
        0
      );

      const travelingHours = (allEntries || []).reduce(
        (sum, t) => sum + (t.traveling_hours || 0),
        0
      );

      const standbyHours = (allEntries || []).reduce(
        (sum, t) => sum + (t.standby_hours || 0),
        0
      );

      const totalCost = totalHours * COST_PER_HOUR;

      setStats({
        totalHours,
        totalCrews: crewsData?.length || 0,
        submittedToday: todayEntries?.length || 0,
        pendingExceptions: exceptions?.length || 0,
        workingHours,
        travelingHours,
        standbyHours,
        totalCost,
      });

      // Hours by actual date (from first timesheet to today)
      const { data: firstTimesheetData } = await supabase
        .from('time_entries')
        .select('date')
        .order('date', { ascending: true })
        .limit(1);

      const firstDate = firstTimesheetData?.[0]?.date || lastWeekDate;

      const { data: dailyHours } = await supabase
        .from('time_entries')
        .select('date, hours_regular, hours_overtime')
        .gte('date', firstDate)
        .order('date');

      const dateMap: { [key: string]: number } = {};

      (dailyHours || []).forEach(entry => {
        const date = entry.date;
        if (!dateMap[date]) {
          dateMap[date] = 0;
        }
        dateMap[date] += (entry.hours_regular || 0) + (entry.hours_overtime || 0);
      });

      // Convert to array and format dates for display
      const dayData = Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, hours]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          hours,
        }));

      setHoursByDay(dayData);

      // Hours by company (all time - no date filter for cumulative data)
      const { data: companyHours } = await supabase
        .from('time_entries')
        .select('hours_regular, hours_overtime, crews!inner(crew_name, companies!inner(name))');

      const utilityMap: { [key: string]: { hours: number; fullName: string } } = {};
      (companyHours || []).forEach(entry => {
        const company = (entry as any).crews?.companies?.name || 'Unknown';
        if (!utilityMap[company]) {
          utilityMap[company] = { hours: 0, fullName: company };
        }
        utilityMap[company].hours += (entry.hours_regular || 0) + (entry.hours_overtime || 0);
      });

      // Helper function to create acronyms from company names
      const createAcronym = (name: string): string => {
        return name
          .split(' ')
          .filter(word => word.length > 0)
          .map(word => word.charAt(0).toUpperCase())
          .join('');
      };

      const utilityData = Object.entries(utilityMap).map(([company, data], index) => ({
        utility: createAcronym(company),
        fullName: data.fullName,
        hours: data.hours,
        color: UTILITY_COLORS[index % UTILITY_COLORS.length],
      }));

      setHoursByUtility(utilityData);

      // Hours by work type (Working, Traveling, Standby)
      const typeData: HoursByType[] = [
        {
          type: 'Working',
          hours: workingHours,
          color: 'var(--theme-base-feedback-success-main)',
        },
        {
          type: 'Traveling', 
          hours: travelingHours,
          color: 'var(--theme-base-feedback-error-main)',
        },
        {
          type: 'Standby',
          hours: standbyHours,
          color: 'var(--theme-base-feedback-warning-main)',
        },
      ].filter(item => item.hours > 0); // Only show types with hours > 0

      setHoursByType(typeData);

      // Daily cost data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoDate = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: dailyHoursData } = await supabase
        .from('time_entries')
        .select('date, hours_regular, hours_overtime')
        .gte('date', thirtyDaysAgoDate)
        .order('date');

      // Group by date and calculate cumulative costs
      const dailyCostMap: { [key: string]: number } = {};
      (dailyHoursData || []).forEach(entry => {
        const date = entry.date;
        const dailyHours = (entry.hours_regular || 0) + (entry.hours_overtime || 0);
        if (!dailyCostMap[date]) {
          dailyCostMap[date] = 0;
        }
        dailyCostMap[date] += dailyHours;
      });

      // Convert to array and calculate running total
      const sortedDates = Object.keys(dailyCostMap).sort();
      let runningTotal = 0;
      const costData: DailyCostData[] = sortedDates.map(date => {
        const dailyHours = dailyCostMap[date];
        const dailyCost = dailyHours * COST_PER_HOUR;
        runningTotal += dailyCost;
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          cost: runningTotal,
          hours: dailyHours,
        };
      });

      setDailyCostData(costData);
    } catch (error: any) {
      showErrorToast(
        'Error loading dashboard',
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUtilitySliceClick = (
    _event: unknown,
    item: { dataIndex?: number | null } | null
  ) => {
    if (item?.dataIndex == null) {
      return;
    }

    const slice = hoursByUtility[item.dataIndex];
    if (slice?.fullName) {
      navigate(`/timesheets?company=${encodeURIComponent(slice.fullName)}`);
    }
  };

  const handleHoursBarClick = () => {
    navigate('/timesheets');
  };


  const totalUtilityHours = hoursByUtility.reduce((sum, d) => sum + (d.hours || 0), 0);
  const totalTypeHours = hoursByType.reduce((sum, d) => sum + (d.hours || 0), 0);

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" width="75%" sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" width="50%" height={32} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Stats Cards */}
      <Grid container sx={{ mb: 4, gap: 'clamp(8px, 2vw, 24px)' }} columns={{ xs: 12, md: 12, lg: 20 }}>
        <Grid size={{ xs: 'auto' }}>
          <Card sx={{ minWidth: 'max-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.totalHours.toFixed(1)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 'auto' }}>
          <Card sx={{ minWidth: 'max-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                  <Typography variant="h4" fontWeight={700}>${stats.totalCost.toLocaleString()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 'auto' }}>
          <Card sx={{ minWidth: 'max-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Active Crews</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.totalCrews}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 'auto' }}>
          <Card sx={{ minWidth: 'max-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Submitted Today</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.submittedToday}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 'auto' }}>
          <Card sx={{ minWidth: 'max-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Pending Exceptions</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.pendingExceptions}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
     <Grid container spacing={3} sx={{ mt: 0, width: '100%' }} columns={{ xs: 12, md: 12, lg: 12 }}>
        <Grid size={{xs:12, md:6, lg:6}} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardHeader title={<Typography variant="h6">Hours by Provider</Typography>} />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <PieChart
                  series={[
                    {
                      id: 'hours-by-utility',
                      data: hoursByUtility.map((item) => ({
                        id: item.utility,
                        value: item.hours,
                        label: item.utility,
                        color: item.color,
                        data: { fullName: item.fullName },
                      })),
                      outerRadius: '65%',
                     },
                   ]}
                   height={300}
                   onItemClick={handleUtilitySliceClick as any}
                 />
               </Box>
            </CardContent>
          </Card>
        </Grid>

         <Grid size={{xs:12, md:6, lg:6}} sx={{ display: 'flex' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardHeader title={<Typography variant="h6">Hours by Work Type</Typography>} />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <PieChart
                  series={[
                    {
                      id: 'hours-by-type',
                      data: hoursByType.map((item) => ({
                        id: item.type,
                        value: item.hours,
                        label: item.type,
                        color: item.color,
                      })),
                      outerRadius: '65%',
                    },
                   ]}
                   height={300}
                 />
               </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Daily Hours Chart */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{xs:12}}>
          <Card>
            <CardHeader title={<Typography variant="h6">Daily Hours</Typography>} />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 400 }}>
                <BarChart
                  height={400}
                  xAxis={[{ scaleType: 'band', data: hoursByDay.map((item) => item.date) }]}
                  yAxis={[{ valueFormatter: (value) => `${value == null ? 0 : Number(value)} h` }]}
                  series={[
                    {
                      id: 'daily-hours',
                      data: hoursByDay.map((item) => item.hours),
                      label: 'Total Hours',
                      color: 'var(--theme-base-primary-main)',
                    },
                   ]}
                   onItemClick={handleHoursBarClick as any}
                   sx={{ cursor: 'pointer' }}
                 />
               </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Daily Cost History Chart */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{xs:12}}>
          <Card>
            <CardHeader title={<Typography variant="h6">Daily Cost History (Running Total)</Typography>} />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 400 }}>
                <LineChart
                  height={400}
                  xAxis={[{ data: dailyCostData.map((item) => item.date), scaleType: 'point' }]}
                  yAxis={[{
                    valueFormatter: (value) => {
                      const n = value == null ? 0 : Number(value);
                      return `$${(n / 1000).toFixed(0)}k`;
                    },
                  }]}
                  series={[
                    {
                      id: 'running-cost',
                      data: dailyCostData.map((item) => item.cost),
                      label: 'Running Total Cost',
                      color: 'var(--theme-base-feedback-success-main)',
                      area: true,
                      showMark: false,
                     },
                   ]}
                   sx={{
                     '& .MuiAreaElement-root': {
                       fill: 'var(--theme-base-feedback-success-main)',
                      fillOpacity: 0.3,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
