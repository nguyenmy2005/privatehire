// CONTROLLER: tính giá
import { SERVICES } from "@/models/service.model";
import { vehicles, type Vehicle } from "@/models/vehicle.model";
import type { Booking } from "@/models/booking.model";

export const rateForSeats = (seats: number) => (seats <= 4 ? 5 : seats <= 6 ? 15 : seats <= 7 ? 30 : 40);

export function quote(service: string, v: Vehicle, source: Booking["source"], offerPct = 0, fare?: number) {
  const base = (fare ?? SERVICES.find((s) => s.id === service)?.from ?? 0) + v.rate;
  let price = base;
  if (source === "online") price *= 0.85;
  price *= 1 - offerPct / 100;
  return { base, price: Math.round(price * 100) / 100 };
}

export function fromPrice(service: string) {
  const prices = vehicles().map((v) => quote(service, v, "online").price);
  return prices.length ? Math.min(...prices) : 0;
}
