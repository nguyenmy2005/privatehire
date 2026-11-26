"use client";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function SignInPrompt({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h2 className="text-2xl font-extrabold">Sign in required</h2>
      <p className="mb-6 mt-2 text-slate-600">{text}</p>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>Sign in or sign up</button>
      {open && <AuthModal onClose={() => setOpen(false)} />}
    </div>
  );
}
