// CONTROLLER: kiểm tra và dùng mã giảm giá
import "./seed";
import { PUBLIC_OFFERS, offers, publicUsed, saveOffers, savePublicUsed } from "@/models/offer.model";

export { PUBLIC_OFFERS, offers, saveOffers };

export const findPublic = (code: string, email: string) => {
  const o = PUBLIC_OFFERS.find((x) => x.code === code.trim().toUpperCase());
  if (!o) return undefined;
  return publicUsed().includes(o.code + "|" + email) ? undefined : o;
};
export const redeemPublic = (code: string, email: string) => savePublicUsed([...publicUsed(), code + "|" + email]);

export const findOffer = (code: string, email: string) =>
  offers().find((o) => o.code === code.trim().toUpperCase() && o.email === email && !o.used);
export const redeemOffer = (code: string) => saveOffers(offers().map((o) => (o.code === code ? { ...o, used: true } : o)));
