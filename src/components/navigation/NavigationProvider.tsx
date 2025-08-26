import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function NavigationProvider({ children, defaultCollapsed = false }: NavigationProviderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <NavigationContext.Provider value={{ collapsed, toggleCollapsed, setCollapsed }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}