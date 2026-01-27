import {useEffect, useState} from "react";
import {RowView} from "@/lib/views";
import {RowSelector} from "@/components/domain/row-selector";
import {Field, FieldContent, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

type Props = {
    allItems: string[]
    allViewNames: string[]
    viewToEdit?: RowView
    onConfirm(view: RowView): void
    onDelete?: () => void
    open: boolean;
    onOpenChange(open: boolean): void;
}

export function RowViewDialog(props: Props) {
    const [name, setName] = useState("");
    const [tickers, setTickers] = useState<string[]>([]);

    useEffect(() => {
        if (props.open) {
            setName(props.viewToEdit?.name ?? "");
            setTickers([...(props.viewToEdit?.items ?? [])]);
        }
    }, [props.open, props.viewToEdit]);

    function isValid(): boolean {
        const dupName = props.allViewNames.filter(n => n !== props.viewToEdit?.name).includes(name)
        return !name.trim() || tickers.length === 0 || dupName
    }

    function onSubmit() {
        if (!name.trim() || tickers.length === 0) return;
        props.onConfirm({name, items: tickers});
        props.onOpenChange(false);
    }

    const isEditing = !!props.viewToEdit;
    const title = isEditing ? "Editar lista" : "Criar lista"
    
    return <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent>
            <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <FieldSet>
                <Field>
                    <FieldLabel>Nome</FieldLabel>
                    <FieldContent>
                        <Input required value={name} onChange={(e) => setName(e.target.value)}/>
                    </FieldContent>
                </Field>
                <Field>
                    <FieldLabel>Ativos</FieldLabel>
                    <FieldContent>
                        <RowSelector allTickers={props.allItems} rows={tickers} setRows={setTickers}/>
                    </FieldContent>
                </Field>
            </FieldSet>
            <DialogFooter>
                {isEditing && (
                    <Button title="Excluir lista" variant="destructive" disabled={props.allViewNames.length <= 0}
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
