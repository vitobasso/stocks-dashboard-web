'use client';

import {createScrapedLiveClient, ScrapedLiveContext} from "@/lib/services/use-scraped-live";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useEffect, useMemo} from "react";

export function Providers({ children }: { children: React.ReactNode }) {

    const queryClient = useMemo(() => new QueryClient(), []);
    const scrapedLiveClient = useMemo(() => createScrapedLiveClient(queryClient), [queryClient]);

    useEffect(() => {
        scrapedLiveClient.open();
        return () => { scrapedLiveClient.close() };
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ScrapedLiveContext.Provider value={scrapedLiveClient}>
                {children}
            </ScrapedLiveContext.Provider>
        </QueryClientProvider>
    );
}