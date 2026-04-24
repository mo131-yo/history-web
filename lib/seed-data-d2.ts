import type { AtlasStateRecord } from "@/lib/types";
import { rings } from "@/lib/seed-rings";

export const atlasSeedDataDPart2: AtlasStateRecord[] = [
    {
    slug: "golden-horde",
    year: 1294,
    name: "Алтан Орд",
    leader: "Тохта",
    capital: "Сарай",
    color: "#a855f7",
    summary: "Алтан Орд Орос, Хар тэнгис, Ижил мөрний худалдааг хянан, Монголын баруун ханлигуудын дунд томоохон нөлөөтэй хэвээр байв.",
    metadata: {
      notableEvents: ["Хар тэнгисийн худалдаанд идэвхтэй оролцов"],
    },
    geometry: rings.goldenHorde,
  },
    {
    slug: "ilkhanate",
    year: 1294,
    name: "Ил хаант улс",
    leader: "Газан хаан",
    capital: "Табриз",
    color: "#059669",
    summary: "1294 онд Ил хаант улс шинэчлэлийн босгон дээр ирж, Иран дахь монгол захиргаагаа исламжсан шинэ хэлбэрт шилжүүлэх эхлэл тавигдав.",
    metadata: {
      notableEvents: ["Газан хааны шинэчлэлийн өмнөх үе"],
    },
    geometry: rings.ilkhanate,
  },
    {
    slug: "yuan-dynasty",
    year: 1300,
    name: "Юань улс",
    leader: "Төмөр өлзийт хаан",
    capital: "Дайду",
    color: "#c9a45d",
    summary: "1300 он гэхэд Юань улс Хятадыг захирсан хэвээр ч далайн аян, ордны зардал, бүс нутгийн биежилтээс шалтгаалсан дарамттай нүүр тулж байв.",
    metadata: {
      strategicFocus: "Дотоод тогтвортой байдал ба хил хамгаалалт",
      notableEvents: ["Пакс Монголика үргэлжилсэн ч дотоод ялгарал нэмэгдэв"],
    },
    geometry: rings.yuan,
  },
    {
    slug: "chagatai-khanate",
    year: 1300,
    name: "Цагаадайн улс",
    leader: "Дува",
    capital: "Алмалык",
    color: "#0ea5e9",
    summary: "1300 онд Цагаадайн улс Төв Азийн хуурай газрын зангилааг удирдан, Монголын ертөнцийн дунд хэсгийн улс төрийг тодорхойлов.",
    metadata: {
      notableEvents: ["Төв Азийн худалдааны урсгалд нөлөөлөв"],
    },
    geometry: rings.chagatai,
  },
    {
    slug: "golden-horde",
    year: 1300,
    name: "Алтан Орд",
    leader: "Тохта",
    capital: "Сарай",
    color: "#a855f7",
    summary: "Алтан Орд Оросын ванлигуудын дээрх нөлөөгөө хадгалж, Хар тэнгис болон Ижил мөрний худалдааны томоохон хүч байсаар байв.",
    metadata: {
      notableEvents: ["Оросын вассал харилцаа тогтвортой үргэлжлэв"],
    },
    geometry: rings.goldenHorde,
  },
    {
    slug: "ilkhanate",
    year: 1300,
    name: "Ил хаант улс",
    leader: "Газан хаан",
    capital: "Табриз",
    color: "#059669",
    summary: "Ил хаант улс 1300 онд Иран, Ирак, Кавказын ихэнхийг хянаж, Монголын баруун ертөнцийн цөм хэвээр байлаа.",
    metadata: {
      religion: "Исламд шилжсэн монгол ханлиг",
      notableEvents: ["Ираны захиргааны шинэчлэлүүд"],
    },
    geometry: rings.ilkhanate,
  },
];
