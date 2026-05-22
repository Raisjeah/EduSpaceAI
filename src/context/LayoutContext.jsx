'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Close sidebar on mobile when navigating (handled in Sidebar component usually,
  // but we can expose the setter here)

  return (
    <LayoutContext.Provider value={{
      isSidebarOpen,
      setIsSidebarOpen,
      isProjectModalOpen,
      setIsProjectModalOpen
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
