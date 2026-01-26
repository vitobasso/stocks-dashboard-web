import {useEffect, useState} from "react";
import {ColList} from "@/lib/views";
import {Field, FieldContent, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ColumnSelector} from "@/components/domain/column-selector";
import ColumnOrderer from "@/components/domain/column-orderer";
import {Label} from "@/lib/metadata/labels";

type Props = {
    allKeys: string[]
    getLabel: (key: string) => Label;
    allListNames: string[]
    listToEdit?: ColList
    onConfirm(colList: ColList): void
    onDelete?: () => void
    open: boolean;
    onOpenChange(open: boolean): void;
}

export function ColListDialog(props: Props) {
    const [name, setName] = useState("");
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        if (props.open) {
            setName(props.listToEdit?.name ?? "");
            setKeys([...(props.listToEdit?.keys ?? [])]);
        }
    }, [props.open, props.listToEdit]);

    function isValid(): boolean {
        const dupName = props.allListNames.filter(n => n !== props.listToEdit?.name).includes(name)
        return !name.trim() || keys.length === 0 || dupName
    }

    function onSubmit() {
        if (!name.trim() || keys.length === 0) return;
        props.onConfirm({name, keys});
        props.onOpenChange(false);
    }

    const isEditing = !!props.listToEdit;
    const title = isEditing ? "Editar lista" : "Criar lista"
    
    return <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="overflow-auto">
            <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <FieldSet className="overflow-auto max-h-[70vh]">
                <Field>
                    <FieldLabel>Nome da lista</FieldLabel>
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
                                allKeys={props.allKeys}
                                getLabel={props.getLabel}
                            />
                            <div className="flex-1/2">
                                <ColumnOrderer
                                    columns={keys}
                                    setColumns={setKeys}
                                    getLabel={props.getLabel}
                                />
                            </div>
                        </div>
                    </FieldContent>
                </Field>
            </FieldSet>
            <DialogFooter>
                {isEditing && (
                    <Button title="Excluir lista" variant="destructive" disabled={props.allListNames.length <= 0}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Tem certeza que deseja excluir a lista "${name}"?`)) {
                                props.onDelete?.();
                                props.onOpenChange(false);
                            }
                        }}>
                        Remover
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
