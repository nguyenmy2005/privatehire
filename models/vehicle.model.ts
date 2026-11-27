// MODEL: xe và tài xế
import { get, set } from "./storage";

export type Vehicle = { id: string; name: string; seats: number; plate: string; colour: string; rate: number; driverId?: string; type?: string };
export type Driver = { id: string; name: string; phone: string };

export const DRIVERS: Driver[] = [
  { id: "d1", name: "James Carter", phone: "07700 900101" },
  { id: "d2", name: "Amira Khan", phone: "07700 900102" },
  { id: "d3", name: "Tom Wilson", phone: "07700 900103" },
  { id: "d4", name: "Priya Nair", phone: "07700 900104" },
  { id: "d5", name: "Luke Bennett", phone: "07700 900105" },
  { id: "d6", name: "Sarah Mitchell", phone: "07700 900106" },
  { id: "d7", name: "Daniel Okoye", phone: "07700 900107" },
  { id: "d8", name: "Fatima Hussain", phone: "07700 900108" },
  { id: "d9", name: "Marcus Reid", phone: "07700 900109" },
  { id: "d10", name: "Elena Petrova", phone: "07700 900110" },
  { id: "d11", name: "Oliver Grant", phone: "07700 900111" },
  { id: "d12", name: "Hannah Brooks", phone: "07700 900112" },
  { id: "d13", name: "Ravi Patel", phone: "07700 900113" },
  { id: "d14", name: "Sophie Turner", phone: "07700 900114" },
  { id: "d15", name: "Kwame Mensah", phone: "07700 900115" },
  { id: "d16", name: "Liam Connor", phone: "07700 900116" },
  { id: "d17", name: "Zara Ahmed", phone: "07700 900117" },
  { id: "d18", name: "Callum Fraser", phone: "07700 900118" },
  { id: "d19", name: "Mei Lin Chen", phone: "07700 900119" },
  { id: "d20", name: "David Owen", phone: "07700 900120" },
  { id: "d21", name: "Isabel Santos", phone: "07700 900121" },
  { id: "d22", name: "George Hall", phone: "07700 900122" },
  { id: "d23", name: "Nadia Rahman", phone: "07700 900123" },
  { id: "d24", name: "Jack Murray", phone: "07700 900124" },
];

export const VEHICLES: Vehicle[] = [
  { id: "v1", name: "Toyota Prius", seats: 4, plate: "LK21 ABC", colour: "Silver", rate: 5, driverId: "d1", type: "Hybrid" },
  { id: "v2", name: "Skoda Octavia", seats: 4, plate: "LM22 DEF", colour: "Black", rate: 8, driverId: "d2", type: "Saloon" },
  { id: "v3", name: "Ford Galaxy", seats: 7, plate: "LN70 GHI", colour: "White", rate: 15, driverId: "d3", type: "MPV" },
  { id: "v4", name: "Mercedes V-Class", seats: 7, plate: "LP71 JKL", colour: "Black", rate: 30, driverId: "d4", type: "MPV" },
  { id: "v5", name: "Mercedes Sprinter", seats: 7, plate: "LR72 MNO", colour: "Grey", rate: 40, driverId: "d5", type: "Van" },
  { id: "v6", name: "Toyota Corolla Hybrid", seats: 4, plate: "LS21 PQR", colour: "White", rate: 5, driverId: "d6", type: "Hybrid" },
  { id: "v7", name: "Honda Civic", seats: 4, plate: "LT22 STU", colour: "Blue", rate: 6, driverId: "d7", type: "Saloon" },
  { id: "v8", name: "Tesla Model 3", seats: 4, plate: "LU71 VWX", colour: "White", rate: 12, driverId: "d8", type: "Electric" },
  { id: "v9", name: "Hyundai Ioniq 5", seats: 4, plate: "LV72 YZA", colour: "Grey", rate: 12, driverId: "d9", type: "Electric" },
  { id: "v10", name: "Kia Niro Hybrid", seats: 4, plate: "LW21 BCD", colour: "Red", rate: 7, driverId: "d10", type: "Hybrid" },
  { id: "v11", name: "Volkswagen Passat", seats: 4, plate: "LX22 EFG", colour: "Silver", rate: 9, driverId: "d11", type: "Saloon" },
  { id: "v12", name: "Mercedes E-Class", seats: 4, plate: "LY70 HJK", colour: "Black", rate: 20, driverId: "d12", type: "Executive" },
  { id: "v13", name: "BMW 5 Series", seats: 4, plate: "LZ71 LMN", colour: "Blue", rate: 20, driverId: "d13", type: "Executive" },
  { id: "v14", name: "Audi A6", seats: 4, plate: "MA72 OPQ", colour: "Grey", rate: 20, driverId: "d14", type: "Executive" },
  { id: "v15", name: "Mercedes S-Class", seats: 4, plate: "MB22 RST", colour: "Black", rate: 28, driverId: "d15", type: "Executive" },
  { id: "v16", name: "Volkswagen Sharan", seats: 7, plate: "MC70 UVW", colour: "Silver", rate: 15, driverId: "d16", type: "MPV" },
  { id: "v17", name: "SEAT Alhambra", seats: 7, plate: "MD71 XYZ", colour: "Black", rate: 15, driverId: "d17", type: "MPV" },
  { id: "v18", name: "Volvo XC90", seats: 7, plate: "ME72 ABD", colour: "Blue", rate: 34, driverId: "d18", type: "SUV" },
  { id: "v19", name: "Land Rover Discovery", seats: 7, plate: "MF21 CDE", colour: "Green", rate: 36, driverId: "d19", type: "SUV" },
  { id: "v20", name: "Range Rover", seats: 7, plate: "MG22 FGH", colour: "Black", rate: 45, driverId: "d20", type: "SUV" },
  { id: "v21", name: "Tesla Model X", seats: 7, plate: "MH71 JKM", colour: "White", rate: 40, driverId: "d21", type: "Electric" },
  { id: "v22", name: "Ford Transit Custom", seats: 7, plate: "MJ72 NPR", colour: "White", rate: 38, driverId: "d22", type: "Van" },
  { id: "v23", name: "Volkswagen Caravelle", seats: 7, plate: "MK21 STV", colour: "Silver", rate: 40, driverId: "d23", type: "Van" },
  { id: "v24", name: "Mercedes Vito Tourer", seats: 7, plate: "ML22 WXZ", colour: "Black", rate: 42, driverId: "d24", type: "Van" },
];

export const vehicles = () => get<Vehicle[]>("ph2_vehicles", VEHICLES);
export const drivers = () => get<Driver[]>("ph2_drivers", DRIVERS);
export const saveVehicles = (v: Vehicle[]) => set("ph2_vehicles", v);
export const saveDrivers = (d: Driver[]) => set("ph2_drivers", d);
export const driverOf = (v: Vehicle) => drivers().find((d) => d.id === v.driverId);
