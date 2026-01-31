'use client';

import {createScrapedSubscriptionClient, ScrapedSubscriptionContext} from "@/lib/services/use-scraped-subscription";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useEffect, useMemo} from "react";

export function Providers({children}: { children: React.ReactNode }) {

    const queryClient = useMemo(() => new QueryClient(), []);
    const scrapedSubscriptionClient = useMemo(() =>
            createScrapedSubscriptionClient(queryClient)
        , [queryClient]);

    useEffect(() => {
        scrapedSubscriptionClient.open();
        return () => {
            scrapedSubscriptionClient.close()
        };
    }, [scrapedSubscriptionClient]);

    return (
        <QueryClientProvider client={queryClient}>
            <ScrapedSubscriptionContext.Provider value={scrapedSubscriptionClient}>
                {children}
            </ScrapedSubscriptionContext.Provider>
        </QueryClientProvider>
    );
}