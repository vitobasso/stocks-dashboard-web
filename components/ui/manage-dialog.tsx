import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Settings} from "lucide-react"
import {Header} from "@/components/ui/ticker-grid";
import {ManageDialogRows} from "@/components/ui/manage-dialog-rows";
import {ManageDialogCols} from "@/components/ui/manage-dialog-cols";

type Props = {
    tickers: string[]
    setTickers(tickers: string[]): void
    headers: Header[]
    setHeaders(headers: Header[]): void
}

export function ManageDialog(props: Props) {
    return <Dialog>
        <form>
            <DialogTrigger asChild>
                <Button variant="ghost"><Settings/></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Manage Table</DialogTitle>
                </DialogHeader>
                <div className="flex justify-between">
                    <ManageDialogRows style={{ flex: '0.1 1 auto' }} tickers={props.tickers} setTickers={props.setTickers} />
                    <ManageDialogCols style={{ flex: '1 1 auto' }} headers={props.headers} setHeaders={props.setHeaders} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </form>
    </Dialog>
}
