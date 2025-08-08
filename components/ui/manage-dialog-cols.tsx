import {Button} from "@/components/ui/button"
import {XIcon} from "lucide-react"
import {CSSProperties} from "react";
import {Header} from "@/components/ui/ticker-grid";
import {DialogDescription} from "@/components/ui/dialog";

type Props = {
    headers: Header[]
    setHeaders(headers: Header[]): void
    className?: string
    style?: CSSProperties
}

export function ManageDialogCols(props: Props) {

    function removeHeader(group: string, key: string) {
        let i: number = props.headers.findIndex((h => h[0] == group));
        let updatedKeys: string[] = props.headers[i][1]?.filter(k => k !== key);
        let updatedHeaders: Header[] = [...props.headers.slice(0, i), [group, updatedKeys], ...props.headers.slice(i + 1)];
        props.setHeaders(updatedHeaders);
    }

    return <div className={props.className} style={{...props.style}}>
        <DialogDescription className="mb-6">
            Columns
        </DialogDescription>
        <div className="dialog max-h-120 overflow-y-auto">
            <ul className="w-full">
                {props.headers.map(([group, keys]) => (
                    <li key={group} className="mt-2">
                        <span  className="font-bold"> {group} </span>
                        <ul className="w-full">
                            {keys.map(key => (
                                <li key={key} className="flex w-full justify-between font-mono">
                                    <span>{key}</span>
                                    <Button variant="ghost" className="size-7"
                                            onClick={() => removeHeader(group, key)}>
                                        <XIcon/>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    </div>
}
