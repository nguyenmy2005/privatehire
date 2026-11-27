// CONTROLLER: đăng ký, đăng nhập, quản lý tài khoản
import "./seed";
import { addUser, clearSession, findUser, sessionEmail, setSession, type User } from "@/models/user.model";

export { allUsers, findUser, staffUsers, updateUser } from "@/models/user.model";

const PASSWORD_RULE = /^.{8,}$/;
const EMAIL_PROVIDERS = /^[^\s@]+@(gmail|icloud|outlook|hotmail|yahoo)\.com$/;

export const userExists = (email: string) => !!findUser(email);

export function register(u: Omit<User, "role" | "active">): User {
  const email = u.email.trim().toLowerCase();
  if (!EMAIL_PROVIDERS.test(email)) throw new Error("Please use a Gmail, iCloud, Outlook, Hotmail or Yahoo address.");
  if (findUser(email)) throw new Error("Email already registered");
  const user: User = { ...u, email, role: "customer" };
  addUser(user);
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
  addUser(user);
  return user;
}

export function login(email: string, password: string): User {
  const user = findUser(email);
  if (!user || user.password !== password) throw new Error("Invalid email or password");
  if (user.active === false) throw new Error("This account has been deactivated. Please contact an administrator.");
  setSession(user.email);
  return user;
}

export const logout = clearSession;

export function currentUser(): User | null {
  const e = sessionEmail();
  const u = e ? findUser(e) : undefined;
  return u && u.active !== false ? u : null;
}
