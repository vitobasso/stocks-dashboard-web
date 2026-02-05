'use client';

import {createScrapedSubscriptionClient, ScrapedSubscriptionContext} from "@/lib/services/use-scraped-subscription";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useEffect} from "react";

export function Providers({children}: { children: React.ReactNode }) {

    const queryClient = new QueryClient();
    const scrapedSubscriptionClient = createScrapedSubscriptionClient(queryClient);

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