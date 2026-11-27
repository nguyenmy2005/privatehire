"use client";
import { useEffect, useState } from "react";
import { useStoreVersion } from "@/lib/useStore";
import Shell from "@/components/Shell";
import SignInPrompt from "@/components/SignInPrompt";
import { currentUser } from "@/controllers/auth.controller";
import { markRead, messages } from "@/controllers/message.controller";
import type { Message } from "@/models/message.model";

export default function Inbox() {
  const v = useStoreVersion();
  const u = v ? currentUser() : undefined;
  return (
    <Shell title="Messages" subtitle="Emails and text messages from PrivateHire Cars.">
      {u === undefined ? null : !u || u.role !== "customer" ? (
        <SignInPrompt text="Sign in to read your emails and text messages." />
      ) : (
        <MessageList key={u.email} email={u.email} />
      )}
    </Shell>
  );
}

function MessageList({ email }: { email: string }) {
  // Chụp danh sách lúc mở trang để vẫn thấy nhãn "New", sau đó mới đánh dấu đã đọc
  const [list] = useState<Message[]>(() => messages(email));
  useEffect(() => {
    markRead(email);
  }, [email]);

  const fresh = list.filter((m) => !m.read).length;

  return list.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-2xl font-extrabold">No messages yet</p>
          <p className="mt-1 text-slate-500">Confirmations and updates will appear here.</p>
        </div>
      ) : (
        <>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {list.length} message{list.length === 1 ? "" : "s"}{fresh > 0 ? ` \u00b7 ${fresh} new` : ""}
          </p>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {list.map((m) => (
              <div key={m.id} className={`border-l-4 py-5 pl-5 ${m.read ? "border-transparent" : "border-[#fdb827]"}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="text-xl font-extrabold leading-tight">{m.subject}</p>
                  <p className="text-sm text-slate-500">{new Date(m.at).toLocaleString("en-GB")}</p>
                </div>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#2d5bf0]">
                  {m.kind === "text" ? "Text message" : "Email"}{!m.read && <span className="text-[#161b33]"> &middot; New</span>}
                </p>
                <p className="mt-3 whitespace-pre-line text-slate-700">{m.body}</p>
              </div>
            ))}
          </div>
        </>
      );
}
