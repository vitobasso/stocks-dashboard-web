"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import {CheckIcon, MinusIcon} from "lucide-react"

import {cn} from "@/lib/utils"

function Checkbox({className, ...props}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    const base = "peer group inline-flex items-center justify-center size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
    const stateChecked = "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary"
    const stateIndeterminate = "data-[state=indeterminate]:bg-primary dark:data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary dark:data-[state=indeterminate]:border-primary"
    const focusValidation = "focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"

    return (
        <CheckboxPrimitive.Root data-slot="checkbox" asChild {...props}>
            <div className={cn(base, stateChecked, stateIndeterminate, focusValidation, className)}>
                <CheckboxPrimitive.Indicator data-slot="checkbox-indicator"
                                             className="flex items-center justify-center text-current transition-none">
                    <CheckIcon className="size-3.5 group-data-[state=indeterminate]:hidden"/>
                    <MinusIcon
                        className="size-3.5 hidden group-data-[state=indeterminate]:block group-data-[state=checked]:hidden"/>
                </CheckboxPrimitive.Indicator>
            </div>
        </CheckboxPrimitive.Root>
    )
}

export {Checkbox}
