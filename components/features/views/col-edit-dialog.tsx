import {useEffect, useRef, useState} from "react";
import {ColView} from "@/lib/views/views";
import {Field, FieldContent, FieldLabel, FieldSet} from "@/components/ui/field";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ColumnSelector} from "@/components/features/views/column-selector";
import ColumnOrderer from "@/components/features/views/column-orderer";
import {Label} from "@/lib/metadata/labels";
import {EditableTitle} from "@/components/ui/editable-title";

type Props = {
    allItems: string[]
    labeler: (key: string) => Label;
    allViewNames: string[]
    viewToEdit?: ColView
    onConfirm(view: ColView): void
    onDelete?: () => void
    open: boolean;
    onOpenChange(open: boolean): void;
}

export function ColEditDialog(props: Props) {
    const [name, setName] = useState(props.viewToEdit?.name ?? "");
    const [keys, setKeys] = useState<string[]>([...(props.viewToEdit?.items ?? [])]);
    const colSelectorRef = useRef<HTMLInputElement>(null);

    const [prevOpen, setPrevOpen] = useState(props.open);
    if (props.open !== prevOpen) {
        setPrevOpen(props.open);
        if (props.open) {
            setName(props.viewToEdit?.name ?? "")
            setKeys([...(props.viewToEdit?.items ?? [])])
        }
    }

    function isValid(): boolean {
        const dupName = props.allViewNames.filter(n => n !== props.viewToEdit?.name).includes(name)
        return !name.trim() || keys.length === 0 || dupName
    }

    function onSubmit() {
        if (!name.trim() || keys.length === 0) return;
        props.onConfirm({name, items: keys});
        props.onOpenChange(false);
    }

    const isEditing = !!props.viewToEdit;

    return <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent aria-describedby={undefined}>
            <DialogHeader>
                    <DialogTitle>
                        <EditableTitle
                            title={name}
                            onTitleChange={setName}
                            onEnter={() => colSelectorRef.current?.focus()}
                            className="text-lg md:text-lg font-semibold"
                        />
                    </DialogTitle>
            </DialogHeader>
            <FieldSet className="overflow-auto max-h-[70vh]">
                <Field>
                    <FieldLabel>Colunas</FieldLabel>
                    <FieldContent>
                        <div className="flex justify-between gap-4">
                            <ColumnSelector
                                columns={keys}
                                setColumns={setKeys}
                                allKeys={props.allItems}
                                labeler={props.labeler}
                                autoFocus ref={colSelectorRef}
                            />
                            <div className="flex-1/2">
                                <ColumnOrderer
                                    columns={keys}
                                    setColumns={setKeys}
                                    labeler={props.labeler}
                                />
                            </div>
                        </div>
                    </FieldContent>
                </Field>
            </FieldSet>
            <DialogFooter>
                {isEditing && (
                    <Button title={`Excluir a lupa "${name}"`} variant="destructive" disabled={props.allViewNames.length <= 0}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Tem certeza que deseja excluir a lupa "${name}"?`)) {
                                props.onDelete?.();
                                props.onOpenChange(false);
                            }
                        }}>
                        Excluir
                    </Button>
                )}
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" onClick={onSubmit} disabled={isValid()}>
                    Confirmar
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}
