const purgeHandlers: (() => any)[] = [];
export function purgeOldValues<T extends { at: number }>(obj: Record<any, T>,
    after: number,
    sideEffect?: (obj: T) => any) {
    purgeHandlers.push(() => {
        for (const [k, { at }] of Object.entries(obj)) {
            if (Date.now() - at > after) {
                if (sideEffect) sideEffect(obj[k]!);
                delete obj[k];
            }
        }
    });
}

setInterval(() => {
    purgeHandlers.forEach(h => h());
}, 5000);
