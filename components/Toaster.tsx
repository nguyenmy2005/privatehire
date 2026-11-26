"use client";
import { useEffect, useState } from "react";

export default function Toaster() {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);

  useEffect(() => {
    const push = (text: string) => {
      const id = Date.now() + Math.random();
      setItems((x) => [...x, { id, text }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4500);
    };
    const h = (e: Event) => push(String((e as CustomEvent).detail));
    window.addEventListener("ph:toast", h);
    const f = sessionStorage.getItem("ph2_flash");
    if (f) {
      sessionStorage.removeItem("ph2_flash");
      push(f);
    }
    return () => window.removeEventListener("ph:toast", h);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(92vw,380px)] flex-col gap-2 print:hidden">
      {items.map((i) => (
        <div key={i.id} className="fade-up pointer-events-auto rounded-xl bg-[#161b33] px-4 py-3 text-sm font-medium text-white shadow-xl">
          {i.text}
        </div>
      ))}
    </div>
  );
}
