import Navbar from "./Navbar";
import Footer from "./Footer";
import Img from "./Img";
import { IMG } from "@/lib/images";

export default function Shell({
  title, subtitle, wide, tone = "blue", children,
}: { title: string; subtitle?: string; wide?: boolean; tone?: "blue" | "navy"; children: React.ReactNode }) {
  const w = wide ? "max-w-6xl" : "max-w-4xl";
  const navy = tone === "navy";
  return (
    <div className="min-h-screen bg-[#f0f3fa] text-[#161b33]">
      <Navbar />
      <section className={`relative overflow-hidden text-white print:hidden ${navy ? "bg-[#14193a]" : "bg-[#1f3fd0]"}`}>
        {!navy && (
          <>
            <Img srcs={IMG.home} className="absolute inset-0 h-full w-full opacity-20" />
            <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(14,28,120,.95),rgba(31,63,208,.75))]" />
          </>
        )}
        <div className={`relative mx-auto px-5 pb-28 pt-14 ${w}`}>
          <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-[#fdb827]">{navy ? "Call Centre" : "PrivateHire"}</p>
          <h1 className="mt-3 text-5xl font-extrabold tracking-tight md:text-7xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-lg text-white/80">{subtitle}</p>}
        </div>
      </section>
      <main className={`relative mx-auto -mt-16 mb-16 px-5 ${w} print:mt-0 print:px-0`}>
        <div className="rounded-xl bg-white p-5 shadow-xl shadow-slate-900/10 md:p-8 print:shadow-none">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
