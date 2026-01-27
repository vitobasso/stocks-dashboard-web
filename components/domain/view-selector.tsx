import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {mapValues, Rec} from "@/lib/utils/records";
import {Button} from "@/components/ui/button";
import {Metadata} from "@/lib/data";
import {viewListCrud, ViewsAvailable, ViewSelection} from "@/lib/views";
import {ViewSelectorTabs} from "@/components/view-selector-tabs";
import {RowListDialog} from "@/components/domain/row-list-dialog";
import {ColListDialog} from "@/components/domain/col-list-dialog";
import {Label} from "@/lib/metadata/labels";

type Props = {
    metadata: Rec<Metadata>
    getLabel: Record<string, (key: string) => Label>;
    setAssetClass: Dispatch<SetStateAction<string | null>>;
    setRows: Dispatch<SetStateAction<string[] | null>>;
    setCols: Dispatch<SetStateAction<string[] | null>>;
};

export function ViewSelector(props: Props) {
    const [viewsAvailable, setViewsAvailable] = useState<Rec<ViewsAvailable> | null>(null);
    const [selection, setSelection] = useState<ViewSelection | null>(null);

    useEffect(() => {
        setViewsAvailable(loadViewsAvailable());
        setSelection(loadSelection());
    }, []);

    useEffect(() => {
        if (viewsAvailable) localStorage.setItem("viewsAvailable", JSON.stringify(viewsAvailable));
    }, [viewsAvailable]);

    useEffect(() => {
        if (selection) localStorage.setItem("viewSelection", JSON.stringify(selection));
    }, [selection]);

    useEffect(() => {
        if (!viewsAvailable || !selection) return;
        const selectedRows = viewsAvailable[selection.assetClass].rowLists
            .find(rl => rl.name === selection.rowListNames[selection.assetClass]);
        const selectedCols = viewsAvailable[selection.assetClass].colLists
            .find(cl => cl.name === selection.colListNames[selection.assetClass]);
        if (!selectedRows || !selectedCols) return;
        props.setAssetClass(selection.assetClass);
        props.setRows(selectedRows.items);
        props.setCols(selectedCols.items);
    }, [viewsAvailable, selection]);

    const assetClasses = Object.keys(props.metadata);
    const crud = viewListCrud(setViewsAvailable, setSelection);

    if (!viewsAvailable || !selection) return null;
    const ac = selection.assetClass;
    return <div className="flex flex-col gap-1">
        <div className="flex gap-1">
            {assetClasses.map(assetClass =>
                <Button
                    key={assetClass} size="sm" className="font-mono text-sm"
                    variant={ac === assetClass ? "default" : "outline"}
                    onClick={() => setSelection({...selection, assetClass})}>
                    {props.getLabel[assetClass](assetClass).short}
                </Button>
            )}
        </div>
        <ViewSelectorTabs
            assetClass={ac} listsAvailable={viewsAvailable[ac].rowLists}
            selected={selection.rowListNames[selection.assetClass]}
            allKeys={props.metadata[ac].tickers}
            getLabel={props.getLabel[ac]}
            onSelect={crud.select("row")}
            onCreate={crud.create("row", ac)}
            onEdit={crud.edit("row", ac)}
            onDelete={crud.delete("row", ac)}
            Dialog={RowListDialog}/>
        <ViewSelectorTabs
            assetClass={ac} listsAvailable={viewsAvailable[ac].colLists}
            selected={selection.colListNames[selection.assetClass]}
            allKeys={props.metadata[ac].schema}
            getLabel={props.getLabel[ac]}
            onSelect={crud.select("col")}
            onCreate={crud.create("col", ac)}
            onEdit={crud.edit("col", ac)}
            onDelete={crud.delete("col", ac)}
            Dialog={ColListDialog}
        />
    </div>;
}

function loadViewsAvailable(): Rec<ViewsAvailable> {
    const stored = typeof window !== 'undefined' ? localStorage.getItem("viewsAvailable") : null;
    return stored ? JSON.parse(stored) : defaultViewsAvailable;
}

function loadSelection(): ViewSelection | null {
    const stored = typeof window !== 'undefined' ? localStorage.getItem("viewSelection") : null;
    return stored ? JSON.parse(stored) : defaultSelection;
}

const defaultViewsAvailable: Rec<ViewsAvailable> = {
    "stock_br": {
        rowLists: [
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
        colLists: [
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
                name: "Recomendação",
                items: ["strong_buy", "buy", "hold", "sell", "strong_sell"].map(s => `yahoo_recom.${s}`)
            },
            {
                name: "Previsão",
                items: ["min_pct", "avg_pct", "max_pct"].map(s => `derived.forecast.${s}`)
            },
        ],
    },
    "reit_br": {
        rowLists: [
            {
                name: "Radar",
                items: ["KNCR11", "KNIP11", "XPML11", "HGLG11", "BTLG11", "KNRI11",],
            },
        ],
        colLists: [
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

const defaultSelection: ViewSelection = {
    assetClass: "stock_br",
    rowListNames: mapValues(defaultViewsAvailable, (v) => v.rowLists[0].name),
    colListNames: mapValues(defaultViewsAvailable, (v) => v.colLists[0].name),
}