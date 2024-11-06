export const getFromStorage = <T>(key: string, json: boolean = false): T | null => {
    const v = localStorage.getItem(key);
    if (v === "undefined" || v === null) return null;
    return (json && v) ? JSON.parse(v) as T : v as T;
};

export const setToStorage = <T>(key: string, value: T, json: boolean = false): void => {
    const v = json ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, v);
};
