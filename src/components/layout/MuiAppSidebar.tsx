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
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
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
    backgroundColor: 'var(--theme-base-background-paper-elevation-2)',
    color: 'var(--theme-base-text-primary)',
    borderRight: `var(--theme-base-border-size-default)px solid var(--theme-base-divider-default)`,
    fontFamily: 'var(--core-lighthouse-typography-font-family-base)',
    position: 'fixed',
    top: '64px',
    left: 0,
    height: 'calc(100vh - 64px)',
    overflowY: 'hidden',
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
  borderRadius: 'var(--core-radii-border-radius)px',
  margin: 'var(--core-spacing-spacing-3xs)px var(--core-spacing-spacing-2xs)px',
  color: 'var(--theme-base-text-primary)',
  backgroundColor: active ? 'var(--theme-base-primary-states-selected)' : 'transparent',
  fontWeight: active ? 'var(--core-lighthouse-typography-font-weight-semibold)' : 'var(--core-lighthouse-typography-font-weight-regular)',
  fontFamily: 'var(--core-lighthouse-typography-font-family-base)',
  transition: `background-color var(--core-animation-duration-fast) var(--core-animation-easing-standard),
               color var(--core-animation-duration-fast) var(--core-animation-easing-standard)`,
  '&:hover': {
    backgroundColor: active ? 'var(--theme-base-primary-states-hover)' : 'var(--theme-base-surface-light-hover)',
    color: 'var(--theme-base-text-primary)',
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
      {!collapsed && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', p: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'var(--theme-base-text-primary)',
              fontFamily: 'var(--core-lighthouse-typography-font-family-base)',
              fontWeight: 'var(--core-lighthouse-typography-font-weight-semibold)',
              ml: 1
            }}
          >
            Navigation
          </Typography>
        </Box>
      )}
      
      <List sx={{ pt: 1, flexGrow: 1 }}>
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
                    color: hasPendingExceptions 
                      ? 'var(--theme-base-feedback-warning-main)' 
                      : 'var(--theme-base-text-primary)',
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
                                backgroundColor: 'var(--theme-base-feedback-error-main)',
                                color: 'var(--theme-base-feedback-error-contrast-text)',
                                fontSize: '0.75rem',
                                fontWeight: 'var(--core-lighthouse-typography-font-weight-bold)',
                                fontFamily: 'var(--core-lighthouse-typography-font-family-base)',
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

      {/* Expand/Collapse Button at Bottom */}
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
        <IconButton 
          onClick={onToggleCollapse}
          sx={{ 
            color: 'var(--theme-base-text-primary)',
            '&:hover': {
              backgroundColor: 'var(--theme-base-surface-light-hover)',
            }
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
    </StyledDrawer>
  );
}