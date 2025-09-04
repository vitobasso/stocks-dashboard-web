import {Data} from "@/lib/data";
import {AssetPosition, extractPositions} from "@/lib/b3-position";
import {extractDividends} from "@/lib/b3-dividends";

export const schema = [
    "b3_position.quantity",
    "b3_position.average_price",
    "b3_position.total_dividends"
]

export function extractData(rows: Record<string, unknown>[]): Data {
    const positions = extractPositions(rows);
    const dividends = extractDividends(rows);
    return standardizeData(positions, dividends);
}

function standardizeData(positions: Map<string, AssetPosition>, dividends: Map<string, number>): Data {
    return Object.fromEntries(
        [...positions].map(([ticker, position]) => [
            ticker,
            {
                "b3_position.quantity": position.quantity,
                "b3_position.average_price": position.averagePrice,
                "b3_position.total_dividends": dividends.get(ticker) || 0
            }
        ])
    );
}
