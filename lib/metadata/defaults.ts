import {ViewsAvailable, ViewSelection} from "@/lib/views";
import {mapValues, Rec} from "@/lib/utils/records";

export const defaultViewsAvailable: Rec<ViewsAvailable> = {
    "stock_br": {
        rowViews: [
            {
                name: "Radar",
                items: ["ITUB4", "BBDC4", "VALE3", "PETR4", "ABEV3", "BBAS3", "B3SA3", "WEGE3"],
            },
            {
                name: "Elétricas e Saneamento",
                items: ["CMIG4", "CPFE3", "EGIE3", "ENGI11", "EQTL3", "ISAE4", "NEOE3", "SAPR4", "SBSP3"],
            },
            {
                name: "Bancos e Seguradoras",
                items: ["BBAS3", "BBDC4", "ITSA$", "ITUB4", "BBSE3", "CXSE3"],
            },
            {
                name: "Comodities",
                items: ["PETR4", "VALE3", "GGBR4", "PRIO3", "RECV3", "SUZB3", "KLBN4"],
            },
        ],
        colViews: [
            {
                name: "Perfil",
                items: ["b3_listagem.setor"],
            },
            {
                name: "Posição",
                items: ["derived.b3_position.current_value", "b3_position.average_price",
                    "derived.b3_position.cumulative_return"],
            },
            {
                name: "Cotação",
                items: ["yahoo_quote.latest", "yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]
            },
            {
                name: "Fundamentos",
                items: ["statusinvest.liquidez_media_diaria", "statusinvest.p_l", "statusinvest.p_vp",
                    "derived.statusinvest.ey", "statusinvest.roe", "statusinvest.roic", "statusinvest.marg_liquida",
                    "statusinvest.div_liq_patri", "statusinvest.liq_corrente", "statusinvest.cagr_lucros_5_anos",
                    "statusinvest.dy"]
            },
            {
                name: "Consenso",
                items: ["strong_buy", "buy", "hold", "sell", "strong_sell"].map(s => `yahoo_recom.${s}`)
            },
            {
                name: "Projeção",
                items: ["min_pct", "avg_pct", "max_pct"].map(s => `derived.forecast.${s}`)
            },
        ],
    },
    "reit_br": {
        rowViews: [
            {
                name: "Radar",
                items: ["KNCR11", "KNIP11", "XPML11", "HGLG11", "BTLG11", "KNRI11",],
            },
        ],
        colViews: [
            {
                name: "Posição",
                items: ["derived.b3_position.current_value", "b3_position.average_price",
                    "derived.b3_position.cumulative_return"]
            },
            {
                name: "Cotação",
                items: ["yahoo_quote.latest", "yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]
            },
            {
                name: "Fundamentos",
                items: ["fundamentus.segmento", "fundamentus.p_vp", "fundamentus.liquidez",
                    "fundamentus.dividend_yield", "fundamentus.qtd_de_imoveis", "fundamentus.vacancia_media"]
            },
        ],
    },
}
export const defaultSelection: ViewSelection = {
    assetClass: "stock_br",
    rowViewNames: mapValues(defaultViewsAvailable, (v) => v.rowViews[0].name),
    colViewNames: mapValues(defaultViewsAvailable, (v) => v.colViews[0].name),
}