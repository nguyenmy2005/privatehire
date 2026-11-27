// MODEL: tài khoản người dùng và phiên đăng nhập
import { get, notifyChange, set } from "./storage";

export type Role = "customer" | "staff";
export type User = {
  name: string; email: string; phone: string; address: string; cardLast4: string;
  password: string; role: Role; active?: boolean;
};

export const STAFF: User = {
  name: "Peter Pham", email: "peter@gmail.com", phone: "0977 535 103",
  address: "PrivateHire Cars, London", cardLast4: "", password: "12345", role: "staff",
};

const SESSION = "ph2_session";

const storedUsers = () => get<User[]>("ph2_users", []);
export const saveUsers = (u: User[]) => set("ph2_users", u);
export const addUser = (u: User) => saveUsers([...storedUsers(), u]);

export const allUsers = (): User[] => [STAFF, ...storedUsers()];
export const staffUsers = (): User[] => storedUsers().filter((u) => u.role === "staff");
export const findUser = (email: string) => allUsers().find((u) => u.email === email.trim().toLowerCase());
export const updateUser = (email: string, patch: Partial<Omit<User, "role" | "email">>) =>
  saveUsers(storedUsers().map((u) => (u.email === email ? { ...u, ...patch } : u)));

export const sessionEmail = () => localStorage.getItem(SESSION);
export function setSession(email: string) {
  localStorage.setItem(SESSION, email);
  notifyChange();
}
export function clearSession() {
  localStorage.removeItem(SESSION);
  notifyChange();
}
