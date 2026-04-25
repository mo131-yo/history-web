import type { AtlasStateRecord } from "@/lib/types";
import { rings } from "@/lib/seed-rings";

export const atlasSeedDataCPart2: AtlasStateRecord[] = [
    {
    slug: "ilkhanate-frontier",
    year: 1259,
    name: "Ил хаантны өмнөх баруун захиргаа",
    leader: "Хүлэгү",
    capital: "Азербайжан орчим",
    color: "#059669",
    summary: "Баруун Азид Хүлэгүгийн цэрэг Багдадыг унагаж, Ойрх Дорнодын шинэ монгол төвийг байгуулж байв.",
    metadata: {
      notableEvents: ["1258 онд Багдад унав", "Сирийн аян"],
    },
    geometry: rings.ilkhanate,
  },
    {
    slug: "song-dynasty",
    year: 1259,
    name: "Өмнөд Сүн",
    leader: "Лизун",
    capital: "Линьань",
    color: "#dc2626",
    summary: "Өмнөд Сүн Монголын дорнын бай болж, ирэх жилүүдэд Хубилайн гол өрсөлдөгч улс болов.",
    metadata: {
      notableEvents: ["Сычуань, Хубэйгийн фронт хурцдав"],
    },
    geometry: rings.song,
  },
    {
    slug: "yuan-dynasty",
    year: 1271,
    name: "Юань улс",
    leader: "Хубилай хаан",
    capital: "Дайду",
    color: "#c9a45d",
    summary: "1271 онд Хубилай хаан Юань улсын нэрийг зарлаж, Монголын Хятад дахь төрийн хэлбэрийг шинэ шатанд гаргав.",
    metadata: {
      governance: "Монгол, Хятад хосолсон эзэнт төр",
      economy: "Хойд Хятадын татвар, тээвэр, тариалан",
      notableEvents: ["Юань улсын тунхаглал"],
    },
    geometry: rings.yuan,
  },
    {
    slug: "chagatai-khanate",
    year: 1271,
    name: "Цагаадайн улс",
    leader: "Мубарак Шахын үе",
    capital: "Алмалык орчим",
    color: "#0ea5e9",
    summary: "Төв Азид Цагаадайн улс Каракорум, Хятад, Иран, Русийн хоорондох дотоод эх газрын зангилааг хянаж байв.",
    metadata: {
      notableEvents: ["Төв Азийн монголын дотоод эрх мэдлийн өрсөлдөөн"],
    },
    geometry: rings.chagatai,
  },
    {
    slug: "golden-horde",
    year: 1271,
    name: "Алтан Орд",
    leader: "Мөнхтөмөр",
    capital: "Сарай",
    color: "#a855f7",
    summary: "Алтан Орд Оросын ванлигууд дээр нөлөөгөө бататгаж, Ижил мөрний худалдааны гарцыг хянав.",
    metadata: {
      economy: "Алба татвар, худалдааны зангилаа",
      notableEvents: ["Русь дахь хараат тогтолцоо бэхжив"],
    },
    geometry: rings.goldenHorde,
  },
    {
    slug: "ilkhanate",
    year: 1271,
    name: "Ил хаант улс",
    leader: "Абақа хан",
    capital: "Табриз орчим",
    color: "#059669",
    summary: "Иранд Ил хаант улс биежиж, Миср-Мамлюк ба Алтан Ордтой зэрэг өрсөлдөж байв.",
    metadata: {
      religion: "Ислам руу шилжилтийн өмнөх олон шашны орчин",
      notableEvents: ["Баруун Азийн монголын тогтвортой ханлиг болов"],
    },
    geometry: rings.ilkhanate,
  },
];
