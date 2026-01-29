import {Rec} from "@/lib/utils/records";
import {Metadata} from "@/lib/data";
import {useQuery} from "@tanstack/react-query";
import {ONE_DAY_MS} from "@/lib/utils/datetime";

export function useMetadataQuery(): Rec<Metadata> | undefined {
    const ttl = ONE_DAY_MS

    const result = useQuery({
        queryKey: ['meta'],
        queryFn: fetchMeta,
        staleTime: ttl,
        gcTime: ttl,
    });

    return result.data;
}

async function fetchMeta(): Promise<Rec<Metadata>> {
    const res = await fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/meta");
    return await res.json();
}