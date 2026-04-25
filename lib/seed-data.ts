import { atlasSeedDataA } from "@/lib/seed-data-a";
import { atlasSeedDataB } from "@/lib/seed-data-b";
import { atlasSeedDataC } from "@/lib/seed-data-c";
import { atlasSeedDataD } from "@/lib/seed-data-d";

export const atlasSeedData = [
  ...atlasSeedDataA,
  ...atlasSeedDataB,
  ...atlasSeedDataC,
  ...atlasSeedDataD,
];

export const atlasSeedYearRange = {
  start: 1162,
  end: 1300,
};

export const atlasSeedYears = Array.from(
  { length: atlasSeedYearRange.end - atlasSeedYearRange.start + 1 },
  (_, index) => atlasSeedYearRange.start + index,
);
