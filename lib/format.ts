// Tiện ích thuần (không đụng dữ liệu, không đụng UI) — mọi tầng đều dùng được
export const gbp = (n: number) => "£" + n.toFixed(2);
export const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
