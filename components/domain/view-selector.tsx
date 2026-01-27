import React, {Dispatch, SetStateAction, useEffect, useMemo, useState} from "react";
import {Rec, recordOfKeys} from "@/lib/utils/records";
import {Metadata} from "@/lib/data";
import {ViewsAvailable, viewsCrud, ViewSelection} from "@/lib/views";
import {ViewSelectorTabs} from "@/components/domain/view-selector-tabs";
import {RowEditDialog} from "@/components/domain/row-edit-dialog";
import {ColEditDialog} from "@/components/domain/col-edit-dialog";
import {Label} from "@/lib/metadata/labels";
import {defaultSelection, defaultViewsAvailable} from "@/lib/metadata/defaults";
import {consolidateSchema} from "@/lib/schema";
import {RowCreateDialog} from "@/components/domain/row-create-dialog";
import {ColCreateDialog} from "@/components/domain/col-create-dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

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

    const { assetClasses, allKeys } = useMemo(() => {
        if (!props.metadata) return { assetClasses: undefined, allKeys: undefined };
        const assetClasses = Object.keys(props.metadata);
        const allKeys = recordOfKeys(assetClasses, ac => consolidateSchema(props.metadata[ac].schema, ac));
        return { assetClasses, allKeys };
    }, [props.metadata]);

    useEffect(() => {
        if (!viewsAvailable || !selection) return;
        const selectedRows = viewsAvailable[selection.assetClass].rowViews
            .find(rl => rl.name === selection.rowViewNames[selection.assetClass]);
        const selectedCols = viewsAvailable[selection.assetClass].colViews
            .find(cl => cl.name === selection.colViewNames[selection.assetClass]);
        if (!selectedRows || !selectedCols) return;
        props.setAssetClass(selection.assetClass);
        props.setRows(selectedRows.items);
        props.setCols(selectedCols.items);
    }, [viewsAvailable, selection, props]);

    const crud = viewsCrud(setViewsAvailable, setSelection);

    if (!assetClasses || !allKeys || !viewsAvailable || !selection) return null;
    const ac = selection.assetClass;
    return <div className="flex flex-col gap-1">
        <div className="flex gap-1">
            <Select defaultValue={defaultSelection.assetClass}
                    onValueChange={(value) => {
                        setSelection({...selection, assetClass: value});
                        removeFocus();
                    }}>
                <SelectTrigger> <SelectValue placeholder="Classe de Ativo" /> </SelectTrigger>
                <SelectContent side="bottom">
                    {assetClasses.map(assetClass =>
                        <SelectItem key={assetClass} value={assetClass}>
                            {props.getLabel[assetClass](assetClass).short}
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
        <ViewSelectorTabs
            assetClass={ac} viewsAvailable={viewsAvailable[ac].rowViews}
            selected={selection.rowViewNames[selection.assetClass]}
            allKeys={props.metadata[ac].tickers}
            getLabel={props.getLabel[ac]}
            onSelect={crud.select("row")}
            onCreate={crud.create("row", ac)}
            onEdit={crud.edit("row", ac)}
            onDelete={crud.delete("row", ac)}
            CreateDialog={RowCreateDialog}
            EditDialog={RowEditDialog}
        />
        <ViewSelectorTabs
            assetClass={ac} viewsAvailable={viewsAvailable[ac].colViews}
            selected={selection.colViewNames[selection.assetClass]}
            allKeys={allKeys[ac]}
            getLabel={props.getLabel[ac]}
            onSelect={crud.select("col")}
            onCreate={crud.create("col", ac)}
            onEdit={crud.edit("col", ac)}
            onDelete={crud.delete("col", ac)}
            CreateDialog={ColCreateDialog}
            EditDialog={ColEditDialog}
        />
    </div>;
}

function removeFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) activeElement.blur();
}

function loadViewsAvailable(): Rec<ViewsAvailable> {
    const stored = typeof window !== 'undefined' ? localStorage.getItem("viewsAvailable") : null;
    return stored ? JSON.parse(stored) : defaultViewsAvailable;
}

function loadSelection(): ViewSelection | null {
    const stored = typeof window !== 'undefined' ? localStorage.getItem("viewSelection") : null;
    return stored ? JSON.parse(stored) : defaultSelection;
}
