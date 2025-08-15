import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  BarChart3, 
  Grid3x3, 
  Download, 
  AlertTriangle, 
  Navigation,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: BarChart3,
  },
  {
    title: 'Timesheet Grid',
    url: '/timesheets',
    icon: Grid3x3,
  },
  {
    title: 'Export Data',
    url: '/export',
    icon: Download,
  },
  {
    title: 'Exceptions',
    url: '/exceptions',
    icon: AlertTriangle,
  },
  {
    title: 'GPS Tracking',
    url: '/gps',
    icon: Navigation,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';
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
          // Refetch count whenever exceptions table changes
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

  const getNavClasses = (path: string) => {
    return isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";
  };

  const renderMenuItem = (item: typeof menuItems[0]) => {
    const isExceptions = item.url === '/exceptions';
    const hasPendingExceptions = isExceptions && pendingExceptionsCount > 0;

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink to={item.url} className={getNavClasses(item.url)}>
            <item.icon 
              className={cn(
                "w-4 h-4",
                hasPendingExceptions && "text-warning"
              )} 
            />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>{item.title}</span>
                {hasPendingExceptions && (
                  <div className="min-w-[22px] h-[22px] bg-error text-error-foreground text-xs rounded-full flex items-center justify-center font-bold px-1.5">
                    {pendingExceptionsCount > 99 ? '99+' : pendingExceptionsCount}
                  </div>
                )}
              </div>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}