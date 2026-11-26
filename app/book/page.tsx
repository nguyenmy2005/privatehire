"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import BookFlow from "@/components/BookFlow";
import { currentUser } from "@/lib/auth";
import type { Trip } from "@/lib/store";

export default function Book() {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [staff, setStaff] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("ph2_search");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setTrip(JSON.parse(raw) as Trip);
    } catch {
      router.replace("/");
      return;
    }
    const u = currentUser();
    setEmail(u?.email ?? null);
    setStaff(u?.role === "staff");
  }, [router]);

  return (
    <Shell wide title="Choose your vehicle" subtitle="Online bookings get 15% off and priority service.">
      {!trip ? null : staff ? (
        <p className="py-8 text-center text-slate-600">
          Staff accounts book for customers from the <a href="/staff" className="font-bold text-[#2d5bf0] underline">Call Centre console</a>.
        </p>
      ) : (
        <BookFlow email={email} source="online" trip={trip} onEdit={() => router.push("/")} />
      )}
    </Shell>
  );
}
