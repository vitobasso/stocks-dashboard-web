import {ButtonGroup} from "@/components/ui/button-group";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {EllipsisVerticalIcon, PlusIcon} from "lucide-react";
import React, {useCallback, useState} from "react";
import {ColView, RowView} from "@/lib/views";
import {Label} from "@/lib/metadata/labels";

type Props<T extends RowView | ColView> = {
    className?: string;
    assetClass: string;
    viewsAvailable: T[]
    selected: string
    allKeys: string[]
    getLabel: (key: string) => Label;
    onSelect: (name: string) => void
    onCreate: (view: T) => void
    onEdit: (oldName: string, view: T) => void
    onDelete: (name: string) => void
    Dialog: React.ComponentType<{
        allItems: string[]
        allViewNames: string[]
        getLabel: (key: string) => Label;
        viewToEdit?: T
        onConfirm(view: T): void
        onDelete?: () => void
        open: boolean;
        onOpenChange(open: boolean): void;
    }>
}

export function ViewSelectorTabs<T extends RowView | ColView>(props: Props<T>) {

    const [openPanel, setOpenPanel] = useState<string | null>(null)
    const close = useCallback(() => setOpenPanel(null), [setOpenPanel])

    return <div className={cn("flex items-center gap-2", props.className)}>
        {props.viewsAvailable.map((view, i) =>
            <ButtonGroup key={i}
                         className={cn(
                             "group h-7.5 px-2 overflow-hidden rounded-md shadow-sm transition-colors",
                             props.selected == view.name
                                 ? "bg-primary text-primary-foreground ring-1 ring-primary"
                                 : "bg-transparent ring-1 ring-border hover:bg-accent hover:text-accent-foreground"
                         )}>
                <Button size="sm"
                        variant="ghost"
                        className="p-1 h-full bg-inherit hover:bg-inherit text-inherit hover:text-inherit"
                        onClick={() => props.onSelect(view.name)}>
                    {view.name}
                </Button>
                <Button size="sm"
                        variant="ghost"
                        className="w-0 !px-1 h-full bg-inherit hover:bg-inherit text-inherit hover:text-inherit"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenPanel(`row-${view.name}`);
                        }}>
                    <EllipsisVerticalIcon className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Button>
                <props.Dialog
                    open={openPanel === `row-${view.name}`}
                    onOpenChange={(o) => !o && close()}
                    viewToEdit={view}
                    allItems={props.allKeys}
                    getLabel={props.getLabel}
                    allViewNames={props.viewsAvailable.map(l => l.name)}
                    onConfirm={updated => props.onEdit(view.name, updated)}
                    onDelete={() => props.onDelete(view.name)}/>
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
            allItems={props.allKeys}
            getLabel={props.getLabel}
            allViewNames={props.viewsAvailable.map(l => l.name)}
            onConfirm={props.onCreate}/>
    </div>
}