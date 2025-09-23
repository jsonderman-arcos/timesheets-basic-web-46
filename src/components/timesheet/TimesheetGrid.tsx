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
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import { TimesheetDetailModal } from './TimesheetDetailModal';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Filter and sort state
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCrewFilter, setSelectedCrewFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('crew_name_asc');
  
  
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

  // Auto refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData(true);
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crews]);

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
      showErrorToast(
        'Error loading data',
        error.message
      );
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

      console.log('Timecards fetched and organized:', organized);
      setTimesheets(organized);
    } catch (error: any) {
      showErrorToast(
        'Error loading timecards',
        error.message
      );
    }
  };

  const clearFilters = () => {
    setSelectedCompany('');
    setSelectedCrewFilter('');
    setSortBy('crew_name_asc');
  };

  const refreshData = (showToast = false) => {
    console.log('refreshData called, about to fetchTimecards');
    fetchTimesheets();
    if (showToast) {
      showSuccessToast(
        "Data refreshed",
        "Timecard data has been updated."
      );
    }
  };

  const handleCellClick = (crew: Crew, date: string) => {
    const timesheet = timesheets[crew.id]?.[date];
    setSelectedCrew(crew);
    setSelectedTimesheet(timesheet || null);
    setSelectedDate(date);
  };

  // Ensure we interpret Supabase date strings as calendar days in local time.
  const parseToLocalDate = (dateString: string) => {
    if (!dateString) return null;
    const normalized = dateString.split('T')[0];
    const [year, month, day] = normalized.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const formatDate = (dateString: string) => {
    const date = parseToLocalDate(dateString);
    if (!date) return dateString;
    return format(date, 'EEE, MMM d');
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
            <Typography>Loading timecard data...</Typography>
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
            <Box className="flex items-center justify-between w-full">
              <Box className="flex items-center gap-3">
                <Chip 
                  icon={<FilterListIcon />} 
                  label={`${crews.length} crews`} 
                  size="small" 
                  variant="outlined" 
                />
                {getActiveFiltersCount() > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
                  </Typography>
                )}
              </Box>
              <Box className="flex items-center flex-1">
                <Box className="flex-1 flex items-center justify-center">
                  <Typography variant="subtitle1" className="font-medium">
                    {getWeekRange()}
                  </Typography>
                </Box>
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
                  <IconButton 
                    onClick={() => refreshData(true)} 
                    size="small"
                    title="Refresh data"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>
                
              </Box>
            </Box>
          }
        />
        <CardContent>


          {/* Filters and Sorting */}
          <Box className="mb-6">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} className="mb-4">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Company</InputLabel>
                <Select
                  value={selectedCompany}
                  label="Company"
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  MenuProps={{
                    disablePortal: false,
                    container: document.body,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                    keepMounted: true,
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                      },
                    },
                  }}
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
                  MenuProps={{
                    disablePortal: false,
                    container: document.body,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                    keepMounted: true,
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                      },
                    },
                  }}
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
                  MenuProps={{
                    disablePortal: false,
                    container: document.body,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                    keepMounted: true,
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                      },
                    },
                  }}
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
                  Clear filters
                </Button>
              )}
            </Stack>
          </Box>
          <TableContainer component={Paper} className="overflow-x-auto">
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'var(--table-header)' }}>
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
                        ? 'var(--table-row-odd)' 
                        : 'var(--table-row-even)',
                      '&:hover': {
                        backgroundColor: 'var(--table-cell-hover)',
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
                      const timesheet = timesheets[crew.id]?.[date];
                      const hasTimesheet = !!timesheet;
                      const today = format(new Date(), 'yyyy-MM-dd');
                      const isFutureDate = date > today;
                      
                      return (
                        <TableCell
                          key={date}
                          align="center"
                          className="cursor-pointer transition-colors"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'var(--table-cell-hover) !important',
                            }
                          }}
                          onClick={() => handleCellClick(crew, date)}
                        >
                          {isFutureDate ? (
                            <RadioButtonUncheckedIcon 
                              sx={{ 
                                color: '#D1D5DB', 
                                fontSize: 'small',
                                strokeWidth: 2
                              }} 
                            />
                          ) : hasTimesheet ? (
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
        selectedDate={selectedDate}
        open={!!selectedCrew}
        onOpenChange={() => {
          setSelectedCrew(null);
          setSelectedTimesheet(null);
          setSelectedDate('');
        }}
        onUpdate={refreshData}
        onDateChange={(newDate) => {
          setSelectedDate(newDate);
          // Find timecard for the new date
          const newTimesheet = selectedCrew ? timesheets[selectedCrew.id]?.[newDate] || null : null;
          setSelectedTimesheet(newTimesheet);
        }}
      />
    </>
  );
}
