import {useEffect, useRef, useState} from "react";
import {RowView} from "@/lib/views/views";
import {RowSelector} from "@/components/features/views/row-selector";
import {Field, FieldContent, FieldSet} from "@/components/ui/field";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {EditableTitle} from "@/components/ui/editable-title";

type Props = {
    allItems: string[]
    allViewNames: string[]
    viewToEdit?: RowView
    onConfirm(view: RowView): void
    onDelete?: () => void
    open: boolean;
    onOpenChange(open: boolean): void;
}

export function RowEditDialog(props: Props) {
    const [name, setName] = useState("");
    const [tickers, setTickers] = useState<string[]>([]);
    const rowSelectorRef = useRef<HTMLInputElement>(null);

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

    return <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent aria-describedby={undefined}>
            <DialogHeader>
                    <DialogTitle>
                        <EditableTitle 
                            title={name} 
                            onTitleChange={setName}
                            onEnter={() => rowSelectorRef.current?.focus()}
                            className="text-lg md:text-lg font-semibold"
                        />
                    </DialogTitle>
            </DialogHeader>
            <FieldSet>
                <Field>
                    <FieldContent>
                        <RowSelector allTickers={props.allItems} rows={tickers} setRows={setTickers}
                                     autoFocus ref={rowSelectorRef}/>
                    </FieldContent>
                </Field>
            </FieldSet>
            <DialogFooter>
                <Button title={`Excluir a lista de ativos "${name}"`} variant="destructive" disabled={props.allViewNames.length <= 0}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Tem certeza que deseja excluir a lista de ativos "${name}"?`)) {
                            props.onDelete?.();
                            props.onOpenChange(false);
                        }
                    }}>
                    Excluir
                </Button>
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
