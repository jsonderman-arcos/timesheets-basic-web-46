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

const DRAWER_WIDTH = 256;
const COLLAPSED_WIDTH = 64;

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
      {/* Fixed Header */}
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.divider}` as const,
          color: theme.palette.text.primary,
          zIndex: theme.zIndex.drawer + 1,
          width: '100%'
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

      {/* Layout Container */}
      <Box sx={{ display: 'flex', minHeight: '100vh', pt: '64px', width: '100vw' }} className="min-h-screen">
        <MuiAppSidebar 
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
        
        <Box 
          component="main" 
          sx={{ 
            flex: 1,
            backgroundColor: theme.palette.background.paper,
            minHeight: 'calc(100vh - 64px)',
            overflow: 'hidden'
          }}
          className="p-3 md:p-6"
        >
          {children}
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