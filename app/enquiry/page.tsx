"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { currentUser } from "@/controllers/auth.controller";
import { bookings } from "@/controllers/booking.controller";
import { enquiries, saveEnquiries } from "@/controllers/enquiry.controller";
import { uid } from "@/lib/format";
import type { Enquiry } from "@/models/enquiry.model";
import { toast } from "@/lib/ui";

const FAQ: [string, string][] = [
  ["Can I cancel or change my booking?", "Yes. You can amend or cancel online up to 24 hours before the journey from My bookings."],
  ["How do I pay?", "We accept PayPal and all major credit cards including American Express. Cards are verified through VISA Check."],
  ["Why book online?", "Online bookings get 15% off and priority service over phone bookings."],
  ["How do I know the car is mine?", "Choose the text service and we will send the registration, colour and make 10 to 15 minutes before arrival."],
  ["Where is my receipt?", "After payment you can print your receipt from the confirmation page. A copy is also in Messages."],
  ["How do I use an offer code?", "Special offers are emailed to you. Enter the code when you choose a vehicle. Each code works once."],
  ["Can I leave a review?", "Yes. After your journey, rate the trip, the car and the driver from My bookings."],
  ["Can I book by phone?", "Yes, call 0977 535 103. Online bookings are cheaper and get priority."],
];

const CONTACT: [string, string, string, string][] = [
  ["Call us", "0977 535 103", "Open 24 hours, 7 days a week", "tel:0977535103"],
  ["Send an enquiry", "We reply by email", "General questions or about a trip", "#enquiry-form"],
  ["Your journeys", "My bookings", "Amend, cancel or review", "/bookings"],
];

export default function Help() {
  const [q, setQ] = useState("");
  const [f, setF] = useState({ email: "", topic: "General enquiry", message: "", bookingId: "" });
  const [mine, setMine] = useState<Enquiry[]>([]);
  const load = (e: string) => setMine(enquiries().filter((x) => x.email === e));

  useEffect(() => {
    const u = currentUser();
    const e = u && u.role === "customer" ? u.email : "";
    setF((p) => ({ ...p, email: e }));
    load(e);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = f.email.trim().toLowerCase();
    saveEnquiries([...enquiries(), { id: uid(), email, topic: f.topic, message: f.message.trim(), bookingId: f.topic === "Enquiry about a specific trip" ? f.bookingId : undefined }]);
    setF({ ...f, message: "", bookingId: "" });
    load(email);
    toast("Enquiry sent. We will reply by email.");
  };

  const list = FAQ.filter(([a, b]) => (a + b).toLowerCase().includes(q.toLowerCase()));

  return (
    <Shell wide title="How can we help?" subtitle="Find a quick answer or send us an enquiry.">
      <div className="space-y-10">
        <div className="rounded-3xl bg-[#14193a] p-6 text-white md:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-[#fdb827]">Search the help centre</p>
          <input
            className="mt-3 w-full rounded-2xl bg-white px-5 py-4 text-lg font-medium text-[#161b33] outline-none ring-4 ring-transparent transition placeholder:text-slate-400 focus:ring-[#fdb827]/60"
            placeholder="Try: cancel, receipt, offer code"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CONTACT.map(([t, big, small, href]) => (
            <a key={t} href={href} className="card-lift block rounded-3xl border border-slate-200 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t}</p>
              <p className="mt-2 text-2xl font-extrabold text-[#2d5bf0]">{big}</p>
              <p className="mt-1 text-sm text-slate-500">{small}</p>
            </a>
          ))}
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="mb-4 text-2xl font-extrabold">Frequently asked questions</h2>
            <div className="space-y-3">
              {list.map(([a, b], i) => (
                <details key={a} className="group rounded-2xl border border-slate-200 bg-white p-4 transition open:border-[#2d5bf0] open:bg-[#f7f9ff]">
                  <summary className="flex cursor-pointer list-none items-center gap-4 font-bold">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fdb827] text-sm font-extrabold text-[#161b33]">{i + 1}</span>
                    <span className="flex-1">{a}</span>
                    <span className="text-2xl font-light text-[#2d5bf0] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 pl-12 text-slate-600">{b}</p>
                </details>
              ))}
              {list.length === 0 && <p className="rounded-2xl bg-slate-50 p-5 text-slate-500">No answers found. Send us an enquiry.</p>}
            </div>
          </div>

          <div id="enquiry-form" className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5">
              <div className="h-2 bg-[#fdb827]" />
              <form onSubmit={submit} className="space-y-3 p-6">
                <h2 className="text-2xl font-extrabold">Make an enquiry</h2>
                <p className="pb-1 text-sm text-slate-500">Tell us what you need and we will reply by email.</p>
                <input required type="email" className="input" placeholder="Your email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                <select className="input" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>
                  <option>General enquiry</option>
                  <option>Enquiry about a specific trip</option>
                </select>
                {f.topic === "Enquiry about a specific trip" && (
                  <select required className="input" value={f.bookingId} onChange={(e) => setF({ ...f, bookingId: e.target.value })}>
                    <option value="">Choose your journey (sign in to see yours)</option>
                    {bookings().filter((b) => b.email === f.email.trim().toLowerCase()).map((b) => (
                      <option key={b.id} value={b.id}>{b.id} - {b.pickup} to {b.destination}, {b.date}</option>
                    ))}
                  </select>
                )}
                <textarea required rows={5} className="input" placeholder="Your message" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
                <button className="btn btn-accent w-full">Send enquiry</button>
                <p className="text-center text-sm text-slate-500">Or call the Call Centre on 0977 535 103, open 24/7.</p>
              </form>
            </div>

            {mine.length > 0 && <h3 className="mb-3 mt-8 text-xl font-extrabold">Your enquiries</h3>}
            <div className="space-y-3">
              {mine.map((x) => (
                <div key={x.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{x.topic}{x.bookingId ? ` - ${x.bookingId}` : ""}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${x.reply ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>{x.reply ? "Answered" : "Waiting"}</span>
                  </div>
                  <p className="mt-2">{x.message}</p>
                  {x.reply && <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">Reply: {x.reply}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
