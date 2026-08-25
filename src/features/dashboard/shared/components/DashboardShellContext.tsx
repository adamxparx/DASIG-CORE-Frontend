import { createContext, useContext } from 'react';

interface DashboardShellContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const DashboardShellContext = createContext<DashboardShellContextValue>({
  sidebarOpen: true,
  toggleSidebar: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useDashboardShell = () => useContext(DashboardShellContext);
