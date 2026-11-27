"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import BookFlow from "@/components/BookFlow";
import { currentUser } from "@/controllers/auth.controller";
import { loadSearch } from "@/controllers/booking.controller";
import { useStoreVersion } from "@/lib/useStore";

export default function Book() {
  const router = useRouter();
  const v = useStoreVersion();
  const trip = v ? loadSearch() : null;
  const u = v ? currentUser() : null;
  const email = u?.email ?? null;
  const staff = u?.role === "staff";

  // Chưa có chuyến nào được tìm thì quay về trang chủ
  useEffect(() => {
    if (v && !trip) router.replace("/");
  }, [v, trip, router]);

  return (
    <Shell wide title="Choose your vehicle" subtitle="Online bookings get 15% off and priority service.">
      {!trip ? null : staff ? (
        <p className="py-8 text-center text-slate-600">
          Staff accounts book for customers from the <Link href="/staff" className="font-bold text-[#2d5bf0] underline">Call Centre console</Link>.
        </p>
      ) : (
        <BookFlow key={email ?? "guest"} email={email} source="online" trip={trip} onEdit={() => router.push("/")} />
      )}
    </Shell>
  );
}
