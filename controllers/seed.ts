// Dữ liệu demo — chạy 1 lần khi app mở lần đầu trên trình duyệt (tầng Controller khởi tạo)
import { get, set } from "@/models/storage";
import { saveUsers, type User } from "@/models/user.model";
import { VEHICLES } from "@/models/vehicle.model";
import type { Booking } from "@/models/booking.model";
import { saveEnquiries } from "@/models/enquiry.model";
import { saveOffers } from "@/models/offer.model";
import { allMessages, saveMessages, type Message } from "@/models/message.model";
import { uid } from "@/lib/format";
import { quote } from "./pricing.controller";

// Không import message.controller ở đây để tránh vòng lặp import (controller đó import "./seed")
const send = (to: string, kind: Message["kind"], subject: string, body: string) =>
  saveMessages([...allMessages(), { id: uid(), to, kind, subject, body, at: new Date().toISOString(), read: false }]);

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
    const pw = "123456789";
    const users: User[] = [
      { name: "Anna Nguyen", email: "anna@gmail.com", phone: "07700 900201", address: "12 Baker Street, London", cardLast4: "1111", password: pw, role: "customer" },
      { name: "Ben Carter", email: "ben@gmail.com", phone: "07700 900202", address: "5 Kings Road, London", cardLast4: "1111", password: pw, role: "customer" },
      { name: "Chloe Evans", email: "chloe@gmail.com", phone: "07700 900203", address: "88 Park Lane, London", cardLast4: "", password: pw, role: "customer" },
      { name: "Sam Taylor", email: "staff@gmail.com", phone: "020 7946 0001", address: "PrivateHire Cars, London", cardLast4: "", password: "Staff1234", role: "staff", active: true },
    ];
    saveUsers(users);

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

    saveEnquiries([
      { id: "ENQ001", email: B, topic: "General enquiry", message: "Do you offer child seats on airport transfers?", reply: "Yes, child seats are free. Add a note when you book or call us." },
      { id: "ENQ002", email: A, topic: "Enquiry about a specific trip", message: "Can the pick-up time be moved by 30 minutes?", bookingId: "PH-D004" },
    ]);
    saveOffers([
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
