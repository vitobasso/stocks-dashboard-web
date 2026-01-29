"use client";

import {useEffect} from "react";
import {migrateIfNeeded} from "@/lib/local-storage/local-storage";

export function LocalStorageManager() {
    useEffect(() => {
        migrateIfNeeded();
    }, []);
    return null;
}
