import type { AtlasStateRecord } from "@/lib/types";
import { rings } from "@/lib/seed-rings";

export const atlasSeedDataCPart1: AtlasStateRecord[] = [
    {
    slug: "mongol-empire",
    year: 1241,
    name: "Монголын эзэнт гүрэн",
    leader: "Өгэдэй хаан",
    capital: "Хархорум",
    color: "#c9a45d",
    summary: "1241 онд Монголын эзэнт гүрэн Польш, Унгар хүртэл довтлон, Евразийн төв хэсгийг бүхэлд нь цэргийн дарамтад оруулав.",
    metadata: {
      military: "Олон их жанжны зэрэг давшилт",
      governance: "Хархорум төвтэй эзэнт гүрний захиргаа",
      notableEvents: ["Легницийн тулаан", "Мохийн тулаан", "Өгэдэй хааны нас баралт"],
    },
    geometry: rings.mongol1241,
  },
    {
    slug: "golden-horde-frontier",
    year: 1241,
    name: "Баруун фронтын монгол захиргаа",
    leader: "Бат хаан",
    capital: "Ижил орчмын орд",
    color: "#a855f7",
    summary: "Батын баруун фронт Зүүн Европт нэвтэрч, ирээдүйн Алтан Ордны суурь тогтлоо.",
    metadata: {
      notableEvents: ["Русь, Польш, Унгарын аян"],
    },
    geometry: rings.goldenHorde,
  },
    {
    slug: "song-dynasty",
    year: 1241,
    name: "Өмнөд Сүн",
    leader: "Лизун",
    capital: "Линьань",
    color: "#dc2626",
    summary: "Өмнөд Сүн нь Монголын өргөтгөлөөс түр хугацаанд зайтай байсан ч урт хугацаанд хамгийн том дорнын өрсөлдөгч хэвээр байв.",
    metadata: {
      economy: "Усан худалдаа, хотын эдийн засаг",
      notableEvents: ["Янцзыгийн систем хамгаалалтын гол шугам болов"],
    },
    geometry: rings.song,
  },
    {
    slug: "delhi-sultanate",
    year: 1241,
    name: "Делийн султанат",
    leader: "Муиззуддин Бахрам Шах",
    capital: "Дели",
    color: "#2563eb",
    summary: "Энэтхэгийн умард хэсэгт Делийн султанат хүчээ хадгалж, Монголын түрэлтэд бэлтгэх шаардлагатай болсон.",
    metadata: {
      religion: "Ислам",
      notableEvents: ["Пенжабын чиглэлд дарамт нэмэгдэв"],
    },
    geometry: rings.delhi,
  },
    {
    slug: "mongol-empire",
    year: 1259,
    name: "Монголын эзэнт гүрний сүүлчийн нэгдмэл хүрээ",
    leader: "Мөнх хаан",
    capital: "Хархорум",
    color: "#c9a45d",
    summary: "1259 онд Мөнх хааны нас баралтаар Монголын эзэнт гүрэн залгамжлалын шинэ хуваагдлын ирмэгт ирэв.",
    metadata: {
      notableEvents: ["Мөнх хаан нас барав", "Хубилай, Аригбөхийн тэмцлийн эхлэл"],
    },
    geometry: rings.mongol1241,
  },
    {
    slug: "golden-horde",
    year: 1259,
    name: "Алтан Ордны бүс",
    leader: "Бэрх",
    capital: "Сарай орчим",
    color: "#a855f7",
    summary: "Баруун зүгт Бат, Бэрхийн удирдсан захиргаа биежиж, хожмын Алтан Ордны улс төрийн хэлбэр тодров.",
    metadata: {
      governance: "Жүчийн угсааны ханлиг",
      notableEvents: ["Баруун талын биежилт эхлэв"],
    },
    geometry: rings.goldenHorde,
  },
];
