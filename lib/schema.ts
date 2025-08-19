import {Derivations} from "@/lib/data";
import {schema as b3Schema} from "@/lib/b3-position";
import {schema as quotesSchema} from "@/app/api/quotes/route";

export function consolidateSchema(scraper: string[], derivations: Derivations): string[] {
    return [...scraper, ...quotesSchema, ...b3Schema, ...Object.keys(derivations)]
}