/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";

export default function Img({ srcs, alt = "", className = "" }: { srcs: string[]; alt?: string; className?: string }) {
  const [i, setI] = useState(0);
  if (i >= srcs.length) return <div className={`bg-gradient-to-br from-[#3b5bdb] to-[#9db0ff] ${className}`} />;
  return (
    <img src={srcs[i]} alt={alt} loading="lazy" referrerPolicy="no-referrer"
      onError={() => setI(i + 1)} className={`object-cover ${className}`} />
  );
}
