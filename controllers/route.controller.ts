// CONTROLLER: kiểm tra tuyến đường, tính giá chuyến, gợi ý địa điểm
import {
  AIRPORTS, AIRPORT_FARE, AREAS, AREA_PLACES, CITIES, CITY_FARE, HOTELS, LANDMARKS,
  type Area, type PlaceGroup,
} from "@/models/place.model";

const ALL_PLACES = AREAS.flatMap((a) => AREA_PLACES[a]);
const HOTEL_NAMES = HOTELS.map((h) => h.name);
const LANDMARK_NAMES = LANDMARKS.map((l) => l.name);

const norm = (s: string) => s.trim().toLowerCase();
const airportOf = (v: string) => AIRPORTS.find((a) => norm(v) === norm(a) || norm(v).startsWith(norm(a).replace(" airport", "")));
const match = (list: string[], v: string) => list.find((x) => norm(x) === norm(v));

export function areaOf(v: string): Area | undefined {
  for (const a of AREAS) if (match(AREA_PLACES[a], v)) return a;
  return LANDMARKS.find((l) => norm(l.name) === norm(v))?.area ?? HOTELS.find((h) => norm(h.name) === norm(v))?.area;
}

const localFare = (a: Area, b: Area) => (a === b ? 12 : a === "central" || b === "central" ? 16 : 22);

export function optionsFor(service: string, end: "pickup" | "destination"): string[] {
  if (service === "local") return ALL_PLACES;
  if (service === "airport") return [...AIRPORTS, ...ALL_PLACES];
  if (service === "hotel") return [...HOTEL_NAMES, ...ALL_PLACES];
  if (service === "meet") return end === "pickup" ? LANDMARK_NAMES : ALL_PLACES;
  if (service === "long") return CITIES;
  return [];
}

export function labelsFor(service: string) {
  const map: Record<string, { from: string; to: string; fromHint: string; toHint: string }> = {
    local: { from: "From", to: "To", fromHint: "Place in London", toHint: "Place in London" },
    airport: { from: "From", to: "To", fromHint: "Place or airport", toHint: "Airport or place" },
    hotel: { from: "From", to: "To", fromHint: "Hotel or place", toHint: "Place or hotel" },
    meet: { from: "Meeting point", to: "Drop-off", fromHint: "Landmark to meet at", toHint: "Where to?" },
    long: { from: "From", to: "To", fromHint: "City", toHint: "City" },
    daily: { from: "From", to: "To", fromHint: "Pick-up address", toHint: "Where to?" },
  };
  return map[service] ?? map.local;
}

export function checkRoute(service: string, pickup: string, destination: string): string {
  if (norm(pickup) === norm(destination)) return "Pick-up and destination must be different.";
  const a = areaOf(pickup);
  const b = areaOf(destination);
  const pa = airportOf(pickup);
  const pb = airportOf(destination);
  if (service === "local") return a && b ? "" : "Please choose both places from the list so we can fix the fare.";
  if (service === "airport") return (pa && b) || (pb && a) ? "" : !pa && !pb ? "Choose one London airport (Heathrow, Gatwick, Stansted, Luton or London City) as the pick-up or the destination." : pa && pb ? "Choose one airport and one London place, not two airports." : "Please choose the other end from the list of London places.";
  if (service === "hotel") {
    const ha = match(HOTEL_NAMES, pickup);
    const hb = match(HOTEL_NAMES, destination);
    return (ha && !hb && b) || (hb && !ha && a) ? "" : "Hotel transfers run between one hotel and one London place from the list.";
  }
  if (service === "meet") return match(LANDMARK_NAMES, pickup) && b ? "" : "Choose a landmark from the list as the meeting point, and a drop-off place from the list.";
  if (service === "long") return match(CITIES, pickup) && match(CITIES, destination) ? "" : "Long distance runs between two different cities from the list.";
  return "";
}

export function tripFare(service: string, pickup: string, destination: string): number | undefined {
  if (checkRoute(service, pickup, destination)) return undefined;
  const a = areaOf(pickup);
  const b = areaOf(destination);
  if (service === "local" && a && b) return localFare(a, b);
  if (service === "hotel" && a && b) return localFare(a, b) + 8;
  if (service === "meet" && a && b) return 30 + localFare(a, b);
  if (service === "airport") {
    const pa = airportOf(pickup);
    const pb = airportOf(destination);
    const ap = pa ?? pb;
    const area = pa ? b : a;
    return ap && area ? AIRPORT_FARE[ap][area] : undefined;
  }
  if (service === "long") {
    const ca = match(CITIES, pickup);
    const cb = match(CITIES, destination);
    if (!ca || !cb) return undefined;
    if (ca === "London") return CITY_FARE[cb];
    if (cb === "London") return CITY_FARE[ca];
    return Math.round((CITY_FARE[ca] + CITY_FARE[cb]) * 0.75);
  }
  return undefined;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const areaGroups = (): PlaceGroup[] => AREAS.map((a) => ({ title: cap(a), items: AREA_PLACES[a] }));

export function groupsFor(service: string, end: "pickup" | "destination"): PlaceGroup[] {
  if (service === "local") return areaGroups();
  if (service === "airport") return [{ title: "Airports", items: AIRPORTS }, ...areaGroups()];
  if (service === "hotel") return [{ title: "Hotels", items: HOTEL_NAMES }, ...areaGroups()];
  if (service === "meet") return end === "pickup" ? [{ title: "Landmarks", items: LANDMARK_NAMES }] : areaGroups();
  if (service === "long") return [{ title: "Cities", items: CITIES }];
  return [];
}
