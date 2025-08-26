import React, { ReactNode } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { MuiAppSidebar } from '@/components/layout/MuiAppSidebar';
import { NavigationProvider, useNavigation } from './NavigationProvider';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh' }} className="min-h-screen">
        <MuiAppSidebar 
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
        
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AppBar 
            position="sticky"
            elevation={0}
            sx={{ 
              backgroundColor: theme.palette.background.default,
              borderBottom: `1px solid ${theme.palette.divider}` as const,
              color: theme.palette.text.primary,
            }}
          >
            <Toolbar sx={{ minHeight: '64px !important' }} className="min-h-16">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {showMobileToggle && (
                  <IconButton
                    edge="start"
                    onClick={toggleCollapsed}
                    sx={{ 
                      display: { sm: 'none' },
                      color: theme.palette.text.primary
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
                    color: theme.palette.text.primary
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
              backgroundColor: theme.palette.background.paper,
              minHeight: 'calc(100vh - 64px)'
            }}
            className="p-3 md:p-6"
          >
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}

interface NavigationLayoutProps extends NavigationLayoutContentProps {
  defaultCollapsed?: boolean;
}

export function NavigationLayout({ 
  children, 
  defaultCollapsed = true,
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