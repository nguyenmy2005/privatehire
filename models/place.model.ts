// MODEL: dữ liệu địa điểm và bảng giá cố định (không có logic nghiệp vụ)
export type Area = "central" | "north" | "south" | "east" | "west";
export const AREAS: Area[] = ["central", "north", "south", "east", "west"];

export const AREA_PLACES: Record<Area, string[]> = {
  central: ["Westminster", "Oxford Street", "Covent Garden", "King's Cross Station", "Victoria Station", "Waterloo Station", "Paddington Station", "Liverpool Street Station"],
  north: ["Camden Market", "Hampstead Heath", "Wembley Stadium", "Finsbury Park", "Highgate Village", "Archway"],
  south: ["Brixton", "Clapham Junction", "Greenwich", "Crystal Palace", "Wimbledon", "Battersea Power Station"],
  east: ["Canary Wharf", "Stratford", "Shoreditch", "Queen Elizabeth Olympic Park", "Whitechapel", "Docklands"],
  west: ["Kensington", "Notting Hill", "Hammersmith", "Ealing Broadway", "Richmond", "Chiswick"],
};

export const LANDMARKS: { name: string; area: Area }[] = [
  { name: "Big Ben", area: "central" },
  { name: "Buckingham Palace", area: "central" },
  { name: "Trafalgar Square", area: "central" },
  { name: "St Paul's Cathedral", area: "central" },
  { name: "Tower Bridge", area: "central" },
  { name: "London Eye", area: "south" },
  { name: "Borough Market", area: "south" },
  { name: "Camden Lock", area: "north" },
];

export const HOTELS: { name: string; area: Area }[] = [
  { name: "The Savoy", area: "central" },
  { name: "The Ritz London", area: "central" },
  { name: "Claridge's", area: "central" },
  { name: "Hilton London Park Lane", area: "central" },
  { name: "The Langham", area: "central" },
  { name: "Holiday Inn London Camden Lock", area: "north" },
  { name: "Premier Inn London County Hall", area: "south" },
  { name: "Novotel London Canary Wharf", area: "east" },
  { name: "Hilton London Olympia", area: "west" },
];

export const AIRPORTS = ["Heathrow Airport", "Gatwick Airport", "Stansted Airport", "Luton Airport", "London City Airport"];

// Fixed fare in GBP from each London area to each airport
export const AIRPORT_FARE: Record<string, Record<Area, number>> = {
  "Heathrow Airport": { central: 40, north: 48, south: 45, east: 55, west: 28 },
  "Gatwick Airport": { central: 55, north: 65, south: 38, east: 60, west: 60 },
  "Stansted Airport": { central: 55, north: 40, south: 70, east: 38, west: 68 },
  "Luton Airport": { central: 50, north: 32, south: 65, east: 52, west: 45 },
  "London City Airport": { central: 22, north: 28, south: 26, east: 20, west: 34 },
};

// Fixed fare from London to each city
export const CITY_FARE: Record<string, number> = {
  London: 0, Oxford: 85, Cambridge: 90, Brighton: 95, Canterbury: 100, Southampton: 120, Bath: 130, Bristol: 150, Birmingham: 160, Manchester: 280, Leeds: 320,
};
export const CITIES = Object.keys(CITY_FARE);

export type PlaceGroup = { title: string; items: string[] };
