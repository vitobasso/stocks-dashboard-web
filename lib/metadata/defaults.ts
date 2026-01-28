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
                name: "Qualidade",
                items: ["b3_listagem.setor", "investidor10.cadastral.ano_de_fundacao",
                    "investidor10.cadastral.ano_de_estreia_na_bolsa", "b3_listagem.segmento_de_negociacao",
                    "investidor10.financeiro.patrimonio_liquido", "statusinvest.liquidez_media_diaria",
                    "investidor10.financeiro.free_float", "investidor10.financeiro.tag_along",
                    "statusinvest.div_liq_patri", "statusinvest.liq_corrente", "statusinvest.marg_liquida",
                    "derived.statusinvest.ey", "statusinvest.roe", "statusinvest.roic", "simplywall.earnings_growth"]
            },
            {
                name: "Preço",
                items: ["b3_listagem.setor", "yahoo_quote.latest", "derived.yahoo_chart.1mo", "yahoo_chart.1y",
                    "yahoo_chart.5y", "statusinvest.p_l", "statusinvest.p_vp", "statusinvest.p_ativos",
                    "statusinvest.p_ebit"]
            },
            {
                name: "Analistas",
                items: ["b3_listagem.setor", "yahoo_recom.strong_buy", "yahoo_recom.buy", "yahoo_recom.hold", "yahoo_recom.sell",
                    "yahoo_recom.strong_sell", "derived.forecast.min_pct", "derived.forecast.avg_pct",
                    "derived.forecast.max_pct"]
            },
            {
                name: "Rentabilidade",
                items: ["derived.b3_position.invested_value", "derived.b3_position.current_value",
                    "derived.b3_position.price_variation", "b3_position.total_dividends",
                    "derived.b3_position.total_value", "derived.b3_position.cumulative_return"]
            },
            {
                name: "Posição",
                items: ["b3_position.quantity", "b3_position.average_price", "derived.b3_position.price_variation",
                    "yahoo_quote.latest", "derived.yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]
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
                name: "Preço",
                items: ["yahoo_quote.latest", "derived.yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y",
                    "fundamentus.p_vp"]
            }, {
                name: "Fundamentos",
                items: ["fundamentus.segmento", "fundamentus.liquidez", "fundamentus.qtd_de_imoveis",
                    "fundamentus.vacancia_media", "fundamentus.ffo_yield", "fundamentus.cap_rate",
                    "fundamentus.dividend_yield"]
            },
            {
                name: "Rentabilidade",
                items: ["derived.b3_position.invested_value", "derived.b3_position.current_value",
                    "derived.b3_position.price_variation", "b3_position.total_dividends",
                    "derived.b3_position.total_value", "derived.b3_position.cumulative_return"]
            },
            {
                name: "Posição",
                items: ["b3_position.quantity", "b3_position.average_price", "derived.b3_position.price_variation",
                    "yahoo_quote.latest", "derived.yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]
            },
        ],
    },
}
export const defaultSelection: ViewSelection = {
    assetClass: "stock_br",
    rowViewNames: mapValues(defaultViewsAvailable, (v) => v.rowViews[0].name),
    colViewNames: mapValues(defaultViewsAvailable, (v) => v.colViews[0].name),
}
