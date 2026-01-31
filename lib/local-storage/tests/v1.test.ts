import {describe, expect, test} from "@jest/globals";
import {migrateIfNeeded} from "../local-storage";

const viewsAvailableV1 = {
    "stock_br": {
        "rowViews": [{
            "name": "Carteira",
            "items": ["VALE3", "PETR4", "BBAS3", "WEGE3", "ABCB4", "BBSE3", "CMIG4", "CPFE3", "CXSE3", "FESA4", "GGBR4", "GOAU4", "ISAE4", "ITSA4", "LEVE3", "PRIO3", "RECV3", "RENT3", "ROMI3", "TAEE11", "KLBN4"]
        }, {
            "name": "Radar",
            "items": ["EGIE3", "ENGI11", "EQTL3", "SAPR4", "SBSP3", "BBDC4", "IRBR3", "KLBN4", "NEOE3", "PSSA3", "SUZB3"]
        }],
        "colViews": [{
            "name": "Qualidade",
            "items": ["b3_listagem.setor", "investidor10.cadastral.ano_de_fundacao", "investidor10.cadastral.ano_de_estreia_na_bolsa", "b3_listagem.segmento_de_negociacao", "investidor10.financeiro.patrimonio_liquido", "statusinvest.liquidez_media_diaria", "investidor10.financeiro.free_float", "investidor10.financeiro.tag_along", "statusinvest.div_liq_patri", "statusinvest.liq_corrente", "statusinvest.marg_liquida", "statusinvest.roe", "statusinvest.roic", "statusinvest.derived.ey", "simplywall.earnings_growth", "simplywall.score.past", "simplywall.score.health", "statusinvest.dy", "simplywall.score.dividend"]
        }, {
            "name": "Preço",
            "items": ["b3_listagem.setor", "yahoo_quote.latest", "derived.yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y", "statusinvest.p_l", "statusinvest.p_vp", "statusinvest.p_ativos", "statusinvest.p_ebit", "simplywall.score.value"]
        }, {
            "name": "Analistas",
            "items": ["b3_listagem.setor", "yahoo_recom.strong_buy", "yahoo_recom.buy", "yahoo_recom.hold", "yahoo_recom.sell", "yahoo_recom.strong_sell", "derived.forecast.min_pct", "derived.forecast.avg_pct", "derived.forecast.max_pct", "simplywall.score.value", "simplywall.score.future"]
        }, {
            "name": "Rentabilidade",
            "items": ["derived.b3_position.invested_value", "derived.b3_position.current_value", "derived.b3_position.price_variation", "b3_position.total_dividends", "derived.b3_position.total_value", "derived.b3_position.cumulative_return"]
        }, {
            "name": "Posição",
            "items": ["b3_position.quantity", "b3_position.average_price", "derived.b3_position.price_variation", "yahoo_quote.latest", "derived.yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]
        }]
    }, "reit_br": {
        "rowViews": [{
            "name": "Radar",
            "items": ["KNCR11", "KNIP11", "XPML11", "HGLG11", "BTLG11", "KNRI11"]
        }],
        "colViews": [{
            "name": "Preço",
            "items": ["yahoo_quote.latest", "derived.yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y", "fundamentus.p_vp"]
        }, {
            "name": "Fundamentos",
            "items": ["fundamentus.segmento", "fundamentus.liquidez", "fundamentus.qtd_de_imoveis", "fundamentus.vacancia_media", "fundamentus.ffo_yield", "fundamentus.cap_rate", "fundamentus.dividend_yield"]
        }, {
            "name": "Rentabilidade",
            "items": ["derived.b3_position.invested_value", "derived.b3_position.current_value", "derived.b3_position.price_variation", "b3_position.total_dividends", "derived.b3_position.total_value", "derived.b3_position.cumulative_return"]
        }, {
            "name": "Posição",
            "items": ["b3_position.quantity", "b3_position.average_price", "derived.b3_position.price_variation", "yahoo_quote.latest", "derived.yahoo_chart.1mo", "yahoo_chart.1y", "yahoo_chart.5y"]
        }]
    }
}

const positionsV1 = {
    "reit_br": {
        "HGLG11": {
            "b3_position.quantity": 17,
            "b3_position.average_price": 164.53235294117647,
            "b3_position.total_dividends": 463.49999999999983
        },
        "ALZR11": {
            "b3_position.quantity": 420,
            "b3_position.average_price": 11.21859523809524,
            "b3_position.total_dividends": 662.79
        },
    },
    "stock_br": {
        "GGBR4": {
            "b3_position.quantity": 64,
            "b3_position.average_price": 21.67653445512821,
            "b3_position.total_dividends": 87.05999999999997
        },
        "BBSE3": {
            "b3_position.quantity": 24,
            "b3_position.average_price": 31.71875,
            "b3_position.total_dividends": 99.03
        },
    }
}

const viewsAvailableV2 = {
    "stock_br": {
        "rowViews": [{
            "name": "Carteira",
            "items": ["VALE3", "PETR4", "BBAS3", "WEGE3", "ABCB4", "BBSE3", "CMIG4", "CPFE3", "CXSE3", "FESA4", "GGBR4", "GOAU4", "ISAE4", "ITSA4", "LEVE3", "PRIO3", "RECV3", "RENT3", "ROMI3", "TAEE11", "KLBN4"]
        }, {
            "name": "Radar",
            "items": ["EGIE3", "ENGI11", "EQTL3", "SAPR4", "SBSP3", "BBDC4", "IRBR3", "KLBN4", "NEOE3", "PSSA3", "SUZB3"]
        }],
        "colViews": [{
            "name": "Qualidade",
            "items": ["b3.listagem.setor", "investidor10.cadastral.ano_de_fundacao", "investidor10.cadastral.ano_de_estreia_na_bolsa", "b3.listagem.segmento_de_negociacao", "investidor10.financeiro.patrimonio_liquido", "statusinvest.liquidez_media_diaria", "investidor10.financeiro.free_float", "investidor10.financeiro.tag_along", "statusinvest.div_liq_patri", "statusinvest.liq_corrente", "statusinvest.marg_liquida", "statusinvest.roe", "statusinvest.roic", "statusinvest.derived.ey", "simplywall.earnings_growth", "simplywall.score.past", "simplywall.score.health", "statusinvest.dy", "simplywall.score.dividend"]
        }, {
            "name": "Preço",
            "items": ["b3.listagem.setor", "yahoo.quote.latest", "yahoo.derived.chart.1mo", "yahoo.chart.1y", "yahoo.chart.5y", "statusinvest.p_l", "statusinvest.p_vp", "statusinvest.p_ativos", "statusinvest.p_ebit", "simplywall.score.value"]
        }, {
            "name": "Analistas",
            "items": ["b3.listagem.setor", "yahoo.recom.strong_buy", "yahoo.recom.buy", "yahoo.recom.hold", "yahoo.recom.sell", "yahoo.recom.strong_sell", "yahoo.derived.forecast.min_pct", "yahoo.derived.forecast.avg_pct", "yahoo.derived.forecast.max_pct", "simplywall.score.value", "simplywall.score.future"]
        }, {
            "name": "Rentabilidade",
            "items": ["b3.derived.position.invested_value", "b3.derived.position.current_value", "b3.derived.position.price_variation", "b3.position.total_dividends", "b3.derived.position.total_value", "b3.derived.position.cumulative_return"]
        }, {
            "name": "Posição",
            "items": ["b3.position.quantity", "b3.position.average_price", "b3.derived.position.price_variation", "yahoo.quote.latest", "yahoo.derived.chart.1mo", "yahoo.chart.1y", "yahoo.chart.5y"]
        }]
    }, "reit_br": {
        "rowViews": [{
            "name": "Radar",
            "items": ["KNCR11", "KNIP11", "XPML11", "HGLG11", "BTLG11", "KNRI11"]
        }],
        "colViews": [{
            "name": "Preço",
            "items": ["yahoo.quote.latest", "yahoo.derived.chart.1mo", "yahoo.chart.1y", "yahoo.chart.5y", "fundamentus.p_vp"]
        }, {
            "name": "Fundamentos",
            "items": ["fundamentus.segmento", "fundamentus.liquidez", "fundamentus.qtd_de_imoveis", "fundamentus.vacancia_media", "fundamentus.ffo_yield", "fundamentus.cap_rate", "fundamentus.dividend_yield"]
        }, {
            "name": "Rentabilidade",
            "items": ["b3.derived.position.invested_value", "b3.derived.position.current_value", "b3.derived.position.price_variation", "b3.position.total_dividends", "b3.derived.position.total_value", "b3.derived.position.cumulative_return"]
        }, {
            "name": "Posição",
            "items": ["b3.position.quantity", "b3.position.average_price", "b3.derived.position.price_variation", "yahoo.quote.latest", "yahoo.derived.chart.1mo", "yahoo.chart.1y", "yahoo.chart.5y"]
        }]
    }
}

const positionsV2 = {
    "reit_br": {
        "HGLG11": {
            "b3.position.quantity": 17,
            "b3.position.average_price": 164.53235294117647,
            "b3.position.total_dividends": 463.49999999999983
        },
        "ALZR11": {
            "b3.position.quantity": 420,
            "b3.position.average_price": 11.21859523809524,
            "b3.position.total_dividends": 662.79
        },
    },
    "stock_br": {
        "GGBR4": {
            "b3.position.quantity": 64,
            "b3.position.average_price": 21.67653445512821,
            "b3.position.total_dividends": 87.05999999999997
        },
        "BBSE3": {
            "b3.position.quantity": 24,
            "b3.position.average_price": 31.71875,
            "b3.position.total_dividends": 99.03
        },
    }
}

describe('local-storage', () => {
    window.localStorage.setItem("version", "1");
    window.localStorage.setItem("viewsAvailable", JSON.stringify(viewsAvailableV1));
    window.localStorage.setItem("positions", JSON.stringify(positionsV1));

    test('migrates v1 to v2', () => {
        migrateIfNeeded()
        expect(window.localStorage.getItem("version")).toBe("2");
        expect(window.localStorage.getItem("viewsAvailable")).toBe(JSON.stringify(viewsAvailableV2));
        expect(window.localStorage.getItem("positions")).toBe(JSON.stringify(positionsV2));
    });
});
