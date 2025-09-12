import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Assessment as ReportsIcon,
  GetApp as ExportIcon,
  Warning as ExceptionIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DashboardIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Real-time Dashboard',
      description: 'Monitor crew hours, submissions, and performance metrics in real-time',
      path: '/dashboard',
      color: '#e3f2fd'
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: 40, color: '#388e3c' }} />,
      title: 'Timesheet Management',
      description: 'View and manage daily timesheet submissions by crew',
      path: '/timesheets',
      color: '#e8f5e8'
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40, color: '#f57c00' }} />,
      title: 'GPS Tracking',
      description: 'Track crew locations with GPS breadcrumb trails',
      path: '/gps',
      color: '#fff3e0'
    },
    {
      icon: <ReportsIcon sx={{ fontSize: 40, color: '#7b1fa2' }} />,
      title: 'Advanced Reports',
      description: 'Generate comprehensive reports with drill-down capabilities',
      path: '/reports',
      color: '#f3e5f5'
    },
    {
      icon: <ExportIcon sx={{ fontSize: 40, color: '#d32f2f' }} />,
      title: 'Data Export',
      description: 'Export timesheet data in CSV or Excel format',
      path: '/export',
      color: '#ffebee'
    },
    {
      icon: <ExceptionIcon sx={{ fontSize: 40, color: '#ff6f00' }} />,
      title: 'Exception Management',
      description: 'Review and approve timesheet exceptions',
      path: '/exceptions',
      color: '#fff8e1'
    },
  ];

  const stats = [
    { label: 'Active Crews', value: '24', icon: <PeopleIcon />, color: '#1976d2' },
    { label: 'Hours This Week', value: '1,847', icon: <TrendingUpIcon />, color: '#388e3c' },
    { label: 'Efficiency Rate', value: '94%', icon: <SpeedIcon />, color: '#7b1fa2' },
    { label: 'Uptime', value: '99.9%', icon: <SecurityIcon />, color: '#d32f2f' },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--theme-base-background-default)', 
      py: 'var(--core-spacing-spacing-lg)' 
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 'var(--core-spacing-spacing-2xl)' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'var(--core-lighthouse-typography-font-weight-bold)', 
              color: 'var(--theme-base-primary-main)',
              fontFamily: 'var(--core-lighthouse-typography-font-family-base)'
            }}
          >
            Timesheet Management System
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'var(--theme-base-text-secondary)', 
              maxWidth: 600, 
              mx: 'auto',
              mb: 'var(--core-spacing-spacing-md)'
            }}
          >
            Streamline your workforce management with our comprehensive timesheet tracking and reporting platform powered by ARCOS Harmony
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 'var(--core-spacing-spacing-sm)' }}>
            <Chip 
              icon={<CloudIcon />} 
              label="Cloud-Based" 
              sx={{ 
                backgroundColor: 'var(--theme-base-primary-main)',
                color: 'var(--theme-base-primary-contrast-text)'
              }}
            />
            <Chip 
              icon={<SecurityIcon />} 
              label="Secure" 
              sx={{ 
                backgroundColor: 'var(--theme-base-feedback-success-main)',
                color: 'var(--theme-base-feedback-success-contrast-text)'
              }}
            />
            <Chip 
              icon={<SupportIcon />} 
              label="24/7 Support" 
              sx={{ 
                backgroundColor: 'var(--theme-base-secondary-main)',
                color: 'var(--theme-base-secondary-contrast-text)'
              }}
            />
          </Stack>
        </Box>

        {/* Quick Stats */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 'var(--core-spacing-spacing-md)',
          mb: 'var(--core-spacing-spacing-2xl)' 
        }}>
          {stats.map((stat, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 'var(--core-spacing-spacing-md)',
                textAlign: 'center',
                backgroundColor: 'var(--theme-base-background-paper-elevation-1)',
                border: `var(--theme-base-border-size-default)px solid var(--theme-base-divider-default)`,
                borderRadius: 'var(--core-radii-border-radius)px',
                transition: 'var(--core-animation-easing-standard) var(--core-animation-duration-slow)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 'var(--core-lighthouse-effects-shadow-level-3)',
                  backgroundColor: 'var(--theme-base-surface-light-hover)'
                }
              }}
            >
              <Avatar sx={{ 
                bgcolor: 'var(--theme-base-primary-main)', 
                mx: 'auto', 
                mb: 'var(--core-spacing-spacing-sm)', 
                width: 56, 
                height: 56,
                color: 'var(--theme-base-primary-contrast-text)'
              }}>
                {stat.icon}
              </Avatar>
              <Typography 
                variant="h4" 
                component="div" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'var(--core-lighthouse-typography-font-weight-bold)', 
                  color: 'var(--theme-base-primary-main)',
                  fontFamily: 'var(--core-lighthouse-typography-font-family-base)'
                }}
              >
                {stat.value}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'var(--theme-base-text-secondary)',
                  fontFamily: 'var(--core-lighthouse-typography-font-family-base)'
                }}
              >
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Features Grid */}
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            textAlign: 'center', 
            mb: 'var(--core-spacing-spacing-lg)', 
            fontWeight: 'var(--core-lighthouse-typography-font-weight-semibold)',
            color: 'var(--theme-base-text-primary)',
            fontFamily: 'var(--core-lighthouse-typography-font-family-base)'
          }}
        >
          Platform Features
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' },
          gap: 'var(--core-spacing-spacing-lg)',
          mb: 'var(--core-spacing-spacing-2xl)'
        }}>
          {features.map((feature, index) => (
            <Card
              key={index}
              elevation={3}
              sx={{
                height: '100%',
                cursor: 'pointer',
                backgroundColor: 'var(--theme-base-background-paper-elevation-1)',
                border: `var(--theme-base-border-size-default)px solid var(--theme-base-divider-default)`,
                borderRadius: 'var(--core-radii-border-radius)px',
                transition: `transform var(--core-animation-duration-slow) var(--core-animation-easing-emphasized),
                           box-shadow var(--core-animation-duration-slow) var(--core-animation-easing-emphasized)`,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 'var(--core-lighthouse-effects-shadow-level-3)',
                  backgroundColor: 'var(--theme-base-surface-light-hover)'
                }
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ p: 'var(--core-spacing-spacing-md)', textAlign: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: 'var(--theme-base-primary-light)',
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 'var(--core-spacing-spacing-sm)',
                    color: 'var(--theme-base-primary-main)'
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'var(--core-lighthouse-typography-font-weight-semibold)',
                    color: 'var(--theme-base-text-primary)',
                    fontFamily: 'var(--core-lighthouse-typography-font-family-base)'
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{ 
                    color: 'var(--theme-base-text-secondary)',
                    fontFamily: 'var(--core-lighthouse-typography-font-family-base)',
                    mb: 'var(--core-spacing-spacing-sm)'
                  }}
                >
                  {feature.description}
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    mt: 'var(--core-spacing-spacing-sm)',
                    borderColor: 'var(--theme-base-primary-main)',
                    color: 'var(--theme-base-primary-main)',
                    fontFamily: 'var(--core-lighthouse-typography-font-family-base)',
                    '&:hover': {
                      backgroundColor: 'var(--theme-base-primary-states-hover)',
                      borderColor: 'var(--theme-base-primary-main)'
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(feature.path);
                  }}
                >
                  Explore
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center' }}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 'var(--core-spacing-spacing-xl)', 
              backgroundColor: 'var(--theme-base-primary-main)', 
              color: 'var(--theme-base-primary-contrast-text)',
              borderRadius: 'var(--core-radii-border-radius)px'
            }}
          >
            <Typography 
              variant="h5" 
              component="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 'var(--core-lighthouse-typography-font-weight-semibold)',
                fontFamily: 'var(--core-lighthouse-typography-font-family-base)'
              }}
            >
              Ready to Get Started with ARCOS Harmony?
            </Typography>
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'var(--core-lighthouse-typography-font-family-base)',
                mb: 'var(--core-spacing-spacing-md)'
              }}
            >
              Begin managing your workforce more efficiently with our ARCOS-powered platform
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                backgroundColor: 'var(--theme-base-primary-contrast-text)', 
                color: 'var(--theme-base-primary-main)',
                fontFamily: 'var(--core-lighthouse-typography-font-family-base)',
                fontWeight: 'var(--core-lighthouse-typography-font-weight-medium)',
                '&:hover': { 
                  backgroundColor: 'var(--theme-base-surface-light-hover)',
                  transform: 'translateY(-2px)',
                  transition: 'var(--core-animation-easing-emphasized) var(--core-animation-duration-fast)'
                }
              }}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Index;