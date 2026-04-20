export type ApartmentStatus = "available" | "reserved" | "sold";

export interface Apartment {
  id: string;
  number: string;
  building: string;
  floor: number;
  rooms: number;
  area: number; // m²
  orientation: "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";
  price: number; // EUR
  status: ApartmentStatus;
  name: string;
  description: string;
  features: string[];
  // Position on the building grid (col 0..3, used for 3D mapping)
  col: number;
}

const ORIENTATIONS: Apartment["orientation"][] = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"];

function makeUnit(
  id: number,
  building: string,
  floor: number,
  col: number,
  status: ApartmentStatus,
): Apartment {
  const rooms = (col % 4) + 2; // 2..5
  const area = 58 + col * 14 + (floor % 3) * 6;
  const price = Math.round((area * 4200 + floor * 9500) / 1000) * 1000;
  const orientation = ORIENTATIONS[(floor + col) % ORIENTATIONS.length];
  const number = `${building}-${String(floor).padStart(2, "0")}${String(col + 1).padStart(2, "0")}`;
  const names = [
    "The Linden Suite",
    "The Atrium Residence",
    "The Park View",
    "The Terrace Suite",
    "The Garden Apartment",
    "The Skyline Loft",
    "The Crown Residence",
    "The Brass Suite",
  ];
  return {
    id: `unit-${id}`,
    number,
    building,
    floor,
    rooms,
    area,
    orientation,
    price,
    status,
    name: names[id % names.length],
    description:
      "A meticulously designed residence with floor-to-ceiling glazing, oak flooring, and a private terrace overlooking landscaped gardens.",
    features: [
      "Floor-to-ceiling glazing",
      "European oak flooring",
      "Private terrace",
      "Underfloor heating",
      "Smart climate control",
    ],
    col,
  };
}

// Generate building A: 8 floors × 4 units
const STATUS_PATTERN: ApartmentStatus[] = [
  "sold", "available", "reserved", "available",
  "available", "sold", "available", "reserved",
  "sold", "sold", "available", "available",
  "reserved", "available", "available", "sold",
  "available", "available", "reserved", "available",
  "sold", "available", "available", "reserved",
  "available", "reserved", "available", "available",
  "available", "available", "available", "reserved",
];

export const apartments: Apartment[] = [];
let counter = 0;
for (const building of ["A", "B"]) {
  for (let floor = 8; floor >= 1; floor--) {
    for (let col = 0; col < 4; col++) {
      const status = STATUS_PATTERN[counter % STATUS_PATTERN.length];
      apartments.push(makeUnit(counter, building, floor, col, status));
      counter++;
    }
  }
}

export const projectStats = {
  buildings: 2,
  units: apartments.length,
  available: apartments.filter((a) => a.status === "available").length,
  reserved: apartments.filter((a) => a.status === "reserved").length,
  sold: apartments.filter((a) => a.status === "sold").length,
  greenSpaces: "1.4 ha",
  parking: 142,
  completion: "Q4 2025",
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}
