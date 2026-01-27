import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Rec} from "@/lib/utils/records";
import {Button} from "@/components/ui/button";
import {Metadata} from "@/lib/data";
import {viewListCrud, ViewsAvailable, ViewSelection} from "@/lib/views";
import {ViewSelectorTabs} from "@/components/view-selector-tabs";
import {RowListDialog} from "@/components/domain/row-list-dialog";
import {ColListDialog} from "@/components/domain/col-list-dialog";
import {Label} from "@/lib/metadata/labels";
import {defaultSelection, defaultViewsAvailable} from "@/lib/metadata/defaults";

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
