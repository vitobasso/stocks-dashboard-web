"use client";

import {useEffect} from "react";
import {applyStoredTheme} from "@/lib/theme";

export function Theme() {
    useEffect(() => {
        applyStoredTheme()
    }, []);
    return null;
}