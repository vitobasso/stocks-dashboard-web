import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"
import {Settings} from "lucide-react"
import {RowSelector} from "@/components/domain/row-selector";
import React from "react";
import {Data} from "@/lib/data";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import PositionsImporter from "@/components/domain/positions-importer";
import {Header} from "@/lib/metadata/defaults";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import HeaderOrderer from "@/components/domain/header-orderer";
import {HeaderSelector} from "@/components/domain/header-selector";

type Props = {
    allKeys: string[]
    tickers: string[]
    headers: Header[]
    setTickers(tickers: string[]): void
    setHeaders(headers: Header[]): void
    setPositions(positions: Data): void
}

export function ManageDialog(props: Props) {
    return <Dialog>
        <DialogTrigger className="left-0" asChild>
            <Settings className="size-8 p-1"/>
        </DialogTrigger>
        <DialogContent className="sm:max-w-200 h-160">
            <VisuallyHidden><DialogHeader><DialogTitle></DialogTitle></DialogHeader></VisuallyHidden>
            <Tabs defaultValue="rows">
                <div className="flex justify-start gap-4">
                    <div className="text-lg font-semibold">Customizar</div>
                    <TabsList>
                        <TabsTrigger value="rows">Linhas</TabsTrigger>
                        <TabsTrigger value="cols">Colunas</TabsTrigger>
                        <TabsTrigger value="local-data">Importar</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="rows">
                    <RowSelector {...props}/>
                </TabsContent>
                <TabsContent value="cols">
                    <div className="flex justify-between">
                        <div className="flex-1/3 max-h-133 overflow-auto">
                            <HeaderOrderer {...props} />
                        </div>
                        <HeaderSelector {...props}/>
                    </div>
                </TabsContent>
                <TabsContent value="local-data">
                    <PositionsImporter {...props}/>
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
}
