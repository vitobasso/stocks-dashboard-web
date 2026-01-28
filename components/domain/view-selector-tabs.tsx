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
    selected: string[]
    allKeys: string[]
    getLabel: (key: string) => Label;
    onSelectSingle: (name: string) => void
    onSelectToggle: (name: string) => void
    onCreate: (view: T) => void
    onEdit: (oldName: string, view: T) => void
    onDelete: (name: string) => void
    CreateDialog: React.ComponentType<{
        allItems: string[]
        allViewNames: string[]
        getLabel: (key: string) => Label;
        onConfirm(view: T): void
        open: boolean;
        onOpenChange(open: boolean): void;
    }>,
    EditDialog: React.ComponentType<{
        allItems: string[]
        allViewNames: string[]
        getLabel: (key: string) => Label;
        viewToEdit?: T
        onConfirm(view: T): void
        onDelete?: () => void
        open: boolean;
        onOpenChange(open: boolean): void;
    }>,
}

export function ViewSelectorTabs<T extends RowView | ColView>(props: Props<T>) {

    const [openPanel, setOpenPanel] = useState<string | null>(null)
    const close = useCallback(() => setOpenPanel(null), [setOpenPanel])
    const inherit = cn("bg-transparent text-inherit shadow-none",
        "hover:bg-transparent hover:text-inherit focus-visible:ring-0")
    const buttonLike = cn("border-2 ring-1 rounded-md shadow-sm transition-colors",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:outline-0")
    const primaryVariant = "bg-primary text-primary-foreground ring-primary border-primary"
    const outlineVariant = cn("bg-background ring-border border-background",
        "hover:bg-accent hover:border-accent hover:text-accent-foreground",
        "dark:hover:bg-input/50")

    return <div className={cn("flex items-center gap-2", props.className)}>
        {props.viewsAvailable.map((view, i) =>
            <ButtonGroup key={i} tabIndex={0}
                         className={cn("group h-7.5 px-1.5 overflow-hidden", buttonLike,
                             props.selected.includes(view.name) ? primaryVariant : outlineVariant)}
                         onKeyDown={(e) => {
                             if (e.key === "Enter" || e.key === " ") {
                                 e.shiftKey? props.onSelectToggle(view.name) : props.onSelectSingle(view.name)
                             }
                         }}>
                <Button size="sm" tabIndex={-1}
                        className={cn("p-1 h-full", inherit)}
                        onClick={(e) =>
                            e.shiftKey ? props.onSelectToggle(view.name) : props.onSelectSingle(view.name)}>
                    {view.name}
                </Button>
                <Button size="sm" tabIndex={-1}
                        className={cn("w-0 !px-1 h-full", inherit)}
                        onClick={(e) => {
                            setOpenPanel(`row-${view.name}`);
                        }}>
                    <EllipsisVerticalIcon className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Button>
                <props.EditDialog
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
        <props.CreateDialog
            open={openPanel === "row-create"}
            onOpenChange={(o) => !o && close()}
            allItems={props.allKeys}
            getLabel={props.getLabel}
            allViewNames={props.viewsAvailable.map(l => l.name)}
            onConfirm={props.onCreate}/>
    </div>
}