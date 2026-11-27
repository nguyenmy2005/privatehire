// MODEL: mã giảm giá (riêng từng khách + mã công khai)
import { get, set } from "./storage";

export type Offer = { code: string; email: string; percent: number; used: boolean };

export const PUBLIC_OFFERS = [
  { code: "WELCOME5", percent: 5 },
  { code: "WEEKDAY8", percent: 8 },
  { code: "LONDON10", percent: 10 },
];

export const offers = () => get<Offer[]>("ph2_offers", []);
export const saveOffers = (o: Offer[]) => set("ph2_offers", o);
export const publicUsed = () => get<string[]>("ph2_public_used", []);
export const savePublicUsed = (used: string[]) => set("ph2_public_used", used);
