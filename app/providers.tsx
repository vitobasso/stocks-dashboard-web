'use client';

import {createScrapedLiveClient, LiveScrapedClient, LiveScrapedContext} from "@/lib/services/use-scraped-live";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {useEffect, useMemo, useState} from "react";

export function Providers({ children }: { children: React.ReactNode }) {

    const queryClient = useMemo(() => new QueryClient(), []);
    const [liveClient, setLiveClient] = useState<LiveScrapedClient | null>(null);

    useEffect(() => {
        const client = createScrapedLiveClient(queryClient);
        setLiveClient(client);

        return () => {
            liveClient?.close();
        };
    }, [queryClient]);

    return (
        <QueryClientProvider client={queryClient}>
            <LiveScrapedContext.Provider value={liveClient}>
                {children}
            </LiveScrapedContext.Provider>
        </QueryClientProvider>
    );
}