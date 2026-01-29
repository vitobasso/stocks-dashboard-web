import {useEffect, useState} from "react";
import {RowView} from "@/lib/views/views";
import {RowSelector} from "@/components/features/views/row-selector";
import {Field, FieldContent, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

type Props = {
    allItems: string[]
    allViewNames: string[]
    onConfirm(view: RowView): void
    open: boolean;
    onOpenChange(open: boolean): void;
}

export function RowCreateDialog(props: Props) {
    const [name, setName] = useState("");
    const [tickers, setTickers] = useState<string[]>([]);

    useEffect(() => { if (props.open) resetForm() }, [props.open])
    function resetForm() {
        setName("")
        setTickers([])
    }

    function isValid(): boolean {
        const dupName = props.allViewNames.includes(name)
        return !name.trim() || tickers.length === 0 || dupName
    }

    function onSubmit() {
        if (!name.trim() || tickers.length === 0) return;
        props.onConfirm({name, items: tickers});
        props.onOpenChange(false);
    }

    return <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Nova lista</DialogTitle>
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
