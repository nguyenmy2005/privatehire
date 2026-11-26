"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICES } from "@/lib/data";
import { DURATION, isFuture, vehicles, type Trip } from "@/lib/store";
import { checkRoute, groupsFor, labelsFor, optionsFor } from "@/lib/places";
import PlacePicker from "./PlacePicker";
import { isoDate } from "@/lib/ui";

const lab = "block text-xs font-bold uppercase tracking-wider text-slate-500";

export default function QuickBook({ service, seats, onClose }: { service?: string; seats?: number; onClose: () => void }) {
  const router = useRouter();
  const [svc, setSvc] = useState(service ?? "local");
  const s = SERVICES.find((x) => x.id === svc);
  const [f, setF] = useState<Trip>({ service: svc, pickup: "", destination: "", date: isoDate(1), time: "10:00", passengers: String(seats ?? 1) });
  const [err, setErr] = useState("");
  const set = (k: keyof Trip, v: string) => setF((x) => ({ ...x, [k]: v }));
  const hours = DURATION[svc] ?? 1;
  const lb = labelsFor(svc);
  const fromList = optionsFor(svc, "pickup");
  const toList = optionsFor(svc, "destination");
  const [vt, setVt] = useState("");
  const types = Array.from(new Set(vehicles().filter((v) => !seats || v.seats === seats).map((v) => v.type).filter((t): t is string => !!t)));
  const title = service ? s?.name : seats ? `${seats}-seater` : "Plan your journey";

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const changeService = (id: string) => {
    setSvc(id);
    setErr("");
    setF((x) => ({ ...x, service: id, pickup: "", destination: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const bad = checkRoute(svc, f.pickup, f.destination);
    if (bad) return setErr(bad);
    if (!isFuture(f.date, f.time)) return setErr("Please choose a date and time in the future.");
    localStorage.setItem("ph2_search", JSON.stringify({ ...f, service: svc, size: seats ? String(seats) : undefined, vtype: vt || undefined }));
    router.push("/book");
  };

  const chips = (key: "pickup" | "destination", list: string[]) =>
    list.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {list.slice(0, 5).map((p) => (
          <button type="button" key={p} onClick={() => set(key, p)} className="rounded-md bg-[#eef0f7] px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-[#fdb827] hover:text-[#161b33]">{p}</button>
        ))}
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1030]/60 p-4 sm:items-center" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 text-[#161b33] shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2d5bf0]">{seats && !service ? "Book a vehicle size" : "Book a service"}</p>
            <h2 className="mt-1 text-3xl font-extrabold">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{s?.desc} &middot; about {hours} hour{hours === 1 ? "" : "s"}</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-[#161b33]">Close</button>
        </div>

        
        

        <div className="mt-6 space-y-5">
          {!service && (
            <div>
              <label className={lab}>Service</label>
              <select className="input mt-1" value={svc} onChange={(e) => changeService(e.target.value)}>
                {SERVICES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={lab}>{lb.from}</label>
            <PlacePicker className="input mt-1" placeholder={lb.fromHint} value={f.pickup} onChange={(v) => set("pickup", v)} groups={groupsFor(svc, "pickup")} />
            {chips("pickup", fromList)}
          </div>
          <div>
            <label className={lab}>{lb.to}</label>
            <PlacePicker className="input mt-1" placeholder={lb.toHint} value={f.destination} onChange={(v) => set("destination", v)} groups={groupsFor(svc, "destination")} />
            {chips("destination", toList)}
          </div>
          <div>
            <label className={lab}>Vehicle type (optional)</label>
            <select className="input mt-1" value={vt} onChange={(e) => setVt(e.target.value)}>
              <option value="">Any type</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lab}>Date</label>
              <input required type="date" min={isoDate(0)} className="input mt-1" value={f.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className={lab}>Time</label>
              <input required type="time" className="input mt-1" value={f.time} onChange={(e) => set("time", e.target.value)} />
            </div>
            <div>
              <label className={lab}>Passengers</label>
              <select className="input mt-1" value={f.passengers} onChange={(e) => set("passengers", e.target.value)}>
                {Array.from({ length: seats ?? 7 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          {seats && !service && <p className="text-sm text-slate-500">Showing {seats}-seater vehicles.</p>}
        </div>

        {err && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
        <button className="btn btn-accent mt-6 w-full">Search cars</button>
        <p className="mt-3 text-center text-xs text-slate-500">Next you choose a vehicle and see your price with the 15% online discount.</p>
      </form>
    </div>
  );
}





