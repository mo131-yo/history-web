"use client";

import type { RpgQuestion } from "./types";

export const RPG_QUESTIONS: RpgQuestion[] = [
  { id: "q1", question: "Аян замд хамгийн түрүүнд чи юуг шалгах вэ?", options: [
    { label: "Морьдын хүч, эмээл хазаар, замын хурдыг шалгана.", scores: { aduuchin: 3, aravt: 1, zuut: 1 } },
    { label: "Хүнс, ус, өвс бэлчээр хүрэлцэх эсэхийг тооцно.", scores: { malchin: 2, tariachin: 2, myangat: 2 } },
    { label: "Хэний нутаг, хэний хэл, ямар ёстойг асууна.", scores: { helmerch: 3, hudaldaachin: 2, bicheech: 1 } },
    { label: "Тэмдэглэл, зарлиг, тооцоогоо эмхэлнэ.", scores: { bicheech: 3, myangatiin_noyon: 1 } },
  ] },
  { id: "q2", question: "Маргаан гарвал чи яаж шийдэх вэ?", options: [
    { label: "Хоёр талын үгийг сонсоод эвлэрүүлэх гарц хайна.", scores: { helmerch: 3, boo_udgan: 1, myangatiin_noyon: 1 } },
    { label: "Дүрэм, тушаал, сахилга батыг баримтална.", scores: { aravt: 2, zuut: 3, myangat: 1 } },
    { label: "Ашиг, алдагдлыг тооцож тохиролцоо санал болгоно.", scores: { hudaldaachin: 3, bicheech: 1 } },
    { label: "Ахмадын ёс, тэнгэр шүтлэг, зан үйлийг сануулна.", scores: { boo_udgan: 3, malchin: 1 } },
  ] },
  { id: "q3", question: "Чиний хамгийн их дуртай ажил юу вэ?", options: [
    { label: "Гараар юм урлах, засах, гоё болгох.", scores: { oydolchin: 3, darkhan: 3 } },
    { label: "Газраа арчлах, ургацаа тооцох.", scores: { tariachin: 4 } },
    { label: "Мал сүрэг, бэлчээр, улирлын нүүдэл төлөвлөх.", scores: { malchin: 4, aduuchin: 1 } },
    { label: "Хүмүүсийг зохион байгуулж, үүрэг хуваарилах.", scores: { zuut: 2, myangat: 3, myangatiin_noyon: 3 } },
  ] },
  { id: "q4", question: "Дайсны мэдээ ирвэл чи юу хийх вэ?", options: [
    { label: "Тагнуулын мөр, газрын байдал, салхины чигийг ажиглана.", scores: { anchin: 3, aravt: 1 } },
    { label: "Цэргүүдийг бүлэглэж, тушаал дамжуулах бэлтгэл хийнэ.", scores: { zuut: 3, myangat: 3, myangatiin_noyon: 1 } },
    { label: "Хэлэлцээ хийх боломж байгаа эсэхийг судална.", scores: { helmerch: 3, hudaldaachin: 1 } },
    { label: "Морь, сум, тоног хэрэгслийг бэлэн болгоно.", scores: { aduuchin: 2, darkhan: 2, aravt: 2 } },
  ] },
  { id: "q5", question: "Чамд нэг өдөр чөлөө өгвөл чи юу хийх вэ?", options: [
    { label: "Морь унаж, тал нутгаар давхина.", scores: { aduuchin: 4, anchin: 1 } },
    { label: "Юм оёж, засаж, хэрэгтэй эдлэл бүтээнэ.", scores: { oydolchin: 3, darkhan: 2 } },
    { label: "Худалдаачидтай уулзаж сонин мэдээ сонсоно.", scores: { hudaldaachin: 3, helmerch: 2 } },
    { label: "Тэмдэглэл уншиж, хуучин явдлыг эргэцүүлнэ.", scores: { bicheech: 3, boo_udgan: 1 } },
  ] },
  { id: "q6", question: "Хүмүүс чамайг юугаар хамгийн их үнэлдэг вэ?", options: [
    { label: "Найдвартай, чимээгүй ч ажлаа хийдэг.", scores: { malchin: 2, tariachin: 2, aravt: 2 } },
    { label: "Удирдаж чаддаг, шийдвэр хурдан гаргадаг.", scores: { zuut: 2, myangat: 3, myangatiin_noyon: 3 } },
    { label: "Ухаантай ярьж, хүмүүсийг ойлгуулж чаддаг.", scores: { helmerch: 3, hudaldaachin: 2 } },
    { label: "Гарын уртай, нарийн мэдрэмжтэй.", scores: { oydolchin: 3, darkhan: 3 } },
  ] },
  { id: "q7", question: "Чи ямар зүйлээс хамгийн их хүч авдаг вэ?", options: [
    { label: "Тал нутаг, сүрэг мал, гэр бүлээс.", scores: { malchin: 3, aduuchin: 1 } },
    { label: "Эмх журам, туг сүлд, хамт олноос.", scores: { aravt: 2, zuut: 2, myangat: 2 } },
    { label: "Мэдлэг, бичиг, ой санамжаас.", scores: { bicheech: 3, helmerch: 1 } },
    { label: "Ёс заншил, билэг тэмдэг, сэтгэлийн хүчнээс.", scores: { boo_udgan: 4 } },
  ] },
  { id: "q8", question: "Чи аль үүргийг өөртөө хамгийн ойр гэж мэдрэх вэ?", options: [
    { label: "Амьдралыг тэтгэгч хүн.", scores: { malchin: 2, tariachin: 3 } },
    { label: "Зам, мэдээ, солилцоог холбогч хүн.", scores: { helmerch: 2, hudaldaachin: 3, bicheech: 1 } },
    { label: "Дайн, хамгаалалт, сахилгын хүн.", scores: { aravt: 2, zuut: 2, myangat: 2, myangatiin_noyon: 1 } },
    { label: "Урлал, хэрэгсэл, бүтээлийн хүн.", scores: { oydolchin: 2, darkhan: 3 } },
  ] },
];
