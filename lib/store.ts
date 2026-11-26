import { SERVICES } from "./data";

export type Vehicle = { id: string; name: string; seats: number; plate: string; colour: string; rate: number; driverId?: string; type?: string };
export type Driver = { id: string; name: string; phone: string };
export type Review = { trip: number; car: number; driver: number; text: string };
export type Trip = { service: string; pickup: string; destination: string; date: string; time: string; passengers: string; size?: string; vtype?: string };
export type Booking = {
  id: string; email: string; service: string; pickup: string; destination: string;
  date: string; time: string; passengers: number; vehicleId: string;
  notify: "email" | "text"; source: "online" | "phone" | "in person";
  price: number; status: "confirmed" | "cancelled" | "completed"; review?: Review; offerCode?: string; extras?: { luggage: number; childSeat: boolean; flight: string; note: string };
};
export type Enquiry = { id: string; email: string; topic: string; message: string; reply?: string; bookingId?: string };
export type Offer = { code: string; email: string; percent: number; used: boolean };
export type Message = { id: string; to: string; kind: "email" | "text"; subject: string; body: string; at: string; read: boolean };

export const gbp = (n: number) => "\u00a3" + n.toFixed(2);
export const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export function get<T>(k: string, d: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
}
export const set = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

const DRIVERS: Driver[] = [
  { id: "d1", name: "James Carter", phone: "07700 900101" },
  { id: "d2", name: "Amira Khan", phone: "07700 900102" },
  { id: "d3", name: "Tom Wilson", phone: "07700 900103" },
  { id: "d4", name: "Priya Nair", phone: "07700 900104" },
  { id: "d5", name: "Luke Bennett", phone: "07700 900105" },
  { id: "d6", name: "Sarah Mitchell", phone: "07700 900106" },
  { id: "d7", name: "Daniel Okoye", phone: "07700 900107" },
  { id: "d8", name: "Fatima Hussain", phone: "07700 900108" },
  { id: "d9", name: "Marcus Reid", phone: "07700 900109" },
  { id: "d10", name: "Elena Petrova", phone: "07700 900110" },
  { id: "d11", name: "Oliver Grant", phone: "07700 900111" },
  { id: "d12", name: "Hannah Brooks", phone: "07700 900112" },
  { id: "d13", name: "Ravi Patel", phone: "07700 900113" },
  { id: "d14", name: "Sophie Turner", phone: "07700 900114" },
  { id: "d15", name: "Kwame Mensah", phone: "07700 900115" },
  { id: "d16", name: "Liam Connor", phone: "07700 900116" },
  { id: "d17", name: "Zara Ahmed", phone: "07700 900117" },
  { id: "d18", name: "Callum Fraser", phone: "07700 900118" },
  { id: "d19", name: "Mei Lin Chen", phone: "07700 900119" },
  { id: "d20", name: "David Owen", phone: "07700 900120" },
  { id: "d21", name: "Isabel Santos", phone: "07700 900121" },
  { id: "d22", name: "George Hall", phone: "07700 900122" },
  { id: "d23", name: "Nadia Rahman", phone: "07700 900123" },
  { id: "d24", name: "Jack Murray", phone: "07700 900124" },
];
const VEHICLES: Vehicle[] = [
  { id: "v1", name: "Toyota Prius", seats: 4, plate: "LK21 ABC", colour: "Silver", rate: 5, driverId: "d1", type: "Hybrid" },
  { id: "v2", name: "Skoda Octavia", seats: 4, plate: "LM22 DEF", colour: "Black", rate: 8, driverId: "d2", type: "Saloon" },
  { id: "v3", name: "Ford Galaxy", seats: 7, plate: "LN70 GHI", colour: "White", rate: 15, driverId: "d3", type: "MPV" },
  { id: "v4", name: "Mercedes V-Class", seats: 7, plate: "LP71 JKL", colour: "Black", rate: 30, driverId: "d4", type: "MPV" },
  { id: "v5", name: "Mercedes Sprinter", seats: 7, plate: "LR72 MNO", colour: "Grey", rate: 40, driverId: "d5", type: "Van" },
  { id: "v6", name: "Toyota Corolla Hybrid", seats: 4, plate: "LS21 PQR", colour: "White", rate: 5, driverId: "d6", type: "Hybrid" },
  { id: "v7", name: "Honda Civic", seats: 4, plate: "LT22 STU", colour: "Blue", rate: 6, driverId: "d7", type: "Saloon" },
  { id: "v8", name: "Tesla Model 3", seats: 4, plate: "LU71 VWX", colour: "White", rate: 12, driverId: "d8", type: "Electric" },
  { id: "v9", name: "Hyundai Ioniq 5", seats: 4, plate: "LV72 YZA", colour: "Grey", rate: 12, driverId: "d9", type: "Electric" },
  { id: "v10", name: "Kia Niro Hybrid", seats: 4, plate: "LW21 BCD", colour: "Red", rate: 7, driverId: "d10", type: "Hybrid" },
  { id: "v11", name: "Volkswagen Passat", seats: 4, plate: "LX22 EFG", colour: "Silver", rate: 9, driverId: "d11", type: "Saloon" },
  { id: "v12", name: "Mercedes E-Class", seats: 4, plate: "LY70 HJK", colour: "Black", rate: 20, driverId: "d12", type: "Executive" },
  { id: "v13", name: "BMW 5 Series", seats: 4, plate: "LZ71 LMN", colour: "Blue", rate: 20, driverId: "d13", type: "Executive" },
  { id: "v14", name: "Audi A6", seats: 4, plate: "MA72 OPQ", colour: "Grey", rate: 20, driverId: "d14", type: "Executive" },
  { id: "v15", name: "Mercedes S-Class", seats: 4, plate: "MB22 RST", colour: "Black", rate: 28, driverId: "d15", type: "Executive" },
  { id: "v16", name: "Volkswagen Sharan", seats: 7, plate: "MC70 UVW", colour: "Silver", rate: 15, driverId: "d16", type: "MPV" },
  { id: "v17", name: "SEAT Alhambra", seats: 7, plate: "MD71 XYZ", colour: "Black", rate: 15, driverId: "d17", type: "MPV" },
  { id: "v18", name: "Volvo XC90", seats: 7, plate: "ME72 ABD", colour: "Blue", rate: 34, driverId: "d18", type: "SUV" },
  { id: "v19", name: "Land Rover Discovery", seats: 7, plate: "MF21 CDE", colour: "Green", rate: 36, driverId: "d19", type: "SUV" },
  { id: "v20", name: "Range Rover", seats: 7, plate: "MG22 FGH", colour: "Black", rate: 45, driverId: "d20", type: "SUV" },
  { id: "v21", name: "Tesla Model X", seats: 7, plate: "MH71 JKM", colour: "White", rate: 40, driverId: "d21", type: "Electric" },
  { id: "v22", name: "Ford Transit Custom", seats: 7, plate: "MJ72 NPR", colour: "White", rate: 38, driverId: "d22", type: "Van" },
  { id: "v23", name: "Volkswagen Caravelle", seats: 7, plate: "MK21 STV", colour: "Silver", rate: 40, driverId: "d23", type: "Van" },
  { id: "v24", name: "Mercedes Vito Tourer", seats: 7, plate: "ML22 WXZ", colour: "Black", rate: 42, driverId: "d24", type: "Van" },
];
export const vehicles = () => get<Vehicle[]>("ph2_vehicles", VEHICLES);
export const drivers = () => get<Driver[]>("ph2_drivers", DRIVERS);
export const driverOf = (v: Vehicle) => drivers().find((d) => d.id === v.driverId);
export const rateForSeats = (seats: number) => (seats <= 4 ? 5 : seats <= 6 ? 15 : seats <= 7 ? 30 : 40);

const HOUR = 3600000;
export const DURATION: Record<string, number> = { local: 1, hotel: 1, airport: 2, meet: 2, long: 4, daily: 8 };
export const startMs = (date: string, time: string) => new Date(`${date}T${time}`).getTime();
const endMs = (b: { date: string; time: string; service: string }) => startMs(b.date, b.time) + (DURATION[b.service] ?? 1) * HOUR;
export const isFuture = (date: string, time: string) => startMs(date, time) > Date.now();
export const canChange = (b: Booking) => startMs(b.date, b.time) - Date.now() >= 24 * HOUR;

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

export function available(minSeats: number, date: string, time: string, service: string, ignoreId = "") {
  const s = startMs(date, time);
  const e = s + (DURATION[service] ?? 1) * HOUR;
  const busy = bookings()
    .filter((b) => b.status === "confirmed" && b.id !== ignoreId && startMs(b.date, b.time) < e && s < endMs(b))
    .map((b) => b.vehicleId);
  return vehicles().filter((v) => v.seats >= minSeats && !busy.includes(v.id));
}

export const offers = () => get<Offer[]>("ph2_offers", []);
export const PUBLIC_OFFERS = [
  { code: "WELCOME5", percent: 5 },
  { code: "WEEKDAY8", percent: 8 },
  { code: "LONDON10", percent: 10 },
];
export const findPublic = (code: string, email: string) => {
  const o = PUBLIC_OFFERS.find((x) => x.code === code.trim().toUpperCase());
  if (!o) return undefined;
  return get<string[]>("ph2_public_used", []).includes(o.code + "|" + email) ? undefined : o;
};
export const redeemPublic = (code: string, email: string) => set("ph2_public_used", [...get<string[]>("ph2_public_used", []), code + "|" + email]);
export const saveOffers = (o: Offer[]) => set("ph2_offers", o);
export const findOffer = (code: string, email: string) =>
  offers().find((o) => o.code === code.trim().toUpperCase() && o.email === email && !o.used);
export const redeemOffer = (code: string) => saveOffers(offers().map((o) => (o.code === code ? { ...o, used: true } : o)));

export const enquiries = () => get<Enquiry[]>("ph2_enquiries", []);
export const saveEnquiries = (e: Enquiry[]) => set("ph2_enquiries", e);

export const messages = (to: string) =>
  get<Message[]>("ph2_messages", []).filter((m) => m.to === to).sort((a, b) => b.at.localeCompare(a.at));
export function send(to: string, kind: Message["kind"], subject: string, body: string) {
  const all = get<Message[]>("ph2_messages", []);
  all.push({ id: uid(), to, kind, subject, body, at: new Date().toISOString(), read: false });
  set("ph2_messages", all);
}
export const markRead = (to: string) =>
  set("ph2_messages", get<Message[]>("ph2_messages", []).map((m) => (m.to === to ? { ...m, read: true } : m)));
export const unread = (to: string) => get<Message[]>("ph2_messages", []).filter((m) => m.to === to && !m.read).length;


function seedDemo() {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem("ph2_seeded")) return;
    localStorage.setItem("ph2_seeded", "1");
    if (get<unknown[]>("ph2_users", []).length || get<unknown[]>("ph2_bookings", []).length) return;

    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 10);
    };
    type SeedUser = import("./auth").User;
    const pw = "123456789";
    const users: SeedUser[] = [
      { name: "Anna Nguyen", email: "anna@gmail.com", phone: "07700 900201", address: "12 Baker Street, London", cardLast4: "1111", password: pw, role: "customer" },
      { name: "Ben Carter", email: "ben@gmail.com", phone: "07700 900202", address: "5 Kings Road, London", cardLast4: "1111", password: pw, role: "customer" },
      { name: "Chloe Evans", email: "chloe@gmail.com", phone: "07700 900203", address: "88 Park Lane, London", cardLast4: "", password: pw, role: "customer" },
      { name: "Sam Taylor", email: "staff@gmail.com", phone: "020 7946 0001", address: "PrivateHire Cars, London", cardLast4: "", password: "Staff1234", role: "staff", active: true },
    ];
    set("ph2_users", users);

    const mk = (n: number, b: Omit<Booking, "id" | "price">): Booking => {
      const v = VEHICLES.find((x) => x.id === b.vehicleId)!;
      return { ...b, id: "PH-D" + String(n).padStart(3, "0"), price: quote(b.service, v, b.source).price };
    };
    const A = "anna@gmail.com";
    const B = "ben@gmail.com";
    const C = "chloe@gmail.com";
    set("ph2_bookings", [
      mk(1, { email: A, service: "local", pickup: "Paddington Station", destination: "Canary Wharf", date: day(-12), time: "09:00", passengers: 2, vehicleId: "v1", notify: "email", source: "online", status: "completed", review: { trip: 5, car: 5, driver: 5, text: "Spotless car and a friendly driver." } }),
      mk(2, { email: A, service: "airport", pickup: "12 Baker Street", destination: "Heathrow Terminal 5", date: day(-8), time: "06:30", passengers: 3, vehicleId: "v2", notify: "text", source: "online", status: "completed", review: { trip: 5, car: 4, driver: 5, text: "Easy to book and the driver was on time." } }),
      mk(3, { email: A, service: "hotel", pickup: "The Savoy", destination: "King's Cross Station", date: day(-4), time: "18:00", passengers: 2, vehicleId: "v1", notify: "email", source: "online", status: "completed" }),
      mk(4, { email: A, service: "airport", pickup: "12 Baker Street", destination: "Gatwick Airport", date: day(5), time: "07:00", passengers: 5, vehicleId: "v3", notify: "text", source: "online", status: "confirmed" }),
      mk(5, { email: B, service: "long", pickup: "5 Kings Road", destination: "Oxford", date: day(-6), time: "10:00", passengers: 2, vehicleId: "v2", notify: "email", source: "phone", status: "completed" }),
      mk(6, { email: B, service: "local", pickup: "5 Kings Road", destination: "Wembley Stadium", date: day(3), time: "14:00", passengers: 3, vehicleId: "v1", notify: "email", source: "online", status: "confirmed" }),
      mk(7, { email: C, service: "daily", pickup: "88 Park Lane", destination: "City meetings", date: day(-10), time: "08:00", passengers: 4, vehicleId: "v4", notify: "email", source: "in person", status: "completed" }),
      mk(8, { email: C, service: "local", pickup: "88 Park Lane", destination: "Oxford Street", date: day(6), time: "12:00", passengers: 1, vehicleId: "v1", notify: "email", source: "online", status: "cancelled" }),
    ]);

    set("ph2_enquiries", [
      { id: "ENQ001", email: B, topic: "General enquiry", message: "Do you offer child seats on airport transfers?", reply: "Yes, child seats are free. Add a note when you book or call us." },
      { id: "ENQ002", email: A, topic: "Enquiry about a specific trip", message: "Can the pick-up time be moved by 30 minutes?", bookingId: "PH-D004" },
    ]);
    set("ph2_offers", [
      { code: "SAVE1ANNA", email: A, percent: 10, used: false },
      { code: "SAVE2BEN", email: B, percent: 10, used: true },
    ]);

    send(A, "email", "Confirm your PrivateHire account", "Hello Anna Nguyen,\n\nWelcome to PrivateHire Cars. Book online to get 15% off and priority service.");
    send(A, "email", "Booking confirmed PH-D004", "Booking number: PH-D004\nService: Airport transfer\nJourney: 12 Baker Street to Gatwick Airport");
    send(A, "email", "A special offer for you", "Thank you for travelling with us. Use code SAVE1ANNA for 10% off your next booking. The code works once.");
    send(B, "email", "Re: General enquiry", "Yes, child seats are free. Add a note when you book or call us.");
  } catch {
    /* seeding is best effort */
  }
}
seedDemo();











