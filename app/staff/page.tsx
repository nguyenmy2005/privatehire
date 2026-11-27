"use client";
import { useState } from "react";
import Shell from "@/components/Shell";
import SignInPrompt from "@/components/SignInPrompt";
import SearchBox from "@/components/SearchBox";
import BookFlow from "@/components/BookFlow";
import { allUsers, createStaff, currentUser, findUser, register, staffUsers, updateUser } from "@/controllers/auth.controller";
import { SERVICES, available, bookings, drivers, saveDrivers, saveVehicles, vehicles } from "@/controllers/booking.controller";
import { enquiries, saveEnquiries } from "@/controllers/enquiry.controller";
import { send } from "@/controllers/message.controller";
import { offers, saveOffers } from "@/controllers/offer.controller";
import { quote, rateForSeats } from "@/controllers/pricing.controller";
import { gbp, uid } from "@/lib/format";
import type { Booking, Trip } from "@/models/booking.model";
import type { Enquiry } from "@/models/enquiry.model";
import type { Offer } from "@/models/offer.model";
import type { User } from "@/models/user.model";
import type { Driver, Vehicle } from "@/models/vehicle.model";
import { digits, fmtDate, isoDate, toast } from "@/lib/ui";
import { useStoreVersion } from "@/lib/useStore";

const TABS = ["New booking", "Bookings", "Fleet", "Enquiries", "Offers"];
const tally = (xs: string[]) =>
  Object.entries(xs.reduce<Record<string, number>>((m, x) => ({ ...m, [x]: (m[x] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 p-4">
    <p className="text-4xl font-extrabold text-[#2d5bf0]">{value}</p>
    <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
  </div>
);

function NewBooking() {
  const [q, setQ] = useState({ name: "", email: "", phone: "", address: "" });
  const [acct, setAcct] = useState<User | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");
  const [src, setSrc] = useState<Booking["source"]>("phone");
  const [trip, setTrip] = useState<Trip | null>(null);

  const reset = () => {
    setAcct(null);
    setIsNew(false);
    setCreating(false);
    setTrip(null);
    setMsg("");
    setQ({ name: "", email: "", phone: "", address: "" });
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    const u = q.email.trim() ? findUser(q.email) : allUsers().find((x) => digits(x.phone) === digits(q.phone));
    if (!u || u.role !== "customer") return setMsg("No customer account found for these details. You can create a new customer account.");
    const samePhone = u.phone.replace(/\s/g, "") === q.phone.replace(/\s/g, "");
    if (!samePhone || u.name.toLowerCase() !== q.name.trim().toLowerCase()) {
      return setMsg("Verification failed: the details do not match our records.");
    }
    setAcct(u);
    setIsNew(false);
    setMsg("");
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.name.trim() || !q.email.trim() || !q.phone.trim()) return setMsg("Name, email and phone are needed to create an account.");
    try {
      const temp = uid();
      const u = register({ name: q.name.trim(), email: q.email, phone: q.phone.trim(), address: q.address.trim(), cardLast4: "", password: temp });
      send(u.email, "email", "Your PrivateHire account",
        `Hello ${u.name},\n\nThe Call Centre created an account for you.\nEmail: ${u.email}\nTemporary password: ${temp}\nPlease sign in and change it.`);
      setAcct(u);
      setIsNew(true);
      setMsg("");
      toast(`Customer account created. Login details emailed to ${u.email}.`);
    } catch (err) {
      setMsg((err as Error).message);
    }
  };

  if (acct) {
    return (
      <div>
        <div className="mb-4 rounded-xl border-l-4 border-green-500 bg-green-50 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold">{isNew ? `New customer account created: ${acct.name}` : `Caller verified, existing account: ${acct.name}`}</p>
            <button className="font-semibold text-[#2d5bf0] underline" onClick={reset}>Next caller</button>
          </div>
          <div className="mt-2 grid gap-1 text-slate-600 sm:grid-cols-2">
            <span>Email: {acct.email}</span>
            <span>Phone: {acct.phone}</span>
            <span>Address: {acct.address || "Not provided"}</span>
            <span>Card on file: {acct.cardLast4 ? `ending ${acct.cardLast4}` : "none"}</span>
          </div>
        </div>
        <select className="input mb-4 sm:max-w-xs" value={src} onChange={(e) => setSrc(e.target.value as Booking["source"])}>
          <option value="phone">Phone booking</option>
          <option value="in person">In-person booking</option>
        </select>
        {trip ? (
          <BookFlow key={JSON.stringify(trip) + src} email={acct.email} source={src} trip={trip} onEdit={() => setTrip(null)} />
        ) : (
          <SearchBox plain onSearch={setTrip} />
        )}
      </div>
    );
  }

  if (creating) {
    return (
      <form onSubmit={create} className="max-w-xl space-y-3 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="text-2xl font-extrabold">Create a customer account</h2>
          <p className="mt-1 text-slate-600">For a new caller. Login details are emailed to the customer.</p>
        </div>
        <input required className="input" placeholder="Full name" value={q.name} onChange={(e) => setQ({ ...q, name: e.target.value })} />
        <input required type="email" className="input" placeholder="Email" value={q.email} onChange={(e) => setQ({ ...q, email: e.target.value })} />
        <input required className="input" placeholder="Phone" value={q.phone} onChange={(e) => setQ({ ...q, phone: e.target.value })} />
        <input className="input" placeholder="Address" value={q.address} onChange={(e) => setQ({ ...q, address: e.target.value })} />
        {msg && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary">Create customer account</button>
          <button type="button" className="btn btn-ghost" onClick={() => { setCreating(false); setMsg(""); }}>Back to verification</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="max-w-xl space-y-3 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-2xl font-extrabold">Verify the caller</h2>
        <p className="mt-1 text-slate-600">Check name, email and phone number before any booking.</p>
      </div>
      <input required className="input" placeholder="Full name" value={q.name} onChange={(e) => setQ({ ...q, name: e.target.value })} />
      <input type="email" className="input" placeholder="Email (or leave blank to search by phone)" value={q.email} onChange={(e) => setQ({ ...q, email: e.target.value })} />
      <input required className="input" placeholder="Phone" value={q.phone} onChange={(e) => setQ({ ...q, phone: e.target.value })} />
      {msg && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary">Verify caller</button>
        <button type="button" className="font-bold text-[#2d5bf0] underline" onClick={() => { setCreating(true); setMsg(""); }}>New caller? Create a customer account</button>
      </div>
    </form>
  );
}

function BookingsTab() {
  const list = [...bookings()].sort(
    (a, b) => (a.source === "online" ? 0 : 1) - (b.source === "online" ? 0 : 1) || (a.date + a.time).localeCompare(b.date + b.time)
  );
  if (!list.length) return <p className="py-8 text-center text-slate-500">No bookings yet.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#14193a] text-xs uppercase tracking-wide text-white/80">
          <tr><th className="p-3">Ref</th><th className="p-3">Customer</th><th className="p-3">Service</th><th className="p-3">When</th><th className="p-3">Vehicle</th><th className="p-3">Total</th><th className="p-3">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {list.map((b) => (
            <tr key={b.id}>
              <td className="p-3 font-bold">
                {b.id}
                {b.source === "online" && <span className="ml-2 rounded bg-[#fdb827] px-1.5 py-0.5 text-[10px] font-extrabold">PRIORITY</span>}
              </td>
              <td className="p-3">{b.email}<br /><span className="text-xs text-slate-400">{b.source}</span></td>
              <td className="p-3">{SERVICES.find((s) => s.id === b.service)?.name}</td>
              <td className="p-3">{fmtDate(b.date)} {b.time}</td>
              <td className="p-3">{vehicles().find((v) => v.id === b.vehicleId)?.name}</td>
              <td className="p-3 font-semibold">{gbp(b.price)}</td>
              <td className="p-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${b.status === "confirmed" ? "bg-blue-100 text-blue-800" : b.status === "completed" ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"}`}>{b.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Fleet({ refresh }: { refresh: () => void }) {
  const [d, setD] = useState({ date: isoDate(1), time: "10:00", service: "local" });
  const [v, setV] = useState({ plate: "", name: "", colour: "", seats: "4", driverId: "" });
  const [dr, setDr] = useState({ name: "", phone: "" });
  const free = d.date ? available(0, d.date, d.time, d.service).map((x) => x.id) : null;

  const saveV = (e: React.FormEvent) => {
    e.preventDefault();
    const all = vehicles();
    const i = all.findIndex((x) => x.plate.toLowerCase() === v.plate.trim().toLowerCase());
    const nv: Vehicle = {
      id: i >= 0 ? all[i].id : "v" + uid(), plate: v.plate.trim().toUpperCase(), name: v.name.trim(), colour: v.colour.trim(),
      seats: +v.seats, rate: i >= 0 ? all[i].rate : rateForSeats(+v.seats), driverId: v.driverId || undefined,
    };
    if (i >= 0) all[i] = nv;
    else all.push(nv);
    saveVehicles(all);
    toast(i >= 0 ? "Minicab updated." : "Minicab added.");
    setV({ plate: "", name: "", colour: "", seats: "4", driverId: "" });
    refresh();
  };

  const saveD = (e: React.FormEvent) => {
    e.preventDefault();
    const all = drivers();
    const i = all.findIndex((x) => x.name.toLowerCase() === dr.name.trim().toLowerCase());
    const nd: Driver = { id: i >= 0 ? all[i].id : "d" + uid(), name: dr.name.trim(), phone: dr.phone.trim() };
    if (i >= 0) all[i] = nd;
    else all.push(nd);
    saveDrivers(all);
    toast(i >= 0 ? "Driver updated." : "Driver added.");
    setDr({ name: "", phone: "" });
    refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 font-bold">Check availability and starting fares</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <select className="input" value={d.service} onChange={(e) => setD({ ...d, service: e.target.value })}>
            {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" className="input" value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} />
          <input type="time" className="input" value={d.time} onChange={(e) => setD({ ...d, time: e.target.value })} />
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#14193a] text-xs uppercase tracking-wide text-white/80">
            <tr><th className="p-3">Minicab</th><th className="p-3">Seats</th><th className="p-3">Driver</th><th className="p-3">Slot</th><th className="p-3">Phone fare (from)</th><th className="p-3">Online fare (from)</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles().map((x) => {
              const isFree = free ? free.includes(x.id) : null;
              return (
                <tr key={x.id}>
                  <td className="p-3 font-semibold">{x.name}<br /><span className="text-xs font-normal text-slate-400">{x.colour}, {x.plate}</span></td>
                  <td className="p-3">{x.seats}</td>
                  <td className="p-3">{drivers().find((y) => y.id === x.driverId)?.name ?? "Unassigned"}</td>
                  <td className="p-3">{isFree === null ? "-" : <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isFree ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{isFree ? "Available" : "Booked"}</span>}</td>
                  <td className="p-3">{gbp(quote(d.service, x, "phone").price)}</td>
                  <td className="p-3">{gbp(quote(d.service, x, "online").price)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {drivers().map((x) => <div key={x.id} className="rounded-xl border border-slate-200 p-3 text-sm"><b>{x.name}</b> &middot; {x.phone}</div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveV} className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f0f3fa] p-4">
          <p className="col-span-2 font-bold">Add or update a minicab</p>
          <input required className="input" placeholder="Plate" value={v.plate} onChange={(e) => setV({ ...v, plate: e.target.value })} />
          <input required className="input" placeholder="Make and model" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
          <input required className="input" placeholder="Colour" value={v.colour} onChange={(e) => setV({ ...v, colour: e.target.value })} />
          <select className="input" value={v.seats} onChange={(e) => setV({ ...v, seats: e.target.value })}>
            {[4, 7].map((n) => <option key={n} value={n}>{n} seats</option>)}
          </select>
          <select className="input col-span-2" value={v.driverId} onChange={(e) => setV({ ...v, driverId: e.target.value })}>
            <option value="">No driver assigned</option>
            {drivers().map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <button className="btn btn-primary btn-sm col-span-2">Save minicab</button>
        </form>
        <form onSubmit={saveD} className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f0f3fa] p-4">
          <p className="col-span-2 font-bold">Add or update a driver</p>
          <input required className="input" placeholder="Name" value={dr.name} onChange={(e) => setDr({ ...dr, name: e.target.value })} />
          <input required className="input" placeholder="Phone" value={dr.phone} onChange={(e) => setDr({ ...dr, phone: e.target.value })} />
          <button className="btn btn-primary btn-sm col-span-2">Save driver</button>
        </form>
      </div>
    </div>
  );
}

function EnqRow({ e, refresh }: { e: Enquiry; refresh: () => void }) {
  const [r, setR] = useState("");
  const reply = () => {
    if (!r.trim()) return;
    saveEnquiries(enquiries().map((x) => (x.id === e.id ? { ...x, reply: r.trim() } : x)));
    send(e.email, "email", `Re: ${e.topic}`, r.trim());
    toast(`Reply emailed to ${e.email}`);
    refresh();
  };
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{e.email} &middot; {e.topic}{e.bookingId ? " - Booking " + e.bookingId : ""}<span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${e.reply ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>{e.reply ? "Answered" : "Open"}</span></p>
      <p className="my-2">{e.message}</p>
      {e.reply ? (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">Replied: {e.reply}</p>
      ) : (
        <div className="flex gap-2">
          <input className="input" placeholder="Write a reply" value={r} onChange={(x) => setR(x.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={reply}>Send</button>
        </div>
      )}
    </div>
  );
}

function Offers({ refresh }: { refresh: () => void }) {
  const [o, setO] = useState({ email: "", percent: "10" });
  const live = bookings().filter((b) => b.status !== "cancelled");
  const cars = tally(live.map((b) => vehicles().find((v) => v.id === b.vehicleId)?.name ?? "Unknown"));
  const customers = tally(live.map((b) => b.email));
  const sent = offers();

  const sendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const email = o.email.trim().toLowerCase();
    const u = findUser(email);
    if (!u || u.role !== "customer") return toast("No customer account for that email.");
    const code = "SAVE" + uid().slice(0, 4);
    const offer: Offer = { code, email, percent: +o.percent, used: false };
    saveOffers([...sent, offer]);
    send(email, "email", "A special offer for you", `Thank you for travelling with us. Use code ${code} for ${o.percent}% off your next booking. The code works once.`);
    toast(`Offer ${code} emailed to ${email}`);
    setO({ ...o, email: "" });
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="mb-2 text-lg font-extrabold text-[#2d5bf0]">Popular cars</p>
          {cars.length ? cars.map(([n, c]) => <p key={n} className="text-sm">{n}: {c} bookings</p>) : <p className="text-sm text-slate-500">No data yet</p>}
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="mb-2 text-lg font-extrabold text-[#2d5bf0]">Most loyal customers</p>
          {customers.length ? customers.map(([n, c]) => (
            <p key={n} className="text-sm">{n}: {c} bookings <button className="font-semibold text-[#2d5bf0] underline" onClick={() => setO({ ...o, email: n })}>send offer</button></p>
          )) : <p className="text-sm text-slate-500">No data yet</p>}
        </div>
      </div>
      <form onSubmit={sendOffer} className="flex flex-wrap gap-2 rounded-2xl bg-[#f0f3fa] p-4">
        <input required type="email" className="input min-w-0 flex-1" placeholder="Customer email" value={o.email} onChange={(e) => setO({ ...o, email: e.target.value })} />
        <select className="input !w-28" value={o.percent} onChange={(e) => setO({ ...o, percent: e.target.value })}>
          {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}%</option>)}
        </select>
        <button className="btn btn-primary">Send offer</button>
      </form>
      {sent.length > 0 && (
        <div className="space-y-1">
          <p className="font-bold">Offers sent</p>
          {sent.map((x) => <p key={x.code} className="text-sm text-slate-600"><b>{x.code}</b> &middot; {x.email} &middot; {x.percent}% &middot; {x.used ? "used" : "not used yet"}</p>)}
        </div>
      )}
    </div>
  );
}

function StaffRow({ u, done }: { u: User; done: () => void }) {
  const [name, setName] = useState(u.name);
  const [phone, setPhone] = useState(u.phone);
  const active = u.active !== false;
  const save = () => {
    if (!name.trim() || !phone.trim()) return toast("Name and phone are required.");
    updateUser(u.email, { name: name.trim(), phone: phone.trim() });
    toast("Staff account updated.");
    done();
  };
  const toggle = () => {
    updateUser(u.email, { active: !active });
    toast(active ? "Staff account deactivated." : "Staff account reactivated.");
    done();
  };
  return (
    <div className="grid gap-3 border-b border-slate-200 py-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      <p className="break-all text-sm">{u.email}</p>
      <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{active ? "Active" : "Deactivated"}</span>
        <button className="btn btn-ghost btn-sm" onClick={save}>Save</button>
        <button className="btn btn-ghost btn-sm" onClick={toggle}>{active ? "Deactivate" : "Reactivate"}</button>
      </div>
    </div>
  );
}

function StaffAccounts() {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [msg, setMsg] = useState("");
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createStaff(f);
      toast("Staff account created.");
      setF({ name: "", email: "", phone: "", password: "" });
      setMsg("");
      refresh();
    } catch (err) {
      setMsg((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Staff accounts</h2>
        <p className="mt-1 text-slate-600">Only the administrator sees this tab. Customer accounts are created from the New booking tab.</p>
      </div>
      <form onSubmit={create} className="grid gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
        <p className="font-bold sm:col-span-2">Create a staff account</p>
        <input required className="input" placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input required type="email" className="input" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required className="input" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input required type="password" className="input" placeholder="Temporary password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {msg && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{msg}</p>}
        <button className="btn btn-primary sm:col-span-2">Create staff account</button>
      </form>
      <div>
        <div className="hidden gap-3 border-b-2 border-[#14193a] pb-2 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid md:grid-cols-[1fr_1fr_1fr_auto]">
          <span>Name</span><span>Email</span><span>Phone</span><span className="w-72">Status</span>
        </div>
        <div className="grid gap-3 border-b border-slate-200 py-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
          <p className="font-semibold">Peter Pham</p>
          <p className="break-all text-sm">peter@gmail.com</p>
          <p className="text-sm">0977 535 103</p>
          <p className="w-72 text-sm text-slate-500">Administrator (built-in)</p>
        </div>
        {staffUsers().map((u) => <StaffRow key={u.email} u={u} done={refresh} />)}
      </div>
    </div>
  );
}

function Console({ admin }: { admin: boolean }) {
  const [tab, setTab] = useState("New booking");
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);

  const all = bookings();
  const live = all.filter((b) => b.status !== "cancelled");
  const onlineShare = all.length ? Math.round((all.filter((b) => b.source === "online").length / all.length) * 100) : 0;
  const open = enquiries().filter((e) => !e.reply);

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 [&>div]:rounded-3xl [&>div]:border-0 [&>div]:bg-[#f0f3fa] [&>div]:p-5">
        <Stat label="Total bookings" value={String(all.length)} />
        <Stat label="Booked online" value={`${onlineShare}%`} />
        <Stat label="Revenue" value={gbp(live.reduce((s, b) => s + b.price, 0))} />
        <Stat label="Open enquiries" value={String(open.length)} />
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {(admin ? [...TABS, "Staff accounts"] : TABS).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 border-b-4 px-4 py-3 text-sm font-bold transition ${tab === t ? "border-[#fdb827] text-[#161b33]" : "border-transparent text-slate-500 hover:text-[#161b33]"}`}>{t}</button>
        ))}
      </div>
      {tab === "New booking" && <NewBooking />}
      {tab === "Bookings" && <BookingsTab />}
      {tab === "Fleet" && <Fleet refresh={refresh} />}
      {tab === "Enquiries" && (
        <div className="space-y-3">
          {enquiries().map((e) => <EnqRow key={e.id} e={e} refresh={refresh} />)}
          {!enquiries().length && <p className="py-8 text-center text-slate-500">No enquiries yet.</p>}
        </div>
      )}
      {tab === "Offers" && <Offers refresh={refresh} />}
      {tab === "Staff accounts" && admin && <StaffAccounts />}
    </div>
  );
}

export default function Staff() {
  const v = useStoreVersion();
  if (!v) return null;
  const user = currentUser();
  return (
    <Shell wide tone="navy" title="Call Centre console" subtitle="Verify callers, take bookings, manage the fleet, enquiries and offers.">
      {user?.role === "staff" ? (
        <Console admin={user.email === "peter@gmail.com"} />
      ) : (
        <SignInPrompt text="This area is for Call Centre staff only. Please sign in with a staff account." />
      )}
    </Shell>
  );
}

































