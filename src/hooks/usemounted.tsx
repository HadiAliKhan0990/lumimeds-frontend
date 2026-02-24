"use client";
import { useEffect, useState } from "react";

export const useMounted = () => {
    const [mounted, setmounted] = useState(false);

    useEffect(() => {
        setmounted(true);
    }, []);

    return { mounted, setmounted };
}