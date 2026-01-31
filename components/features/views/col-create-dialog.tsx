import {useEffect, useState} from "react";
import {ColView} from "@/lib/views/views";
import {Field, FieldContent, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ColumnSelector} from "@/components/features/views/column-selector";
import ColumnOrderer from "@/components/features/views/column-orderer";
import {Label} from "@/lib/metadata/labels";

type Props = {
    allItems: string[]
    labeler: (key: string) => Label;
    allViewNames: string[]
    onConfirm(view: ColView): void
    open: boolean;
    onOpenChange(open: boolean): void;
}

export function ColCreateDialog(props: Props) {
    const [name, setName] = useState("");
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => { if (props.open) resetForm() }, [props.open])
    function resetForm() {
        setName("")
        setKeys([])
    }

    function isValid(): boolean {
        const dupName = props.allViewNames.includes(name)
        return !name.trim() || keys.length === 0 || dupName
    }

    function onSubmit() {
        if (!name.trim() || keys.length === 0) return;
        props.onConfirm({name, items: keys});
        props.onOpenChange(false);
    }

    return <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent aria-describedby={undefined}>
            <DialogHeader>
                    <DialogTitle>Nova lupa</DialogTitle>
            </DialogHeader>
            <FieldSet className="overflow-auto max-h-[70vh]">
                <Field>
                    <FieldLabel>Nome</FieldLabel>
                    <FieldContent>
                        <Input required value={name} onChange={(e) => setName(e.target.value)}/>
                    </FieldContent>
                </Field>
                <Field>
                    <FieldLabel>Colunas</FieldLabel>
                    <FieldContent>
                        <div className="flex justify-between gap-4">
                            <ColumnSelector
                                columns={keys}
                                setColumns={setKeys}
                                allKeys={props.allItems}
                                labeler={props.labeler}
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
