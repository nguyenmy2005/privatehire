// MODEL: đơn đặt xe
import { get, set } from "./storage";
import { DURATION } from "./service.model";

export type Review = { trip: number; car: number; driver: number; text: string };
export type Trip = { service: string; pickup: string; destination: string; date: string; time: string; passengers: string; size?: string; vtype?: string };
export type Booking = {
  id: string; email: string; service: string; pickup: string; destination: string;
  date: string; time: string; passengers: number; vehicleId: string;
  notify: "email" | "text"; source: "online" | "phone" | "in person";
  price: number; status: "confirmed" | "cancelled" | "completed"; review?: Review; offerCode?: string; extras?: { luggage: number; childSeat: boolean; flight: string; note: string };
};

export const HOUR = 3600000;
export const startMs = (date: string, time: string) => new Date(`${date}T${time}`).getTime();
export const endMs = (b: { date: string; time: string; service: string }) => startMs(b.date, b.time) + (DURATION[b.service] ?? 1) * HOUR;

export const bookings = (): Booking[] =>
  get<Booking[]>("ph2_bookings", []).map((b) =>
    b.status === "confirmed" && endMs(b) < Date.now() ? { ...b, status: "completed" as const } : b
  );

export function saveBooking(b: Booking) {
  const all = bookings();
  const i = all.findIndex((x) => x.id === b.id);
  if (i >= 0) all[i] = b;
  else all.push(b);
  set("ph2_bookings", all);
}
