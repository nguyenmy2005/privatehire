export function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("ph:toast", { detail: message }));
}

export function fillSearch(d: Record<string, string>) {
  window.dispatchEvent(new CustomEvent("ph:fill", { detail: d }));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export const digits = (s: string) => s.replace(/\D/g, "");

export function luhn(num: string) {
  const d = digits(num);
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = +d[i];
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return d.length > 0 && sum % 10 === 0;
}

export function cardValid(num: string) {
  const d = digits(num);
  const amex = /^3[47]/.test(d);
  return (amex ? d.length === 15 : d.length === 16) && /^[3-6]/.test(d) && luhn(d);
}

export function expValid(exp: string) {
  const m = exp.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = +m[1];
  const year = 2000 + +m[2];
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}
