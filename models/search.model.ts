// MODEL: bản nháp tìm chuyến (lưu giữa trang chủ và trang đặt xe)
import type { Trip } from "./booking.model";

const KEY = "ph2_search";

export function loadSearch(): Trip | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null") as Trip | null;
  } catch {
    return null;
  }
}
export const saveSearch = (t: Trip) => localStorage.setItem(KEY, JSON.stringify(t));
