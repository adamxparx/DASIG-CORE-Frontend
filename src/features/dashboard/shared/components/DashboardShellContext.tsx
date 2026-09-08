import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DashboardShellContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  committeeSelector: ReactNode | null;
  setCommitteeSelector: (node: ReactNode | null) => void;
}

export const DashboardShellContext = createContext<DashboardShellContextValue>({
  sidebarOpen: true,
  toggleSidebar: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  committeeSelector: null,
  setCommitteeSelector: () => {},
});

export const useDashboardShell = () => useContext(DashboardShellContext);

export const DashboardShellProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [committeeSelector, setCommitteeSelector] = useState<ReactNode | null>(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <DashboardShellContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        mobileOpen,
        setMobileOpen,
        committeeSelector,
        setCommitteeSelector,
      }}
    >
      {children}
    </DashboardShellContext.Provider>
  );
};
