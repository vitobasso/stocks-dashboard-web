import {ButtonGroup} from "@/components/ui/button-group";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {EllipsisVerticalIcon, PlusIcon} from "lucide-react";
import React, {useCallback, useState} from "react";
import {ColList, RowList} from "@/lib/views";

type Props<T extends RowList | ColList> = {
    assetClass: string;
    listsAvailable: T[]
    selected: string
    allKeys: string[]
    onSelect: (name: string) => void
    onCreate: (list: T) => void
    onEdit: (oldName: string, list: T) => void
    onDelete: (name: string) => void
    Dialog: React.ComponentType<{
        allKeys: string[]
        allListNames: string[]
        listToEdit?: T
        onConfirm(list: T): void
        onDelete?: () => void
        open: boolean;
        onOpenChange(open: boolean): void;
    }>
}

export function ViewSelectorTabs<T extends RowList | ColList>(props: Props<T>) {

    const [openPanel, setOpenPanel] = useState<string | null>(null)
    const close = useCallback(() => setOpenPanel(null), [setOpenPanel])

    return <div className="flex items-center gap-2">
        {props.listsAvailable.map((list, i) =>
            <ButtonGroup key={i}
                         className={cn(
                             "group h-7.5 px-2 overflow-hidden rounded-md shadow-sm transition-colors",
                             props.selected == list.name
                                 ? "bg-primary text-primary-foreground ring-1 ring-primary"
                                 : "bg-transparent ring-1 ring-border hover:bg-accent hover:text-accent-foreground"
                         )}>
                <Button size="sm"
                        variant="ghost"
                        className="p-1 h-full bg-inherit hover:bg-inherit text-inherit hover:text-inherit"
                        onClick={() => props.onSelect(list.name)}>
                    {list.name}
                </Button>
                <Button size="sm"
                        variant="ghost"
                        className="w-0 !px-1 h-full bg-inherit hover:bg-inherit text-inherit hover:text-inherit"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenPanel(`row-${list.name}`);
                        }}>
                    <EllipsisVerticalIcon className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Button>
                <props.Dialog
                    open={openPanel === `row-${list.name}`}
                    onOpenChange={(o) => !o && close()}
                    listToEdit={list}
                    allKeys={props.allKeys}
                    allListNames={props.listsAvailable.map(l => l.name)}
                    onConfirm={list => props.onEdit(list.name, list)}
                    onDelete={() => props.onDelete(list.name)}/>
            </ButtonGroup>
        )}
        <Button size="sm" variant="outline"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenPanel("row-create");
                }}>
            <PlusIcon className="w-0"/>
        </Button>
        <props.Dialog
            open={openPanel === "row-create"}
            onOpenChange={(o) => !o && close()}
            allKeys={props.allKeys}
            allListNames={props.listsAvailable.map(l => l.name)}
            onConfirm={props.onCreate}/>
    </div>
}