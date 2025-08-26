import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Box,
  CircularProgress,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import { TimesheetDetailModal } from './TimesheetDetailModal';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';

interface Crew {
  id: string;
  crew_name: string;
  company_id: string;
  companies?: {
    name: string;
  };
}

interface Company {
  id: string;
  name: string;
}

interface Timesheet {
  id: string;
  crew_id: string;
  date: string;
  start_time: string;
  end_time: string;
  hours_regular: number;
  hours_overtime: number;
  work_description: string;
  status: string;
}

interface TimesheetGridData {
  [crewId: string]: {
    [date: string]: Timesheet;
  };
}

export function TimesheetGrid() {
  const [searchParams] = useSearchParams();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [allCrews, setAllCrews] = useState<Crew[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetGridData>({});
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Filter and sort state
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCrewFilter, setSelectedCrewFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('crew_name_asc');
  
  const { toast } = useToast();
  
  const companyFilter = searchParams.get('company');

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCompany) count++;
    if (selectedCrewFilter) count++;
    return count;
  };

  // Generate dates for the current week (Monday to Sunday)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeek, i);
    return format(date, 'yyyy-MM-dd');
  });

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (companyFilter) {
      setSelectedCompany(companyFilter);
    }
  }, [companyFilter]);

  useEffect(() => {
    filterAndSortCrews();
    fetchTimesheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek, selectedCompany, selectedCrewFilter, sortBy, allCrews]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch all companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);

      // Fetch all crews with company info
      const { data: crewData, error: crewError } = await supabase
        .from('crews')
        .select('id, crew_name, company_id, companies!inner(name)');

      if (crewError) throw crewError;
      setAllCrews(crewData || []);
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCrews = () => {
    let filtered = [...allCrews];

    // Apply company filter
    if (selectedCompany) {
      filtered = filtered.filter(crew => crew.companies?.name === selectedCompany);
    }

    // Apply crew filter
    if (selectedCrewFilter) {
      filtered = filtered.filter(crew => crew.id === selectedCrewFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'crew_name_asc':
          return a.crew_name.localeCompare(b.crew_name);
        case 'crew_name_desc':
          return b.crew_name.localeCompare(a.crew_name);
        case 'company_name_asc':
          return (a.companies?.name || '').localeCompare(b.companies?.name || '');
        case 'company_name_desc':
          return (b.companies?.name || '').localeCompare(a.companies?.name || '');
        default:
          return 0;
      }
    });

    setCrews(filtered);
  };

  const fetchTimesheets = async () => {
    if (crews.length === 0) return;
    
    try {

      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      const crewIds = crews.map(crew => crew.id);

      if (crewIds.length === 0) {
        setTimesheets({});
        return;
      }

      const { data: timesheetData, error: timesheetError } = await supabase
        .from('time_entries')
        .select('*')
        .in('crew_id', crewIds)
        .gte('date', startDate)
        .lte('date', endDate);

      if (timesheetError) throw timesheetError;

      const organized: TimesheetGridData = {};
      (timesheetData || []).forEach((t) => {
        if (!organized[t.crew_id]) organized[t.crew_id] = {};
        organized[t.crew_id][t.date] = t;
      });

      setTimesheets(organized);
    } catch (error: any) {
      toast({
        title: 'Error loading timesheets',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSelectedCompany('');
    setSelectedCrewFilter('');
    setSortBy('crew_name_asc');
  };

  const refreshData = () => {
    fetchTimesheets();
  };

  const handleCellClick = (crew: Crew, date: string) => {
    const timesheet = timesheets[crew.id]?.[date];
    setSelectedCrew(crew);
    setSelectedTimesheet(timesheet || null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const getWeekRange = () => {
    const endOfWeek = addDays(currentWeek, 6);
    return `${format(currentWeek, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Box className="flex items-center justify-center">
            <CircularProgress size={24} className="mr-2" />
            <Typography>Loading timesheet data...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader 
          title={
            <Box className="flex items-center gap-3">
              <Box>
                <Typography variant="h6">Timesheet Overview</Typography>
                {getActiveFiltersCount() > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
                  </Typography>
                )}
              </Box>
              <Chip 
                icon={<FilterListIcon />} 
                label={`${crews.length} crews`} 
                size="small" 
                variant="outlined" 
              />
            </Box>
          }
          action={
            <Box className="flex items-center gap-2">
              <IconButton onClick={goToPreviousWeek} size="small">
                <ChevronLeftIcon />
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                onClick={goToCurrentWeek}
                startIcon={<TodayIcon />}
                className="min-w-[140px]"
              >
                This Week
              </Button>
              <IconButton onClick={goToNextWeek} size="small">
                <ChevronRightIcon />
              </IconButton>
            </Box>
          }
        />
        <CardContent>
          {/* Week Display */}
          <Box className="mb-4">
            <Typography variant="subtitle1" className="text-center font-medium">
              {getWeekRange()}
            </Typography>
          </Box>

          {/* Filters and Sorting */}
          <Box className="mb-6">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} className="mb-4">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Company</InputLabel>
                <Select
                  value={selectedCompany}
                  label="Company"
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <MenuItem value="">All Companies</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.name}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Crew</InputLabel>
                <Select
                  value={selectedCrewFilter}
                  label="Crew"
                  onChange={(e) => setSelectedCrewFilter(e.target.value)}
                >
                  <MenuItem value="">All Crews</MenuItem>
                  {allCrews
                    .filter(crew => !selectedCompany || crew.companies?.name === selectedCompany)
                    .map((crew) => (
                    <MenuItem key={crew.id} value={crew.id}>
                      {crew.crew_name} ({crew.companies?.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  startAdornment={<SortIcon sx={{ mr: 1, fontSize: 16 }} />}
                >
                  <MenuItem value="crew_name_asc">Crew Name (A-Z)</MenuItem>
                  <MenuItem value="crew_name_desc">Crew Name (Z-A)</MenuItem>
                  <MenuItem value="company_name_asc">Company Name (A-Z)</MenuItem>
                  <MenuItem value="company_name_desc">Company Name (Z-A)</MenuItem>
                </Select>
              </FormControl>

              {getActiveFiltersCount() > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ minWidth: 120 }}
                >
                  Clear Filters
                </Button>
              )}
            </Stack>
          </Box>
          <TableContainer component={Paper} className="overflow-x-auto">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="w-48"><Typography variant="subtitle2">Crew</Typography></TableCell>
                  {dates.map((date) => (
                    <TableCell key={date} align="center">
                      <Typography variant="caption">{formatDate(date)}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {crews.map((crew, index) => (
                  <TableRow 
                    key={crew.id} 
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 
                        ? 'hsl(var(--table-row-odd))' 
                        : 'hsl(var(--table-row-even))',
                      '&:hover': {
                        backgroundColor: index % 2 === 0 
                          ? 'hsl(var(--muted))' 
                          : 'hsl(var(--muted))',
                      }
                    }}
                  >
                    <TableCell>
                      <div>
                        <Typography variant="body2" fontWeight={600}>{crew.crew_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(crew as any).companies?.name || 'Company'}
                        </Typography>
                      </div>
                    </TableCell>
                    {dates.map((date) => {
                      const hasTimesheet = !!timesheets[crew.id]?.[date];
                      return (
                        <TableCell
                          key={date}
                          align="center"
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => handleCellClick(crew, date)}
                        >
                          {hasTimesheet ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <CancelIcon color="error" fontSize="small" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <TimesheetDetailModal
        timesheet={selectedTimesheet}
        crew={selectedCrew}
        open={!!selectedCrew}
        onOpenChange={() => {
          setSelectedCrew(null);
          setSelectedTimesheet(null);
        }}
        onUpdate={refreshData}
      />
    </>
  );
}