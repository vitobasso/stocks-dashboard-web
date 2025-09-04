import {schema as b3} from "@/lib/b3-import";
import {schema as derivations} from "@/lib/metadata/derivations";

export function consolidateSchema(scraper: string[], assetClass: string): string[] {
    return [...scraper, ...quotes, ...b3, ...derivations[assetClass]]
}

// next.js prohibits exporting this from api/../route.ts
const quotes = [
    "yahoo_quote.latest"
]
