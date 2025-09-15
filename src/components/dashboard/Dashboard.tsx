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
} from 'recharts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
}

interface HoursByDay {
  day: string;
  hours: number;
}

interface HoursByUtility {
  utility: string;
  hours: number;
  color: string;
}

interface HoursByType {
  type: string;
  hours: number;
  color: string;
}

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
  });
  const [hoursByDay, setHoursByDay] = useState<HoursByDay[]>([]);
  const [hoursByUtility, setHoursByUtility] = useState<HoursByUtility[]>([]);
  const [hoursByType, setHoursByType] = useState<HoursByType[]>([]);
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

      // Total hours this week
      const { data: weeklyEntries } = await supabase
        .from('time_entries')
        .select('hours_regular, hours_overtime, working_hours, traveling_hours, standby_hours')
        .gte('date', lastWeekDate);

      // Pending exceptions
      const { data: exceptions } = await supabase
        .from('exceptions')
        .select('id')
        .eq('status', 'pending');

      const totalHours = (weeklyEntries || []).reduce(
        (sum, t) => sum + (t.hours_regular || 0) + (t.hours_overtime || 0),
        0
      );

      const workingHours = (weeklyEntries || []).reduce(
        (sum, t) => sum + (t.working_hours || 0),
        0
      );

      const travelingHours = (weeklyEntries || []).reduce(
        (sum, t) => sum + (t.traveling_hours || 0),
        0
      );

      const standbyHours = (weeklyEntries || []).reduce(
        (sum, t) => sum + (t.standby_hours || 0),
        0
      );

      setStats({
        totalHours,
        totalCrews: crewsData?.length || 0,
        submittedToday: todayEntries?.length || 0,
        pendingExceptions: exceptions?.length || 0,
        workingHours,
        travelingHours,
        standbyHours,
      });

      // Hours by day of week
      const { data: dailyHours } = await supabase
        .from('time_entries')
        .select('date, hours_regular, hours_overtime')
        .gte('date', lastWeekDate);

      const dayMap: { [key: string]: number } = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      days.forEach(day => (dayMap[day] = 0));

      (dailyHours || []).forEach(entry => {
        const date = new Date(entry.date);
        const dayName = days[date.getDay()];
        dayMap[dayName] += (entry.hours_regular || 0) + (entry.hours_overtime || 0);
      });

      const dayData = days.map(day => ({
        day,
        hours: dayMap[day],
      }));

      setHoursByDay(dayData);

      // Hours by company (since we don't have utility in the current schema)
      const { data: companyHours } = await supabase
        .from('time_entries')
        .select('hours_regular, hours_overtime, crews!inner(crew_name, companies!inner(name))')
        .gte('date', lastWeekDate);

      const utilityMap: { [key: string]: number } = {};
      (companyHours || []).forEach(entry => {
        const company = (entry as any).crews?.companies?.name || 'Unknown';
        utilityMap[company] =
          (utilityMap[company] || 0) + (entry.hours_regular || 0) + (entry.hours_overtime || 0);
      });

      const utilityData = Object.entries(utilityMap).map(([utility, hours], index) => ({
        utility,
        hours,
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
    if (data && data.utility) {
      navigate(`/timesheets?company=${encodeURIComponent(data.utility)}`);
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
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Hours (Week)</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.totalHours.toFixed(1)}</Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Active Crews</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.totalCrews}</Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Submitted Today</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.submittedToday}</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
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
            <CardHeader title={<Typography variant="h6">Hours by Day of Week</Typography>} />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hoursByDay} onClick={handleBarClick}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip formatter={(value: any) => [`${value} hours`, 'Total Hours']} />
                    <Bar dataKey="hours" fill={theme.palette.primary.main} style={{ cursor: 'pointer' }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

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
                        const name = d.utility.length > 12 ? `${d.utility.substring(0, 12)}...` : d.utility;
                        return `${name} ${(d.percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={90}
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
                        props.payload.utility
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
    </Box>
  );
}