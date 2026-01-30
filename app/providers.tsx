'use client';

import {createScrapedLiveClient, LiveScrapedContext} from "@/lib/services/use-scraped-live";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {useEffect, useMemo} from "react";

export function Providers({ children }: { children: React.ReactNode }) {

    const queryClient = useMemo(() => new QueryClient(), []);

    const liveClient = useMemo(
        () => createScrapedLiveClient(queryClient),
        [queryClient]
    );

    useEffect(() => {
        return () => {
            liveClient.close(); // <-- clean shutdown
        };
    }, [liveClient]);

    return (
        <QueryClientProvider client={queryClient}>
            <LiveScrapedContext.Provider value={liveClient}>
                {children}
            </LiveScrapedContext.Provider>
        </QueryClientProvider>
    );
}