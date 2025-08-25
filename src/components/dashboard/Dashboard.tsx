import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalHours: number;
  totalCrews: number;
  submittedToday: number;
  pendingExceptions: number;
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

const UTILITY_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'];

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHours: 0,
    totalCrews: 0,
    submittedToday: 0,
    pendingExceptions: 0,
  });
  const [hoursByDay, setHoursByDay] = useState<HoursByDay[]>([]);
  const [hoursByUtility, setHoursByUtility] = useState<HoursByUtility[]>([]);
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
        .select('hours_regular, hours_overtime')
        .gte('date', lastWeekDate);

      // Pending exceptions
      const { data: exceptions } = await supabase
        .from('exceptions')
        .select('id')
        .eq('status', 'pending');

      const totalHours = (weeklyEntries || []).reduce((sum, t) => sum + (t.hours_regular || 0) + (t.hours_overtime || 0), 0);

      setStats({
        totalHours,
        totalCrews: crewsData?.length || 0,
        submittedToday: todayEntries?.length || 0,
        pendingExceptions: exceptions?.length || 0,
      });

      // Hours by day of week
      const { data: dailyHours } = await supabase
        .from('time_entries')
        .select('date, hours_regular, hours_overtime')
        .gte('date', lastWeekDate);

      const dayMap: { [key: string]: number } = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      days.forEach(day => dayMap[day] = 0);

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
        const company = entry.crews?.companies?.name || 'Unknown';
        utilityMap[company] = (utilityMap[company] || 0) + (entry.hours_regular || 0) + (entry.hours_overtime || 0);
      });

      const utilityData = Object.entries(utilityMap).map(([utility, hours], index) => ({
        utility,
        hours,
        color: UTILITY_COLORS[index % UTILITY_COLORS.length],
      }));

      setHoursByUtility(utilityData);

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
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
                <p className="text-3xl font-bold">{stats.totalHours.toFixed(1)}</p>
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
                <p className="text-3xl font-bold">{stats.totalCrews}</p>
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
                <p className="text-3xl font-bold">{stats.submittedToday}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Exceptions</p>
                <p className="text-3xl font-bold">{stats.pendingExceptions}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hours by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hoursByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} hours`, 'Total Hours']} />
                <Bar dataKey="hours" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours by Utility</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={hoursByUtility}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ utility, percent }) => `${utility} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {hoursByUtility.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} hours`, 'Total Hours']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}