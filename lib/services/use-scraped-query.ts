import {mergeDepth2, Rec} from "@/lib/utils/records";
import {Data} from "@/lib/data";
import {useQueries} from "@tanstack/react-query";
import {ONE_DAY_MS} from "@/lib/utils/datetime";

const ttl = ONE_DAY_MS

async function fetchScraped(ac: string, ticker: string): Promise<Rec<Data>> {
    const urlParams = scraperParams(ac, [ticker]);
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/data?${urlParams.toString()}`);
    return await res.json();
}

function scraperParams(ac: string, rows: string[]) {
    const urlParams = new URLSearchParams();
    if (rows.length) urlParams.append(ac, rows.join(","));
    return urlParams;
}

export function useScrapedQuery(ac: string | null, rows: string[] | null): Rec<Data> {
    const results = useQueries({
        queries: (rows ?? []).map((ticker) => ({
            queryKey: [ac, 'scraped', ticker],
            queryFn: () => fetchScraped(ac ?? "", ticker),
            enabled: Boolean(ac && rows?.length),
            staleTime: ttl,
            gcTime: ttl,
        })),
    });
    return results.map(r => r.data)
        .filter((d): d is Rec<Data> => !!d)
        .reduce(mergeDepth2, {})
}
