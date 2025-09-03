import * as React from "react"

import {cn} from "@/lib/utils"

function Input({className, type, ...props}: React.ComponentProps<"input">) {
    const base = `
  flex h-9 w-full min-w-0 rounded-md bg-input border
  px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm
  dark:bg-input/30
`
    const placeholder = "placeholder:text-muted-foreground"
    const selection = "selection:bg-primary selection:text-primary-foreground"
    const file = "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium"
    const disabled = "disabled:bg-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
    const focus = "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
    const invalid = "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"


    return (
        <input type={type} data-slot="input"
            className={cn(base, placeholder, selection, file, disabled, focus, invalid, className)}
            {...props}
        />
    )
}

export {Input}
