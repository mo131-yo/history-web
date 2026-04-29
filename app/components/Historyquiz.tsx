"use client";

import { useCallback, useState } from "react";
import { T } from "./atlas/constants";

// =============================================
// TYPES
// =============================================
interface Question {
  level: number;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

type GradeGroup = "1-5" | "6-9" | "10-12";
type QuizMode = "knowledge" | "grade";
type Screen = "grade" | "quiz" | "result";
type QuizAnswer = {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

// =============================================
// QUESTION BANK
// =============================================
const QUESTIONS: Record<GradeGroup, Question[]> = {
  "1-5": [
    { level: 0, q: "Монгол улсын нийслэл хот аль нь вэ?", opts: ["а) Дархан", "б) Улаанбаатар", "в) Эрдэнэт", "г) Чойбалсан"], ans: 1, exp: "Улаанбаатар хот 1924 оноос Монгол улсын нийслэл болсон." },
    { level: 0, q: "Чингис хааныг анхны нэр нь хэн байсан бэ?", opts: ["а) Тэмүжин", "б) Өгэдэй", "в) Мөнх", "г) Хубилай"], ans: 0, exp: "Чингис хааны анхны нэр Тэмүжин байсан бөгөөд 1206 онд Чингис хаан цол хүртсэн." },
    { level: 0, q: "Монголчуудын уламжлалт орон байрыг юу гэж нэрлэдэг вэ?", opts: ["а) Байшин", "б) Гэр", "в) Асар", "г) Дэн"], ans: 1, exp: "Гэр нь Монголчуудын уламжлалт нүүдлийн орон байр юм." },
    { level: 0, q: "Монгол улс хэдэн онд тунхаглагдсан бэ?", opts: ["а) 1911", "б) 1924", "в) 1945", "г) 1990"], ans: 0, exp: "Монгол улс 1911 онд Манжийн эрхшээлээс тусгаар тогтнолоо зарласан." },
    { level: 0, q: "Монголын нутаг дэвсгэрийг хэдэн дүгээр зуунд Чингис хаан нэгтгэсэн бэ?", opts: ["а) 10-р зуун", "б) 12-р зуун", "в) 13-р зуун", "г) 14-р зуун"], ans: 2, exp: "Чингис хаан 13-р зуунд (1206 он) Монголын овог аймгуудыг нэгтгэн Их Монгол улсыг байгуулсан." },
    { level: 1, q: "Монгол эзэнт гүрний хамгийн том тал нутгийн байлдан дагуулагч хэн бэ?", opts: ["а) Хубилай хаан", "б) Чингис хаан", "в) Өгэдэй хаан", "г) Тэмүр хаан"], ans: 1, exp: "Чингис хаан Монгол эзэнт гүрнийг үүсгэн байгуулж, дэлхийн хамгийн том нийлмэл эзэнт гүрний суурийг тавьсан." },
    { level: 1, q: "Монголын үндэсний бичиг хэзээ бий болсон бэ?", opts: ["а) 10-р зуун", "б) 12-р зуун эхэн", "в) 13-р зуун эхэн", "г) 15-р зуун"], ans: 2, exp: "Монгол бичгийг 13-р зуунд Чингис хааны үед Уйгуур бичгийн үндсэн дээр бүтээсэн." },
    { level: 1, q: "'Монголын нууц товчоо' хэзээ бичигдсэн бэ?", opts: ["а) 1227 он", "б) 1240 он", "в) 1260 он", "г) 1300 он"], ans: 1, exp: "Монголын нууц товчоо 1240 онд бичигдсэн гэж үздэг бөгөөд хамгийн эртний Монгол бичмэл дурсгал юм." },
    { level: 1, q: "Монгол эзэнт гүрний дараа аль улсын засаглал тогтсон бэ?", opts: ["а) Хятад", "б) Манж", "в) Орос", "г) Турк"], ans: 1, exp: "1691 оноос Монгол нутаг Манжийн Чин гүрний мэдэлд орсон." },
    { level: 1, q: "Монгол улс ардчилсан тогтолцоонд хэзээ шилжсэн бэ?", opts: ["а) 1989 он", "б) 1990 он", "в) 1991 он", "г) 1992 он"], ans: 1, exp: "1990 онд Монгол улс олон намын тогтолцоонд шилжиж, анхны чөлөөт сонгууль болсон." },
    { level: 2, q: "Монгол нууц товчооны анхны Монгол нэр юу вэ?", opts: ["а) Монголын тэмдэглэл", "б) Монголын судар", "в) Нууц товчоо", "г) Монгол нутгийн домог"], ans: 2, exp: "Монголын нууц товчооны Монгол нэр нь 'Монгол-ун Нигуча Тобчиян' буюу 'Нууц Товчоо' юм." },
    { level: 2, q: "Чингис хааны үед Монгол эзэнт гүрэн аль улсыг эхлэж байлдан дагуулсан бэ?", opts: ["а) Хятад", "б) Ирак", "в) Польш", "г) Зи Ся гүрэн"], ans: 3, exp: "Чингис хаан 1205–1209 онуудад Зи Ся (Баруун Ся) гүрнийг байлдан дагуулахаар анхны том дайн хийсэн." },
  ],
  "6-9": [
    { level: 0, q: "Дэлхийн нэгдүгээр дайн хэдэн онд эхэлсэн бэ?", opts: ["а) 1910 он", "б) 1914 он", "в) 1918 он", "г) 1920 он"], ans: 1, exp: "Дэлхийн нэгдүгээр дайн 1914 оны 7-р сард эхэлж 1918 онд дууссан." },
    { level: 0, q: "Монгол улс ямар онд НҮБ-д элссэн бэ?", opts: ["а) 1945 он", "б) 1956 он", "в) 1961 он", "г) 1970 он"], ans: 2, exp: "Монгол улс 1961 онд НҮБ-д элссэн." },
    { level: 0, q: "Дэлхийн хоёрдугаар дайн хэдэн онд дууссан бэ?", opts: ["а) 1943 он", "б) 1944 он", "в) 1945 он", "г) 1946 он"], ans: 2, exp: "Дэлхийн хоёрдугаар дайн 1945 оны 9-р сарын 2-нд Японы бууж өгснөөр дууссан." },
    { level: 0, q: "Монголын ардын хувьсгал хэдэн онд болсон бэ?", opts: ["а) 1919 он", "б) 1921 он", "в) 1924 он", "г) 1930 он"], ans: 1, exp: "Монголын ардын хувьсгал 1921 оны 7-р сарын 11-нд ялсан бөгөөд энэ өдрийг Нийслэлийн өдөр болгон тэмдэглэдэг." },
    { level: 0, q: "Хүйтэн дайн ямар хоёр улсын хооронд явагдсан бэ?", opts: ["а) АНУ ба Хятад", "б) АНУ ба ЗХУ", "в) Англи ба Герман", "г) Франц ба АНУ"], ans: 1, exp: "Хүйтэн дайн 1947–1991 он хүртэл АНУ ба ЗХУ-ын хооронд явагдсан геополитикийн тэмцэл байв." },
    { level: 1, q: "Монгол-Зөвлөлтийн цэргүүд Халхын голын байлдаанд (1939) аль улсын армитай тулалдсан бэ?", opts: ["а) Хятад", "б) Герман", "в) Япон", "г) Польш"], ans: 2, exp: "1939 онд Халхын голын дэргэд Монгол-Зөвлөлтийн хамтарсан цэрэг Японы армитай тулалдаж, ялалт байгуулсан." },
    { level: 1, q: "Орос дахь 1917 оны хувьсгалын дараа хэн засгийн эрхийг авсан бэ?", opts: ["а) Лениний большевикууд", "б) Царт засгийн газар", "в) Орос ардчилсан нам", "г) Герман"], ans: 0, exp: "1917 оны Аравдугаар сарын хувьсгалаар Лениний удирдсан большевикууд засгийн эрхийг авсан." },
    { level: 1, q: "Берлиний хана хэдэн онд нурсан бэ?", opts: ["а) 1987 он", "б) 1989 он", "в) 1990 он", "г) 1991 он"], ans: 1, exp: "Берлиний хана 1989 оны 11-р сарын 9-нд нурж, Германы нэгдэлд хүргэсэн." },
    { level: 1, q: "НҮБ-ын байгуулагдсан он хэд вэ?", opts: ["а) 1942 он", "б) 1944 он", "в) 1945 он", "г) 1948 он"], ans: 2, exp: "НҮБ 1945 оны 10-р сарын 24-нд байгуулагдсан." },
    { level: 1, q: "Монголын Ардын Намыг үүсгэн байгуулахад оролцсон гол удирдагч хэн вэ?", opts: ["а) Цэрэндорж", "б) Д.Сүхбаатар", "в) Х.Чойбалсан", "г) Ю.Цэдэнбал"], ans: 1, exp: "Дамдины Сүхбаатар 1921 оны ардын хувьсгалын гол удирдагч байсан бөгөөд Монгол хувьсгалын баатар хэмээн алдаршсан." },
    { level: 2, q: "Халх голын байлдааны командлагч Зөвлөлтийн генерал хэн байсан бэ?", opts: ["а) Ворошилов", "б) Тимошенко", "в) Жуков", "г) Буденный"], ans: 2, exp: "Георгий Жуков Халхын голын байлдаанд Зөвлөлтийн цэргийг удирдаж, ялалт байгуулсан бөгөөд энэ нь түүний цэргийн карьерт чухал хуудас болсон." },
    { level: 2, q: "1930-аад онд Монгол дахь хэлмэгдүүлэлт хамгийн ихээр хэний нэр дор явагдсан бэ?", opts: ["а) Сүхбаатар", "б) Цэдэнбал", "в) Чойбалсан", "г) Амар"], ans: 2, exp: "Хорлоогийн Чойбалсан Сталины зааврын дагуу 1937–1939 оны хэлмэгдүүлэлтийг удирдан явуулж, олон мянган хүн хохирсон." },
  ],
  "10-12": [
    { level: 0, q: "Дэлхийн хоёрдугаар дайнд аль хоёр эсэргүүцэгч холбоо тулалдсан бэ?", opts: ["а) Холбоотнууд ба Дайны Тэнхлэг", "б) НАТО ба ЗХУ", "в) АНУ ба Япон", "г) Европ ба Ази"], ans: 0, exp: "Дэлхийн хоёрдугаар дайнд Холбоотнууд (АНУ, СССР, Британи гэх мэт) ба Дайны Тэнхлэг (Герман, Итали, Япон) тулалдсан." },
    { level: 0, q: "Нийгмийн дарвинизм гэсэн нэр томьёог хэн бий болгосон бэ?", opts: ["а) Карл Маркс", "б) Герберт Спенсер", "в) Чарльз Дарвин", "г) Макс Вебер"], ans: 1, exp: "'Нийгмийн дарвинизм' нэр томьёог Британийн философич Герберт Спенсер хүний нийгэмд 'байгалийн шилгарлын' онолыг хэрэглэн санаачилсан." },
    { level: 0, q: "Монгол улсын 1992 оны үндсэн хуульд ямар засаглалын хэлбэр тогтоосон бэ?", opts: ["а) Нийгмийн нам", "б) Ерөнхийлөгчийн бүгд найрамдах улс", "в) Хагас ерөнхийлөгчийн парламентат бүгд найрамдах улс", "г) Монарх"], ans: 2, exp: "1992 оны Үндсэн хуулиар Монгол улс хагас ерөнхийлөгчийн парламентат бүгд найрамдах улс болохыг тогтоосон." },
    { level: 0, q: "Версалийн гэрээ ямар дайны дараа байгуулагдсан бэ?", opts: ["а) Дэлхийн 2-р дайн", "б) Дэлхийн 1-р дайн", "в) Наполеоны дайн", "г) Орос-Японы дайн"], ans: 1, exp: "Версалийн гэрээ 1919 онд Дэлхийн нэгдүгээр дайны дараа Парист байгуулагдсан." },
    { level: 0, q: "Их хямрал хэдэн онд эхэлсэн бэ?", opts: ["а) 1925", "б) 1929", "в) 1933", "г) 1937"], ans: 1, exp: "Их хямрал 1929 оны 10-р сарын 24-нд Нью-Йоркийн хөрөнгийн биржийн уналтаас эхэлсэн." },
    { level: 1, q: "Монгол-Оросын найрамдлын гэрээг хэдэн онд байгуулсан бэ?", opts: ["а) 1912 он", "б) 1921 он", "в) 1936 он", "г) 1946 он"], ans: 1, exp: "1921 оны хувьсгалын дараа Монгол-Оросын найрамдлын анхны гэрээ 1921 онд байгуулагдсан." },
    { level: 1, q: "Постмодернизм ямар чиглэлийн эсрэг урсгал болон гарч ирсэн бэ?", opts: ["а) Классицизм", "б) Романтизм", "в) Модернизм", "г) Реализм"], ans: 2, exp: "Постмодернизм 20-р зууны дунд үеэс модернизмын тодорхойлолт ба объектив үнэнд итгэх итгэлийг эрс эргэлзэх замаар гарч ирсэн." },
    { level: 1, q: "Монгол улсын анхны ардчилсан ерөнхийлөгч хэн байсан бэ?", opts: ["а) П.Очирбат", "б) Н.Багабанди", "в) Ц.Элбэгдорж", "г) Х.Баттулга"], ans: 0, exp: "Пунсалмаагийн Очирбат 1990 онд Монгол улсын анхны ардчилсан ерөнхийлөгчөөр сонгогдсон." },
    { level: 1, q: "Хятадын иргэний дайн (1927–1949) хэн хэнийг эсэргүүцсэн дайн байсан бэ?", opts: ["а) КНН ба Японы цэрэг", "б) ЗХУКН ба Гоминьдан", "в) Хятад ба ЗСБНХУ", "г) Шинэ Хятад ба Тайвань"], ans: 1, exp: "Хятадын иргэний дайн нь Мао Цзэдуны ЗХУКНам ба Чан Кайшийн Гоминьдан намын хооронд явагдсан." },
    { level: 1, q: "'Харанхуй зуун' гэдэг ямар эрин үеийг заадаг вэ?", opts: ["а) 6–10-р зуун", "б) 5–15-р зуун", "в) 10–13-р зуун", "г) 3–6-р зуун"], ans: 0, exp: "Орчин цагийн судлаачид 'Харанхуй зуун' гэдгийг ихэвчлэн 6–10-р зуун буюу Ромын эзэнт гүрэн нурснаас хойших Европын дундад зууны эхэн үеийг зааж хэрэглэдэг." },
    { level: 2, q: "Монгол улсын 'Шинэ сэргэлт' бодлогын зорилго юу байсан бэ?", opts: ["а) Хөдөө аж ахуйн хөгжил", "б) Зэвсэгт хүчний шинэчлэл", "в) Засаглал, эдийн засгийн шинэчлэл", "г) Гадаад харилцааны тэлэлт"], ans: 2, exp: "'Шинэ сэргэлт' бодлого засаглалын ил тод байдал, эдийн засгийн шинэчлэлийг гол зорилгоо болгосон." },
    { level: 2, q: "Вестфалийн гэрээ (1648) ямар ач холбогдолтой байсан бэ?", opts: ["а) Наполеоны дайныг дуусгасан", "б) Колонийн тогтолцоог бий болгосон", "в) Орчин үеийн улс-үндэстний тогтолцооны суурийг тавьсан", "г) Европын холбоог байгуулсан"], ans: 2, exp: "1648 оны Вестфалийн гэрээ улс-үндэстний бүрэн эрхт байдлын зарчмыг батлан орчин үеийн олон улсын харилцааны суурийг тавьсан гэж үздэг." },
  ],
};

const LEVELS = ["Энгийн", "Дунд", "Хэцүү"] as const;
const TOTAL = 10;
const GRADE_GROUPS: GradeGroup[] = ["1-5", "6-9", "10-12"];
const GRADE_LABELS: Record<GradeGroup, string> = {
  "1-5": "1-5 ангийн түвшин",
  "6-9": "6-9 ангийн түвшин",
  "10-12": "10-12 ангийн түвшин",
};
const GRADES = Array.from({ length: 12 }, (_, index) => index + 1);
const quizPanel = "rgba(8,5,2,0.92)";
const quizPanelSoft = "rgba(15,23,42,0.42)";
const quizBorder = `1px solid ${T.border}`;
const quizGlow = "0 18px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)";

// =============================================
// MAIN COMPONENT
// =============================================
export default function HistoryQuiz({
  mode,
  onClose,
  userName = "Зочин",
  onScoreSaved,
}: {
  mode: QuizMode;
  onClose?: () => void;
  userName?: string;
  onScoreSaved?: () => void;
}) {
  const [screen, setScreen] = useState<Screen>("grade");
  const [gradeGroup, setGradeGroup] = useState<GradeGroup>("6-9");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [level, setLevel] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [scoreSaveStatus, setScoreSaveStatus] = useState<"idle" | "saving" | "saved" | "login" | "error">("idle");
  const [groupStats, setGroupStats] = useState<Record<GradeGroup, { asked: number; correct: number }>>({
    "1-5": { asked: 0, correct: 0 },
    "6-9": { asked: 0, correct: 0 },
    "10-12": { asked: 0, correct: 0 },
  });

  const pickQuestion = useCallback(
    (lvl: number, currentUsed: Set<string>, group: GradeGroup): { q: Question; newUsed: Set<string> } => {
      const newUsed = new Set(currentUsed);
      const preferredLevels = getPreferredLevels(lvl);
      const preferredPool = QUESTIONS[group].filter((q) => preferredLevels.includes(q.level));
      const preferredUnused = preferredPool.filter((q) => !newUsed.has(`${group}:${q.q}`));

      if (preferredUnused.length > 0) {
        const q = preferredUnused[Math.floor(Math.random() * preferredUnused.length)];
        newUsed.add(`${group}:${q.q}`);
        return { q, newUsed };
      }

      const groupUnused = QUESTIONS[group].filter((q) => !newUsed.has(`${group}:${q.q}`));
      if (groupUnused.length > 0) {
        const q = groupUnused[Math.floor(Math.random() * groupUnused.length)];
        newUsed.add(`${group}:${q.q}`);
        return { q, newUsed };
      }

      newUsed.clear();
      const q = preferredPool[Math.floor(Math.random() * preferredPool.length)] ?? QUESTIONS[group][0];
      newUsed.add(`${group}:${q.q}`);
      return { q, newUsed };
    },
    []
  );

  const startKnowledgeQuiz = () => {
    const questions = shuffleQuestions(Object.values(QUESTIONS).flat()).slice(0, TOTAL);
    const first = questions[0];
    if (!first) return;

    setCorrect(0);
    setStreak(0);
    setQIndex(0);
    setLevel(1);
    setGradeGroup("6-9");
    setSelectedGrade(null);
    setQuizQuestions(questions);
    setAnswered(false);
    setChosen(null);
    setUsedIds(new Set());
    setCurrentQ(first);
    setAnswers([]);
    setGroupStats({
      "1-5": { asked: 0, correct: 0 },
      "6-9": { asked: 0, correct: 0 },
      "10-12": { asked: 0, correct: 0 },
    });
    setScoreSaveStatus("idle");
    setScreen("quiz");
  };

  const startGradeQuiz = (grade: number) => {
    const emptyUsed = new Set<string>();
    const startingGroup = getGradeGroup(grade);
    const startingLevel = getGradeLevel(grade);
    const { q, newUsed } = pickQuestion(startingLevel, emptyUsed, startingGroup);
    setCorrect(0);
    setStreak(0);
    setQIndex(0);
    setLevel(startingLevel);
    setGradeGroup(startingGroup);
    setSelectedGrade(grade);
    setQuizQuestions([]);
    setAnswered(false);
    setChosen(null);
    setUsedIds(newUsed);
    setCurrentQ(q);
    setAnswers([]);
    setGroupStats({
      "1-5": { asked: 0, correct: 0 },
      "6-9": { asked: 0, correct: 0 },
      "10-12": { asked: 0, correct: 0 },
    });
    setScoreSaveStatus("idle");
    setScreen("quiz");
  };

  const startQuiz = () => {
    if (mode === "knowledge") startKnowledgeQuiz();
    else setScreen("grade");
  };

  const handleAnswer = (idx: number) => {
    if (answered || !currentQ) return;
    setAnswered(true);
    setChosen(idx);

    const isOk = idx === currentQ.ans;
    const newCorrect = isOk ? correct + 1 : correct;
    const newStreak = isOk ? streak + 1 : 0;
    let newLevel = level;
    let nextGroup = gradeGroup;

    if (mode === "grade" && selectedGrade) {
      newLevel = getGradeLevel(selectedGrade);
      nextGroup = getGradeGroup(selectedGrade);
    } else if (mode === "knowledge") {
      if (isOk) {
        if (newStreak >= 2 && level < 2) newLevel = level + 1;
        if (newStreak >= 2) nextGroup = shiftGradeGroup(gradeGroup, 1);
      } else {
        if (level > 0) newLevel = level - 1;
        nextGroup = shiftGradeGroup(gradeGroup, -1);
      }
    }

    setCorrect(newCorrect);
    setStreak(isOk ? (newStreak >= 2 ? 0 : newStreak) : 0);
    setLevel(newLevel);
    setGradeGroup(nextGroup);
    setGroupStats((current) => ({
      ...current,
      [gradeGroup]: {
        asked: current[gradeGroup].asked + 1,
        correct: current[gradeGroup].correct + (isOk ? 1 : 0),
      },
    }));
    setAnswers((current) => [
      ...current,
      {
        question: currentQ.q,
        selectedAnswer: currentQ.opts[idx],
        correctAnswer: currentQ.opts[currentQ.ans],
        isCorrect: isOk,
      },
    ]);
  };

  const nextQuestion = () => {
    const nextIdx = qIndex + 1;
    if (nextIdx >= TOTAL) {
      setScreen("result");
      saveAttempt();
      return;
    }
    if (mode === "knowledge") {
      setQIndex(nextIdx);
      setAnswered(false);
      setChosen(null);
      setCurrentQ(quizQuestions[nextIdx] ?? null);
      return;
    }

    const lockedGrade = selectedGrade ?? 6;
    const { q, newUsed } = pickQuestion(getGradeLevel(lockedGrade), usedIds, getGradeGroup(lockedGrade));
    setQIndex(nextIdx);
    setAnswered(false);
    setChosen(null);
    setCurrentQ(q);
    setUsedIds(newUsed);
  };

  const saveAttempt = async () => {
    try {
      setScoreSaveStatus("saving");
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: mode === "knowledge" ? "history-knowledge" : `history-grade-${selectedGrade ?? getAssessedGroup()}`,
          userName,
          year: null,
          score: correct,
          totalQuestions: TOTAL,
          passed: correct >= Math.ceil(TOTAL * 0.6),
          answers,
        }),
      });

      if (response.status === 401) {
        setScoreSaveStatus("login");
        return;
      }
      if (!response.ok) {
        setScoreSaveStatus("error");
        return;
      }

      setScoreSaveStatus("saved");
      onScoreSaved?.();
    } catch (error) {
      console.error("History quiz attempt save error:", error);
      setScoreSaveStatus("error");
    }
  };

  const restart = () => {
    setScreen("grade");
    setGradeGroup("6-9");
    setSelectedGrade(null);
    setQuizQuestions([]);
    setAnswers([]);
    setScoreSaveStatus("idle");
  };

  const progress = (qIndex / TOTAL) * 100;

  const resultPct = correct / TOTAL;
  const assessedGroup = getAssessedGroup();
  const resultSub =
    resultPct >= 0.9
      ? "Гайхалтай! Та маш сайн мэдлэгтэй!"
      : resultPct >= 0.7
      ? "Маш сайн үр дүн!"
      : resultPct >= 0.5
      ? "Сайн байна, үргэлжлүүлэн дадлага хийгээрэй."
      : "Дахин давтаарай, чадна шүү!";

  return (
    <div style={{
      minHeight: "100%",
      background: `radial-gradient(circle at 50% 0%, rgba(201,164,93,0.10), transparent 34%), ${T.bg}`,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "2rem 1rem 3rem",
      fontFamily: "'Georgia', serif",
    }}>
      <div style={{ width: "100%", maxWidth: 580 }}>

        {/* ── GRADE SELECTION ── */}
        {screen === "grade" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{
              background: quizPanel,
              border: quizBorder,
              borderRadius: 16,
              padding: "2rem",
              backdropFilter: "blur(18px)",
              boxShadow: quizGlow,
            }}>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    margin: "0 auto 12px",
                    borderRadius: 12,
                    background: "rgba(201,164,93,0.14)",
                    border: "1px solid rgba(201,164,93,0.38)",
                    color: T.amber,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  Q
                </div>
                <h1 style={{ color: T.amber, fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: 0 }}>
                  {mode === "knowledge" ? "Мэдлэгээ сорих" : "Анги сонгох"}
                </h1>
                <p style={{ color: T.textSub, fontSize: 14, lineHeight: 1.7 }}>
                  {mode === "knowledge" ? (
                    <>
                      Танин мэдэхүйн 10 асуулттай богино сорил.<br />
                      Монгол болон дэлхийн түүхийн ерөнхий мэдлэгээ шалгаарай.
                    </>
                  ) : (
                    <>
                      1-12 ангиас сонгоно.<br />
                      Анги ахих тусам асуултын түвшин хэцүү болно.
                    </>
                  )}
                </p>
              </div>

              {mode === "knowledge" ? (
                <>
                  <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
                    {["10 асуулт", "Танин мэдэхүйн холимог сэдэв", "Зөв хариултын тайлбартай"].map((label) => (
                      <div
                        key={label}
                        style={{
                          padding: "12px 14px",
                          border: quizBorder,
                          borderRadius: 12,
                          background: quizPanelSoft,
                          color: T.textSub,
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={startQuiz}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: T.amber,
                      color: T.bg,
                      border: "none",
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      letterSpacing: 0.5,
                    }}
                  >
                    Мэдлэгээ сорих →
                  </button>
                </>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
                  {GRADES.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => startGradeQuiz(grade)}
                      style={{
                        minHeight: 58,
                        border: quizBorder,
                        borderRadius: 12,
                        background: "rgba(15,23,42,0.42)",
                        color: T.text,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <span style={{ display: "block", color: T.amber, fontSize: 18, fontWeight: 700 }}>{grade}</span>
                      <span style={{ display: "block", color: T.textMuted, fontSize: 10, marginTop: 2 }}>анги</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {screen === "quiz" && currentQ && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Top bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: T.textMuted, fontSize: 13 }}>
                {qIndex + 1} / {TOTAL}
              </span>
              <span style={{
                padding: "4px 14px",
                borderRadius: 99,
                background: level === 0 ? "rgba(92,64,32,0.38)" : level === 1 ? "rgba(201,164,93,0.14)" : "rgba(192,96,96,0.14)",
                color: level === 0 ? T.textSub : level === 1 ? T.amber : T.red,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: 11,
                textTransform: "uppercase" as const,
                border: `1px solid ${level === 0 ? T.borderMid : level === 1 ? "rgba(201,164,93,0.38)" : "rgba(192,96,96,0.38)"}`,
              }}>
                {LEVELS[level]}
              </span>
            </div>
            <p style={{ color: T.textSub, fontSize: 12, marginBottom: 10, textAlign: "right" }}>
              {mode === "knowledge" ? "Танин мэдэхүйн сорил" : `${selectedGrade ?? ""}-р анги · ${GRADE_LABELS[gradeGroup]}`}
            </p>

            {/* Progress */}
            <div style={{ height: 5, background: "rgba(92,64,32,0.38)", borderRadius: 999, marginBottom: 20, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                background: `linear-gradient(90deg, ${T.amberDim}, ${T.amberBright})`,
                borderRadius: 999,
                width: `${progress}%`,
                transition: "width 0.4s ease",
              }} />
            </div>

            {/* Question card */}
            <div style={{
              background: quizPanel,
              border: quizBorder,
              borderRadius: 16,
              padding: "1.5rem",
              marginBottom: 10,
              backdropFilter: "blur(18px)",
              boxShadow: quizGlow,
            }}>
              <p style={{
                color: T.text,
                fontSize: 17,
                fontWeight: 600,
                lineHeight: 1.6,
                marginBottom: "1.25rem",
              }}>
                {currentQ.q}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {currentQ.opts.map((opt, i) => {
                  let bg = quizPanelSoft;
                  let border = quizBorder;
                  let color = T.textSub;

                  if (answered) {
                    if (i === currentQ.ans) {
                      bg = "rgba(201,164,93,0.14)";
                      border = "1px solid rgba(201,164,93,0.48)";
                      color = T.amberBright;
                    } else if (i === chosen && chosen !== currentQ.ans) {
                      bg = "rgba(192,96,96,0.14)";
                      border = "1px solid rgba(192,96,96,0.48)";
                      color = T.red;
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={answered}
                      style={{
                        textAlign: "left",
                        padding: "11px 16px",
                        border,
                        borderRadius: 10,
                        background: bg,
                        color,
                        fontSize: 14,
                        cursor: answered ? "default" : "pointer",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                        lineHeight: 1.4,
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {answered && (
                <div style={{
                  marginTop: 14,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: chosen === currentQ.ans ? "rgba(201,164,93,0.10)" : "rgba(192,96,96,0.12)",
                  border: `1px solid ${chosen === currentQ.ans ? "rgba(201,164,93,0.35)" : "rgba(192,96,96,0.35)"}`,
                  color: chosen === currentQ.ans ? T.amberBright : T.red,
                  fontSize: 13,
                  lineHeight: 1.6,
                  animation: "fadeIn 0.2s ease",
                }}>
                  {chosen === currentQ.ans ? "✓ Зөв! " : `✗ Буруу. Зөв хариулт: ${currentQ.opts[currentQ.ans]}. `}
                  {currentQ.exp}
                </div>
              )}
            </div>

            {answered && (
              <button
                onClick={nextQuestion}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "rgba(201,164,93,0.10)",
                  border: "1px solid rgba(201,164,93,0.28)",
                  borderRadius: 12,
                  color: T.amber,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  animation: "fadeIn 0.2s ease",
                }}
              >
                {qIndex + 1 >= TOTAL ? "Үр дүн харах →" : "Дараагийн асуулт →"}
              </button>
            )}
          </div>
        )}

        {/* ── RESULT ── */}
        {screen === "result" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{
              background: quizPanel,
              border: quizBorder,
              borderRadius: 16,
              padding: "2rem",
              textAlign: "center",
              backdropFilter: "blur(18px)",
              boxShadow: quizGlow,
            }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: T.amber, marginBottom: 6 }}>
                {correct}/{TOTAL}
              </div>
              <p style={{ color: T.textSub, fontSize: 14, marginBottom: 24 }}>{resultSub}</p>
              <div style={{
                background: "rgba(201,164,93,0.10)",
                border: "1px solid rgba(201,164,93,0.28)",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 18,
              }}>
                <p style={{ color: T.textMuted, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 6 }}>
                  {mode === "knowledge" ? "Сорилын төрөл" : "Сонгосон түвшин"}
                </p>
                <p style={{ color: T.amber, fontSize: 22, fontWeight: 700 }}>
                  {mode === "knowledge" ? "Мэдлэгээ сорих" : `${selectedGrade ?? ""}-р анги · ${GRADE_LABELS[assessedGroup]}`}
                </p>
              </div>
              <p style={{ color: T.textMuted, fontSize: 11, marginBottom: 18, textTransform: "uppercase", letterSpacing: 1.4 }}>
                {scoreSaveStatus === "saved" && "Leaderboard-д хадгаллаа"}
                {scoreSaveStatus === "saving" && "Оноо хадгалж байна..."}
                {scoreSaveStatus === "login" && "Нэвтэрвэл оноо leaderboard-д хадгалагдана"}
                {scoreSaveStatus === "error" && "Оноо хадгалж чадсангүй"}
                {scoreSaveStatus === "idle" && "Оноо бэлэн"}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
                {[
                  { num: correct, lbl: "Зөв хариулт" },
                  { num: TOTAL - correct, lbl: "Буруу хариулт" },
                  { num: mode === "knowledge" ? LEVELS[level] : `${selectedGrade ?? "-"} анги`, lbl: mode === "knowledge" ? "Хүрсэн түвшин" : "Сонгосон анги" },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: quizPanelSoft,
                    border: quizBorder,
                    borderRadius: 12,
                    padding: "14px 8px",
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: T.amber }}>{s.num}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={restart}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: T.amber,
                  color: T.bg,
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {mode === "knowledge" ? "Дахин сорих" : "Дахин анги сонгох"}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: 10,
                  background: "rgba(15,23,42,0.42)",
                  color: T.textSub,
                  border: quizBorder,
                  borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Хаах
                </button>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );

  function getAssessedGroup(): GradeGroup {
    if (mode === "grade" && selectedGrade) return getGradeGroup(selectedGrade);

    const weightedScore = GRADE_GROUPS.reduce((sum, group, index) => {
      const stats = groupStats[group];
      if (!stats.asked) return sum;
      return sum + stats.correct * (index + 1);
    }, 0);
    const correctAnswers = Math.max(correct, 1);
    const avgLevel = weightedScore / correctAnswers;

    if (correct / TOTAL >= 0.75 && avgLevel >= 2.2) return "10-12";
    if (correct / TOTAL >= 0.5 && avgLevel >= 1.35) return "6-9";
    return "1-5";
  }
}

function shiftGradeGroup(group: GradeGroup, delta: -1 | 1): GradeGroup {
  const currentIndex = GRADE_GROUPS.indexOf(group);
  const nextIndex = Math.max(0, Math.min(GRADE_GROUPS.length - 1, currentIndex + delta));
  return GRADE_GROUPS[nextIndex];
}

function getGradeGroup(grade: number): GradeGroup {
  if (grade <= 5) return "1-5";
  if (grade <= 9) return "6-9";
  return "10-12";
}

function getGradeLevel(grade: number) {
  if (grade <= 4) return 0;
  if (grade <= 8) return 1;
  return 2;
}

function getPreferredLevels(level: number) {
  if (level <= 0) return [0, 1];
  if (level === 1) return [1, 0, 2];
  return [2, 1, 0];
}

function shuffleQuestions(questions: Question[]) {
  return [...questions].sort(() => Math.random() - 0.5);
}
