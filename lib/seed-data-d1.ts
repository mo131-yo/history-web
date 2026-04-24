import type { AtlasStateRecord } from "@/lib/types";
import { rings } from "@/lib/seed-rings";

export const atlasSeedDataDPart1: AtlasStateRecord[] = [
    {
    slug: "yuan-dynasty",
    year: 1279,
    name: "Юань улс",
    leader: "Хубилай хаан",
    capital: "Дайду",
    color: "#c9a45d",
    summary: "1279 онд Юань улс Өмнөд Сүнийг бүрэн эзлэн, Хятадыг бүхэлд нь захирсан анхны Монгол төр болов.",
    metadata: {
      notableEvents: ["Ямын тэнгисийн тулаан", "Өмнөд Сүн мөхөв"],
    },
    geometry: rings.yuan,
  },
    {
    slug: "chagatai-khanate",
    year: 1279,
    name: "Цагаадайн улс",
    leader: "Дувагийн үеийн өмнөх тогтворгүй байдал",
    capital: "Алмалык",
    color: "#0ea5e9",
    summary: "Цагаадайн улс Төв Азийн торгоны замын дундах зангилааг хадгалсан ч дотоод эрх мэдлийн өрсөлдөөнтэй байв.",
    metadata: {
      notableEvents: ["Трансоксианы хяналтын төлөө тэмцэл"],
    },
    geometry: rings.chagatai,
  },
    {
    slug: "golden-horde",
    year: 1279,
    name: "Алтан Орд",
    leader: "Мөнхтөмөр",
    capital: "Сарай",
    color: "#a855f7",
    summary: "Алтан Орд баруун Евразийн худалдааны гарцыг тогтоон барьж, Оросын вант улсуудын дээр сюзерен ноёрхлоо хадгалав.",
    metadata: {
      notableEvents: ["Ижил мөрний тэнхлэг бэхжив"],
    },
    geometry: rings.goldenHorde,
  },
    {
    slug: "ilkhanate",
    year: 1279,
    name: "Ил хаант улс",
    leader: "Абақа хан",
    capital: "Табриз",
    color: "#059669",
    summary: "Ил хаант улс Кавказ, Иран, Иракийг хянаж, Өрнө Азийн хүчний тэнцвэрийн гол тоглогч хэвээр байв.",
    metadata: {
      notableEvents: ["Мамлюктай өрсөлдөөн үргэлжилсээр"],
    },
    geometry: rings.ilkhanate,
  },
    {
    slug: "mamluk-sultanate",
    year: 1279,
    name: "Мамлюкийн султанат",
    leader: "Калаун",
    capital: "Каир",
    color: "#f97316",
    summary: "Мамлюкийн султанат Сирийн фронтоор Ил хаант улсыг тогтоон барих Ойрх Дорнодын гол сөрөг хүч байв.",
    metadata: {
      religion: "Ислам",
      notableEvents: ["Сирийн фронтын бат хамгаалалт"],
    },
    geometry: rings.mamluks,
  },
    {
    slug: "yuan-dynasty",
    year: 1294,
    name: "Юань улс",
    leader: "Төмөр өлзийт хаан",
    capital: "Дайду",
    color: "#c9a45d",
    summary: "1294 онд Хубилай нас барж, Юань улс их гүрний нэр сүрээ хадгалсан ч тэнгисийн аян, санхүүгийн ачааллын дарамтыг үүрч байв.",
    metadata: {
      notableEvents: ["Хубилай хаан нас барав"],
    },
    geometry: rings.yuan,
  },
    {
    slug: "chagatai-khanate",
    year: 1294,
    name: "Цагаадайн улс",
    leader: "Дува",
    capital: "Алмалык орчим",
    color: "#0ea5e9",
    summary: "Дувагийн үед Цагаадайн улс Төв Азид дахин идэвхжиж, Юань болон Ил хаантны хоорондын тэнцвэрт нөлөөлөв.",
    metadata: {
      notableEvents: ["Төв Азийн улс төр дахин идэвхжив"],
    },
    geometry: rings.chagatai,
  },
];
