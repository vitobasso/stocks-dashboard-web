import React, {Dispatch, SetStateAction, useEffect, useMemo, useState} from "react";
import {Rec, recordOfKeys} from "@/lib/utils/records";
import {Button} from "@/components/ui/button";
import {Metadata} from "@/lib/data";
import {ViewsAvailable, viewsCrud, ViewSelection} from "@/lib/views/views";
import {ViewSelectorTabs} from "@/components/features/views/view-selector-tabs";
import {RowEditDialog} from "@/components/features/views/row-edit-dialog";
import {ColEditDialog} from "@/components/features/views/col-edit-dialog";
import {Label} from "@/lib/metadata/labels";
import {consolidateSchema} from "@/lib/schema";
import {RowCreateDialog} from "@/components/features/views/row-create-dialog";
import {ColCreateDialog} from "@/components/features/views/col-create-dialog";
import {flattenUnique} from "@/lib/utils/collections";
import {arraysEq} from "@/lib/utils/strings";
import {loadViewsAvailable, loadViewSelection, saveViewsAvailable, saveViewSelection} from "@/lib/local-storage/local-storage";

type Props = {
    metadata: Rec<Metadata>
    labeler: Record<string, (key: string) => Label>;
    setAssetClass: Dispatch<SetStateAction<string | null>>;
    setRows: Dispatch<SetStateAction<string[] | null>>;
    setCols: Dispatch<SetStateAction<string[] | null>>;
};

export function ViewSelector(props: Props) {
    const [viewsAvailable, setViewsAvailable] = useState<Rec<ViewsAvailable>>(loadViewsAvailable());
    const [selection, setSelection] = useState<ViewSelection>(loadViewSelection());

    useEffect(() => {
        if (viewsAvailable) saveViewsAvailable(viewsAvailable);
    }, [viewsAvailable]);

    useEffect(() => {
        if (selection) saveViewSelection(selection);
    }, [selection]);

    const { assetClasses, allKeys } = useMemo(() => {
        if (!props.metadata) return { assetClasses: undefined, allKeys: undefined };
        const assetClasses = Object.keys(props.metadata);
        const allKeys = recordOfKeys(assetClasses, ac => consolidateSchema(props.metadata[ac].schema, ac));
        return { assetClasses, allKeys };
    }, [props.metadata]);

    const { setAssetClass, setRows, setCols } = props;

    useEffect(() => {
        if (!viewsAvailable || !selection) return;
        const ac = selection.assetClass;
        setAssetClass(prevAc => prevAc === ac ? prevAc : ac);

        const selectedRows = selection.rowViewNames[ac]
            .map(n => viewsAvailable[ac].rowViews.find(v => v.name === n)!)
            .map(v => v.items);
        const newRows = flattenUnique(selectedRows);
        setRows(prevRows => prevRows && arraysEq(prevRows, newRows) ? prevRows : newRows);

        const selectedCols = selection.colViewNames[ac]
            .map(n => viewsAvailable[ac].colViews.find(v => v.name === n)!)
            .map(v => v.items);
        const newCols = flattenUnique(selectedCols);
        setCols(prevCols => prevCols && arraysEq(prevCols, newCols) ? prevCols : newCols);
    }, [viewsAvailable, selection, setAssetClass, setRows, setCols]);

    const crud = viewsCrud(setViewsAvailable, setSelection);

    if (!assetClasses || !allKeys || !viewsAvailable || !selection) return null;
    const ac = selection.assetClass;
    return <div className="flex flex-col gap-1">
        <div className="flex gap-1">
            {assetClasses.map(assetClass =>
                <Button
                    key={assetClass} size="sm" className="font-mono text-sm"
                    variant={ac === assetClass ? "default" : "outline"}
                    onClick={() => setSelection({...selection, assetClass})}>
                    {props.labeler[assetClass](assetClass).short}
                </Button>
            )}
        </div>
        <ViewSelectorTabs
            assetClass={ac} viewsAvailable={viewsAvailable[ac].rowViews}
            selected={selection.rowViewNames[selection.assetClass]}
            allKeys={props.metadata[ac].tickers}
            labeler={props.labeler[ac]}
            onSelectSingle={crud.selectSingle("row")}
            onSelectToggle={crud.selectToggle("row")}
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
            labeler={props.labeler[ac]}
            onSelectSingle={crud.selectSingle("col")}
            onSelectToggle={crud.selectToggle("col")}
            onCreate={crud.create("col", ac)}
            onEdit={crud.edit("col", ac)}
            onDelete={crud.delete("col", ac)}
            CreateDialog={ColCreateDialog}
            EditDialog={ColEditDialog}
        />
    </div>;
}
