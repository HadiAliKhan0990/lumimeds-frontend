import { useMemo } from "react";

export const useMinDate = (interval: number) => {
    const minDate = useMemo(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - interval);
        return d;
    }, [interval]);

    return minDate;
};

