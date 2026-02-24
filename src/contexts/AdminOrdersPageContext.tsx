'use client';

import { createContext, useContext, useState, PropsWithChildren, useMemo, ReactNode } from 'react';
import { RootState } from '@/store';

interface AdminOrdersPageContextType {
    selectedPageFilters: ReactNode | null;
    setSelectedPageFilters: (filters: ReactNode | null) => void;
    savedFilters: Partial<RootState['sort']>;
    setSavedFilters: (filters: Partial<RootState['sort']>) => void;
}

const AdminOrdersPageContext = createContext<AdminOrdersPageContextType | undefined>(undefined);

export function AdminOrdersPageProvider({ children }: Readonly<PropsWithChildren>) {
    const [selectedPageFilters, setSelectedPageFilters] = useState<ReactNode | null>(null);

    // Initialize savedFilters as empty object (filters are now preserved via query params only)
    const [savedFilters, setSavedFilters] = useState<Partial<RootState['sort']>>({});

    const values = useMemo(
        () => ({
            selectedPageFilters,
            setSelectedPageFilters,
            savedFilters,
            setSavedFilters,
        }),
        [selectedPageFilters, savedFilters]
    );

    return <AdminOrdersPageContext.Provider value={values}>{children}</AdminOrdersPageContext.Provider>;
}

export function useAdminOrdersPage() {
    const context = useContext(AdminOrdersPageContext);
    if (!context) throw new Error('useAdminOrdersPage must be used within an AdminOrdersPageProvider');
    return context;
}
