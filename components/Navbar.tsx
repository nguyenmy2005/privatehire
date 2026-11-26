"use client";
import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";
import { currentUser, logout, type User } from "@/lib/auth";
import { unread } from "@/lib/store";

export default function Navbar() {
  const [modal, setModal] = useState<"" | "login" | "register">("");
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [count, setCount] = useState(0);
  const [path, setPath] = useState("");

  useEffect(() => {
    const u = currentUser();
    setUser(u);
    if (u) setCount(unread(u.email));
    setPath(window.location.pathname);
  }, []);

  const out = () => {
    logout();
    window.location.href = "/";
  };
  const staff = user?.role === "staff";

  const links: [string, string][] = staff
    ? [["Call Centre", "/staff"]]
    : [["Services", "/#services"], ["Options", "/#fleet"], ["My bookings", "/bookings"]];
  if (user && !staff) links.push(["Messages", "/inbox"], ["Account", "/account"]);
  if (!staff) links.push(["Help", "/enquiry"]);

  const linkCls = (h: string) =>
    `relative py-1 text-sm font-semibold transition ${
      staff ? (h === path ? "text-white" : "text-white/70 hover:text-white") : h === path ? "text-[#2d5bf0]" : "text-slate-600 hover:text-[#2d5bf0]"
    }`;

  return (
    <>
      <header className={`sticky top-0 z-40 print:hidden ${staff ? "bg-[#14193a] text-white" : "border-b border-slate-200 bg-white text-[#161b33]"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fdb827] text-sm font-extrabold text-[#161b33]">PH</span>
            <span>Private<span className={staff ? "text-[#fdb827]" : "text-[#2d5bf0]"}>Hire</span></span>
            {staff && <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">Staff</span>}
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {links.map(([t, h]) => (
              <a key={h} href={h} className={linkCls(h)}>
                {t}
                {t === "Messages" && count > 0 && <span className="ml-1.5 rounded-full bg-[#fdb827] px-1.5 py-0.5 text-[10px] font-extrabold text-[#161b33]">{count}</span>}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden items-center gap-2 sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d5bf0] text-sm font-extrabold text-white">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="text-sm font-semibold">{user.name.split(" ")[0]}</span>
                </span>
                <button onClick={out} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${staff ? "bg-white/15 hover:bg-white/25" : "bg-[#eef0f7] hover:bg-[#e2e6f3]"}`}>Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => setModal("login")} className="rounded-xl px-4 py-2 text-sm font-bold text-[#161b33] transition hover:bg-[#eef0f7]">Sign in</button>
                <button onClick={() => setModal("register")} className="rounded-xl bg-[#fdb827] px-4 py-2 text-sm font-extrabold text-[#161b33] transition hover:bg-[#f0a912]">Sign up</button>
              </>
            )}
            <button className={`rounded-lg border px-3 py-2 text-sm font-semibold md:hidden ${staff ? "border-white/40" : "border-slate-300"}`} onClick={() => setMenu(!menu)}>
              {menu ? "Close" : "Menu"}
            </button>
          </div>
        </div>
        {menu && (
          <div className={`px-5 pb-3 md:hidden ${staff ? "border-t border-white/10" : "border-t border-slate-100"}`}>
            {links.map(([t, h]) => <a key={h} href={h} className="block border-b border-slate-100/30 py-3 text-sm font-semibold">{t}</a>)}
          </div>
        )}
      </header>
      {modal && <AuthModal start={modal} onClose={() => setModal("")} />}
    </>
  );
}

