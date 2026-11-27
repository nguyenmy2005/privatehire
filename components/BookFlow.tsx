"use client";
import { useEffect, useState } from "react";
import Img from "./Img";
import AuthModal from "./AuthModal";
import { IMG } from "@/lib/images";
import { findUser, updateUser } from "@/controllers/auth.controller";
import { SERVICES, DURATION, available, driverOf, isFuture, saveBooking } from "@/controllers/booking.controller";
import { send } from "@/controllers/message.controller";
import { findOffer, redeemOffer, redeemPublic, PUBLIC_OFFERS, findPublic } from "@/controllers/offer.controller";
import { quote } from "@/controllers/pricing.controller";
import { tripFare } from "@/controllers/route.controller";
import { gbp, uid } from "@/lib/format";
import type { Booking, Trip } from "@/models/booking.model";
import type { Vehicle } from "@/models/vehicle.model";
import { cardValid, digits, expValid, fmtDate, toast } from "@/lib/ui";

const CHILD_SEAT = 5;
const lab = "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500";
const carImg = (s: number) => IMG.cars[s <= 4 ? 0 : s <= 6 ? 1 : s <= 7 ? 2 : 3];

const svcName = (id: string) => SERVICES.find((s) => s.id === id)?.name ?? "";
const fareOf = (t: Trip) => tripFare(t.service, t.pickup, t.destination);

type Step = "vehicle" | "extras" | "pay" | "done";
type Extras = { luggage: number; childSeat: boolean; flight: string; note: string };
const NO_EXTRAS: Extras = { luggage: 0, childSeat: false, flight: "", note: "" };
const LABELS: Record<Step, string> = { vehicle: "Vehicle", extras: "Extras", pay: "Payment", done: "Confirmed" };

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-4 py-2.5 text-sm">
    <span className="text-slate-500">{k}</span>
    <span className="text-right font-semibold">{v}</span>
  </div>
);

function Stepper({ keys, step }: { keys: Step[]; step: Step }) {
  const idx = keys.indexOf(step);
  return (
    <ol className="mb-7 flex items-center">
      {keys.map((k, i) => (
        <li key={k} className="flex flex-1 items-center last:flex-none">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i < idx ? "bg-[#2d5bf0] text-white" : i === idx ? "bg-[#fdb827] text-[#161b33]" : "bg-slate-100 text-slate-400"}`}>{i + 1}</span>
          <span className={`ml-2 hidden text-sm font-semibold sm:inline ${i <= idx ? "" : "text-slate-400"}`}>{LABELS[k]}</span>
          {i < keys.length - 1 && <span className={`mx-3 h-0.5 flex-1 ${i < idx ? "bg-[#2d5bf0]" : "bg-slate-200"}`} />}
        </li>
      ))}
    </ol>
  );
}

function Summary({ trip, car, source, pct, extras }: { trip: Trip; car: Vehicle | null; source: Booking["source"]; pct: number; extras: Extras }) {
  const q = car ? quote(trip.service, car, source, pct, fareOf(trip)) : null;
  const disc = q && source === "online" ? q.base * 0.15 : 0;
  const offer = q ? (q.base - disc) * (pct / 100) : 0;
  const extraCost = extras.childSeat ? CHILD_SEAT : 0;
  return (
    <aside className="rounded-2xl bg-[#f0f3fa] p-5 lg:sticky lg:top-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">Your trip</p>
      <div className="relative space-y-4 pl-6">
        <span className="absolute bottom-3 left-[7px] top-3 w-0.5 bg-slate-300" />
        <div className="relative"><span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-4 border-[#2d5bf0] bg-white" /><p className="text-xs text-slate-500">From</p><p className="font-semibold">{trip.pickup}</p></div>
        <div className="relative"><span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[#fdb827]" /><p className="text-xs text-slate-500">To</p><p className="font-semibold">{trip.destination}</p></div>
      </div>
      <div className="mt-5 divide-y divide-slate-200 border-t border-slate-200">
        <Row k="Service" v={svcName(trip.service)} />
        <Row k="Duration" v={`About ${DURATION[trip.service] ?? 1} hr`} />
        <Row k="When" v={`${fmtDate(trip.date)}, ${trip.time}`} />
        <Row k="Passengers" v={trip.passengers} />
        {car && <Row k="Vehicle" v={car.name} />}
      </div>
      {q ? (
        <div className="mt-2 border-t border-slate-200 pt-2">
          <Row k="Base fare" v={gbp(q.base)} />
          {disc > 0 && <div className="flex justify-between py-2 text-sm font-semibold text-green-700"><span>Online discount (15%)</span><span>-{gbp(disc)}</span></div>}
          {pct > 0 && <div className="flex justify-between py-2 text-sm font-semibold text-green-700"><span>Offer code ({pct}%)</span><span>-{gbp(offer)}</span></div>}
          {extraCost > 0 && <Row k="Child seat" v={gbp(extraCost)} />}
          <div className="mt-1 flex justify-between border-t border-slate-200 pt-3 text-lg font-extrabold"><span>Total</span><span className="text-[#2d5bf0]">{gbp(q.price + extraCost)}</span></div>
        </div>
      ) : (
        source === "online" && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-800">The 15% online discount is already included in the prices shown.</p>
      )}
    </aside>
  );
}

const receipt = (b: Booking, c: Vehicle) =>
  [
    `Booking number: ${b.id}`,
    `Service: ${svcName(b.service)}`,
    `Journey: ${b.pickup} to ${b.destination}`,
    `When: ${fmtDate(b.date)} at ${b.time}`,
    `Passengers: ${b.passengers}`,
    `Vehicle: ${c.colour} ${c.name} (${c.plate})`,
    b.extras ? `Extras: ${b.extras.childSeat ? "child seat" : "no child seat"}${b.extras.flight ? `, flight ${b.extras.flight}` : ""}` : "",
    `Total: ${gbp(b.price)}`,
  ].filter(Boolean).join("\n");

function pendingVehicle(tripKey: string, trip: Trip): Vehicle | null {
  try {
    const raw = sessionStorage.getItem("ph2_pending");
    if (!raw) return null;
    const p = JSON.parse(raw) as { id: string; key: string };
    if (p.key !== tripKey) return null;
    return available(+trip.passengers, trip.date, trip.time, trip.service).find((x) => x.id === p.id) ?? null;
  } catch {
    return null;
  }
}

export default function BookFlow({
  email, source, trip, onEdit,
}: { email: string | null; source: Booking["source"]; trip: Trip; onEdit: () => void }) {
  const online = source === "online";
  const [mobile, setMobile] = useState("");
  const tripKey = `${trip.service}|${trip.date}|${trip.time}|${trip.pickup}|${trip.destination}`;
  // Xe khách đã chọn trước khi bị yêu cầu đăng nhập (lưu ở sessionStorage, khôi phục sau khi tải lại trang)
  const [restored] = useState<Vehicle | null>(() => (email ? pendingVehicle(tripKey, trip) : null));
  const [step, setStep] = useState<Step>(restored ? "extras" : "vehicle");
  const [minSize, setMinSize] = useState(trip.size ? +trip.size : 0);
  const [type, setType] = useState(trip.vtype ?? "");
  const sizeLocked = !!trip.size;
  const typeLocked = !!trip.vtype;
  const [sort, setSort] = useState<"recommended" | "price" | "high" | "seats">("recommended");
  const [notify, setNotify] = useState<Booking["notify"]>("email");
  const [code, setCode] = useState("");
  const [pct, setPct] = useState(0);
  const [applied, setApplied] = useState("");
  const [msg, setMsg] = useState("");
  const [car, setCar] = useState<Vehicle | null>(restored);
  const [extras, setExtras] = useState<Extras>(NO_EXTRAS);
  const [pay, setPay] = useState({ method: "card", number: "", exp: "", cvv: "" });
  const [done, setDone] = useState<Booking | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const needPhone = notify === "text" && !!email && !findUser(email)?.phone?.trim();
  const keys: Step[] = online ? ["vehicle", "extras", "pay", "done"] : ["vehicle", "extras", "done"];
  const past = !isFuture(trip.date, trip.time);
  const cars = (past ? [] : available(Math.max(+trip.passengers, minSize), trip.date, trip.time, trip.service))
    .filter((c) => (!type || c.type === type) && (!minSize || c.seats === minSize));
  const price = (c: Vehicle) => quote(trip.service, c, source, pct, fareOf(trip)).price;
  const best = cars.length > 1 ? cars.reduce((a, b) => (price(a) <= price(b) ? a : b)).id : "";
  const sorted = [...cars].sort((a, b) => sort === "price" ? price(a) - price(b) : sort === "high" ? price(b) - price(a) : sort === "seats" ? b.seats - a.seats || price(a) - price(b) : a.seats - b.seats || price(a) - price(b));

  useEffect(() => {
    if (!email) return;
    sessionStorage.removeItem("ph2_pending");
    if (restored) toast("Welcome back. We kept your selected vehicle.");
  }, [email, restored]);

  const apply = (c: string = code) => {
    setCode(c);
    if (!email) return setMsg("Sign in to use a special offer code.");
    const o = findOffer(c, email) ?? findPublic(c, email);
    setPct(o ? o.percent : 0);
    setApplied(o ? o.code : "");
    setMsg(o ? `Code applied: ${o.percent}% off` : "This code is invalid, already used, or belongs to another account.");
  };

  const finish = (c: Vehicle) => {
    if (!email) return;
    if (!available(+trip.passengers, trip.date, trip.time, trip.service).some((v) => v.id === c.id)) {
      setMsg("Sorry, that vehicle was just booked. Please choose another one.");
      setStep("vehicle");
      return;
    }
    const extraCost = extras.childSeat ? CHILD_SEAT : 0;
    const b: Booking = {
      id: "PH-" + uid(), email, service: trip.service, pickup: trip.pickup.trim(), destination: trip.destination.trim(),
      date: trip.date, time: trip.time, passengers: +trip.passengers, vehicleId: c.id, notify, source,
      price: Math.round((quote(trip.service, c, source, pct, fareOf(trip)).price + extraCost) * 100) / 100,
      status: "confirmed", offerCode: pct ? applied : undefined, extras,
    };
    saveBooking(b);
    if (pct && applied) {
      redeemOffer(applied);
      if (PUBLIC_OFFERS.some((x) => x.code === applied)) redeemPublic(applied, email);
    }
    send(email, "email", `Booking confirmed ${b.id}`, receipt(b, c));
    setCar(c);
    setDone(b);
    setMsg("");
    setStep("done");
    toast(`Booking ${b.id} confirmed. A confirmation email was sent.`);
  };

  const choose = (c: Vehicle) => {
    if (!email) {
      sessionStorage.setItem("ph2_pending", JSON.stringify({ id: c.id, key: tripKey }));
      return setLoginOpen(true);
    }
    setCar(c);
    setMsg("");
    
    setStep("extras");
  };

  const submitExtras = (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;
    setMsg("");
    if (needPhone) {
      if (digits(mobile).length < 9) return setMsg("Please enter a valid mobile number for text updates.");
      updateUser(email as string, { phone: mobile.trim() });
    }
    if (online) setStep("pay");
    else finish(car);
  };

  const payNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;
    if (pay.method === "card") {
      if (!cardValid(pay.number)) return setMsg("VISA Check failed: the card number could not be verified.");
      if (!expValid(pay.exp)) return setMsg("The card has expired or the date is not valid.");
      const amex = /^3[47]/.test(digits(pay.number));
      if (pay.cvv.length !== (amex ? 4 : 3)) return setMsg("Please enter a valid security code.");
    }
    setMsg("");
    finish(car);
  };

  if (step === "done" && done && car) {
    return (
      <div>
        <Stepper keys={keys} step={step} />
        <div className="mx-auto max-w-xl">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-extrabold">Booking confirmed</h2>
            <p className="mt-2 text-slate-600">
              {online ? "A confirmation email is in your Messages. Priority service applied." : `Booked by the Call Centre for ${done.email}.`}
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="bg-[#2a45d0] px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-wide text-white/70">Booking number</p>
              <p className="text-2xl font-extrabold">{done.id}</p>
            </div>
            <div className="divide-y divide-slate-100 px-5">
              <Row k="Service" v={svcName(done.service)} />
              <Row k="Journey" v={`${done.pickup} to ${done.destination}`} />
              <Row k="When" v={`${fmtDate(done.date)} at ${done.time}`} />
              <Row k="Passengers" v={String(done.passengers)} />
              <Row k="Vehicle" v={`${car.colour} ${car.name} (${car.plate})`} />
              <Row k="Driver" v={driverOf(car)?.name ?? "To be assigned"} />
              
              {done.extras?.childSeat && <Row k="Child seat" v="Yes" />}
              {done.extras?.flight && <Row k="Flight" v={done.extras.flight} />}
              {done.extras?.note && <Row k="Note for driver" v={done.extras.note} />}
              <Row k="Updates" v={done.notify === "text" ? "Email and text" : "Email"} />
            </div>
            <div className="flex items-center justify-between border-t-2 border-dashed border-slate-200 bg-[#f0f3fa] px-5 py-4">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-extrabold text-[#2d5bf0]">{gbp(done.price)}</span>
            </div>
          </div>
          {done.notify === "text" && (
            <p className="mt-4 rounded-2xl bg-[#e3e8ff] p-4 text-sm font-medium">
              We will text you the car&apos;s registration, colour and make 10 to 15 minutes before pick-up.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3 print:hidden">
            <button className="btn btn-primary" onClick={() => window.print()}>Print receipt</button>
            {online ? <a href="/bookings" className="btn btn-ghost">My bookings</a> : <button className="btn btn-ghost" onClick={onEdit}>New journey</button>}
          </div>
        </div>
      </div>
    );
  }

  const chip = (on: boolean) => `rounded-full px-4 py-2 text-sm font-semibold transition ${on ? "bg-[#2d5bf0] text-white" : "bg-[#eef0f7] hover:bg-[#e2e6f3]"}`;

  return (
    <div>
      <Stepper keys={keys} step={step} />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_310px]">
        <div>
          {step === "vehicle" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#f0f3fa] px-4 py-3">
                <p className="font-semibold">{trip.pickup} to {trip.destination} &middot; {fmtDate(trip.date)}, {trip.time} &middot; {trip.passengers} passenger{trip.passengers === "1" ? "" : "s"}</p>
                <button className="text-sm font-bold text-[#2d5bf0] hover:underline" onClick={onEdit}>Edit journey</button>
              </div>
              {past && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">That date and time has passed. Please edit your journey.</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className={lab}>Type{typeLocked && " (chosen on the home page)"}</p>
                  <select className="input disabled:cursor-not-allowed disabled:bg-slate-100" disabled={typeLocked} value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">Any type</option>
                    {["Saloon", "Hybrid", "Electric", "Executive", "MPV", "SUV", "Van"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <p className={lab}>Sort by</p>
                  <select className="input" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                    <option value="recommended">Recommended</option>
                    <option value="price">Lowest price</option>
                    <option value="high">Highest price</option>
                    <option value="seats">Most seats</option>
                  </select>
                </div>
              </div>

              <div>
                <p className={lab}>Vehicle size{sizeLocked && " (chosen on the home page)"}</p>
                <div className="flex flex-wrap gap-2">
                  {(sizeLocked ? [minSize] : [0, 4, 7]).map((n) => (
                    <button type="button" key={n} onClick={() => setMinSize(n)} className={chip(minSize === n)}>{n ? `${n}-seater` : "Any size"}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className={lab}>How should we keep you updated?</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {([["email", "Email", "Confirmation by email"], ["text", "Email and text", "Plus a text with the car details 10 to 15 minutes before pick-up"]] as const).map(([v, t, d]) => (
                    <button type="button" key={v} onClick={() => setNotify(v)} className={`rounded-xl border-2 p-3 text-left transition ${notify === v ? "border-[#2d5bf0] bg-[#eef2ff]" : "border-slate-200 hover:border-slate-300"}`}>
                      <span className="block text-sm font-bold">{t}</span>
                      <span className="block text-xs text-slate-500">{d}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className={lab}>Special offer code (optional)</p>
                <div className="flex gap-2">
                  <input className="input" placeholder="Enter your code" value={code} onChange={(e) => setCode(e.target.value)} />
                  <button type="button" className="btn btn-ghost" onClick={() => apply()}>Apply</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {PUBLIC_OFFERS.map((o) => (
                  <button type="button" key={o.code} onClick={() => apply(o.code)} className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-left transition hover:border-[#fdb827] hover:bg-[#fffaf0]">
                    <span className="block text-sm font-extrabold">{o.code}</span>
                    <span className="block text-xs text-slate-500">{o.percent}% off, once per account</span>
                  </button>
                ))}
              </div>
              {msg && <p className={`rounded-xl p-3 text-sm font-semibold ${pct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg}</p>}

              <div className="space-y-4">
                <p className="text-lg font-extrabold">{sorted.length} vehicle{sorted.length === 1 ? "" : "s"} available</p>
                {sorted.length === 0 && !past && (
                  <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700">
                    <p className="font-bold">No vehicle available</p>
                    <p className="mt-1 text-sm">Try another time, a different size or clear the search.</p>
                  </div>
                )}
                {sorted.map((c) => {
                  const q = quote(trip.service, c, source, pct, fareOf(trip));
                  return (
                    <div key={c.id} className="card-lift flex flex-col gap-4 rounded-2xl border-2 border-slate-200 p-3 transition hover:border-[#2d5bf0] sm:flex-row sm:items-center">
                      <Img srcs={carImg(c.seats)} className="h-36 w-full shrink-0 rounded-xl sm:w-56" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-bold">{c.name}</p>
                          {c.id === best && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Best price</span>}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{c.seats} seats &middot; {c.colour}{c.type && <> &middot; {c.type}</>}</p>
                        <p className="text-sm text-slate-500">Driver: {driverOf(c)?.name ?? "to be assigned"} &middot; Free cancellation up to 24h</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 px-2 sm:block sm:text-right">
                        <div>
                          {q.price !== q.base && <p className="text-sm text-slate-400 line-through">{gbp(q.base)}</p>}
                          <p className="text-2xl font-extrabold text-[#2d5bf0]">{gbp(q.price)}</p>
                        </div>
                        <button className="btn btn-accent btn-sm sm:mt-2" onClick={() => choose(c)}>{email ? "Select" : "Sign in to book"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === "extras" && car && (
            <form onSubmit={submitExtras} className="space-y-5">
              <p className="text-lg font-extrabold">Extras and trip details</p>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-slate-200 p-3 hover:border-slate-300">
                <input type="checkbox" className="h-5 w-5" checked={extras.childSeat} onChange={(e) => setExtras({ ...extras, childSeat: e.target.checked })} />
                <span>
                  <span className="block text-sm font-bold">Child seat (+{gbp(CHILD_SEAT)})</span>
                  <span className="block text-xs text-slate-500">Fitted before pick-up</span>
                </span>
              </label>
              {(trip.service === "airport" || trip.service === "meet") && (
                <div>
                  <p className={lab}>Flight number (optional)</p>
                  <input className="input sm:max-w-xs" placeholder="For example BA 117" value={extras.flight} onChange={(e) => setExtras({ ...extras, flight: e.target.value })} />
                  <p className="mt-1 text-xs text-slate-500">Lets the driver track delays.</p>
                </div>
              )}
              <div>
                {needPhone && (
                  <div className="mb-5">
                    <p className={lab}>Mobile number for text updates</p>
                    <input required inputMode="tel" className="input sm:max-w-xs" placeholder="Your mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                    <p className="mt-1 text-xs text-slate-500">Your account has no mobile number yet. It is saved to your account.</p>
                  </div>
                )}
                <p className={lab}>Note for the driver (optional)</p>
                <textarea rows={3} className="input" placeholder="Gate code, meeting point..." value={extras.note} onChange={(e) => setExtras({ ...extras, note: e.target.value })} />
              </div>
              {msg && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn btn-ghost" onClick={() => { setMsg(""); setStep("vehicle"); }}>Back</button>
                <button className="btn btn-accent flex-1">{online ? "Continue to payment" : "Confirm booking"}</button>
              </div>
            </form>
          )}

          {step === "pay" && car && (
            <form onSubmit={payNow} className="space-y-4">
              <p className="text-lg font-extrabold">Pay {gbp(price(car) + (extras.childSeat ? CHILD_SEAT : 0))}</p>
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#eef0f7] p-1">
                {[["card", "Card"], ["paypal", "PayPal"]].map(([v, t]) => (
                  <button type="button" key={v} onClick={() => { setPay({ ...pay, method: v }); setMsg(""); }} className={`rounded-xl py-2.5 text-sm font-bold transition ${pay.method === v ? "bg-white shadow" : "text-slate-500"}`}>{t}</button>
                ))}
              </div>
              {pay.method === "card" ? (
                <>
                  <input required inputMode="numeric" className="input" placeholder="Card number (demo: 4111 1111 1111 1111)" value={pay.number}
                    onChange={(e) => setPay({ ...pay, number: digits(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required className="input" placeholder="MM/YY (demo: 12/30)" value={pay.exp}
                      onChange={(e) => setPay({ ...pay, exp: digits(e.target.value).slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2") })} />
                    <input required inputMode="numeric" className="input" placeholder="CVV (demo: 123)" value={pay.cvv}
                      onChange={(e) => setPay({ ...pay, cvv: digits(e.target.value).slice(0, 4) })} />
                  </div>
                </>
              ) : (
                <p className="rounded-xl bg-[#e3e8ff] p-4 text-sm">You will be redirected to PayPal to approve the payment (simulated in this prototype).</p>
              )}
              <p className="text-xs text-slate-500">Card details are checked by the company&apos;s bank through VISA Check. We accept PayPal and all major cards including American Express.</p>
              {msg && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn btn-ghost" onClick={() => { setMsg(""); setStep("extras"); }}>Back</button>
                <button className="btn btn-accent flex-1">Pay and confirm</button>
              </div>
            </form>
          )}
        </div>
        <Summary trip={trip} car={car} source={source} pct={pct} extras={extras} />
      </div>
      {loginOpen && <AuthModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
}












































