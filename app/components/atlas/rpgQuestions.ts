"use client";

import type { RpgQuestion } from "./types";

export const RPG_QUESTIONS: RpgQuestion[] = [
  {
    id: "q1",
    question: "Олон аймаг хоорондоо зөрчилдөөд, нэгдэх эсэх нь эргэлзээтэй байвал чи юу хийх вэ?",
    options: [
      { label: "Нэг том зорилго дэвшүүлж, бүгдийг түүний дор зангидахыг оролдоно.", scores: { chinggis_khaan: 4, orlog_zovloh: 1 } },
      { label: "Хамгийн хүчтэй хүмүүсийг зохион байгуулж, сахилга журам тогтооно.", scores: { janjin: 3, urtuu_zahiragch: 1 } },
      { label: "Аль тал юунаас эмээж, юунд итгэж байгааг сонсоод эвийн гарц хайна.", scores: { khaanii_elch: 3, udgan: 1 } },
      { label: "Баримт, ам тангараг, дүрэм журмыг эмхлэн бичиж, ойлгомжтой болгоно.", scores: { bicheech: 3, orlog_zovloh: 1 } },
    ],
  },
  {
    id: "q2",
    question: "Аян дайнд гарахын өмнө чиний хамгийн түрүүнд бодох зүйл юу вэ?",
    options: [
      { label: "Ямар чиглэлээр довтолж, хаанаас бүслэх вэ гэдгээ бодно.", scores: { janjin: 4, turshuul: 1 } },
      { label: "Сэлгээ морь, хүнс, мэдээ дамжуулалт тасалдахгүй эсэхийг шалгана.", scores: { urtuu_zahiragch: 4, chinggis_khaan: 1 } },
      { label: "Дайсныхаа дотоод сул тал, хөдөлгөөнийг эхэлж олж мэднэ.", scores: { turshuul: 4, janjin: 1 } },
      { label: "Энэ аян урт хугацаанд ашигтай юу гэдгийг нухацтай тооцно.", scores: { orlog_zovloh: 3, chinggis_khaan: 1 } },
    ],
  },
  {
    id: "q3",
    question: "Харь улсын төлөөлөгч танай өргөөнд ирвэл чи хэрхэн харьцах вэ?",
    options: [
      { label: "Нэр хүндээ хадгалж, үг бүрийн цаадах зорилгыг нь танина.", scores: { khaanii_elch: 4, hudaldaanii_noen: 1 } },
      { label: "Тэднээс ямар мэдээ, ямар аюул нууж байгааг ажиглана.", scores: { turshuul: 3, orlog_zovloh: 1 } },
      { label: "Худалдаа, зам харилцааны боломж нээгдэх эсэхийг бодно.", scores: { hudaldaanii_noen: 4, khaanii_elch: 1 } },
      { label: "Тэднийг төрийн жаягт нийцүүлэн бүртгэж, хэлсэн үгийг нь тэмдэглэнэ.", scores: { bicheech: 4 } },
    ],
  },
  {
    id: "q4",
    question: "Чамайг хүмүүс ямар үед хамгийн их түшдэг вэ?",
    options: [
      { label: "Хэцүү мөчид зориг өгч, бүгдийг нэг чигт хөдөлгөх үед.", scores: { chinggis_khaan: 4, janjin: 1 } },
      { label: "Эмх замбараагүй байдлыг богино хугацаанд цэгцлэх үед.", scores: { janjin: 3, urtuu_zahiragch: 2 } },
      { label: "Эргэлзээтэй шийдвэрт урт хугацааны зөв гарц санал болгох үед.", scores: { orlog_zovloh: 4 } },
      { label: "Хүмүүсийн сэтгэлийг тэнцвэржүүлж, зоригийг нь сэргээх үед.", scores: { udgan: 4, khaanii_elch: 1 } },
    ],
  },
  {
    id: "q5",
    question: "Чи ямар ажил хийхдээ хамгийн их төвлөрч чаддаг вэ?",
    options: [
      { label: "Зэвсэг, тоног, эд хэрэгсэл урлаж сайжруулах.", scores: { darkhan: 4 } },
      { label: "Нууцаар ажиглаж, бусдын анзаараагүй зүйлийг олох.", scores: { turshuul: 4, janjin: 1 } },
      { label: "Зарлиг, хууль, тооцоог алдаагүй эмхэтгэх.", scores: { bicheech: 4, orlog_zovloh: 1 } },
      { label: "Хүмүүс, бараа, мэдээ хоёрыг зөв газарт нь холбох.", scores: { hudaldaanii_noen: 3, khaanii_elch: 2, urtuu_zahiragch: 1 } },
    ],
  },
  {
    id: "q6",
    question: "Шинэ эзлэгдсэн нутагт хамгийн зөв эхний алхам юу гэж боддог вэ?",
    options: [
      { label: "Айдас биш дэг журам тогтоож, хүмүүсийг нэгдсэн зорилгод оруулах.", scores: { chinggis_khaan: 3, orlog_zovloh: 2 } },
      { label: "Цэрэг, харуул, зам харилцааг нэн даруй цэгцлэх.", scores: { janjin: 3, urtuu_zahiragch: 2 } },
      { label: "Орон нутгийн ноёд, элч нартай ярилцаж тогтвортой харилцаа тогтоох.", scores: { khaanii_elch: 3, hudaldaanii_noen: 2 } },
      { label: "Хүн ам, татвар, нөөц, газрын мэдээллийг нэгтгэн бүртгэх.", scores: { bicheech: 3, orlog_zovloh: 2 } },
    ],
  },
  {
    id: "q7",
    question: "Чиний хувьд хүч гэдэг юунаас бүрддэг вэ?",
    options: [
      { label: "Нэгэн зорилгын дор нэгдсэн хүмүүсээс.", scores: { chinggis_khaan: 4 } },
      { label: "Сахилга баттай цэрэг, зөв тушаалаас.", scores: { janjin: 4 } },
      { label: "Алсыг харсан бодлого, мэдээллийн давуу талаас.", scores: { orlog_zovloh: 3, turshuul: 2 } },
      { label: "Зам, солилцоо, урсгал тасрахгүй байх тогтолцооноос.", scores: { urtuu_zahiragch: 3, hudaldaanii_noen: 2 } },
    ],
  },
  {
    id: "q8",
    question: "Хаан чамаас ганц чадвараа сонгож үлдээ гэвэл чи юуг үлдээх вэ?",
    options: [
      { label: "Хүмүүсийг зоригжуулж, дагуулж чадах нөлөөгөө.", scores: { chinggis_khaan: 4, khaanii_elch: 1 } },
      { label: "Тулааны үед яг зөв шийдвэр гаргах мэдрэмжээ.", scores: { janjin: 4 } },
      { label: "Үгийг баримт болгож, баримтыг дэг журам болгох чадвараа.", scores: { bicheech: 4 } },
      { label: "Хэн ч анзаараагүй зам, боломж, дохиог мэдрэх чадвараа.", scores: { turshuul: 3, udgan: 2, orlog_zovloh: 1 } },
    ],
  },
];
