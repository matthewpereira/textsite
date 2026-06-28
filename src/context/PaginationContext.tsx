import React, { createContext, useContext } from 'react';

// Define the context
export interface PaginationContextType {
  numberOfPages?: number,
  pathName?: string,
  currentPage?: number
}

const PaginationContext = createContext<PaginationContextType | undefined>(undefined);

// Create a custom hook to access the context
export function usePaginationContext() {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('usePaginationContext must be used within a PaginationContextProvider');
  }

  return context;
}

// Create a provider component

export function PaginationContextProvider({ children, numberOfPages, pathName, currentPage }: { children: React.ReactNode } & PaginationContextType) {
  return (
    <PaginationContext.Provider value={{ numberOfPages, pathName, currentPage }}>
      {children}
    </PaginationContext.Provider>
  );
}

