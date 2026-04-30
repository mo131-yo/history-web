export type HistoricalBattleMarker = {
  id: string;
  name: string;
  year: number;
  locationName: string;
  coordinates: [number, number];
  summary: string;
  sides: string[];
  result: string;
};

export type HistoricalBattleProperties = Omit<HistoricalBattleMarker, "coordinates">;
export type HistoricalBattleFeature = GeoJSON.Feature<
  GeoJSON.Point,
  HistoricalBattleProperties
>;
export type HistoricalBattleFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  HistoricalBattleProperties
>;

// Approximate coordinates for educational visualization only.
// They are not archaeological site coordinates and should not be treated as exact.
export const HISTORICAL_BATTLE_MARKERS: HistoricalBattleMarker[] = [
  {
    id: "qalaqaljit-sands-1203",  
    name: "Battle of Qalaqaljit Sands",
    year: 1203,
    locationName: "Eastern Mongolia, approximate",
    coordinates: [111.2, 47.6],
    summary:
      "Approximate marker for Temujin's campaign against the Kereit. Location is generalized for atlas visualization.",
    sides: ["Temujin's Mongols", "Kereit confederation"],
    result: "Temujin recovered and later defeated Toghrul's Kereit power.",
  },
  {
    id: "naiman-campaign-1204",
    name: "Battle Against the Naiman",
    year: 1204,
    locationName: "Altai region, approximate",
    coordinates: [91.2, 48.1],
    summary:
      "Approximate marker for the decisive campaign against the Naiman, helping Temujin consolidate the steppe.",
    sides: ["Temujin's Mongols", "Naiman confederation"],
    result: "Naiman power collapsed and Mongol unification accelerated.",
  },
  {
    id: "yehuling-1211",
    name: "Battle of Yehuling",
    year: 1211, 
    locationName: "Yehuling pass, northern China, approximate",
    coordinates: [114.6, 40.8],
    summary:
      "Approximate marker for a major Mongol victory during the Jin dynasty campaign.",
    sides: ["Mongol Empire", "Jin dynasty"],
    result: "Mongols broke through Jin defenses in North China.",
  },
  {
    id: "zhongdu-1215",
    name: "Siege and Fall of Zhongdu",
    year: 1215,
    locationName: "Near Beijing, China, approximate",
    coordinates: [116.4, 39.9],
    summary:
      "Approximate marker for the fall of Zhongdu, the Jin capital near modern Beijing.",
    sides: ["Mongol Empire", "Jin dynasty"],
    result: "Zhongdu fell to the Mongols.",
  },
  {
    id: "otrar-1219",
    name: "Otrar Incident and Siege of Otrar",
    year: 1219,
    locationName: "Otrar, Kazakhstan, approximate",
    coordinates: [68.3, 42.85],
    summary:
      "Approximate marker for Otrar, where the killing of Mongol merchants and envoys triggered the Khwarazm campaign.",
    sides: ["Mongol Empire", "Khwarazmian Empire"],
    result: "Otrar was besieged and captured.",
  },
  {
    id: "bukhara-1220",
    name: "Siege of Bukhara",
    year: 1220,
    locationName: "Bukhara, Uzbekistan, approximate",
    coordinates: [64.43, 39.77],
    summary:
      "Approximate marker for the Mongol capture of Bukhara during the Khwarazmian campaign.",
    sides: ["Mongol Empire", "Khwarazmian Empire"],
    result: "Bukhara was captured by Mongol forces.",
  },
  {
    id: "samarkand-1220",
    name: "Siege of Samarkand",
    year: 1220,
    locationName: "Samarkand, Uzbekistan, approximate",
    coordinates: [66.98, 39.65],
    summary:
      "Approximate marker for the fall of Samarkand, one of the key cities of the Khwarazmian Empire.",
    sides: ["Mongol Empire", "Khwarazmian Empire"],
    result: "Samarkand surrendered after the Mongol siege.",
  },
  {
    id: "indus-1221",
    name: "Battle of the Indus",
    year: 1221,
    locationName: "Indus River region, approximate",
    coordinates: [72.2, 33.9],
    summary:
      "Approximate marker for Chinggis Khan's pursuit of Jalal ad-Din to the Indus River.",
    sides: ["Mongol Empire", "Forces of Jalal ad-Din Mingburnu"],
    result: "Mongols won; Jalal ad-Din escaped across the river.",
  },
  {
    id: "kalka-river-1223",
    name: "Battle of the Kalka River",
    year: 1223,
    locationName: "Kalka River region, Ukraine, approximate",
    coordinates: [37.6, 47.1],
    summary:
      "Approximate marker for the Mongol victory over a Rus'-Cuman coalition west of the steppe.",
    sides: ["Mongol expeditionary forces", "Rus' principalities and Cumans"],
    result: "Mongol tactical victory.",
  },
  {
    id: "baghdad-1258",
    name: "Siege of Baghdad",
    year: 1258,
    locationName: "Baghdad, Iraq, approximate",
    coordinates: [44.37, 33.31],
    summary:
      "Approximate marker for Hulegu's capture of Baghdad and the end of Abbasid political power in the city.",
    sides: ["Ilkhanate Mongols", "Abbasid Caliphate"],
    result: "Baghdad fell to Hulegu's forces.",
  },
  {
    id: "ain-jalut-1260",
    name: "Battle of Ain Jalut",
    year: 1260,
    locationName: "Jezreel Valley, Levant, approximate",
    coordinates: [35.35, 32.55],
    summary:
      "Approximate marker for the Mamluk victory that checked Mongol expansion into Egypt and the Levant.",
    sides: ["Mamluk Sultanate", "Mongol forces of the Ilkhanate"],
    result: "Mamluk victory.",
  },
  {
    id: "toluid-civil-war-1260",
    name: "Toluid Civil War: Ariq Boke vs Kublai",
    year: 1260,
    locationName: "Karakorum region, Mongolia, approximate",
    coordinates: [102.83, 47.2],
    summary:
      "Approximate marker for the succession conflict between Ariq Boke and Kublai after Mongke's death.",
    sides: ["Ariq Boke's faction", "Kublai's faction"],
    result: "Civil war began; Kublai ultimately prevailed in 1264.",
  },
  {
    id: "yamen-1279",
    name: "Battle of Yamen",
    year: 1279,
    locationName: "Guangdong coast, China, approximate",
    coordinates: [113.12, 22.18],
    summary:
      "Approximate marker for the final Yuan victory over the Southern Song, closing the Yuan-Song timeline.",
    sides: ["Yuan dynasty", "Southern Song dynasty"],
    result: "Yuan victory; Southern Song resistance ended.",
  },
];

export function createBattleCollection(
  year: number,
): HistoricalBattleFeatureCollection {
  const selectedYear = Number.isFinite(year) ? year : 0;
  const features: HistoricalBattleFeature[] = HISTORICAL_BATTLE_MARKERS
    .filter(
      (battle) =>
        battle.year >= 1162 &&
        battle.year <= 1300 &&
        battle.year <= selectedYear,
    )
    .map(({ coordinates, ...properties }) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates,
      },
      properties,
    }));

  return {
    type: "FeatureCollection",
    features,
  };
}
