import React, { createContext, useContext } from 'react';

// Define the context
export interface PaginationContextType {
  children: React.ReactNode,
  numberOfPages: number,
  pathName: string,
  currentPage: number
  // Add other properties or methods you need here
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

export function PaginationContextProvider({ children, numberOfPages, pathName, currentPage }: PaginationContextType) {
  return (
    <PaginationContext.Provider value={{ numberOfPages, pathName, currentPage }}>
      {children}
    </PaginationContext.Provider>
  );
}

