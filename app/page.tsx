"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import Img from "@/components/Img";
import { IMG } from "@/lib/images";
import { findUser } from "@/controllers/auth.controller";
import { SERVICES, DURATION, bookings, vehicles } from "@/controllers/booking.controller";
import { fromPrice, quote } from "@/controllers/pricing.controller";
import { gbp } from "@/lib/format";
import { fmtDate } from "@/lib/ui";
import { useStoreVersion } from "@/lib/useStore";
import QuickBook from "@/components/QuickBook";

type Rev = { name: string; text: string; stars: number; date: string; tag: string; verified: boolean };
type Size = { seats: number; names: string; from: number };

const HERO = "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=2000&q=80";
const SIZES = [4, 7];
const SVC_IMG: Record<string, string> = {};

// Optional: paste your own image URL for each size, for example { 4: "https://...", 6: "https://..." }
const FLEET_IMG: Record<number, string> = {};
const carImg = (s: number) => (FLEET_IMG[s] ? [FLEET_IMG[s]] : IMG.cars[s <= 4 ? 0 : s <= 6 ? 1 : s <= 7 ? 2 : 3]);

const SAMPLES: Rev[] = [
  { name: "Daniel Okafor", stars: 5, date: "2026-11-18", tag: "Airport transfer", verified: false, text: "Driver was waiting at arrivals and helped with the bags. The fare was exactly what the site showed." },
  { name: "Priya Shah", stars: 5, date: "2026-11-15", tag: "Hotel transfer", verified: false, text: "Booked from the hotel lobby in two minutes. The text with the car details arrived before the driver did." },
  { name: "Marcus Webb", stars: 4, date: "2026-11-12", tag: "Long distance", verified: false, text: "Comfortable ride to Manchester and a fair fixed price. Pick-up was five minutes late but the driver called ahead." },
  { name: "Sofia Rossi", stars: 5, date: "2026-11-09", tag: "Meet & greet", verified: false, text: "The name sign at arrivals made a stressful landing easy. Very polite driver and a spotless car." },
  { name: "Tom Hughes", stars: 5, date: "2026-11-06", tag: "Daily hire", verified: false, text: "Had a car and driver for a full day of meetings across London. Flexible and always on time." },
  { name: "Hannah Lee", stars: 4, date: "2026-11-03", tag: "Local journey", verified: false, text: "Cheaper than I expected with the online discount, and cancelling the next day was simple." },
  { name: "Omar Farouk", stars: 5, date: "2026-10-30", tag: "Airport transfer", verified: false, text: "Early morning flight and the car was outside before I was. Would book again." },
];

const WHY: [string, string, string, string][] = [
  ["24/7", "Convenience", "Book a minicab anytime and anywhere, in a few taps.", "By phone: speak to an operator"],
  ["Private", "Privacy", "Book online without anyone overhearing your plans.", "By phone: details are said out loud"],
  ["1st", "Priority", "Online bookings are served ahead of phone bookings.", "By phone: served after online bookings"],
  ["Text", "Improved safety", "We text the registration, colour and make before pick-up, so you never get into the wrong car.", "By phone: car details given on the call"],
];
const TRUST: [string, string][] = [
  ["15% off", "every online booking"],
  ["24 hours", "free cancellation window"],
  ["Text alert", "car details before pick-up"],
  ["24 / 7", "Call Centre support"],
];
const STEPS: [string, string][] = [
  ["Tell us your journey", "Choose a service, enter where and when, and how many people are travelling."],
  ["Choose a vehicle", "See the cars free at your time, with your 15% discount already included."],
  ["Pay and relax", "Pay securely online, get your confirmation by email and the car details by text."],
];
const PERKS = ["15% off every online booking", "24 hours free cancellation", "Text alert with your car details"];
const wrap = "mx-auto max-w-6xl px-5";

const Head = ({ no, label, title, accent, dark }: { no: string; label: string; title: string; accent: string; dark?: boolean }) => (
  <div className="mb-10">
    <p className={`flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.22em] ${dark ? "text-white/80" : "text-[#161b33]"}`}>
      <span className="text-5xl font-black leading-none tracking-normal text-[#fdb827]">{no}</span>
      {label}
    </p>
    <h2 className={`mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl ${dark ? "text-white" : "text-[#161b33]"}`}>
      {title} <span className={dark ? "text-[#fdb827]" : "text-[#2d5bf0]"}>{accent}</span>
    </h2>
  </div>
);

const Stars = ({ n, big }: { n: number; big?: boolean }) => (
  <span className={`tracking-tight ${big ? "text-2xl" : "text-base"}`} aria-label={`${n} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= n ? "text-[#fbbc04]" : "text-slate-300"}>&#9733;</span>)}
  </span>
);

export default function Home() {
  const [all, setAll] = useState(false);
  const [pick, setPick] = useState("");
  const [seats, setSeats] = useState(0);
  const [any, setAny] = useState(false);

  // Dữ liệu từ localStorage: rỗng khi render trên server, có sau khi vào trình duyệt
  const v = useStoreVersion();
  const prices: Record<string, number> = v ? Object.fromEntries(SERVICES.map((s) => [s.id, fromPrice(s.id)])) : {};
  const vs = v ? vehicles() : [];
  const fleet: Size[] = SIZES.map((seats) => {
    const g = vs.filter((v) => v.seats === seats);
    return { seats, names: g.slice(0, 3).map((v) => v.name).join(", ") + (g.length > 3 ? " and " + (g.length - 3) + " more" : ""), from: g.length ? Math.min(...g.map((v) => quote("local", v, "online").price)) : 0 };
  }).filter((x) => x.names);
  const real: Rev[] = (v ? bookings() : [])
    .filter((b) => b.review && b.review.text)
    .slice(-4)
    .reverse()
    .map((b) => ({
      name: findUser(b.email)?.name ?? "Customer",
      text: b.review!.text,
      stars: Math.round((b.review!.trip + b.review!.car + b.review!.driver) / 3),
      date: b.date,
      tag: SERVICES.find((s) => s.id === b.service)?.name ?? "Journey",
      verified: true,
    }));

  const reviews = [...real, ...SAMPLES];
  const avg = reviews.reduce((a, r) => a + r.stars, 0) / reviews.length;
  const feat = reviews.filter((r) => r.stars === 5).sort((a, b) => b.text.length - a.text.length)[0] ?? reviews[0];
  const rest = reviews.filter((r) => r !== feat);
  const shown = all ? rest : rest.slice(0, 6);

  return (
    <div className="bg-white text-[#161b33]">
      <Navbar />

      <section className="relative overflow-hidden bg-[#1f3fd0] text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO})` }} />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(8,16,70,.93),rgba(20,40,160,.78)_50%,rgba(20,40,160,.3))]" />
        <div className="fade-up relative mx-auto max-w-6xl px-5 pb-28 pt-14 md:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <span className="mb-5 inline-block rounded-full bg-[#fdb827] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#161b33] lg:hidden">15% off when you book online</span>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                Your London minicab, <span className="text-[#fdb827]">booked in a minute</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/90">Fixed fares, priority over phone bookings and a text with your car&apos;s details before pick-up.</p>
            </div>
            <div className="hidden justify-end lg:flex">
              <div className="-rotate-3 rounded-[32px] bg-[#fdb827] px-9 py-8 text-[#161b33] shadow-2xl shadow-black/40">
                <p className="text-xs font-extrabold uppercase tracking-[0.25em]">Online only</p>
                <p className="text-[110px] font-black leading-none tracking-tighter">15<span className="text-6xl">%</span></p>
                <p className="text-2xl font-extrabold leading-tight">off every<br />online booking</p>
                <p className="mt-4 border-t-2 border-[#161b33]/20 pt-3 text-sm font-semibold">Plus priority over phone bookings</p>
              </div>
            </div>
          </div>
          <div className="mt-10"><SearchBox /></div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-5">
        <ul className="grid grid-cols-2 divide-slate-100 rounded-3xl bg-white p-2 shadow-xl shadow-slate-900/10 lg:grid-cols-4 lg:divide-x">
          {TRUST.map(([a, b]) => (
            <li key={a} className="px-5 py-4">
              <p className="text-2xl font-extrabold text-[#2d5bf0]">{a}</p>
              <p className="text-sm text-slate-500">{b}</p>
            </li>
          ))}
        </ul>
      </div>

      <section id="services" className={`${wrap} py-20`}>
        <Head no="01" label="Services" title="Where do you" accent="need to go?" />
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <button key={s.id} onClick={() => setPick(s.id)} className="group text-left">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#14193a]">
                {SVC_IMG[s.id] ? (
                  <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${SVC_IMG[s.id]})` }} />
                ) : s.id === "meet" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#14193a]">
                    <div className="bg-white px-8 py-5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Arrivals</p>
                      <p className="mt-1 text-xl font-extrabold text-[#161b33]">MR. J. ANDERSON</p>
                    </div>
                  </div>
                ) : (
                  <Img srcs={IMG.svc[s.id]} className="h-full w-full transition duration-700 group-hover:scale-105" />
                )}
              </div>
              <h3 className="mt-4 text-xl font-extrabold">{s.name}</h3>
              <p className="mt-1 text-slate-500">{s.desc}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-semibold text-slate-500">About {DURATION[s.id] ?? 1} hour{(DURATION[s.id] ?? 1) === 1 ? "" : "s"}</span>
                <span className="rounded-md bg-[#fdb827] px-5 py-2.5 font-extrabold text-[#161b33] transition group-hover:bg-[#14193a] group-hover:text-white">Book now</span>
              </div>
            </button>
          ))}
        </div>
        {pick && <QuickBook service={pick} onClose={() => setPick("")} />}
        {seats > 0 && <QuickBook seats={seats} onClose={() => setSeats(0)} />}
        {any && <QuickBook onClose={() => setAny(false)} />}
      </section>
<section id="fleet" className="bg-[#f0f3fa] py-20">
        <div className={wrap}>
          <Head no="02" label="Our options" title="A car for" accent="every group size" />
          <div className="grid max-w-4xl gap-6 sm:grid-cols-2">
            {fleet.map((f) => (
              <div key={f.seats} className="group overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="relative h-52 overflow-hidden bg-[#2a45d0]">
                  <Img srcs={carImg(f.seats)} className="h-full w-full transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,16,48,0)_45%,rgba(10,16,48,.75))]" />
                  <span className="absolute left-4 top-4 flex items-baseline gap-1 rounded-2xl bg-[#fdb827] px-3 py-1.5 text-[#161b33] shadow-lg">
                    <span className="text-2xl font-black leading-none">{f.seats}</span>
                    <span className="text-xs font-extrabold uppercase">seats</span>
                  </span>
                  <span className="absolute bottom-3 left-4 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-[#2d5bf0]">From {gbp(f.from)}</span>
                </div>
                <div className="p-5">
                  <p className="min-h-[44px] font-bold leading-snug">{f.names}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    
                    <span className="rounded-full bg-[#eef0f7] px-3 py-1 text-xs font-semibold text-slate-600">Driver included</span>
                  </div>
                  <button onClick={() => setSeats(f.seats)} className="btn btn-primary btn-sm mt-4 w-full">Book this size</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#14193a] py-20 text-white">
        <div className={wrap}>
          <Head no="03" label="How it works" title="Your ride in" accent="three steps" dark />
          <div className="relative grid gap-10 md:grid-cols-3">
            <span className="absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-white/25 md:block" />
            {STEPS.map(([t, d], i) => (
              <div key={t} className="relative text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fdb827] text-2xl font-extrabold text-[#161b33] ring-8 ring-[#14193a]">{i + 1}</span>
                <h3 className="mt-5 text-xl font-bold">{t}</h3>
                <p className="mx-auto mt-2 max-w-xs text-white/70">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <button onClick={() => setAny(true)} className="btn btn-accent">Start your booking</button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0f1538] py-24 text-white">
        <Img srcs={IMG.svc.local} className="absolute inset-0 h-full w-full opacity-25" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,21,56,.96),rgba(26,52,190,.8))]" />
        <div className={`${wrap} relative`}>
          <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Head no="04" label="Why book online" title="Same London minicabs." accent="Better in every way online." dark />
            <p className="mb-10 text-lg text-white/75">A lower fare, priority service and a safer pick-up, all from one booking.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(([stat, t, d, p]) => (
              <div key={t} className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15">
                <p className="text-4xl font-extrabold text-[#fdb827]">{stat}</p>
                <h3 className="mt-3 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-sm text-white/80">{d}</p>
                <p className="mt-4 border-t border-white/15 pt-3 text-xs text-white/55">{p}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl bg-[#fdb827] p-6 text-[#161b33] md:flex-row md:items-center md:p-8">
            <div>
              <p className="text-2xl font-extrabold md:text-3xl">15% off every online booking</p>
              <p className="mt-1 font-medium text-[#161b33]/75">The discount is already included in every price you see.</p>
            </div>
            <button onClick={() => setAny(true)} className="btn btn-primary">Book online now</button>
          </div>
        </div>
      </section>

      <section className={`${wrap} py-20`}>
        <Head no="05" label="Reviews" title="Loved by" accent="London riders" />
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="rounded-[28px] border border-slate-200 p-7">
            <div className="flex items-end gap-4">
              <p className="text-7xl font-extrabold leading-none">{avg.toFixed(1)}</p>
              <div className="pb-1">
                <Stars n={Math.round(avg)} big />
                <p className="text-sm text-slate-500">{reviews.length} reviews</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = reviews.filter((r) => r.stars === n).length;
                return (
                  <div key={n} className="flex items-center gap-3 text-sm">
                    <span className="w-3 text-slate-600">{n}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <span className="block h-full rounded-full bg-[#fbbc04]" style={{ width: `${(c / reviews.length) * 100}%` }} />
                    </span>
                    <span className="w-4 text-right text-xs text-slate-400">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-[#14193a] p-8 text-white md:p-10">
            <span className="absolute -top-4 left-6 text-[150px] font-black leading-none text-[#fdb827]">&ldquo;</span>
            <p className="relative mt-14 text-xl font-semibold leading-snug md:text-2xl">{feat.text}</p>
            <div className="relative mt-7 flex items-center gap-3 border-t border-white/15 pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fdb827] text-lg font-extrabold text-[#161b33]">{feat.name.charAt(0).toUpperCase()}</span>
              <div className="flex-1">
                <p className="font-bold leading-tight">{feat.name}</p>
                <p className="text-xs text-white/60">{feat.tag} &middot; {fmtDate(feat.date)}</p>
              </div>
              <Stars n={feat.stars} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((r, i) => (
            <div key={r.name + r.date + i} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#2d5bf0]/40 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <Stars n={r.stars} />
                <span className="text-xs text-slate-400">{fmtDate(r.date)}</span>
              </div>
              <p className="mt-3 line-clamp-3 text-slate-700">{r.text}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14193a] text-sm font-bold text-white">{r.name.charAt(0).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold leading-tight">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.tag}</p>
                </div>
                {r.verified && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Verified</span>}
              </div>
            </div>
          ))}
        </div>
        {rest.length > 6 && (
          <div className="mt-6 text-center">
            <button onClick={() => setAll(!all)} className="btn btn-ghost">{all ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}</button>
          </div>
        )}
      </section>

      <section className={`${wrap} pb-20`}>
        <div className="relative overflow-hidden rounded-[36px] bg-[#14193a] text-white">
          <Img srcs={IMG.svc.local} className="absolute inset-0 h-full w-full opacity-20" />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(20,25,58,.97),rgba(20,25,58,.8))]" />
          <div className="relative grid items-center gap-10 p-8 md:p-14 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#fdb827]">Ready when you are</p>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">Your next ride is a minute away</h2>
              <p className="mt-5 max-w-md text-lg text-white/70">Pick a service, choose a car and pay online. Your 15% discount is already included.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => setAny(true)} className="btn btn-accent">Plan your journey</button>
                <a href="tel:0977535103" className="rounded-xl border border-white/30 px-5 py-3 font-bold transition hover:bg-white/10">Call 0977 535 103</a>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-7 text-[#161b33] shadow-2xl shadow-black/30">
              {prices.local > 0 && (
                <>
                  <p className="text-sm font-semibold text-slate-500">Local journeys from</p>
                  <p className="text-6xl font-extrabold tracking-tight text-[#2d5bf0]">{gbp(prices.local)}</p>
                </>
              )}
              <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
                {PERKS.map((p) => (
                  <li key={p} className="flex items-center gap-3 py-3 font-semibold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fdb827] text-xs font-black">&#10003;</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}























