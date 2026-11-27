"use client";
import { useState } from "react";
import { login, register } from "@/controllers/auth.controller";
import { send } from "@/controllers/message.controller";
import type { User } from "@/models/user.model";
import { afterLogin, cardValid, digits, flash } from "@/lib/ui";

type Mode = "login" | "register";
const PANEL = "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=900&q=80";
const PERKS: [string, string][] = [
  ["15% off", "on every online booking"],
  ["Priority", "served ahead of phone bookings"],
  ["Car details", "by text before pick-up"],
];

export default function AuthModal({ onClose, start = "login" }: { onClose: () => void; start?: Mode }) {
  const [mode, setMode] = useState<Mode>(start);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", card: "", password: "" });
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((x) => ({ ...x, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        const u = login(form.email, form.password);
        flash(`Signed in as ${u.name}`);
        afterLogin(u.role);
        return;
      }
      if (form.password.length < 8) throw new Error("Password needs at least 8 characters.");
      if (!cardValid(form.card)) throw new Error("The card number is not valid.");
      const u: User = register({
        name: form.name.trim(), email: form.email, phone: form.phone.trim(), address: form.address.trim(),
        cardLast4: digits(form.card).slice(-4), password: form.password,
      });
      send(u.email, "email", "Confirm your PrivateHire account",
        `Hello ${u.name},\n\nWelcome to PrivateHire Cars. Your account was created with ${u.email}.\nBook online to get 15% off and priority service.`);
      login(u.email, form.password);
      flash(`Account created. A confirmation email was sent to ${u.email} (see Messages).`);
      afterLogin(u.role);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const tab = (m: Mode, label: string) => (
    <button type="button" onClick={() => { setMode(m); setError(""); }}
      className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === m ? "bg-white shadow" : "text-slate-500 hover:text-[#161b33]"}`}>{label}</button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1030]/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="fade-up relative flex max-h-[92vh] w-full max-w-[860px] overflow-hidden rounded-[28px] bg-white text-[#161b33] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative hidden w-[320px] shrink-0 flex-col justify-between overflow-hidden p-8 text-white md:flex">
          <div className="absolute inset-0 bg-[#2a45d0] bg-cover bg-center" style={{ backgroundImage: `url(${PANEL})` }} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,52,190,.88),rgba(10,20,90,.96))]" />
          <div className="relative">
            <p className="flex items-center gap-2 text-xl font-extrabold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fdb827] text-sm text-[#161b33]">PH</span>
              Private<span className="text-[#fdb827]">Hire</span>
            </p>
            <h3 className="mt-10 text-3xl font-extrabold leading-tight">Ride London with confidence</h3>
          </div>
          <ul className="relative space-y-5">
            {PERKS.map(([a, b]) => (
              <li key={a} className="border-l-4 border-[#fdb827] pl-4">
                <p className="text-lg font-extrabold">{a}</p>
                <p className="text-sm text-white/80">{b}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-w-0 flex-1 overflow-y-auto p-7 md:p-9">
          <button onClick={onClose} className="absolute right-5 top-5 rounded-xl bg-[#eef0f7] px-3 py-1.5 text-sm font-semibold transition hover:bg-[#e2e6f3]">Close</button>
          <h2 className="pr-20 text-[26px] font-extrabold">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="mb-5 mt-1 text-[15px] text-slate-500">
            {mode === "login" ? "Sign in to book and manage your journeys." : "Register to book online and get 15% off."}
          </p>
          <div className="mb-5 flex gap-1 rounded-2xl bg-[#eef0f7] p-1">
            {tab("login", "I have an account")}
            {tab("register", "I am new")}
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <>
                <input required placeholder="Full name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input required placeholder="Phone number" className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  <input required placeholder="Address" className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
                </div>
              </>
            )}
            <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <div className="relative">
              <input required type={show ? "text" : "password"} placeholder="Password" className="input pr-16" value={form.password} onChange={(e) => set("password", e.target.value)} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2d5bf0]">{show ? "Hide" : "Show"}</button>
            </div>
            {mode === "register" && (
              <>
                <input required inputMode="numeric" placeholder="Payment card number" className="input" value={form.card} onChange={(e) => set("card", e.target.value)} />
                <></>
              </>
            )}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button className="btn btn-primary w-full py-4 text-base">{mode === "register" ? "Create account" : "Sign in"}</button>
          </form>
          {mode === "login" && (
            <p className="mt-5 rounded-xl bg-[#f0f3fa] p-3 text-xs text-slate-600">Staff demo account: peter@gmail.com / 12345</p>
          )}
        </div>
      </div>
    </div>
  );
}

