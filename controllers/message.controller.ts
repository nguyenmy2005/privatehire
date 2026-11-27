// CONTROLLER: gửi / đọc thông báo
import "./seed";
import { allMessages, saveMessages, type Message } from "@/models/message.model";
import { uid } from "@/lib/format";

export const messages = (to: string) =>
  allMessages().filter((m) => m.to === to).sort((a, b) => b.at.localeCompare(a.at));

export function send(to: string, kind: Message["kind"], subject: string, body: string) {
  saveMessages([...allMessages(), { id: uid(), to, kind, subject, body, at: new Date().toISOString(), read: false }]);
}

export const markRead = (to: string) => saveMessages(allMessages().map((m) => (m.to === to ? { ...m, read: true } : m)));
export const unread = (to: string) => allMessages().filter((m) => m.to === to && !m.read).length;
