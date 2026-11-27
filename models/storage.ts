// MODEL: lớp lưu trữ chung (localStorage). Mọi model đọc/ghi dữ liệu qua đây.
export function get<T>(k: string, d: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
}
export const set = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));
