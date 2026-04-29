"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { T } from "./atlas/constants";


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
type SavedQuizState = {
  screen: Screen;
  gradeGroup: GradeGroup;
  selectedGrade: number | null;
  quizQuestions: Question[];
  level: number;
  correct: number;
  streak: number;
  qIndex: number;
  answered: boolean;
  chosen: number | null;
  usedIds: string[];
  currentQ: Question | null;
  answers: QuizAnswer[];
  scoreSaveStatus: "idle" | "saving" | "saved" | "login" | "error";
  groupStats: Record<GradeGroup, { asked: number; correct: number }>;
};


const QUIZ_PERIOD = "1162-1300";
const QUESTIONS: Record<GradeGroup, Question[]> = {
  "1-5": [
    { level: 0, q: "1162 онд төрсөн гэж үздэг Монголын их хаан хэн бэ?", opts: ["а) Өгэдэй", "б) Тэмүжин", "в) Хубилай", "г) Мөнх"], ans: 1, exp: "Тэмүжин буюу Чингис хааныг 1162 онд төрсөн гэж уламжлалд тэмдэглэдэг." },
    { level: 0, q: "1206 оны их хуралдайгаар Тэмүжин ямар цол авсан бэ?", opts: ["а) Гүр хаан", "б) Сэцэн хан", "в) Чингис хаан", "г) Ил хаан"], ans: 2, exp: "1206 онд Тэмүжин бүх Монголын хаанаар өргөмжлөгдөж Чингис хаан цол хүртсэн." },
    { level: 0, q: "Их Монгол Улс хэдэн онд байгуулагдсан бэ?", opts: ["а) 1189", "б) 1206", "в) 1227", "г) 1271"], ans: 1, exp: "1206 оны их хуралдайгаар Их Монгол Улсын төрийн суурь тавигдсан." },
    { level: 0, q: "Чингис хааны дараа их хаан болсон хүн хэн бэ?", opts: ["а) Өгэдэй", "б) Зүчи", "в) Аригбөх", "г) Тогоонтөмөр"], ans: 0, exp: "Өгэдэй 1229 онд их хаанаар сонгогдож, эзэнт гүрний захиргааг үргэлжлүүлсэн." },
    { level: 0, q: "Монголчууд 1215 онд аль хотыг эзэлсэн бэ?", opts: ["а) Бээжин/Жүндү", "б) Дели", "в) Багдад", "г) Киев"], ans: 0, exp: "1215 онд Алтан улсын нийслэл Жүндү буюу өнөөгийн Бээжинг Монголчууд эзэлсэн." },
    { level: 1, q: "Монголын цэргийн үндсэн зохион байгуулалт аль нь вэ?", opts: ["а) Легион", "б) Арван-зуу-мянга-түмт", "в) Фаланкс", "г) Самурай бүлэг"], ans: 1, exp: "Монголын арми арван, зуу, мянга, түмтийн зохион байгуулалтаар хурдан хөдөлгөөнтэй байв." },
    { level: 1, q: "1227 онд нас барсан их хаан хэн бэ?", opts: ["а) Чингис хаан", "б) Гүюг", "в) Мөнх", "г) Хубилай"], ans: 0, exp: "Чингис хаан 1227 онд нас барсан бөгөөд түүний байгуулсан төр үргэлжлэн тэлсэн." },
    { level: 1, q: "Монгол бичигт хүчтэй нөлөөлсөн бичиг аль вэ?", opts: ["а) Уйгур бичиг", "б) Латин бичиг", "в) Кирилл бичиг", "г) Руник бичиг"], ans: 0, exp: "XIII зууны Монгол төр Уйгур бичгийн уламжлалыг авч хэрэглэсэн." },
    { level: 1, q: "1240 онд бичигдсэн гэж үздэг Монголын алдарт эх сурвалж аль вэ?", opts: ["а) Судрын чуулган", "б) Монголын нууц товчоо", "в) Юань улсын судар", "г) Алтан товч"], ans: 1, exp: "Монголын нууц товчоо 1240 онд бичигдсэн гэж үздэг, 1162-1227 үеийн чухал эх сурвалж юм." },
    { level: 1, q: "1271 онд Хубилай хаан ямар улсыг зарласан бэ?", opts: ["а) Юань улс", "б) Алтан Орд", "в) Цагаадайн улс", "г) Ил хаант улс"], ans: 0, exp: "1271 онд Хубилай хаан Юань улсыг зарлаж, Хятад дахь Монгол төрийг байгуулсан." },
    { level: 2, q: "Монголчуудын шуудан, өртөөний тогтолцоог юу гэж нэрлэдэг вэ?", opts: ["а) Ям", "б) Жизья", "в) Феод", "г) Полис"], ans: 0, exp: "Ям буюу өртөөний тогтолцоо эзэнт гүрний мэдээлэл, захиргааны холбоог түргэсгэсэн." },
    { level: 2, q: "1219 онд Монгол-Хорезмын дайн эхлэхэд гол шалтгаан болсон явдал аль вэ?", opts: ["а) Отрарын хэрэг", "б) Таласын тулалдаан", "в) Самаркандын гэрээ", "г) Хархорумын бослого"], ans: 0, exp: "Отрарт Монголын худалдаачид, элч нар хохирсон явдал Хорезмын эсрэг их аян дайны шалтаг болсон." },
  ],
  "6-9": [
    { level: 0, q: "1189 оны орчим Тэмүжин ямар албан тушаалд өргөмжлөгдсөн бэ?", opts: ["а) Монголын хан", "б) Ил хаан", "в) Юань хаан", "г) Алтан хаан"], ans: 0, exp: "1189 оны орчим Тэмүжин Хамаг Монголын хан болж, улс төрийн нэгдлийн эхлэл тавигдсан." },
    { level: 0, q: "Хархорум хот ямар хааны үед эзэнт гүрний төв болж хөгжсөн бэ?", opts: ["а) Өгэдэй", "б) Тэмүжин", "в) Аригбөх", "г) Есөнтөмөр"], ans: 0, exp: "Өгэдэй хааны үед Хархорумыг эзэнт гүрний захиргааны төв болгон хөгжүүлсэн." },
    { level: 0, q: "Монголчууд 1230-аад онд аль улсад томоохон аян хийсэн бэ?", opts: ["а) Алтан улс", "б) Инк улс", "в) Англи", "г) Япон"], ans: 0, exp: "Өгэдэй хааны үед Алтан улсыг бүрэн мөхөөх аян үргэлжилж 1234 онд дууссан." },
    { level: 0, q: "1241 онд Монгол цэрэг Европт ямар тулалдаанд ялсан бэ?", opts: ["а) Легница", "б) Ватерлоо", "в) Гастингс", "г) Манцикерт"], ans: 0, exp: "1241 онд Легницагийн тулалдаанд Монгол цэрэг Европын эвслийг ялсан." },
    { level: 1, q: "Алтан Ордны үндэс аль Чингисийн хүүгийн улсад тавигдсан бэ?", opts: ["а) Зүчийн улс", "б) Цагаадайн улс", "в) Тулуйн улс", "г) Өгэдэйн улс"], ans: 0, exp: "Зүчийн угсааны баруун зүгийн эзэмшлээс Алтан Ордны улс бүрэлдсэн." },
    { level: 1, q: "Цагаадайн улс голчлон аль бүсэд тогтсон бэ?", opts: ["а) Төв Ази", "б) Япон", "в) Скандинав", "г) Египет"], ans: 0, exp: "Цагаадайн улс Мавераннахр, Долоон ус, Төв Азийн өргөн бүсэд төвлөрсөн." },
    { level: 1, q: "1258 онд Хүлэгүгийн цэрэг аль хотыг эзэлсэн бэ?", opts: ["а) Багдад", "б) Ром", "в) Парис", "г) Киото"], ans: 0, exp: "1258 онд Багдадыг эзэлснээр Аббасын халифатын улс төрийн төв нуран унасан." },
    { level: 1, q: "1259 онд нас барж, эзэнт гүрний залгамжлалын хямралыг өдөөсөн их хаан хэн бэ?", opts: ["а) Мөнх", "б) Гүюг", "в) Бат", "г) Хайду"], ans: 0, exp: "Мөнх хаан 1259 онд нас барснаар Хубилай, Аригбөхийн тэмцэл эхэлсэн." },
    { level: 1, q: "1260-аад онд Хубилай хэнтэй хаан ширээний төлөө тэмцсэн бэ?", opts: ["а) Аригбөх", "б) Зүчи", "в) Бат", "г) Тохтамыш"], ans: 0, exp: "Хубилай, Аригбөх хоёрын тэмцэл Монголын төв эрх мэдлийн задарлыг гүнзгийрүүлсэн." },
    { level: 1, q: "1279 онд Юань улс аль улсыг бүрэн эзэлсэн бэ?", opts: ["а) Өмнөд Сүн", "б) Хорезм", "в) Дели", "г) Мамлюк"], ans: 0, exp: "1279 онд Өмнөд Сүн улс мөхөж, Хубилайн Юань Хятадыг бүрэн нэгтгэсэн." },
    { level: 2, q: "Ил хаант улс голчлон аль бүс нутагт байгуулагдсан бэ?", opts: ["а) Иран ба Баруун Ази", "б) Солонгос", "в) Балкан", "г) Сибирь"], ans: 0, exp: "Хүлэгүгийн байгуулсан Ил хаант улс Иран, Ирак, Кавказын чиглэлд төвлөрсөн." },
    { level: 2, q: "1260 оны Айн Жалутын тулалдаанд Монголчуудыг хэн зогсоосон бэ?", opts: ["а) Мамлюкууд", "б) Франкууд", "в) Византчууд", "г) Сүн улс"], ans: 0, exp: "Мамлюкууд Айн Жалутын тулалдаанд Монголын баруун тийш давших хүчийг сааруулсан." },
  ],
  "10-12": [
    { level: 0, q: "Их Монгол Улсын тэлэлтэд худалдаачин, элчийн халдашгүй байдал яагаад чухал байсан бэ?", opts: ["а) Дипломат холбоо, худалдааг хамгаалсан", "б) Зөвхөн шашны ёс байсан", "в) Хот барих арга байсан", "г) Татвар устгасан"], ans: 0, exp: "Элч, худалдаачны аюулгүй байдал нь Монголын дипломат бодлого, мэдээллийн сүлжээний гол зарчим байв." },
    { level: 0, q: "Яса хэмээх ойлголтыг юу гэж тайлбарлаж болох вэ?", opts: ["а) Хааны зарлиг, хэв ёсны цогц", "б) Зөвхөн шашны ном", "в) Хотын нэр", "г) Далайн хууль"], ans: 0, exp: "Яса нь Чингис хааны зарлиг, цэргийн болон төрийн сахилга, хэв ёсны цогц ойлголт гэж тайлбарлагддаг." },
    { level: 0, q: "Монголын эзэнт гүрэн 13-р зуунд ямар давуу талтай байсан бэ?", opts: ["а) Морьт цэрэг, мэдээлэл, сахилга", "б) Далай тэнгисийн флот", "в) Нүүрсний үйлдвэр", "г) Галт зэвсгийн үйлдвэр"], ans: 0, exp: "Хөдөлгөөнт морьт цэрэг, өртөө, тагнуул, сахилга бат нь эзэнт гүрний гол давуу тал байв." },
    { level: 0, q: "1300 он гэхэд Монголын ертөнц ямар байдалтай болсон бэ?", opts: ["а) Хэд хэдэн ханлигт хуваагдсан", "б) Нэг жижиг аймаг болсон", "в) Европт бүрэн төвлөрсөн", "г) Далайд шилжсэн"], ans: 0, exp: "1300 он гэхэд Юань, Алтан Орд, Ил хаант улс, Цагаадайн улс зэрэг тусдаа төвүүд хүчтэй болсон." },
    { level: 1, q: "Пакс Монголика гэж юу гэсэн ойлголт вэ?", opts: ["а) Монголын ноёрхлын үеийн Евроазийн харилцааны идэвхжил", "б) Зөвхөн нэг тулалдаан", "в) Хятадын нэг хот", "г) Шашны урсгал"], ans: 0, exp: "Пакс Монголика нь Монголын ноёрхлын үед Евроазийн худалдаа, элч, мэдлэгийн урсгал идэвхжсэнийг нэрлэдэг." },
    { level: 1, q: "Хубилай, Аригбөхийн тэмцэл ямар үр дагавартай байсан бэ?", opts: ["а) Төв эрх мэдлийн задралыг түргэсгэсэн", "б) Бүх ханлигийг нэгтгэсэн", "в) Алтан улсыг сэргээсэн", "г) Японыг эзэлсэн"], ans: 0, exp: "1260-аад оны тэмцэл их хааны эрх мэдлийг сулруулж, бүс нутгийн ханлигуудын бие даах хандлагыг нэмэгдүүлсэн." },
    { level: 1, q: "Юань улсын засаглал Монголын ямар сорилттой тулгарсан бэ?", opts: ["а) Нүүдэлчин ба суурин засаглалын тэнцвэр", "б) Далайгүй байх", "в) Бичиг үсэггүй байх", "г) Мал аж ахуйгүй байх"], ans: 0, exp: "Юань улс нүүдэлчин Монгол эрх мэдэл, Хятадын суурин захиргааны уламжлалыг зэрэг удирдах шаардлагатай болсон." },
    { level: 1, q: "Ил хаант улсын баруун Азид тогтох нь ямар ач холбогдолтой вэ?", opts: ["а) Монголын нөлөө Исламын ертөнцөд хүрсэн", "б) Монголчууд далайг эзэлсэн", "в) Юань мөхсөн", "г) Сүн улс сэргэсэн"], ans: 0, exp: "Ил хаант улс Иран, Ирак, Кавказ дахь улс төр, худалдаа, соёлын харилцаанд Монголын нөлөөг оруулсан." },
    { level: 2, q: "Ханлигуудын хуваагдал яагаад зөвхөн сулрал биш гэж үзэж болох вэ?", opts: ["а) Бүс нутгийн дасан зохицол, шинэ төрийн хэлбэрүүд бий болсон", "б) Бүгд нэг өдөр мөхсөн", "в) Цэрэг бүрэн татан буугдсан", "г) Худалдаа хаагдсан"], ans: 0, exp: "Хуваагдал нь төвлөрөл сулрахын зэрэгцээ бүс нутгийн хэл, шашин, захиргаатай зохицсон шинэ ханлигуудыг бий болгосон." },
    { level: 2, q: "Монголын өртөөний тогтолцоо эзэнт гүрний засаглалд ямар үүрэгтэй байсан бэ?", opts: ["а) Мэдээлэл, зарлиг, элчийг хурдан дамжуулсан", "б) Зөвхөн тариалан усалсан", "в) Хотын хэрэм барьсан", "г) Зоос устгасан"], ans: 0, exp: "Өртөө нь асар уудам орон зайд захиргаа, цэрэг, худалдаа, дипломат харилцааг холбосон." },
    { level: 2, q: "Монголын байлдан дагууллын амжилтыг дан ганц хүчээр тайлбарлахад юу дутагддаг вэ?", opts: ["а) Дипломат, тагнуул, логистик, нутгийн элиттэй харилцах бодлого", "б) Зөвхөн цаг агаар", "в) Зөвхөн аз", "г) Зөвхөн нэг зэвсэг"], ans: 0, exp: "Монголын амжилт нь хүчнээс гадна мэдээлэл, дипломат бодлого, логистик, нутгийн хүчнүүдийг ашиглах чадвартай холбоотой." },
    { level: 2, q: "1162-1300 оны Монголын түүхийг дэлхийн түүхэнд чухал болгодог гол шалтгаан аль вэ?", opts: ["а) Евроазийн улс төр, худалдаа, соёлын холбоог өөрчилсөн", "б) Зөвхөн нэг хот байгуулсан", "в) Дэлхийн бүх улсыг нэгтгэсэн", "г) Түүхэн эх сурвалж үлдээгээгүй"], ans: 0, exp: "Монголын эзэнт гүрэн Евроазийн хүчний тэнцвэр, худалдаа, мэдлэгийн солилцоонд гүн нөлөө үзүүлсэн." },
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
const QUIZ_STORAGE_PREFIX = "mongol-atlas-history-quiz";


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
  const hydratedRef = useRef(false);
  const storageKey = `${QUIZ_STORAGE_PREFIX}:${mode}`;
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

  useEffect(() => {
    hydratedRef.current = false;
    const saved = readSavedQuiz(storageKey);
    if (saved) {
      setScreen(saved.screen);
      setGradeGroup(saved.gradeGroup);
      setSelectedGrade(saved.selectedGrade);
      setQuizQuestions(saved.quizQuestions);
      setLevel(saved.level);
      setCorrect(saved.correct);
      setStreak(saved.streak);
      setQIndex(saved.qIndex);
      setAnswered(saved.answered);
      setChosen(saved.chosen);
      setUsedIds(new Set(saved.usedIds));
      setCurrentQ(saved.currentQ);
      setAnswers(saved.answers);
      setScoreSaveStatus(saved.scoreSaveStatus === "saving" ? "idle" : saved.scoreSaveStatus);
      setGroupStats(saved.groupStats);
    } else {
      setScreen("grade");
      setGradeGroup("6-9");
      setSelectedGrade(null);
      setQuizQuestions([]);
      setLevel(1);
      setCorrect(0);
      setStreak(0);
      setQIndex(0);
      setAnswered(false);
      setChosen(null);
      setUsedIds(new Set());
      setCurrentQ(null);
      setAnswers([]);
      setScoreSaveStatus("idle");
      setGroupStats(createEmptyGroupStats());
    }
    hydratedRef.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveQuizState(storageKey, {
      screen,
      gradeGroup,
      selectedGrade,
      quizQuestions,
      level,
      correct,
      streak,
      qIndex,
      answered,
      chosen,
      usedIds: Array.from(usedIds),
      currentQ,
      answers,
      scoreSaveStatus,
      groupStats,
    });
  }, [
    answers,
    answered,
    chosen,
    correct,
    currentQ,
    gradeGroup,
    groupStats,
    level,
    qIndex,
    quizQuestions,
    scoreSaveStatus,
    screen,
    selectedGrade,
    storageKey,
    streak,
    usedIds,
  ]);

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
      ...createEmptyGroupStats(),
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
      ...createEmptyGroupStats(),
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
          year: QUIZ_PERIOD,
          period: QUIZ_PERIOD,
          mode,
          selectedGrade,
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
    setCorrect(0);
    setStreak(0);
    setQIndex(0);
    setAnswered(false);
    setChosen(null);
    setUsedIds(new Set());
    setCurrentQ(null);
    setGroupStats(createEmptyGroupStats());
    setScoreSaveStatus("idle");
    clearSavedQuiz(storageKey);
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
              {onClose && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      border: quizBorder,
                      background: quizPanelSoft,
                      color: T.textSub,
                      borderRadius: 10,
                      padding: "7px 11px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 12,
                    }}
                  >
                    Хаах
                  </button>
                </div>
              )}
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
                      1162-1300 оны Монголын түүхийн 10 танин мэдэхүйн асуулт.<br />
                      Анги сонгохгүйгээр тэр үеийн мэдлэгээ шалгаарай.
                    </>
                  ) : (
                    <>
                      1-12 ангиас сонгоно.<br />
                      Асуултууд зөвхөн 1162-1300 оны Монголын түүхээс орно.
                    </>
                  )}
                </p>
              </div>

              {mode === "knowledge" ? (
                <>
                  <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
                    {["10 асуулт", "1162-1300 оны Монголын түүх", "Зөв хариултын тайлбартай"].map((label) => (
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      border: quizBorder,
                      background: quizPanelSoft,
                      color: T.textSub,
                      borderRadius: 10,
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 12,
                    }}
                  >
                    Түр гарах
                  </button>
                )}
              </div>
            </div>
            <p style={{ color: T.textSub, fontSize: 12, marginBottom: 10, textAlign: "right" }}>
              {mode === "knowledge" ? "1162-1300 · Танин мэдэхүй" : `${selectedGrade ?? ""}-р анги · 1162-1300`}
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

function createEmptyGroupStats(): Record<GradeGroup, { asked: number; correct: number }> {
  return {
    "1-5": { asked: 0, correct: 0 },
    "6-9": { asked: 0, correct: 0 },
    "10-12": { asked: 0, correct: 0 },
  };
}

function readSavedQuiz(storageKey: string): SavedQuizState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedQuizState;
    if (!parsed || !["grade", "quiz", "result"].includes(parsed.screen)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveQuizState(storageKey: string, state: SavedQuizState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Local storage can be unavailable; the quiz still works without resume.
  }
}

function clearSavedQuiz(storageKey: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage cleanup errors.
  }
}
