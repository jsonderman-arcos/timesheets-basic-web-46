import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Badge,
  Divider,
  useTheme,
  styled
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  GridView as GridViewIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  GpsFixed as GpsFixedIcon,
  Assessment as AssessmentIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon
} from '@mui/icons-material';
import { supabase } from '@/integrations/supabase/client';

const DRAWER_WIDTH = 256;
const COLLAPSED_WIDTH = 64;

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: '#F3F4F6', // Light gray background
    color: '#374151', // Dark gray text
    position: 'fixed',
    top: '64px', // Position under header
    height: 'calc(100vh - 64px)',
    left: 0,
    '& .MuiListItemIcon-root': {
      color: '#6B7280', // Dark gray icons
    },
    '& .MuiTypography-root': {
      color: '#374151', // Dark gray text
    },
    borderRight: '1px solid #E5E7EB',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  minHeight: 48,
  borderRadius: '6px',
  margin: '2px 8px',
  color: '#374151', // Dark gray text
  backgroundColor: active ? '#E5E7EB' : 'transparent', // Light gray for active
  fontWeight: active ? 600 : 400,
  '&:hover': {
    backgroundColor: '#FFFFFF', // White background on hover
    color: '#374151', // Keep dark gray text
    '& .MuiListItemIcon-root': {
      color: '#6B7280', // Dark gray icons on hover
    },
  },
}));

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: BarChartIcon,
  },
  {
    title: 'Timesheet Grid',
    url: '/timesheets',
    icon: GridViewIcon,
  },
  {
    title: 'Export Data',
    url: '/export',
    icon: DownloadIcon,
  },
  {
    title: 'Exceptions',
    url: '/exceptions',
    icon: WarningIcon,
  },
  {
    title: 'GPS Tracking',
    url: '/gps',
    icon: GpsFixedIcon,
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: AssessmentIcon,
  },
];

interface MuiAppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function MuiAppSidebar({ collapsed, onToggleCollapse }: MuiAppSidebarProps) {
  console.log('MuiAppSidebar rendered with collapsed:', collapsed);
  
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [pendingExceptionsCount, setPendingExceptionsCount] = useState(0);

  useEffect(() => {
    fetchPendingExceptionsCount();
    
    // Set up real-time subscription for exceptions table changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'exceptions' 
        },
        (payload) => {
          console.log('Exception table change detected:', payload);
          fetchPendingExceptionsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingExceptionsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('exceptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending exceptions count:', error);
        return;
      }

      setPendingExceptionsCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending exceptions count:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  return (
    <StyledDrawer
      variant="permanent"
      collapsed={collapsed}
    >
      <List sx={{ pt: 1, flex: 1 }}>
        {menuItems.map((item) => {
          const isExceptions = item.url === '/exceptions';
          const hasPendingExceptions = isExceptions && pendingExceptionsCount > 0;
          const active = isActive(item.url);
          
          return (
            <ListItem key={item.title} disablePadding>
              <StyledListItemButton
                active={active}
                onClick={() => handleNavigation(item.url)}
                sx={{ px: collapsed ? 1.5 : 2 }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 'auto' : 40,
                    color: hasPendingExceptions ? 'hsl(var(--warning))' : '#6B7280', // Dark gray icons
                    mr: collapsed ? 0 : 1,
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2" component="span">
                          {item.title}
                        </Typography>
                        {hasPendingExceptions && (
                          <Badge
                            badgeContent={pendingExceptionsCount > 99 ? '99+' : pendingExceptionsCount}
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: 'hsl(var(--error))',
                                color: 'hsl(var(--error-foreground))',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                minWidth: '22px',
                                height: '22px',
                              }
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                )}
              </StyledListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Toggle button at bottom */}
      <Box sx={{ p: 1, borderTop: '1px solid #E5E7EB' }}>
        <IconButton 
          onClick={onToggleCollapse}
          sx={{ 
            width: '100%',
            justifyContent: collapsed ? 'center' : 'flex-end',
            color: '#6B7280', // Dark gray icon
            '&:hover': {
              backgroundColor: 'transparent',
            }
          }}
        >
          {collapsed ? <ArrowRightIcon /> : <ArrowLeftIcon />}
        </IconButton>
      </Box>
    </StyledDrawer>
  );
}