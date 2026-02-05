import {ViewsAvailable, ViewSelection} from "@/lib/views/views";
import {mapValues, Rec} from "@/lib/utils/records";

export const viewsProd: Rec<ViewsAvailable> = {
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
                items: ["BBAS3", "BBDC4", "ITSA4", "ITUB4", "BBSE3", "CXSE3"],
            },
            {
                name: "Comodities",
                items: ["PETR4", "VALE3", "GGBR4", "PRIO3", "RECV3", "SUZB3", "KLBN4"],
            },
        ],
        colViews: [
            {
                name: "Qualidade",
                items: ["b3.listagem.setor", "investidor10.derived.cadastral.anos_desde_fundacao",
                    "investidor10.derived.cadastral.anos_desde_estreia_na_bolsa", "b3.listagem.segmento_de_negociacao",
                    "investidor10.financeiro.patrimonio_liquido", "statusinvest.liquidez_media_diaria",
                    "investidor10.financeiro.free_float", "investidor10.financeiro.tag_along",
                    "statusinvest.div_liq_patri", "statusinvest.liq_corrente", "statusinvest.marg_liquida",
                    "statusinvest.derived.ey", "statusinvest.roe", "statusinvest.roic", "simplywall.earnings_growth"]
            },
            {
                name: "Preço",
                items: ["b3.listagem.setor", "yahoo.quote.latest", "yahoo.derived.chart.1mo", "yahoo.chart.1y",
                    "yahoo.chart.5y", "statusinvest.p_l", "statusinvest.p_vp", "statusinvest.p_ativos",
                    "statusinvest.p_ebit"]
            },
            {
                name: "Analistas",
                items: ["b3.listagem.setor", "yahoo.recom.strong_buy", "yahoo.recom.buy", "yahoo.recom.hold", "yahoo.recom.sell",
                    "yahoo.recom.strong_sell", "yahoo.derived.forecast.min_pct", "yahoo.derived.forecast.avg_pct",
                    "yahoo.derived.forecast.max_pct"]
            },
            {
                name: "Rentabilidade",
                items: ["b3.derived.position.invested_value", "b3.derived.position.current_value",
                    "b3.derived.position.price_variation", "b3.position.total_dividends",
                    "b3.derived.position.total_value", "b3.derived.position.cumulative_return"]
            },
            {
                name: "Posição",
                items: ["b3.position.quantity", "b3.position.average_price", "b3.derived.position.price_variation",
                    "yahoo.quote.latest", "yahoo.derived.chart.1mo", "yahoo.chart.1y", "yahoo.chart.5y"]
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
                items: ["yahoo.quote.latest", "yahoo.derived.chart.1mo", "yahoo.chart.1y", "yahoo.chart.5y",
                    "fundamentus.p_vp"]
            }, {
                name: "Fundamentos",
                items: ["fundamentus.segmento", "fundamentus.liquidez", "fundamentus.qtd_de_imoveis",
                    "fundamentus.vacancia_media", "fundamentus.ffo_yield", "fundamentus.cap_rate",
                    "fundamentus.dividend_yield"]
            },
            {
                name: "Rentabilidade",
                items: ["b3.derived.position.invested_value", "b3.derived.position.current_value",
                    "b3.derived.position.price_variation", "b3.position.total_dividends",
                    "b3.derived.position.total_value", "b3.derived.position.cumulative_return"]
            },
            {
                name: "Posição",
                items: ["b3.position.quantity", "b3.position.average_price", "b3.derived.position.price_variation",
                    "yahoo.quote.latest", "yahoo.derived.chart.1mo", "yahoo.chart.1y", "yahoo.chart.5y"]
            },
        ],
    },
}

export const viewsDev: Rec<ViewsAvailable> = {
    "stock_br": {
        rowViews: [
            {
                name: "test",
                items: ["BBAS3",],
            },
        ],
        colViews: [
            {
                name: "test",
                items: ["yahoo.quote.latest", "b3.position.quantity", "b3.listagem.setor", "statusinvest.preco",
                    "yahoo.recom.buy", "yahoo.chart.1mo", "yahoo.target.max", "investidor10.derived.cadastral.anos_desde_fundacao",
                    "simplywall.score.future"]
            },
        ],
    },
    "reit_br": {
        rowViews: [
            {
                name: "test",
                items: ["HGLG11",],
            },
        ],
        colViews: [
            {
                name: "test",
                items: ["yahoo.quote.latest", "b3.position.quantity", "fundamentus.p_vp", "simplywall.p_earnings",
                    "yahoo.chart.1mo"]
            },
        ],
    },
}

export const defaultViews: Rec<ViewsAvailable> = process.env.NEXT_PUBLIC_DEFAULT_VIEWS_DEV ? viewsDev : viewsProd

export const defaultSelection: ViewSelection = {
    assetClass: "stock_br",
    rowViewNames: mapValues(defaultViews, (v) => [v.rowViews[0].name]),
    colViewNames: mapValues(defaultViews, (v) => [v.colViews[0].name]),
}
