// MODEL: lớp lưu trữ chung (localStorage). Mọi model đọc/ghi dữ liệu qua đây.
// Mỗi lần ghi sẽ tăng "version" và báo cho View vẽ lại (xem lib/useStore.ts).
const EVENT = "ph:store";
let version = 1;

export function get<T>(k: string, d: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
}

export function notifyChange() {
  version++;
  window.dispatchEvent(new Event(EVENT));
}

export function set(k: string, v: unknown) {
  localStorage.setItem(k, JSON.stringify(v));
  notifyChange();
}

export const storeVersion = () => version;

export function subscribe(onChange: () => void) {
  // "storage" bắn ra khi tab khác sửa localStorage
  const fromOtherTab = () => {
    version++;
    onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", fromOtherTab);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", fromOtherTab);
  };
}
