// Hook cho tầng View: đọc dữ liệu localStorage an toàn với SSR/hydration.
import { useSyncExternalStore } from "react";
import { storeVersion, subscribe } from "@/controllers/store.controller";

/**
 * Trả về 0 khi render trên server và lúc hydrate, >0 trên trình duyệt.
 * Component gọi hook này tự vẽ lại mỗi khi Model ghi dữ liệu.
 *
 *   const v = useStoreVersion();
 *   const user = v ? currentUser() : null;
 */
export const useStoreVersion = () => useSyncExternalStore(subscribe, storeVersion, () => 0);
