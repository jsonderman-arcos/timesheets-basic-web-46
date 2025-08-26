import React, { ReactNode } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { MuiAppSidebar } from '@/components/layout/MuiAppSidebar';
import { NavigationProvider, useNavigation } from './NavigationProvider';

const theme = createTheme({
  palette: {
    background: {
      default: 'hsl(var(--background))',
      paper: 'hsl(var(--card))',
    },
    text: {
      primary: 'hsl(var(--foreground))',
      secondary: 'hsl(var(--muted-foreground))',
    },
    primary: {
      main: 'hsl(var(--primary))',
      contrastText: 'hsl(var(--primary-foreground))',
    },
    secondary: {
      main: 'hsl(var(--secondary))',
      contrastText: 'hsl(var(--secondary-foreground))',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
        },
      },
    },
  },
});

interface NavigationLayoutContentProps {
  children: ReactNode;
  title?: string;
  showMobileToggle?: boolean;
}

function NavigationLayoutContent({ 
  children, 
  title = "Timesheet Management System",
  showMobileToggle = true 
}: NavigationLayoutContentProps) {
  const { collapsed, toggleCollapsed } = useNavigation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <MuiAppSidebar 
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
        
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AppBar 
            position="sticky"
            elevation={0}
            sx={{ 
              backgroundColor: 'hsl(var(--background))',
              borderBottom: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          >
            <Toolbar sx={{ minHeight: '64px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {showMobileToggle && (
                  <IconButton
                    edge="start"
                    onClick={toggleCollapsed}
                    sx={{ 
                      display: { sm: 'none' },
                      color: 'hsl(var(--foreground))'
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                <Typography 
                  variant="h6" 
                  component="h1"
                  sx={{ 
                    fontWeight: 600,
                    color: 'hsl(var(--foreground))'
                  }}
                >
                  {title}
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
          
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              p: 3,
              backgroundColor: 'hsl(var(--muted) / 0.1)',
              minHeight: 'calc(100vh - 64px)'
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

interface NavigationLayoutProps extends NavigationLayoutContentProps {
  defaultCollapsed?: boolean;
}

export function NavigationLayout({ 
  children, 
  defaultCollapsed = false,
  ...props 
}: NavigationLayoutProps) {
  return (
    <NavigationProvider defaultCollapsed={defaultCollapsed}>
      <NavigationLayoutContent {...props}>
        {children}
      </NavigationLayoutContent>
    </NavigationProvider>
  );
}