import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#14193a] px-5 py-14 text-white print:hidden">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="flex items-center gap-2 text-2xl font-extrabold">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fdb827] text-base text-[#161b33]">PH</span>
            Private<span className="text-[#fdb827]">Hire</span>
          </p>
          <p className="mt-4 max-w-sm text-sm text-white/70">Safe, reliable minicabs across London since 2012. Book online for 15% off and priority service.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-white/50">Customers</p>
          <ul className="space-y-2 text-sm text-white/85">
            <li><Link className="hover:text-[#fdb827]" href="/#services">Services</Link></li>
            <li><Link className="hover:text-[#fdb827]" href="/#fleet">Our options</Link></li>
            <li><Link className="hover:text-[#fdb827]" href="/bookings">My bookings</Link></li>
            <li><Link className="hover:text-[#fdb827]" href="/enquiry">Help and enquiries</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-white/50">Contact</p>
          <ul className="space-y-2 text-sm text-white/85">
            <li>Call Centre 0977 535 103</li>
            <li>Open 24 hours, 7 days a week</li>
            <li><Link className="underline hover:text-[#fdb827]" href="/staff">Staff login</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

