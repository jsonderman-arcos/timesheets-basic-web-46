import React, { useState } from 'react';
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
import { MuiAppSidebar } from './MuiAppSidebar';

const theme = createTheme({
  palette: {
    background: {
      default: 'var(--background)',
      paper: 'var(--card)',
    },
    text: {
      primary: 'var(--foreground)',
      secondary: 'var(--muted-foreground)',
    },
    primary: {
      main: 'var(--primary)',
      contrastText: 'var(--primary-foreground)',
    },
    secondary: {
      main: 'var(--secondary)',
      contrastText: 'var(--secondary-foreground)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        },
      },
    },
  },
});

interface MuiAppLayoutProps {
  children: React.ReactNode;
  [key: string]: any; // Allow Lovable's data attributes
}

export function MuiAppLayout({ children, ...props }: MuiAppLayoutProps) {
  console.log('MuiAppLayout props:', props);
  
  // Filter out Lovable's data attributes
  const filteredProps = Object.keys(props).reduce((acc, key) => {
    if (!key.startsWith('data-lov-') && !key.startsWith('data-component-')) {
      acc[key] = props[key];
    }
    return acc;
  }, {} as any);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <MuiAppSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
        
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AppBar 
            position="sticky"
            elevation={0}
            sx={{ 
              backgroundColor: 'var(--theme-component-navigation-topbar-text-fill-default)',
              borderBottom: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <Toolbar sx={{ minHeight: '64px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  edge="start"
                  onClick={handleToggleSidebar}
                  sx={{ 
                    display: { sm: 'none' },
                    color: 'var(--foreground)'
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography 
                  variant="h6" 
                  component="h1"
                  sx={{ 
                    fontWeight: 600,
                    color: 'var(--foreground)'
                  }}
                >
                  Timesheet Management System
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
          
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              p: 3,
              backgroundColor: 'var(--theme-base-background-elevations-level-4)',
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
