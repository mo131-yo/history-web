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
    name: "Халхалжит элсний тулалдаан",
    year: 1203,
    locationName: "Зүүн Монгол, ойролцоогоор",
    coordinates: [111.2, 47.6],
    summary:
      "Тэмүжиний Хэрэйдийн эсрэг хийсэн аян дайныг ерөнхийлөн тэмдэглэсэн цэг. Байршлыг атласын дүрслэлд зориулж ойролцоолсон.",
    sides: ["Тэмүжиний Монголчууд", "Хэрэйдийн холбоо"],
    result: "Тэмүжин хүчээ сэргээж, улмаар Тоорил ханы Хэрэйдийн хүчийг бут цохив.",
  },
  {
    id: "naiman-campaign-1204",
    name: "Найманы эсрэг тулалдаан",
    year: 1204,
    locationName: "Алтайн бүс, ойролцоогоор",
    coordinates: [91.2, 48.1],
    summary:
      "Тэмүжин тал нутгийн нэгдлийг бэхжүүлэхэд чухал нөлөө үзүүлсэн Найманы эсрэг шийдвэрлэх аяныг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Тэмүжиний Монголчууд", "Найманы холбоо"],
    result: "Найманы хүч задран унаж, Монголын нэгдэл түргэсэв.",
  },
  {
    id: "yehuling-1211",
    name: "Ехулиний тулалдаан",
    year: 1211, 
    locationName: "Ехулиний даваа, Хойд Хятад, ойролцоогоор",
    coordinates: [114.6, 40.8],
    summary:
      "Алтан улсын эсрэг аяны үеийн Монголчуудын томоохон ялалтыг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Монголын эзэнт гүрэн", "Алтан улс"],
    result: "Монголчууд Хойд Хятадын Алтан улсын хамгаалалтыг сэтлэв.",
  },
  {
    id: "zhongdu-1215",
    name: "Жундугийн бүслэлт ба уналт",
    year: 1215,
    locationName: "Бээжингийн орчим, Хятад, ойролцоогоор",
    coordinates: [116.4, 39.9],
    summary:
      "Өнөөгийн Бээжингийн орчим байсан Алтан улсын нийслэл Жунду унасныг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Монголын эзэнт гүрэн", "Алтан улс"],
    result: "Жунду хот Монголчуудын мэдэлд оров.",
  },
  {
    id: "otrar-1219",
    name: "Отрарын хэрэг ба Отрарын бүслэлт",
    year: 1219,
    locationName: "Отрар, Казахстан, ойролцоогоор",
    coordinates: [68.3, 42.85],
    summary:
      "Монголын худалдаачид, элч нарыг хороосон хэрэг Хорезмын аян дайныг өдөөсөн Отрар хотыг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Монголын эзэнт гүрэн", "Хорезмын эзэнт улс"],
    result: "Отрар бүслэгдэж эзлэгдэв.",
  },
  {
    id: "bukhara-1220",
    name: "Бухарын бүслэлт",
    year: 1220,
    locationName: "Бухар, Узбекистан, ойролцоогоор",
    coordinates: [64.43, 39.77],
    summary:
      "Хорезмын аян дайны үеэр Монголчууд Бухарыг эзэлснийг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Монголын эзэнт гүрэн", "Хорезмын эзэнт улс"],
    result: "Бухар хот Монголын цэрэгт эзлэгдэв.",
  },
  {
    id: "samarkand-1220",
    name: "Самаркандын бүслэлт",
    year: 1220,
    locationName: "Самарканд, Узбекистан, ойролцоогоор",
    coordinates: [66.98, 39.65],
    summary:
      "Хорезмын эзэнт улсын гол хотуудын нэг Самарканд унасныг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Монголын эзэнт гүрэн", "Хорезмын эзэнт улс"],
    result: "Самарканд Монголын бүслэлтийн дараа бууж өгөв.",
  },
  {
    id: "indus-1221",
    name: "Инд мөрний тулалдаан",
    year: 1221,
    locationName: "Инд мөрний бүс, ойролцоогоор",
    coordinates: [72.2, 33.9],
    summary:
      "Чингис хаан Жалал ад-Диныг Инд мөрөн хүртэл нэхэн хөөсөн үйл явдлыг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Монголын эзэнт гүрэн", "Жалал ад-Дин Мингбурнугийн цэрэг"],
    result: "Монголчууд ялсан ч Жалал ад-Дин мөрөн гатлан зугтав.",
  },
  {
    id: "kalka-river-1223",
    name: "Калка мөрний тулалдаан",
    year: 1223,
    locationName: "Калка мөрний бүс, Украин, ойролцоогоор",
    coordinates: [37.6, 47.1],
    summary:
      "Тал нутгийн баруун хэсэгт Русь болон Куманчуудын холбоот хүчийг Монголчууд ялсныг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Монголын аян цэрэг", "Русь ноёд ба Куманчууд"],
    result: "Монголчууд тактикийн ялалт байгуулав.",
  },
  {
    id: "baghdad-1258",
    name: "Багдадын бүслэлт",
    year: 1258,
    locationName: "Багдад, Ирак, ойролцоогоор",
    coordinates: [44.37, 33.31],
    summary:
      "Хүлэгү Багдадыг эзэлж, хот дахь Аббасидын улс төрийн ноёрхол төгссөнийг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Ил хаант улсын Монголчууд", "Аббасидын халифат"],
    result: "Багдад Хүлэгүгийн цэрэгт эзлэгдэв.",
  },
  {
    id: "ain-jalut-1260",
    name: "Айн Жалутын тулалдаан",
    year: 1260,
    locationName: "Изреэлийн хөндий, Левант, ойролцоогоор",
    coordinates: [35.35, 32.55],
    summary:
      "Монголын Египет болон Левант руу тэлэх явцыг зогсоосон Мамлюкуудын ялалтыг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Мамлюкийн султант улс", "Ил хаант улсын Монгол цэрэг"],
    result: "Мамлюкууд ялалт байгуулав.",
  },
  {
    id: "toluid-civil-war-1260",
    name: "Толуйн угсааны иргэний дайн: Аригбөх ба Хубилай",
    year: 1260,
    locationName: "Хархорумын бүс, Монгол, ойролцоогоор",
    coordinates: [102.83, 47.2],
    summary:
      "Мөнх хааны нас барсны дараах Аригбөх, Хубилай нарын хаан ширээний тэмцлийг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Аригбөхийн тал", "Хубилайн тал"],
    result: "Иргэний дайн эхэлж, эцэст нь 1264 онд Хубилай давамгайлав.",
  },
  {
    id: "yamen-1279",
    name: "Ямэний тулалдаан",
    year: 1279,
    locationName: "Гуандуны эрэг, Хятад, ойролцоогоор",
    coordinates: [113.12, 22.18],
    summary:
      "Юань улс Өмнөд Сүн улсыг бүрэн ялж, Юань-Сүнгийн мөргөлдөөнийг төгсгөсөн үйл явдлыг тэмдэглэсэн ойролцоо цэг.",
    sides: ["Юань улс", "Өмнөд Сүн улс"],
    result: "Юань ялж, Өмнөд Сүнгийн эсэргүүцэл дуусав.",
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
