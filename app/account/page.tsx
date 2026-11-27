"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import SignInPrompt from "@/components/SignInPrompt";
import { currentUser, updateUser } from "@/controllers/auth.controller";
import type { User } from "@/models/user.model";
import { cardValid, digits, toast } from "@/lib/ui";

export default function Account() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [f, setF] = useState({ name: "", phone: "", address: "" });
  const [card, setCard] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const u = currentUser();
    setUser(u);
    if (u) setF({ name: u.name, phone: u.phone, address: u.address });
  }, []);

  const saveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateUser(user.email, { name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim() });
    toast("Personal details updated.");
  };

  const saveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!cardValid(card)) return setErr("The card number is not valid.");
    updateUser(user.email, { cardLast4: digits(card).slice(-4) });
    setUser({ ...user, cardLast4: digits(card).slice(-4) });
    setCard("");
    setErr("");
    toast("Payment card saved.");
  };

  return (
    <Shell wide title="My account" subtitle="Update your details and payment card.">
      {user === undefined ? null : !user || user.role !== "customer" ? (
        <SignInPrompt text="Sign in with a customer account to manage your details." />
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-4 rounded-3xl bg-[#f0f3fa] p-5">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2d5bf0] text-3xl font-extrabold text-white">{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <p className="text-2xl font-extrabold">{user.name}</p>
              <p className="text-slate-600">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <form onSubmit={saveDetails} className="space-y-3 rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-extrabold">Personal details</h2>
              <p className="text-sm text-slate-500">Your email is used to sign in and cannot be changed.</p>
              <input className="input bg-slate-100" value={user.email} disabled />
              <input required className="input" placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <input required className="input" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              <input required className="input" placeholder="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
              <button className="btn btn-primary">Save details</button>
            </form>

            <form onSubmit={saveCard} className="space-y-4 rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-extrabold">Payment card</h2>
              <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#14193a,#2a45d0)] p-5 text-white shadow-xl shadow-blue-900/20">
                <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#fdb827]/30" />
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">PrivateHire card on file</p>
                <p className="mt-6 text-2xl font-extrabold tracking-[0.2em]">{user.cardLast4 ? `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${user.cardLast4}` : "No card on file"}</p>
                <p className="mt-4 text-sm font-semibold uppercase text-white/80">{user.name}</p>
              </div>
              <input required inputMode="numeric" className="input" placeholder="New card number" value={card}
                onChange={(e) => setCard(digits(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))} />
              <p className="text-xs text-slate-500">Only the last 4 digits are stored.</p>
              {err && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
              <button className="btn btn-primary">Save card</button>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
