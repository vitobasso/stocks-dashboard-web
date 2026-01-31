import {describe, expect, test} from "@jest/globals";
import {migrateV0ToV1} from "@/lib/local-storage/v0";

const rowsV0 = {
    "stock_br": [
        "ABCB4",
        "BBAS3",
        "BBDC4",
        "BBSE3",
        "CMIG4",
        "CPFE3",
        "CXSE3",
        "EGIE3",
        "ENGI11",
        "EQTL3",
        "FESA4",
        "GGBR4",
        "GOAU4",
        "IRBR3",
        "ISAE4",
        "ITSA4",
        "KLBN11",
        "KLBN4",
        "LEVE3",
        "NEOE3",
        "PETR4",
        "PRIO3",
        "PSSA3",
        "RECV3",
        "RENT3",
        "ROMI3",
        "SAPR4",
        "SBSP3",
        "SUZB3",
        "TAEE11",
        "VALE3",
        "WEGE3"
    ],
    "reit_br": [
        "ALZR11",
        "BTLG11",
        "FATN11",
        "FIIB11",
        "HGLG11",
        "HGRU11",
        "KCRE11",
        "KNHY11",
        "KNIP11",
        "KNSC11",
        "LVBI11",
        "MFII11",
        "PMLL11",
        "RBVA11",
        "RECR11",
        "TEPP11",
        "TGAR11",
        "TRXF11",
        "VISC11",
        "XPLG11",
        "XPML11"
    ]
}

const columnsV0 = {
    "stock_br": [
        {
            "group": "Perfil",
            "keys": [
                "ticker",
                "b3_listagem.setor"
            ]
        },
        {
            "group": "Posição",
            "keys": [
                "derived.b3_position.current_value",
                "b3_position.average_price",
                "derived.b3_position.cumulative_return",
                "derived.b3_position.price_variation"
            ]
        },
        {
            "group": "Cotação",
            "keys": [
                "yahoo_quote.latest",
                "derived.yahoo_chart.1mo",
                "yahoo_chart.1y",
                "yahoo_chart.5y"
            ]
        },
        {
            "group": "Fundamentos",
            "keys": [
                "statusinvest.liquidez_media_diaria",
                "statusinvest.p_l",
                "statusinvest.p_vp",
                "derived.statusinvest.ey",
                "statusinvest.roe",
                "statusinvest.marg_liquida",
                "statusinvest.div_liq_patri",
                "statusinvest.liq_corrente",
                "statusinvest.cagr_lucros_5_anos",
                "statusinvest.dy"
            ]
        },
        {
            "group": "Score",
            "keys": [
                "simplywall.score.value",
                "simplywall.score.future",
                "simplywall.score.past",
                "simplywall.score.health",
                "simplywall.score.dividend"
            ]
        },
        {
            "group": "Recomendação",
            "keys": [
                "yahoo_recom.strong_buy",
                "yahoo_recom.buy",
                "yahoo_recom.hold",
                "yahoo_recom.sell",
                "yahoo_recom.strong_sell"
            ]
        },
        {
            "group": "Previsão",
            "keys": [
                "derived.forecast.min_pct",
                "derived.forecast.avg_pct",
                "derived.forecast.max_pct"
            ]
        }
    ],
    "reit_br": [
        {
            "group": "Perfil",
            "keys": [
                "ticker"
            ]
        },
        {
            "group": "Posição",
            "keys": [
                "derived.b3_position.current_value",
                "b3_position.average_price",
                "derived.b3_position.cumulative_return",
                "derived.b3_position.price_variation"
            ]
        },
        {
            "group": "Cotação",
            "keys": [
                "yahoo_quote.latest",
                "derived.yahoo_chart.1mo",
                "yahoo_chart.1y",
                "yahoo_chart.5y"
            ]
        },
        {
            "group": "Fundamentos",
            "keys": [
                "fundamentus.segmento",
                "fundamentus.p_vp",
                "fundamentus.liquidez",
                "fundamentus.ffo_yield",
                "fundamentus.dividend_yield",
                "fundamentus.qtd_de_imoveis",
                "fundamentus.vacancia_media"
            ]
        }
    ]
}

const viewsAvailableV1 = {
    "stock_br": {
        "rowViews": [
            {
                "name": "Radar",
                "items": [
                    "ITUB4",
                    "BBDC4",
                    "VALE3",
                    "PETR4",
                    "ABEV3",
                    "BBAS3",
                    "B3SA3",
                    "WEGE3"
                ]
            },
            {
                "name": "Elétricas e Saneamento",
                "items": [
                    "CMIG4",
                    "CPFE3",
                    "EGIE3",
                    "ENGI11",
                    "EQTL3",
                    "ISAE4",
                    "NEOE3",
                    "SAPR4",
                    "SBSP3"
                ]
            },
            {
                "name": "Bancos e Seguradoras",
                "items": [
                    "BBAS3",
                    "BBDC4",
                    "ITSA4",
                    "ITUB4",
                    "BBSE3",
                    "CXSE3"
                ]
            },
            {
                "name": "Comodities",
                "items": [
                    "PETR4",
                    "VALE3",
                    "GGBR4",
                    "PRIO3",
                    "RECV3",
                    "SUZB3",
                    "KLBN4"
                ]
            },
            {
                "name": "Minhas Linhas",
                "items": [
                    "ABCB4",
                    "BBAS3",
                    "BBDC4",
                    "BBSE3",
                    "CMIG4",
                    "CPFE3",
                    "CXSE3",
                    "EGIE3",
                    "ENGI11",
                    "EQTL3",
                    "FESA4",
                    "GGBR4",
                    "GOAU4",
                    "IRBR3",
                    "ISAE4",
                    "ITSA4",
                    "KLBN11",
                    "KLBN4",
                    "LEVE3",
                    "NEOE3",
                    "PETR4",
                    "PRIO3",
                    "PSSA3",
                    "RECV3",
                    "RENT3",
                    "ROMI3",
                    "SAPR4",
                    "SBSP3",
                    "SUZB3",
                    "TAEE11",
                    "VALE3",
                    "WEGE3"
                ]
            }
        ],
        "colViews": [
            {
                "name": "Qualidade",
                "items": [
                    "b3.listagem.setor",
                    "investidor10.cadastral.ano_de_fundacao",
                    "investidor10.cadastral.ano_de_estreia_na_bolsa",
                    "b3.listagem.segmento_de_negociacao",
                    "investidor10.financeiro.patrimonio_liquido",
                    "statusinvest.liquidez_media_diaria",
                    "investidor10.financeiro.free_float",
                    "investidor10.financeiro.tag_along",
                    "statusinvest.div_liq_patri",
                    "statusinvest.liq_corrente",
                    "statusinvest.marg_liquida",
                    "statusinvest.derived.ey",
                    "statusinvest.roe",
                    "statusinvest.roic",
                    "simplywall.earnings_growth"
                ]
            },
            {
                "name": "Preço",
                "items": [
                    "b3.listagem.setor",
                    "yahoo.quote.latest",
                    "yahoo.derived.chart.1mo",
                    "yahoo.chart.1y",
                    "yahoo.chart.5y",
                    "statusinvest.p_l",
                    "statusinvest.p_vp",
                    "statusinvest.p_ativos",
                    "statusinvest.p_ebit"
                ]
            },
            {
                "name": "Analistas",
                "items": [
                    "b3.listagem.setor",
                    "yahoo.recom.strong_buy",
                    "yahoo.recom.buy",
                    "yahoo.recom.hold",
                    "yahoo.recom.sell",
                    "yahoo.recom.strong_sell",
                    "yahoo.derived.forecast.min_pct",
                    "yahoo.derived.forecast.avg_pct",
                    "yahoo.derived.forecast.max_pct"
                ]
            },
            {
                "name": "Rentabilidade",
                "items": [
                    "b3.derived.position.invested_value",
                    "b3.derived.position.current_value",
                    "b3.derived.position.price_variation",
                    "b3.position.total_dividends",
                    "b3.derived.position.total_value",
                    "b3.derived.position.cumulative_return"
                ]
            },
            {
                "name": "Posição",
                "items": [
                    "b3.position.quantity",
                    "b3.position.average_price",
                    "b3.derived.position.price_variation",
                    "yahoo.quote.latest",
                    "yahoo.derived.chart.1mo",
                    "yahoo.chart.1y",
                    "yahoo.chart.5y"
                ]
            },
            {
                "name": "Minhas Colunas",
                "items": [
                    "b3_listagem.setor",
                    "derived.b3_position.current_value",
                    "b3_position.average_price",
                    "derived.b3_position.cumulative_return",
                    "derived.b3_position.price_variation",
                    "yahoo_quote.latest",
                    "derived.yahoo_chart.1mo",
                    "yahoo_chart.1y",
                    "yahoo_chart.5y",
                    "statusinvest.liquidez_media_diaria",
                    "statusinvest.p_l",
                    "statusinvest.p_vp",
                    "derived.statusinvest.ey",
                    "statusinvest.roe",
                    "statusinvest.marg_liquida",
                    "statusinvest.div_liq_patri",
                    "statusinvest.liq_corrente",
                    "statusinvest.cagr_lucros_5_anos",
                    "statusinvest.dy",
                    "simplywall.score.value",
                    "simplywall.score.future",
                    "simplywall.score.past",
                    "simplywall.score.health",
                    "simplywall.score.dividend",
                    "yahoo_recom.strong_buy",
                    "yahoo_recom.buy",
                    "yahoo_recom.hold",
                    "yahoo_recom.sell",
                    "yahoo_recom.strong_sell",
                    "derived.forecast.min_pct",
                    "derived.forecast.avg_pct",
                    "derived.forecast.max_pct"
                ]
            }
        ]
    },
    "reit_br": {
        "rowViews": [
            {
                "name": "Radar",
                "items": [
                    "KNCR11",
                    "KNIP11",
                    "XPML11",
                    "HGLG11",
                    "BTLG11",
                    "KNRI11"
                ]
            },
            {
                "name": "Minhas Linhas",
                "items": [
                    "ALZR11",
                    "BTLG11",
                    "FATN11",
                    "FIIB11",
                    "HGLG11",
                    "HGRU11",
                    "KCRE11",
                    "KNHY11",
                    "KNIP11",
                    "KNSC11",
                    "LVBI11",
                    "MFII11",
                    "PMLL11",
                    "RBVA11",
                    "RECR11",
                    "TEPP11",
                    "TGAR11",
                    "TRXF11",
                    "VISC11",
                    "XPLG11",
                    "XPML11"
                ]
            }
        ],
        "colViews": [
            {
                "name": "Preço",
                "items": [
                    "yahoo.quote.latest",
                    "yahoo.derived.chart.1mo",
                    "yahoo.chart.1y",
                    "yahoo.chart.5y",
                    "fundamentus.p_vp"
                ]
            },
            {
                "name": "Fundamentos",
                "items": [
                    "fundamentus.segmento",
                    "fundamentus.liquidez",
                    "fundamentus.qtd_de_imoveis",
                    "fundamentus.vacancia_media",
                    "fundamentus.ffo_yield",
                    "fundamentus.cap_rate",
                    "fundamentus.dividend_yield"
                ]
            },
            {
                "name": "Rentabilidade",
                "items": [
                    "b3.derived.position.invested_value",
                    "b3.derived.position.current_value",
                    "b3.derived.position.price_variation",
                    "b3.position.total_dividends",
                    "b3.derived.position.total_value",
                    "b3.derived.position.cumulative_return"
                ]
            },
            {
                "name": "Posição",
                "items": [
                    "b3.position.quantity",
                    "b3.position.average_price",
                    "b3.derived.position.price_variation",
                    "yahoo.quote.latest",
                    "yahoo.derived.chart.1mo",
                    "yahoo.chart.1y",
                    "yahoo.chart.5y"
                ]
            },
            {
                "name": "Minhas Colunas",
                "items": [
                    "derived.b3_position.current_value",
                    "b3_position.average_price",
                    "derived.b3_position.cumulative_return",
                    "derived.b3_position.price_variation",
                    "yahoo_quote.latest",
                    "derived.yahoo_chart.1mo",
                    "yahoo_chart.1y",
                    "yahoo_chart.5y",
                    "fundamentus.segmento",
                    "fundamentus.p_vp",
                    "fundamentus.liquidez",
                    "fundamentus.ffo_yield",
                    "fundamentus.dividend_yield",
                    "fundamentus.qtd_de_imoveis",
                    "fundamentus.vacancia_media"
                ]
            }
        ]
    }
}

const viewSelectionV1 = {
    "assetClass": "stock_br",
    "rowViewNames": {
        "stock_br": [
            "Minhas Linhas"
        ],
        "reit_br": [
            "Minhas Linhas"
        ]
    },
    "colViewNames": {
        "stock_br": [
            "Minhas Colunas"
        ],
        "reit_br": [
            "Minhas Colunas"
        ]
    }
}

describe('migrateV0ToV1', () => {
    //"version" is undefined in V0
    window.localStorage.setItem("rows", JSON.stringify(rowsV0));
    window.localStorage.setItem("columns", JSON.stringify(columnsV0));
    migrateV0ToV1()

    test('upgrades the version', () => {
        expect(window.localStorage.getItem("version")).toBe("1");
    });

    test('clears deprecated properties', () => {
        expect(window.localStorage.getItem("rows")).toBe(null);
        expect(window.localStorage.getItem("columns")).toBe(null);
    });

    test('creates v1 properties', () => {
        expect(window.localStorage.getItem("viewsAvailable")).toBe(JSON.stringify(viewsAvailableV1));
        expect(window.localStorage.getItem("viewSelection")).toBe(JSON.stringify(viewSelectionV1));
    });

});
