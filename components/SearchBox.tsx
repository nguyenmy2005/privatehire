"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICES, DURATION, isFuture, loadSearch, saveSearch } from "@/controllers/booking.controller";
import { fromPrice } from "@/controllers/pricing.controller";
import { checkRoute, groupsFor, labelsFor } from "@/controllers/route.controller";
import { gbp } from "@/lib/format";
import type { Trip } from "@/models/booking.model";
import { isoDate } from "@/lib/ui";
import PlacePicker from "./PlacePicker";

const SHORT: Record<string, string> = { local: "Local", long: "Long distance", airport: "Airport", hotel: "Hotel", meet: "Meet & greet", daily: "Daily hire" };
const lab = "block text-[11px] font-bold uppercase tracking-wider text-slate-400";
const bare = "mt-0.5 w-full bg-transparent text-[17px] font-semibold text-[#161b33] outline-none placeholder:font-normal placeholder:text-slate-400";
const cell = "min-w-0 px-5 py-2.5 md:border-l md:border-slate-200";

export default function SearchBox({ onSearch, plain = false }: { onSearch?: (t: Trip) => void; plain?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<Trip>({ service: "local", pickup: "", destination: "", date: "", time: "10:00", passengers: "1" });
  const [err, setErr] = useState("");
  const set = (k: keyof Trip, v: string) => setF((x) => ({ ...x, [k]: v }));
  const [from, setFrom] = useState(0);
  useEffect(() => { setFrom(fromPrice(f.service)); }, [f.service]);
  const hours = DURATION[f.service] ?? 1;

  useEffect(() => {
    let init: Partial<Trip> = { date: isoDate(1) };
    if (!onSearch) {
      const s = loadSearch();
      if (s && isFuture(s.date, s.time)) init = s;
    }
    setF((x) => ({ ...x, ...init }));
    const h = (e: Event) => setF((x) => ({ ...x, ...(e as CustomEvent<Partial<Trip>>).detail }));
    window.addEventListener("ph:fill", h);
    return () => window.removeEventListener("ph:fill", h);
  }, [onSearch]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const bad = checkRoute(f.service, f.pickup, f.destination);
    if (bad) return setErr(bad);
    if (!isFuture(f.date, f.time)) return setErr("Please choose a date and time in the future.");
    setErr("");
    if (onSearch) return onSearch(f);
    saveSearch({ ...f, size: undefined, vtype: undefined });
    router.push("/book");
  };

  const tab = (id: string) => {
    const on = f.service === id;
    if (plain) {
      const base = "shrink-0 rounded-full px-5 py-2.5 text-[15px] font-bold transition ";
      return base + (on ? "bg-[#2d5bf0] text-white" : "bg-[#e2e6f3] text-[#161b33] hover:bg-[#d8dded]");
    }
    const base = "shrink-0 border-b-[3px] px-1 pb-3 text-base font-bold transition ";
    return base + (on ? "border-[#fdb827] text-white" : "border-transparent text-white/60 hover:text-white");
  };

  return (
    <form onSubmit={submit} className={plain ? "rounded-2xl bg-[#f0f3fa] p-3" : "w-full text-white"}>
      <div className={plain ? "mb-3 flex gap-2 overflow-x-auto px-1 pb-1" : "mb-4 flex gap-8 overflow-x-auto overflow-y-hidden border-b border-white/25"}>
        {SERVICES.map((s) => (
          <button type="button" key={s.id} onClick={() => setF((x) => ({ ...x, service: s.id, pickup: "", destination: "" }))} className={tab(s.id)}>{SHORT[s.id]}</button>
        ))}
      </div>
      <p className={`mb-5 text-lg font-semibold ${plain ? "px-2 text-[#161b33]" : "text-white"}`}>
        {SERVICES.find((s) => s.id === f.service)?.desc} &middot; about {hours} hour{hours === 1 ? "" : "s"}{from > 0 && <> &middot; from <span className={plain ? "font-extrabold text-[#2d5bf0]" : "font-extrabold text-[#fdb827]"}>{gbp(from)}</span> online</>}
      </p>
      <div className="flex flex-col gap-1 rounded-2xl bg-white p-2 text-left text-[#161b33] shadow-2xl shadow-black/25 md:flex-row md:items-center">
        <div className="min-w-0 flex-[1.3] px-5 py-2.5">
          <label className={lab}>{labelsFor(f.service).from}</label>
          <PlacePicker className={bare} placeholder={labelsFor(f.service).fromHint} value={f.pickup} onChange={(v) => set("pickup", v)} groups={groupsFor(f.service, "pickup")} />
          
        </div>
        <div className={`${cell} flex-[1.3]`}>
          <label className={lab}>{labelsFor(f.service).to}</label>
          <PlacePicker className={bare} placeholder={labelsFor(f.service).toHint} value={f.destination} onChange={(v) => set("destination", v)} groups={groupsFor(f.service, "destination")} />
          
        </div>
        <div className={cell}>
          <label className={lab}>Date</label>
          <input required type="date" min={isoDate(0)} className={bare} value={f.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div className={cell}>
          <label className={lab}>Time</label>
          <input required type="time" className={bare} value={f.time} onChange={(e) => set("time", e.target.value)} />
        </div>
        <div className={cell}>
          <label className={lab}>Passengers</label>
          <select className={bare} value={f.passengers} onChange={(e) => set("passengers", e.target.value)}>
            {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button className="rounded-xl bg-[#fdb827] px-8 py-4 text-lg font-extrabold text-[#161b33] transition hover:bg-[#f0a912]">Search cars</button>
      </div>
      {err && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
    </form>
  );
}



















