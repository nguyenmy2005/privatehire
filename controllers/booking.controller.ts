// CONTROLLER: đặt xe, đổi/huỷ chuyến, xe còn trống, đội xe
import "./seed";
import { DURATION, SERVICES } from "@/models/service.model";
import { HOUR, bookings, endMs, saveBooking, startMs, type Booking } from "@/models/booking.model";
import { vehicles } from "@/models/vehicle.model";

export { SERVICES, DURATION, bookings, saveBooking };
export { vehicles, drivers, driverOf, saveVehicles, saveDrivers } from "@/models/vehicle.model";
export { loadSearch, saveSearch } from "@/models/search.model";

export const isFuture = (date: string, time: string) => startMs(date, time) > Date.now();
export const canChange = (b: Booking) => startMs(b.date, b.time) - Date.now() >= 24 * HOUR;

export function available(minSeats: number, date: string, time: string, service: string, ignoreId = "") {
  const s = startMs(date, time);
  const e = s + (DURATION[service] ?? 1) * HOUR;
  const busy = bookings()
    .filter((b) => b.status === "confirmed" && b.id !== ignoreId && startMs(b.date, b.time) < e && s < endMs(b))
    .map((b) => b.vehicleId);
  return vehicles().filter((v) => v.seats >= minSeats && !busy.includes(v.id));
}
