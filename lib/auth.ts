import { get, set } from "./store";

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
const PASSWORD_RULE = /^.{8,}$/;

export const allUsers = (): User[] => [STAFF, ...get<User[]>("ph2_users", [])];
export const staffUsers = (): User[] => get<User[]>("ph2_users", []).filter((u) => u.role === "staff");
export const findUser = (email: string) => allUsers().find((u) => u.email === email.trim().toLowerCase());
export const userExists = (email: string) => !!findUser(email);

export function register(u: Omit<User, "role" | "active">): User {
  if (!/^[^\s@]+@(gmail|icloud|outlook|hotmail|yahoo)\.com$/i.test(u.email.trim())) throw new Error("Please use a Gmail, iCloud, Outlook, Hotmail or Yahoo address.");
  const email = u.email.trim().toLowerCase();
  if (!/^[^\s@]+@(gmail|icloud|outlook|hotmail|yahoo)\.com$/.test(email)) throw new Error("Please use a Gmail, iCloud, Outlook, Hotmail or Yahoo address.");
  if (findUser(email)) throw new Error("Email already registered");
  const user: User = { ...u, email, role: "customer" };
  set("ph2_users", [...get<User[]>("ph2_users", []), user]);
  return user;
}

export function createStaff(u: { name: string; email: string; phone: string; password: string }): User {
  const email = u.email.trim().toLowerCase();
  if (!u.name.trim() || !u.phone.trim()) throw new Error("Name and phone are required.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please enter a valid email address.");
  if (!PASSWORD_RULE.test(u.password)) throw new Error("Password needs at least 8 characters.");
  if (findUser(email)) throw new Error("Email already registered");
  const user: User = {
    name: u.name.trim(), email, phone: u.phone.trim(), address: "PrivateHire Cars, London",
    cardLast4: "", password: u.password, role: "staff", active: true,
  };
  set("ph2_users", [...get<User[]>("ph2_users", []), user]);
  return user;
}

export function updateUser(email: string, patch: Partial<Omit<User, "role" | "email">>) {
  set("ph2_users", get<User[]>("ph2_users", []).map((u) => (u.email === email ? { ...u, ...patch } : u)));
}

export function login(email: string, password: string): User {
  const user = findUser(email);
  if (!user || user.password !== password) throw new Error("Invalid email or password");
  if (user.active === false) throw new Error("This account has been deactivated. Please contact an administrator.");
  localStorage.setItem(SESSION, user.email);
  return user;
}

export const logout = () => localStorage.removeItem(SESSION);

export function currentUser(): User | null {
  const e = localStorage.getItem(SESSION);
  const u = e ? findUser(e) : undefined;
  return u && u.active !== false ? u : null;
}









