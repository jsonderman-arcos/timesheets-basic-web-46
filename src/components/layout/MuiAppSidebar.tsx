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
  ChevronLeft as ChevronLeftIcon
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
    backgroundColor: 'hsl(var(--sidebar-background))',
    color: 'hsl(var(--sidebar-foreground))',
    borderRight: '1px solid hsl(var(--sidebar-border))',
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
  color: active ? 'hsl(var(--sidebar-accent-foreground))' : 'hsl(var(--sidebar-foreground))',
  backgroundColor: active ? 'hsl(var(--sidebar-accent))' : 'transparent',
  fontWeight: active ? 600 : 400,
  '&:hover': {
    backgroundColor: active ? 'hsl(var(--sidebar-accent))' : 'hsl(var(--sidebar-accent))',
    color: 'hsl(var(--sidebar-accent-foreground))',
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', p: 1 }}>
        {!collapsed && (
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'hsl(var(--sidebar-foreground))',
              fontWeight: 600,
              px: 1
            }}
          >
            Navigation
          </Typography>
        )}
        <IconButton 
          onClick={onToggleCollapse}
          sx={{ 
            color: 'hsl(var(--sidebar-foreground))',
            '&:hover': {
              backgroundColor: 'hsl(var(--sidebar-accent))',
            }
          }}
        >
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      
      <Divider sx={{ borderColor: 'hsl(var(--sidebar-border))' }} />
      
      <List sx={{ pt: 1 }}>
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
                    color: hasPendingExceptions ? 'hsl(var(--warning))' : 'inherit',
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
    </StyledDrawer>
  );
}