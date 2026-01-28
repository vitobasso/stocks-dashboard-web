"use client"

import * as React from "react"
import {cn} from "@/lib/utils"
import {useCallback} from "react";

export type FabPosition = "br" | "bl" | "tr" | "tl"

export type FabProps = {
  icon: React.ReactNode
  position?: FabPosition
  label?: string
  className?: string
  buttonClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode | ((ctx: { close: () => void }) => React.ReactNode)
}

/**
 * Floating Action Button with optional stacked menu.
 * - Un/controlled open state
 * - Closes on outside click and ESC
 * - Render-prop children receive { close }
 */
export function Fab({
  icon,
  position = "br",
  label,
  className,
  buttonClassName,
  open: openProp,
  onOpenChange,
  children,
}: FabProps) {

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = openProp ?? uncontrolledOpen

  const setOpen = useCallback((v: boolean) => {
    if (onOpenChange) onOpenChange(v)
    if (openProp === undefined) setUncontrolledOpen(v)
  }, [onOpenChange, openProp])

  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocMouseDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [setOpen])

  const positionClass =
    position === "br" ? "bottom-6 right-6" :
    position === "bl" ? "bottom-6 left-6" :
    position === "tr" ? "top-6 right-6" :
    /* tl */             "top-6 left-6"

  const menuPositionClass =
    position === "tr"
      ? "absolute translate-y-0 top-0 right-16"
      : "absolute -translate-y-2 bottom-14 right-0"

  const renderChildren = typeof children === "function" ? children({ close: () => setOpen(false) }) : children

  return (
    <div className={cn("fixed z-40", positionClass, className)} ref={containerRef}>
      <div className="relative">
        {open && (
          <div className={cn(menuPositionClass, "flex flex-col gap-2")}
               role="menu" aria-orientation="vertical">
            {renderChildren}
          </div>
        )}

        <button
          type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}
          className={cn(
            "bg-primary text-primary-foreground rounded-full shadow-lg size-12 flex items-center justify-center hover:opacity-90 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            buttonClassName,
          )}
        >
          {icon}
        </button>
      </div>
    </div>
  )
}

export type FabMenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function FabMenuItem({ className, ...props }: FabMenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "bg-sidebar text-foreground border border-border rounded-md px-3 py-2 shadow-md shadow-gray-400 dark:shadow-zinc-600 flex items-center gap-2 hover:bg-sidebar-accent",
        className,
      )}
      {...props}
    />
  )
}
