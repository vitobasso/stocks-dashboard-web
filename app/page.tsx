"use client"

import {ReactElement, useEffect, useMemo, useState} from "react";
import {consolidateData, Data, Derivations} from "@/lib/data";
import {ManageDialog} from "@/components/ui/manage-dialog";
import {TickerGrid} from "@/components/ui/ticker-grid";
import {headerOptions, selectedHeaders} from "@/components/ui/manage-dialog-cols";
import {Analytics} from "@vercel/analytics/next"
import PositionsReader from "@/components/ui/positions-reader";

export default function Home() {

    // query results
    const [versions, setVersions] = useState<string[]>([]);
    const [scraped, setScraped] = useState<Map<string, Data>>(new Map);
    const [quotes, setQuotes] = useState<Data>({});

    // derived state
    const [positions, setPositions] = useState<Data>({});
    const [selectedVersion, setSelectedVersion] = useState<string>("");
    const [tickers, setTickers] = useState<string[] | null>(null);
    const [headers, setHeaders] = useState<Header[] | null>(null);

    useEffect(() => {
        setTickers(loadTickers(localStorage));
        setHeaders(loadHeaders(localStorage));
        setPositions(loadPositions(localStorage));

        fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + "/api/scraped")
            .then(res => res.json())
            .then(json => setVersions(json));
    }, []);

    useEffect(() => {
        if (selectedVersion) return;
        setSelectedVersion(versions[versions.length -1])
    }, [versions]);

    useEffect(() => {
        if (!selectedVersion || scraped.has(selectedVersion)) return
        fetch(process.env.NEXT_PUBLIC_SCRAPER_URL + `/api/scraped/${selectedVersion}`)
            .then(res => res.json())
            .then(json => setScraped(prev => new Map(prev).set(selectedVersion, json)));
    }, [selectedVersion]);

    useEffect(() => {
        localStorage.setItem("tickers", JSON.stringify(tickers));

        tickers?.length && fetch("/api/quotes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({tickers}),
        })
            .then(res => res.json())
            .then(json => setQuotes(json));
    }, [tickers]);

    useEffect(() => {
        localStorage.setItem("headers", JSON.stringify(headers));
    }, [headers]);

    useEffect(() => {
        localStorage.setItem("positions", JSON.stringify(positions));
    }, [positions]);

    const data: Data = useMemo(() => {
        let selectedData = scraped.get(selectedVersion) ?? {};
        return consolidateData([selectedData, quotes, positions], derivations)
    }, [selectedVersion, scraped, quotes, positions]);

    function customHeaders(key: string): ((defaultRender: ReactElement) => ReactElement) | undefined {
        if (key == "Posição") {
            return (visibleElement: ReactElement) => <PositionsReader visibleElement={visibleElement} setPositions={setPositions} />
        }
    }

    if (!tickers || !headers) return;
    return <>
        <div className="flex justify-between p-1">
            <select value={selectedVersion} onChange={e => setSelectedVersion(e.target.value)}>
                {versions.map(v => (
                    <option key={v} value={v}>{v}</option>
                ))}
            </select>
            <ManageDialog tickers={tickers} headers={selectedHeaders(headers)} allHeaders={headerOptions(data)}
                          getLabel={getLabel} setTickers={setTickers} setHeaders={setHeaders}/>
        </div>
        <TickerGrid
            style={{height: "100vh"}} bgColor={bgColor}
            tickers={tickers} headers={headers} getLabel={getLabel} formats={formats} colors={colors} data={data}
            renderHeader={customHeaders}/>
        <Analytics />
    </>
}

const derivations: Derivations = {
    "derived_position.total_price": {
        function: (args) => args[1] * args[0],
        arguments: ["b3_position.quantity", "quotes.latest"],
    },
    "derived_forecast.min_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["yahoo_forecast.min", "quotes.latest"],
    },
    "derived_forecast.avg_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["yahoo_forecast.avg", "quotes.latest"],
    },
    "derived_forecast.max_pct": {
        function: (args) => calcChangePct(args[1], args[0]),
        arguments: ["yahoo_forecast.max", "quotes.latest"],
    },
    "statusinvest.liqmd_millions": {
        function: (args) => args[0] / 1000000,
        arguments: ["statusinvest.liquidez_media_diaria"],
    },
    "statusinvest.ey": {
        function: (args) => Math.round(100 / args[0]),
        arguments: ["statusinvest.ev_ebit"],
    },
}

export type Formats = Record<string, "chart" | "percent">;
const formats: Formats = {
    "yahoo_chart.1mo": "chart",
    "yahoo_chart.1y": "chart",
    "yahoo_chart.5y": "chart",
    "statusinvest.ey": "percent",
    "derived_forecast.min_pct": "percent",
    "derived_forecast.avg_pct": "percent",
    "derived_forecast.max_pct": "percent",
}

export type Label = { short: string; long?: string }
export type Labels = Record<string, Label>;
const labels: Labels = {
    "ticker": { short: "Ação" },

    "derived_position.total_price": { short: "Tota", long: "Preço Total" },
    "b3_position.quantity": { short: "Qtd", long: "Quantidade" },
    "b3_position.average_price": { short: "Med", long: "Preço Médio" },

    "quotes.latest": { short: "Hoje" },

    "yahoo_chart.1mo": { short: "1mo", long: "1 mês" },
    "yahoo_chart.1y": { short: "1y", long: "1 ano" },
    "yahoo_chart.5y": { short: "5y", long: "5 anos" },

    "statusinvest.liqmd_millions": { short: "LiqM", long: "Liquidez Média Diária (Milhões)" },
    "statusinvest.p_l": { short: "P/L", long: "Preço / Lucro" },
    "statusinvest.p_vp": { short: "P/VP", long: "Preço / Valor Patrimonial" },
    "statusinvest.ey": { short: "EY", long: "Earning Yield" },
    "statusinvest.roe": { short: "ROE", long: "Retorno / Patrimônio Líquido" },
    "statusinvest.roic": { short: "ROIC", long: "Retorno / Capital Investido" },
    "statusinvest.marg_liquida": { short: "Marg", long: "Margem Líquida" },
    "statusinvest.div_liq_patri": { short: "Dív", long: "Dívida Líquida / Patrimônio" },
    "statusinvest.liq_corrente": { short: "LCor", long: "Liquidez Corrente" },
    "statusinvest.cagr_lucros_5_anos": { short: "Lucro", long: "CAGR Lucros 5 Anos" },
    "statusinvest.dy": { short: "DY", long: "Dividend Yield" },

    "simplywallst.value": { short: "Valu", long: "Value" },
    "simplywallst.future": { short: "Futu", long: "Future" },
    "simplywallst.past": { short: "Past" },
    "simplywallst.health": { short: "Heal", long: "Health" },
    "simplywallst.dividend": { short: "Divi", long: "Dividend" },

    "yahoo_api_rating.strongBuy": { short: "SBuy", long: "Strong Buy" },
    "yahoo_api_rating.buy": { short: "Buy" },
    "yahoo_api_rating.hold": { short: "Hold" },
    "yahoo_api_rating.sell": { short: "Sell" },
    "yahoo_api_rating.strongSell": { short: "SSell", long: "Strong Sell" },

    "derived_forecast.min_pct": { short: "Min" },
    "derived_forecast.avg_pct": { short: "Avg" },
    "derived_forecast.max_pct": { short: "Max" },
}

const red = "#D23D2D";
const bgColor = "#F0EEE5";
const green = "#428554";
export type Colors = Record<string, ColorRule>;
export type ColorRule = { domain: number[], colors: string[] }
const colors: Colors = {
    "yahoo_chart.1mo": {domain: [-20, -5, 10, 20], colors: [red, bgColor, bgColor, green]},
    "yahoo_chart.1y": {domain: [-20, 8.8, 18.8, 45], colors: [red, bgColor, bgColor, green]}, //selic anual media: 13.84
    "yahoo_chart.5y": {domain: [0, 70, 115, 150], colors: [red, bgColor, bgColor, green]}, //selic acc 5 anos: 92.4

    "statusinvest.p_l": {domain: [-1000, 0, 12, 20], colors: [red, bgColor, bgColor, red]},
    "statusinvest.p_vp": {domain: [2, 5], colors: [bgColor, red]},
    "statusinvest.ey": {domain: [0, 10], colors: [red, bgColor]},
    "statusinvest.roe": {domain: [2, 15], colors: [red, bgColor]},
    "statusinvest.roic": {domain: [0, 10], colors: [red, bgColor]},
    "statusinvest.marg_liquida": {domain: [0, 10], colors: [red, bgColor]},
    "statusinvest.div_liq_patri": {domain: [1, 2], colors: [bgColor, red]},
    "statusinvest.liq_corrente": {domain: [0.5, 1], colors: [red, bgColor]},
    "statusinvest.cagr_lucros_5_anos": {domain: [0, 8, 15, 50], colors: [red, bgColor, bgColor, green]},
    "statusinvest.dy": {domain: [7, 20], colors: [bgColor, green]},

    "simplywallst.value": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywallst.future": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywallst.past": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywallst.health": {domain: [-2, 2, 4, 8], colors: [red, bgColor, bgColor, green]},
    "simplywallst.dividend": {domain: [3, 6], colors: [bgColor, green]},

    "yahoo_api_rating.strongBuy": {domain: [1, 10], colors: [bgColor, green]},
    "yahoo_api_rating.buy": {domain: [2, 20], colors: [bgColor, green]},
    "yahoo_api_rating.hold": {domain: [4, 15], colors: [bgColor, red]},
    "yahoo_api_rating.sell": {domain: [0, 4], colors: [bgColor, red]},
    "yahoo_api_rating.strongSell": {domain: [0, 2], colors: [bgColor, red]},

    "statusinvest.liqmd_millions": {domain: [4, 6], colors: [red, bgColor]},
    "derived_forecast.min_pct": {domain: [-20, 0, 10, 30], colors: [red, bgColor, bgColor, green]},
    "derived_forecast.avg_pct": {domain: [-5, 5, 20, 80], colors: [red, bgColor, bgColor, green]},
    "derived_forecast.max_pct": {domain: [10, 25, 60, 100], colors: [red, bgColor, bgColor, green]},
}

export type Header = [group: string, keys: string[]];
const initialHeaders: Header[] = [
    ["", ["ticker"]],
    ["Posição", ["derived_position.total_price", "b3_position.average_price"]],
    ["Preço", ["quotes.latest", "yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]], //TODO compare with latest when displaying % change?
    ["Fundamentos", ["liqmd_millions", "p_l", "p_vp", "ey", "roe", "roic", "marg_liquida", "div_liq_patri", "liq_corrente",
        "cagr_lucros_5_anos", "dy"].map(s => `statusinvest.${s}`)],
    ["Score", [ "value", "future", "past", "health", "dividend" ].map(s => `simplywallst.${s}`)],
    ["Recomendação", [ "strongBuy", "buy", "hold", "sell", "strongSell"].map(s => `yahoo_api_rating.${s}`)],
    ["Previsão", [ "min_pct", "avg_pct", "max_pct" ].map(s => `derived_forecast.${s}`)],
];

const initialTickers = [
    "ABCB4",
    "BBAS3",
    "BBSE3",
    "CMIG4",
    "CPFE3",
    "CXSE3",
    "FESA4",
    "GGBR4",
    "GOAU4",
    "ISAE4",
    "ITSA4",
    "LEVE3",
    "NEOE3",
    "PETR4",
    "PRIO3",
    "RECV3",
    "RENT3",
    "ROMI3",
    "TAEE11",
    "UNIP6",
    "VALE3",
    "WEGE3",
]

function getLabel(path: string): Label {
    let basename = path?.split('.')[1]
    return labels[path] ?? {
        short: titleize(basename ?? path),
    };
}

function titleize(key: string) {
    // replace dots/underscores, split camelCase, capitalize words
    if (!key) return "";
    const spaced = key
        .replace(/\./g, ' ')
        .replace(/[_\-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced
        .split(/\s+/)
        .map(w => (w.length ? w[0].toUpperCase() + w.slice(1) : ''))
        .join(' ')
        .trim();
}

function calcChangePct(start: number, end: number) {
    let result = Math.floor((end - start) / start * 100);
    if (!isNaN(result)) return result;
}

function loadTickers(localStorage: Storage): string[] {
    let rawString = localStorage.getItem("tickers");
    return rawString?.length && JSON.parse(rawString) || initialTickers;
}

function loadHeaders(localStorage: Storage): Header[] {
    let rawString = localStorage.getItem("headers");
    return rawString?.length && JSON.parse(rawString) || initialHeaders;
}

function loadPositions(localStorage: Storage): Data {
    let rawString = localStorage.getItem("positions");
    return rawString?.length && JSON.parse(rawString) || [];
}