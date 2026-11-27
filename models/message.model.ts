// MODEL: hộp thư (email / tin nhắn giả lập)
import { get, set } from "./storage";

export type Message = { id: string; to: string; kind: "email" | "text"; subject: string; body: string; at: string; read: boolean };

export const allMessages = () => get<Message[]>("ph2_messages", []);
export const saveMessages = (m: Message[]) => set("ph2_messages", m);
