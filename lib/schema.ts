import {schema as b3} from "@/lib/b3-position";
import {schema as quotes} from "@/app/api/quotes/route";
import {schema as derivations} from "@/lib/metadata/derivations";

export function consolidateSchema(scraper: string[]): string[] {
    return [...scraper, ...quotes, ...b3, ...derivations]
}