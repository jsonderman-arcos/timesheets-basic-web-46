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
      backgroundColor: 'background.default', 
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            Timesheet Management System
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary', 
              maxWidth: 600, 
              mx: 'auto',
              mb: 3
            }}
          >
            Streamline your workforce management with our comprehensive timesheet tracking and reporting platform powered by ARCOS Harmony
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 2 }}>
            <Chip 
              icon={<CloudIcon />} 
              label="Cloud-Based" 
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'primary.contrastText'
              }}
            />
            <Chip 
              icon={<SecurityIcon />} 
              label="Secure" 
              color="success"
            />
            <Chip 
              icon={<SupportIcon />} 
              label="24/7 Support" 
              color="secondary"
            />
          </Stack>
        </Box>

        {/* Quick Stats */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 6
        }}>
          {stats.map((stat, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: 'background.paper',
                borderRadius: 2,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                mx: 'auto', 
                mb: 2, 
                width: 56, 
                height: 56,
                color: 'primary.contrastText'
              }}>
                {stat.icon}
              </Avatar>
              <Typography 
                variant="h4" 
                component="div" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {stat.value}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontFamily: 'Arial, sans-serif'
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
            mb: 4, 
            fontWeight: 600,
            color: 'text.primary',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          Platform Features
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' },
          gap: 4,
          mb: 6
        }}>
          {features.map((feature, index) => (
            <Card
              key={index}
              elevation={3}
              sx={{
                height: '100%',
                cursor: 'pointer',
                backgroundColor: 'background.paper',
                borderRadius: 2,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 8
                }
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: feature.color,
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{ 
                    color: 'text.secondary',
                    fontFamily: 'Arial, sans-serif',
                    mb: 2
                  }}
                >
                  {feature.description}
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    mt: 2,
                    fontFamily: 'Arial, sans-serif'
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
              p: 6, 
              backgroundColor: 'primary.main', 
              color: 'primary.contrastText',
              borderRadius: 2
            }}
          >
            <Typography 
              variant="h5" 
              component="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                fontFamily: 'Arial, sans-serif'
              }}
            >
              Ready to Get Started with ARCOS Harmony?
            </Typography>
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'Arial, sans-serif',
                mb: 3
              }}
            >
              Begin managing your workforce more efficiently with our ARCOS-powered platform
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                backgroundColor: 'primary.contrastText', 
                color: 'primary.main',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 500,
                '&:hover': { 
                  backgroundColor: 'background.default',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
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