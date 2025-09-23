import React, { ReactNode } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Menu as MenuIcon, ArrowRight as ArrowRightIcon } from '@mui/icons-material';
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
  title = "Timecard Management System",
  showMobileToggle = false 
}: NavigationLayoutContentProps) {
  const { collapsed, toggleCollapsed } = useNavigation();
  const theme = useTheme();

  // Storm event select state
  const stormEvents = [
    'Northern California Wildfire',
    'Bomb Cyclone 042025',
    'El Niño Windstorm N135'
  ];
  const [stormEvent, setStormEvent] = React.useState(stormEvents[0]);

  return (
    <>
      {/* Full-width header */}
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{ 
          backgroundColor: 'var(--theme-component-navigation-topbar-background-fill)',
          borderBottom: `1px solid ${theme.palette.divider}` as const,
          color: 'white',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }} className="min-h-16">
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {showMobileToggle && (
              <IconButton
                edge="start"
                onClick={toggleCollapsed}
                sx={{ 
                  display: { sm: 'none' },
                  color: 'white'
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
                color: 'white',
                mr: 3,
                flexShrink: 0
              }}
            >
              {title}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

              <FormControl variant="standard" size="small" sx={{ minWidth: 220 }}>
                <Select
                  id="storm-event-select"
                  value={stormEvent}
                  variant="standard"
                  onChange={e => setStormEvent(e.target.value)}
                  sx={{
                    '& .MuiSelect-select': { color: 'white' },
                    '&:before, &:after': { borderBottomColor: 'white' },
                    '& .MuiSvgIcon-root': { color: 'white' },
                    px: 1,
                  }}
                  disableUnderline={false}
                >
                  {stormEvents.map(event => (
                    <MenuItem key={event} value={event}>{event}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content area with sidebar and main */}
      <Box sx={{ display: 'flex', minHeight: '100vh', pt: '64px' }} className="min-h-screen">
        <MuiAppSidebar 
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
        
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            backgroundColor: 'var(--theme-base-background-elevations-level-4)',
            minHeight: 'calc(100vh - 64px)',
            width: 0, // Forces flex item to shrink properly
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
