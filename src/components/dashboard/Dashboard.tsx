import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Clock, Users, TrendingUp, AlertTriangle } from 'lucide-react';
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

const UTILITY_COLORS = [
  'hsl(var(--primary))', 
  'hsl(var(--secondary))', 
  'hsl(var(--accent))', 
  'hsl(var(--muted))', 
  'hsl(var(--destructive))'
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
          color: 'hsl(var(--primary))',
        },
        {
          type: 'Traveling', 
          hours: travelingHours,
          color: 'hsl(var(--destructive))',
        },
        {
          type: 'Standby',
          hours: standbyHours,
          color: 'hsl(var(--secondary))',
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours (Week)</p>
                <h3 className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</h3>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Crews</p>
                <h3 className="text-2xl font-bold">{stats.totalCrews}</h3>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted Today</p>
                <h3 className="text-2xl font-bold">{stats.submittedToday}</h3>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Exceptions</p>
                <h3 className="text-2xl font-bold">{stats.pendingExceptions}</h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hours by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursByDay} onClick={handleBarClick}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: any) => [`${value} hours`, 'Total Hours']} />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" style={{ cursor: 'pointer' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours by Utility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hoursByUtility}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(d: any) => `${d.utility} ${(d.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="hours"
                    onClick={handlePieClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {hoursByUtility.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => [`${value} hours`, 'Total Hours']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours by Work Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}