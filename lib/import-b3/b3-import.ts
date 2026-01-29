import {Data} from "@/lib/data";
import {AssetPosition, extractPositions} from "@/lib/import-b3/b3-position";
import {extractDividends} from "@/lib/import-b3/b3-dividends";

export const schema = [
    "b3_position.quantity",
    "b3_position.average_price",
    "b3_position.total_dividends"
]

export function extractData(rows: Record<string, unknown>[]): Data {
    const positions = extractPositions(rows, oldNames);
    const dividends = extractDividends(rows, oldNames);
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

/**
 * Manually maintained history of known ticker renames.
 */
const oldNames: Record<string, string> = {
    "PMLL11": "MALL11", // 23/07/2025
    "NATU3": "NTCO3",   // 02/07/2025
    "TOKY3": "MBLY3",   // 03/06/2025
    "MOTV3": "CCRO3",   // 02/05/2025
    "CTAX3": "ATMP3",   // 08/05/2025
    "FYTO11": "NCHB11", // 10/03/2025
    "VPPR11": "XPPR11", // 05/02/2025
    "FTCA11": "NCRA11", // ??/02/2025
    "REAG3": "GNJN3",   // 28/01/2025
    "ISAE4": "TRPL4",   // 19/11/2024
    "AURE3": "AESB3",   // 31/10/2024
    "GARE11": "GALG11", // 08/02/2024
    "TVRI11": "BBPO11", // 02/10/2023
    "CSUD3": "CARD3",   // 15/09/2022
    "AESB3": "TIET11",  // 29/03/2021

}
