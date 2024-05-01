import { default as React } from 'react';

export interface PaginationContextType {
    children: React.ReactNode;
    numberOfPages?: number;
    pathName?: string;
    currentPage?: number;
}
export declare function usePaginationContext(): PaginationContextType;
export declare function PaginationContextProvider({ children, numberOfPages, pathName, currentPage }: PaginationContextType): import("react/jsx-runtime").JSX.Element;
