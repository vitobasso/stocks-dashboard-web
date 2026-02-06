import {describe, expect, test} from "@jest/globals";
import {migrateV0ToV1} from "@/lib/local-storage/v0";
import {ColView, RowView, ViewsAvailable} from "@/lib/views/views";
import {mapValues, Rec} from "@/lib/utils/records";

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

const viewsAvailableV1ExclDefaults = {
    "stock_br": {
        "rowViews": [
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
        // exclude default views to decouple the test from it
        const viewsAvailableV1Result = window.localStorage.getItem("viewsAvailable");
        const viewsAvailableV1ExclDefaultViews = removeDefaultViews(viewsAvailableV1Result);
        expect(viewsAvailableV1ExclDefaultViews).toBe(JSON.stringify(viewsAvailableV1ExclDefaults));
        expect(window.localStorage.getItem("viewSelection")).toBe(JSON.stringify(viewSelectionV1));
    });

});

function removeDefaultViews(viewsAvailable: string | null) {
    const result: Rec<ViewsAvailable> = viewsAvailable ? JSON.parse(viewsAvailable) : {};
    const resultExclDefaultViews = mapValues(result, filterMigratedViews)
    return JSON.stringify(resultExclDefaultViews);
}

function filterMigratedViews(views: ViewsAvailable) {
    views.rowViews = views.rowViews.filter((v: RowView) => v.name === "Minhas Linhas");
    views.colViews = views.colViews.filter((v: ColView) => v.name === "Minhas Colunas");
    return views;
}