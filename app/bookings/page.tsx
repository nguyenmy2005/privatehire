"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import SignInPrompt from "@/components/SignInPrompt";
import { currentUser } from "@/controllers/auth.controller";
import { SERVICES, available, bookings, canChange, driverOf, isFuture, saveBooking, vehicles } from "@/controllers/booking.controller";
import { send } from "@/controllers/message.controller";
import { offers } from "@/controllers/offer.controller";
import { quote } from "@/controllers/pricing.controller";
import { checkRoute, groupsFor, labelsFor, tripFare } from "@/controllers/route.controller";
import { gbp } from "@/lib/format";
import type { Booking, Review } from "@/models/booking.model";
import { fmtDate, toast } from "@/lib/ui";
import PlacePicker from "@/components/PlacePicker";

const STATUS: Record<string, string> = { confirmed: "bg-blue-100 text-blue-800", completed: "bg-green-100 text-green-800", cancelled: "bg-slate-200 text-slate-600" };
const BAR: Record<string, string> = { confirmed: "bg-[#2d5bf0]", completed: "bg-green-500", cancelled: "bg-slate-300" };
const TABS = [["confirmed", "Upcoming"], ["completed", "Completed"], ["cancelled", "Cancelled"]];
const WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
const sm = "btn btn-ghost btn-sm";
const chipCls = "rounded-full bg-[#eef0f7] px-3 py-1 text-xs font-semibold text-slate-700";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex text-xl leading-none" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= value ? "text-[#fbbc04]" : "text-slate-300"}>&#9733;</span>)}
    </span>
  );
}

function StarPick({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span className="inline-flex items-center gap-3">
      <span className="inline-flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}
            className={`px-0.5 text-4xl leading-none transition hover:scale-110 ${n <= shown ? "text-[#fbbc04]" : "text-slate-300"}`}>&#9733;</button>
        ))}
      </span>
      <span className={`w-20 text-sm font-semibold ${shown ? "text-[#161b33]" : "text-slate-400"}`}>{shown ? WORDS[shown] : "Tap a star"}</span>
    </span>
  );
}

function ReviewForm({ onSave }: { onSave: (r: Review) => void }) {
  const [r, setR] = useState<Review>({ trip: 0, car: 0, driver: 0, text: "" });
  const ready = r.trip > 0 && r.car > 0 && r.driver > 0;
  const rows: [keyof Pick<Review, "trip" | "car" | "driver">, string, string][] = [
    ["trip", "Trip", "The whole journey"],
    ["car", "Car", "Cleanliness and comfort"],
    ["driver", "Driver", "Politeness and driving"],
  ];
  return (
    <div className="rounded-2xl border-2 border-[#fdb827] bg-[#fffaf0] p-5">
      <p className="text-lg font-extrabold">How was your journey?</p>
      <p className="mb-3 text-sm text-slate-600">Tap the stars to rate the trip, the car and the driver.</p>
      <div className="divide-y divide-[#f3e3b5]">
        {rows.map(([k, t, d]) => (
          <div key={k} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <p className="font-bold">{t}</p>
              <p className="text-xs text-slate-500">{d}</p>
            </div>
            <StarPick value={r[k]} onChange={(n) => setR({ ...r, [k]: n })} />
          </div>
        ))}
      </div>
      <textarea rows={3} className="input mt-3" placeholder="Write a short review (optional)" value={r.text} onChange={(e) => setR({ ...r, text: e.target.value })} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button disabled={!ready} onClick={() => onSave({ ...r, text: r.text.trim() })} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40">Submit review</button>
        {!ready && <span className="text-sm text-slate-500">Rate the trip, the car and the driver to submit.</span>}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [ready, setReady] = useState(false);
  const [list, setList] = useState<Booking[]>([]);
  const [tab, setTab] = useState("confirmed");
  const [edit, setEdit] = useState<Booking | null>(null);
  const [confirmId, setConfirmId] = useState("");
  const [msg, setMsg] = useState("");
  const load = (e: string) =>
    setList(bookings().filter((b) => b.email === e).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)));

  useEffect(() => {
    const u = currentUser();
    setEmail(u?.email ?? "");
    setRole(u?.role ?? "");
    load(u?.email ?? "");
    setReady(true);
  }, []);

  const save = (b: Booking) => {
    saveBooking(b);
    load(email);
    setEdit(null);
    setConfirmId("");
    setMsg("");
  };

  const amend = () => {
    if (!edit) return;
    if (!edit.pickup.trim() || !edit.destination.trim()) return setMsg("Pick-up and destination are required.");
    const old = list.find((x) => x.id === edit.id);
    const moved = !old || old.pickup !== edit.pickup || old.destination !== edit.destination;
    if (moved) {
      const bad = checkRoute(edit.service, edit.pickup, edit.destination);
      if (bad) return setMsg(bad);
    }
    let price = edit.price;
    const car = vehicles().find((v) => v.id === edit.vehicleId);
    if (moved && car) {
      const pct = offers().find((o) => o.code === edit.offerCode)?.percent ?? 0;
      const fare = tripFare(edit.service, edit.pickup, edit.destination);
      price = Math.round((quote(edit.service, car, edit.source, pct, fare).price + (edit.extras?.childSeat ? 5 : 0)) * 100) / 100;
    }
    if (!isFuture(edit.date, edit.time)) return setMsg("Please choose a date and time in the future.");
    if (!available(0, edit.date, edit.time, edit.service, edit.id).some((v) => v.id === edit.vehicleId)) {
      return setMsg("Your vehicle is not free at that time. Cancel and rebook to choose another vehicle.");
    }
    save({ ...edit, price });
    send(email, "email", `Booking ${edit.id} updated`, `Your booking now runs from ${edit.pickup} to ${edit.destination} on ${fmtDate(edit.date)} at ${edit.time}.`);
    toast(`Booking updated. New total ${gbp(price)}. A confirmation email was sent.`);
  };

  const cancel = (b: Booking) => {
    save({ ...b, status: "cancelled" });
    send(email, "email", `Booking ${b.id} cancelled`, `Your booking from ${b.pickup} to ${b.destination} on ${fmtDate(b.date)} at ${b.time} has been cancelled.`);
    toast("Booking cancelled.");
  };

  const approaching = (b: Booking) => {
    const car = vehicles().find((v) => v.id === b.vehicleId);
    if (!car) return;
    send(email, "text", "Your driver is approaching",
      `PrivateHire: your driver ${driverOf(car)?.name ?? ""} is on the way. Vehicle: ${car.colour} ${car.name}, registration ${car.plate}. Arriving in about 10 minutes.`);
    toast("Text message sent. See Messages.");
  };

  const shown = list.filter((b) => b.status === tab);

  return (
    <Shell title="My bookings" subtitle="Amend, cancel or review your journeys.">
      {!ready ? null : !email ? (
        <SignInPrompt text="Sign in to see and manage your bookings." />
      ) : role === "staff" ? (
        <p className="py-8 text-center text-slate-600">Staff accounts manage bookings in the <a href="/staff" className="font-bold text-[#2d5bf0] underline">Call Centre console</a>.</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200">
            {[
              ["Upcoming", String(list.filter((b) => b.status === "confirmed").length)],
              ["Completed", String(list.filter((b) => b.status === "completed").length)],
              ["Total spent", gbp(list.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.price, 0))],
            ].map(([k, v]) => (
              <div key={k} className="px-4 py-6 first:pl-0 md:px-8 md:first:pl-0">
                <p className="text-4xl font-extrabold tracking-tight text-[#161b33] md:text-5xl">{v}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{k}</p>
              </div>
            ))}
          </div>
          <div className="mb-6 flex gap-8 border-b border-slate-200">
            {TABS.map(([v, t]) => (
              <button key={v} onClick={() => setTab(v)} className={`-mb-px border-b-[3px] px-1 pb-3 text-base font-bold transition ${tab === v ? "border-[#fdb827] text-[#161b33]" : "border-transparent text-slate-400 hover:text-[#161b33]"}`}>
                {t} <span className="ml-1 text-sm font-semibold text-slate-400">{list.filter((b) => b.status === v).length}</span>
              </button>
            ))}
          </div>
          {shown.length === 0 && (
            <div className="rounded-3xl bg-[#f0f3fa] py-14 text-center">
              <p className="text-xl font-extrabold">Nothing here yet</p>
              <p className="mb-5 mt-1 text-sm text-slate-600">Ready for your next journey?</p>
              <a href="/" className="btn btn-accent">Book a ride</a>
            </div>
          )}
          <div className="space-y-5">
            {shown.map((b) => {
              const car = vehicles().find((v) => v.id === b.vehicleId);
              const driver = car ? driverOf(car) : undefined;
              const open = b.status === "confirmed" && canChange(b);
              return (
                <div key={b.id} className="card-lift flex overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <span className={`w-2 shrink-0 ${BAR[b.status]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
                      <div>
                        <p className="text-lg font-extrabold">{SERVICES.find((s) => s.id === b.service)?.name}</p>
                        <p className="text-xs text-slate-500">{b.id} &middot; booked {b.source}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS[b.status]}`}>{b.status}</span>
                    </div>

                    <div className="space-y-4 px-5 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="relative space-y-3 pl-6">
                          <span className="absolute bottom-2 left-[7px] top-2 w-0.5 bg-slate-300" />
                          <div className="relative"><span className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-4 border-[#2d5bf0] bg-white" /><p className="font-semibold">{b.pickup}</p></div>
                          <div className="relative"><span className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full bg-[#fdb827]" /><p className="font-semibold">{b.destination}</p></div>
                        </div>
                        <p className="text-3xl font-extrabold text-[#2d5bf0]">{gbp(b.price)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={chipCls}>{fmtDate(b.date)}, {b.time}</span>
                        {car && <span className={chipCls}>{car.colour} {car.name} ({car.plate})</span>}
                        {driver && <span className={chipCls}>Driver {driver.name}</span>}
                        <span className={chipCls}>{b.passengers} passenger{b.passengers === 1 ? "" : "s"}</span>
                        <span className={chipCls}>{b.notify === "text" ? "Email and text" : "Email"}</span>
                        
                        {b.extras?.childSeat && <span className={chipCls}>Child seat</span>}
                        {b.extras?.flight && <span className={chipCls}>Flight {b.extras.flight}</span>}
                      </div>

                      {edit?.id === b.id ? (
                        <div className="space-y-2 rounded-2xl bg-[#f0f3fa] p-4">
                          <PlacePicker className="input" placeholder={labelsFor(edit.service).fromHint} value={edit.pickup} onChange={(v) => setEdit({ ...edit, pickup: v })} groups={groupsFor(edit.service, "pickup")} />
                          <PlacePicker className="input" placeholder={labelsFor(edit.service).toHint} value={edit.destination} onChange={(v) => setEdit({ ...edit, destination: v })} groups={groupsFor(edit.service, "destination")} />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="date" className="input" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} />
                            <input type="time" className="input" value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} />
                          </div>
                          {msg && <p className="text-sm text-red-600">{msg}</p>}
                          <div className="flex gap-2">
                            <button className="btn btn-primary btn-sm" onClick={amend}>Save changes</button>
                            <button className={sm} onClick={() => { setEdit(null); setMsg(""); }}>Close</button>
                          </div>
                        </div>
                      ) : (
                        b.status === "confirmed" && (
                          <div className="space-y-3">
                            {open ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <button className={sm} onClick={() => setEdit(b)}>Amend</button>
                                {confirmId === b.id ? (
                                  <>
                                    <button className="btn btn-sm bg-red-600 text-white" onClick={() => cancel(b)}>Yes, cancel booking</button>
                                    <button className={sm} onClick={() => setConfirmId("")}>Keep it</button>
                                  </>
                                ) : (
                                  <button className={sm} onClick={() => setConfirmId(b.id)}>Cancel</button>
                                )}
                                <select className="input !w-auto !py-1.5 text-sm" value={b.notify} onChange={(e) => save({ ...b, notify: e.target.value as Booking["notify"] })}>
                                  <option value="email">Updates: email</option>
                                  <option value="text">Updates: email and text</option>
                                </select>
                              </div>
                            ) : (
                              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Changes are closed (less than 24 hours to go).</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500">
                              <span className="font-bold">Demo controls</span>
                              {b.notify === "text" && <button className="font-semibold underline" onClick={() => approaching(b)}>Send approaching-vehicle text</button>}
                              <button className="font-semibold underline" onClick={() => save({ ...b, status: "completed" })}>Complete this journey now</button>
                            </div>
                          </div>
                        )
                      )}

                      {b.status === "completed" && !b.review && <ReviewForm onSave={(review) => { save({ ...b, review }); toast("Thanks for your review."); }} />}
                      {b.review && (
                        <div className="rounded-2xl bg-[#f0f3fa] p-4 text-sm">
                          <p className="mb-2 font-bold">Your review</p>
                          <div className="flex flex-wrap gap-x-8 gap-y-2">
                            {(["trip", "car", "driver"] as const).map((k) => <span key={k} className="flex items-center gap-2 capitalize">{k}<Stars value={b.review![k]} /></span>)}
                          </div>
                          {b.review.text && <p className="mt-2 text-slate-700">&ldquo;{b.review.text}&rdquo;</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Shell>
  );
}









