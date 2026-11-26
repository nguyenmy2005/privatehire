"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PlaceGroup } from "@/lib/places";

type Pos = { left: number; width: number; top?: number; bottom?: number; maxH: number };

export default function PlacePicker({ value, onChange, groups, placeholder, className }: {
  value: string; onChange: (v: string) => void; groups: PlaceGroup[]; placeholder: string; className: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos>({ left: 0, width: 300, top: 0, maxH: 288 });
  const [tab, setTab] = useState("");

  const show = () => {
    const r = input.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom;
    const up = below < 300 && r.top > below;
    const width = Math.max(r.width, 300);
    setPos({
      left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
      width,
      top: up ? undefined : r.bottom + 8,
      bottom: up ? window.innerHeight - r.top + 8 : undefined,
      maxH: Math.max(180, Math.min(360, (up ? r.top : below) - 24)),
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e.target instanceof Node && panel.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const q = value.trim().toLowerCase();
  const exact = groups.some((g) => g.items.some((p) => p.toLowerCase() === q));
  const term = exact ? "" : q;
  const active = groups.some((g) => g.title === tab) ? tab : "";
  const shown = groups
    .filter((g) => !active || g.title === active)
    .map((g) => ({ title: g.title, items: g.items.filter((p) => !term || p.toLowerCase().includes(term)) }))
    .filter((g) => g.items.length > 0);

  const tabCls = (on: boolean) => `rounded-md px-2.5 py-1 text-xs font-bold transition ${on ? "bg-[#14193a] text-white" : "bg-[#eef0f7] text-slate-600 hover:bg-[#e2e6f3]"}`;

  return (
    <>
      <input
        ref={input}
        required
        autoComplete="off"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); show(); }}
        onFocus={show}
        onClick={show}
        onBlur={() => setOpen(false)}
      />
      {open && groups.length > 0 && createPortal(
        <div
          ref={panel}
          onMouseDown={(e) => e.preventDefault()}
          style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxH }}
          className="z-[60] flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white text-[#161b33] shadow-lg"
        >
          {groups.length > 1 && (
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200 p-2">
              <button type="button" onClick={() => setTab("")} className={tabCls(active === "")}>All</button>
              {groups.map((g) => (
                <button type="button" key={g.title} onClick={() => setTab(g.title)} className={tabCls(active === g.title)}>{g.title}</button>
              ))}
            </div>
          )}
          <div className="overflow-y-auto pb-2">
            {shown.length === 0 && <p className="px-4 py-4 text-sm text-slate-500">No match. Please pick a place from the list.</p>}
            {shown.map((g) => (
              <div key={g.title}>
                <p className="px-4 pb-1 pt-3 text-[11px] font-extrabold uppercase tracking-wider text-[#2d5bf0]">{g.title}</p>
                {g.items.map((p) => (
                  <button type="button" key={p} onClick={() => { onChange(p); setOpen(false); }} className="block w-full px-4 py-2 text-left text-sm font-semibold transition hover:bg-[#fdb827]">{p}</button>
                ))}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
