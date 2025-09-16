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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useTheme } from '@mui/material/styles';
import { useToast } from '@/hooks/use-toast';
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

const UTILITY_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'];

export function Dashboard() {
  const theme = useTheme();
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
  const { toast } = useToast();

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

      // Time entries submitted today
      const { data: todayEntries } = await supabase
        .from('time_entries')
        .select('id')
        .eq('date', today);

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

      // Hours by company (since we don't have utility in the current schema)
      const { data: companyHours } = await supabase
        .from('time_entries')
        .select('hours_regular, hours_overtime, crews!inner(crew_name, companies!inner(name))')
        .gte('date', lastWeekDate);

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
          color: '#16a34a', // green
        },
        {
          type: 'Traveling', 
          hours: travelingHours,
          color: '#dc2626', // red
        },
        {
          type: 'Standby',
          hours: standbyHours,
          color: '#ca8a04', // amber
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

  const handleBarClick = (data: any) => {
    if (data && data.activeLabel) {
      navigate('/timesheets');
    }
  };

  const handlePieClick = (data: any) => {
    if (data && data.fullName) {
      navigate(`/timesheets?company=${encodeURIComponent(data.fullName)}`);
    }
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, md: 6, lg: 3 }} key={i}>
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
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.totalHours.toFixed(1)}</Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
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

        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
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

        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
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

        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Pending Exceptions</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.pendingExceptions}</Typography>
                </Box>
                <WarningAmberIcon sx={{ fontSize: 32, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardHeader title={<Typography variant="h6">Hours by Utility</Typography>} />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hoursByUtility}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(d: any) => {
                        const name = d.utility;
                        const maxChars = 20;
                        let wrappedName = name;
                        
                        if (name.length > maxChars) {
                          const firstLine = name.substring(0, maxChars);
                          const secondLine = name.substring(maxChars);
                          wrappedName = `${firstLine}\n${secondLine}`;
                        }
                        
                        return `${wrappedName}\n${(d.percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      dataKey="hours"
                      onClick={handlePieClick}
                      style={{ cursor: 'pointer' }}
                    >
                      {hoursByUtility.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value} hours`, 
                        props.payload.fullName
                      ]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardHeader title={<Typography variant="h6">Hours by Work Type</Typography>} />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hoursByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(d: any) => `${d.type} ${(d.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="hours"
                    >
                      {hoursByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => [`${value} hours`, 'Total Hours']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Daily Hours Chart */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title={<Typography variant="h6">Daily Hours</Typography>} />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hoursByDay} onClick={handleBarClick}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip formatter={(value: any) => [`${value} hours`, 'Total Hours']} />
                    <Bar dataKey="hours" fill={theme.palette.primary.main} style={{ cursor: 'pointer' }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Daily Cost History Chart */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title={<Typography variant="h6">Daily Cost History (Running Total)</Typography>} />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyCostData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      tickFormatter={(value: any) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Running Total Cost']}
                      labelFormatter={(label: any) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cost" 
                      stroke={theme.palette.success.main} 
                      fill={theme.palette.success.main}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}