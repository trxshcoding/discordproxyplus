// SPDX-FileCopyrightText: 2026 Amy <amyulated@proton.me>
// SPDX-FileCopyrightText: 2026 Sunnie <>
//
// SPDX-License-Identifier: EUPL-1.2

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
