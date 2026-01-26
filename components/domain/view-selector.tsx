import React, {useCallback, useEffect, useState} from "react";
import {mapValues, Rec} from "@/lib/utils/records";
import {EllipsisVerticalIcon, PlusIcon} from "lucide-react";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {Metadata} from "@/lib/data";
import {RowList, ViewsAvailable, ViewSelection} from "@/lib/views";
import {RowListDialog} from "@/components/domain/row-list-dialog";
import {cn} from "@/lib/utils";

type Props = {
    metadata: Rec<Metadata>
    getLabel: Record<string, (key: string) => { short: string }>;
    setAssetClass: React.Dispatch<React.SetStateAction<string | null>>;
    setRows: React.Dispatch<React.SetStateAction<string[] | null>>;
};

export function ViewSelector(props: Props) {
    const [viewsAvailable, setViewsAvailable] = useState<Rec<ViewsAvailable> | null>(null);
    const [selection, setSelection] = useState<ViewSelection | null>(null);
    const [openPanel, setOpenPanel] = useState<string | null>(null)

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
        const selectedList = viewsAvailable[selection.assetClass].rowLists
            .find(rl => rl.name === selection.rowListNames[selection.assetClass]);
        if (!selectedList) return;
        props.setAssetClass(selection.assetClass);
        props.setRows(selectedList.tickers);
    }, [viewsAvailable, selection]);

    const assetClasses = Object.keys(props.metadata);
    const close = useCallback(() => setOpenPanel(null), [setOpenPanel])

    const createRowList = (ac: string) => (rowList: RowList) => {
        setViewsAvailable(prev => addAvailableRowList(prev, ac, rowList));
        setSelection(prev => changeSelectedRowList(prev, rowList.name));
    }

    const editRowList = (ac: string, oldName: string) => (updated: RowList) => {
        setViewsAvailable(prev => changeAvailableRowList(prev, ac, oldName, updated));
        if (updated.name !== oldName) setSelection(prev => changeSelectedRowList(prev, updated.name));
    }

    const deleteRowList = (ac: string, listName: string) => {
        setViewsAvailable(prev => {
            if (!prev) return prev;
            const newLists = prev[ac].rowLists.filter(list => list.name !== listName);
            if (newLists.length === 0) return prev; // Don't delete if it's the last list

            // If the deleted list was selected, select the first available list
            if (selection?.rowListNames[ac] === listName) {
                setSelection(prev => changeSelectedRowList(prev, newLists[0].name))
            }

            return {...prev, [ac]: {...prev[ac], rowLists: newLists}};
        });
    }

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
        <div className="flex items-center gap-2">
            {viewsAvailable[ac].rowLists.map((list, i) =>
                <ButtonGroup key={`${ac}-${i}`}
                             className={cn(
                               "group h-7.5 px-2 overflow-hidden rounded-md shadow-sm transition-colors",
                               isRowListSelected(list, selection)
                                 ? "bg-primary text-primary-foreground ring-1 ring-primary"
                                 : "bg-transparent ring-1 ring-border hover:bg-accent hover:text-accent-foreground"
                             )}>
                    <Button size="sm"
                            variant="ghost"
                            className="p-1 h-full bg-inherit hover:bg-inherit text-inherit hover:text-inherit"
                            onClick={() => setSelection(prev => changeSelectedRowList(prev, list.name))}>
                        {list.name}
                    </Button>
                    <Button size="sm"
                            variant="ghost"
                            className="w-0 !px-1 h-full bg-inherit hover:bg-inherit text-inherit hover:text-inherit"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenPanel(`${ac}-row-${list.name}`);
                            }}>
                        <EllipsisVerticalIcon className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </Button>
                    <RowListDialog
                        open={openPanel === `${ac}-row-${list.name}`}
                        onOpenChange={(o) => !o && close()}
                        rowListToEdit={list}
                        allTickers={props.metadata[ac].tickers}
                        allRowListNames={viewsAvailable[ac].rowLists.map(l => l.name)}
                        onConfirm={editRowList(ac, list.name)}
                        onDelete={() => deleteRowList(ac, list.name)}/>
                </ButtonGroup>
            )}
            <Button size="sm" variant="outline"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenPanel(`${ac}-row-create`);
                    }}>
                <PlusIcon className="w-0"/>
            </Button>
            <RowListDialog
                open={openPanel === `${ac}-row-create`}
                onOpenChange={(o) => !o && close()}
                allTickers={props.metadata[ac].tickers}
                allRowListNames={viewsAvailable[ac].rowLists.map(l => l.name)}
                onConfirm={createRowList(ac)}/>
        </div>
    </div>;
}

function isRowListSelected(list: RowList, selection: ViewSelection,): boolean {
    return selection.rowListNames[selection.assetClass] === list.name
}

function changeSelectedRowList(prev: ViewSelection | null, listName: string): ViewSelection | null {
    if (!prev) return prev;
    return {...prev, rowListNames: {...prev.rowListNames, [prev.assetClass]: listName}};
}

function changeAvailableRowList(prev: Rec<ViewsAvailable> | null, ac: string, oldName: string, rowList: RowList): Rec<ViewsAvailable> | null {
    if (!prev) return prev;
    return {
        ...prev,
        [ac]: {
            ...prev[ac],
            rowLists: prev[ac].rowLists.map(list => list.name === oldName ? rowList : list),
        }
    };
}

function addAvailableRowList(prev: Rec<ViewsAvailable> | null, ac: string, newRowList: RowList): Rec<ViewsAvailable> | null {
    if (!prev) return prev;
    return {
        ...prev,
        [ac]: {
            ...prev[ac],
            rowLists: [...prev[ac].rowLists, newRowList],
        }
    };
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
                tickers: ["ITUB4", "BBDC4", "VALE3", "PETR4", "ABEV3", "BBAS3", "B3SA3", "WEGE3"],
            },
            {
                name: "Elétricas e Saneamento",
                tickers: ["CMIG4", "CPFE3", "EGIE3", "ENGI11", "EQTL3", "ISAE4", "NEOE3", "SAPR4", "SBSP3"],
            },
            {
                name: "Bancos e Seguradoras",
                tickers: ["BBAS3", "BBDC4", "ITSA$", "ITUB4", "BBSE3", "CXSE3"],
            },
            {
                name: "Comodities",
                tickers: ["PETR4", "VALE3", "GOAU4", "PRIO3", "RECV3", "SUZB3", "KLBN4"],
            },
        ]
    },
    "reit_br": {
        rowLists: [
            {
                name: "Radar",
                tickers: ["KNCR11", "KNIP11", "XPML11", "HGLG11", "BTLG11", "KNRI11",],
            },
        ]
    },
}

const defaultSelection: ViewSelection = {
    assetClass: "stock_br",
    rowListNames: mapValues(defaultViewsAvailable, (v) => v.rowLists[0].name)
}