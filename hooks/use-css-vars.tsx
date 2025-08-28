"use client"
import {useEffect, useState} from "react"

export function useCssVars(names: string[]) {
    const read = () => {
        const s = getComputedStyle(document.documentElement)
        return Object.fromEntries(names.map(n => [n, s.getPropertyValue(n).trim()]))
    }
    const [v, setV] = useState<Record<string, string>>(() =>
        (typeof window === "undefined" ? Object.fromEntries(names.map(n => [n, ""])) : read()))

    useEffect(() => {
        const update = () => setV(read())
        update()
        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const mo = new MutationObserver(update)
        mq.addEventListener("change", update)
        mo.observe(document.documentElement, {attributes: true, attributeFilter: ["class"]})
        return () => {
            mq.removeEventListener("change", update);
            mo.disconnect()
        }
    }, [names.join("|")])

    return v
}
