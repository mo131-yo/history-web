"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  altanUragEdges,
  altanUragPeople,
  type LineagePerson,
  type LineageRank,
} from "./altanUragData";

const NODE_WIDTH = 260;
const NODE_HEIGHT = 132;
const NODE_GAP_X = 92;
const NODE_GAP_Y = 96;
const GOLD = "#D4AF37";
type PositionedLineagePerson = LineagePerson & {
  position: { x: number; y: number };
};

const rankLabels: Record<LineageRank, string> = {
  mythic: "Домогт үе",
  origin: "Домогт өвөг",
  khan: "Хан",
  "great-khan": "Их хаан",
  prince: "Хан хүү",
  "empire-founder": "Улс үндэслэгч",
  revival: "Сэргээн нэгтгэгч",
  "final-head": "Сүүл үеийн толгой",
};

const rankGlow: Record<LineageRank, string> = {
  mythic: "from-slate-100 via-blue-100 to-blue-400",
  origin: "from-slate-200 via-blue-100 to-blue-500",
  khan: "from-blue-100 via-blue-500 to-blue-700",
  "great-khan": "from-amber-100 via-[#D4AF37] to-blue-700",
  prince: "from-sky-100 via-blue-200 to-blue-500",
  "empire-founder": "from-amber-100 via-blue-500 to-blue-800",
  revival: "from-emerald-100 via-blue-500 to-blue-800",
  "final-head": "from-slate-100 via-blue-200 to-slate-500",
};

export default function LineageTree() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const initialCenteredRef = useRef(false);
  const [search, setSearch] = useState("");
  const { people, peopleById, canvasWidth, canvasHeight } = useMemo(
    () => layoutLineage(altanUragPeople),
    [],
  );
  const [selectedPerson, setSelectedPerson] = useState<PositionedLineagePerson | null>(
    people.find((person) => person.id === "genghis") ?? people[0] ?? null,
  );

  const searchResults = useMemo(
    () =>
      search.trim().length < 2
        ? []
        : people
            .filter((person) => {
              const query = search.trim().toLowerCase();
              return (
                person.name.mn.toLowerCase().includes(query) ||
                person.name.en.toLowerCase().includes(query) ||
                person.title.toLowerCase().includes(query) ||
                person.branch.toLowerCase().includes(query)
              );
            })
            .slice(0, 8),
    [people, search],
  );

  const centerPerson = (person: PositionedLineagePerson) => {
    setSelectedPerson(person);

    const viewport = viewportRef.current;
    if (!viewport) return;

    const targetLeft =
      person.position.x + NODE_WIDTH / 2 - viewport.clientWidth / 2;
    const targetTop =
      person.position.y + NODE_HEIGHT / 2 - viewport.clientHeight / 2;

    viewport.scrollTo({
      left: Math.max(0, targetLeft),
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (initialCenteredRef.current || !selectedPerson) return;
    initialCenteredRef.current = true;
    const frame = window.requestAnimationFrame(() => centerPerson(selectedPerson));
    return () => window.cancelAnimationFrame(frame);
  }, [selectedPerson]);

  return (
    <section className="relative min-h-[760px] overflow-hidden rounded-3xl border border-blue-100 bg-[#fcfcfc] text-slate-900 shadow-[0_24px_70px_rgba(37,99,235,0.14)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.12),transparent_34%),radial-gradient(circle_at_12%_85%,rgba(212,175,55,0.14),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.34] [background-image:linear-gradient(rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />

      <header className="relative z-10 flex flex-col gap-4 border-b border-blue-100 bg-white/82 px-6 py-5 backdrop-blur md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-600">
            Монгол Атлас
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-wide text-slate-900 md:text-4xl">
            Алтан Ураг
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Бөртэ Чоноос Чингис хаан, Даян хаан, Лигдэн хаан болон 1924 он хүртэлх
            гол Боржигин угсааны автомат байрлалтай мод.
          </p>
          <div className="relative mt-4 max-w-xl">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Нэр хайх: Чингис, Даян, Лигдэн..."
              className="h-11 w-full rounded-2xl border border-blue-100 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-blue-100 bg-white p-1.5 shadow-2xl">
                {searchResults.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => {
                      centerPerson(person);
                      setSearch("");
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-blue-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-slate-800">
                        {person.name.mn}
                      </span>
                      <span className="block truncate text-[11px] font-semibold text-slate-400">
                        {person.title}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-600">
                      {person.years}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          {(["great-khan", "empire-founder", "prince"] as LineageRank[]).map(
            (rank) => (
              <div
                key={rank}
                className="rounded-xl border border-blue-100 bg-blue-50/55 px-3 py-2"
              >
                <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-blue-500">
                  Зэрэг
                </span>
                <span className="font-bold text-slate-700">
                  {rankLabels[rank]}
                </span>
              </div>
            ),
          )}
        </div>
      </header>

      <div className="relative z-10 grid min-h-[650px] lg:grid-cols-[1fr_390px]">
        <div
          ref={viewportRef}
          className="relative overflow-auto scroll-smooth bg-white/35"
        >
          <div
            className="relative"
            style={{ width: canvasWidth, height: canvasHeight }}
          >
            <LineageEdges
              canvasHeight={canvasHeight}
              canvasWidth={canvasWidth}
              peopleById={peopleById}
            />
            {people.map((person) => (
              <RoyalNode
                key={person.id}
                person={person}
                active={selectedPerson?.id === person.id}
                onClick={() => centerPerson(person)}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedPerson && (
            <LineageSidebar
              key={selectedPerson.id}
              person={selectedPerson}
              onClose={() => setSelectedPerson(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function LineageEdges({
  canvasHeight,
  canvasWidth,
  peopleById,
}: {
  canvasHeight: number;
  canvasWidth: number;
  peopleById: Map<string, PositionedLineagePerson>;
}) {
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={canvasWidth}
      height={canvasHeight}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="altan-urag-edge-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.7" />
          <stop offset="48%" stopColor="#2563eb" stopOpacity="0.85" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0.7" />
        </linearGradient>
        <filter id="altan-urag-edge-glow">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {altanUragEdges.map((edge) => {
        const source = peopleById.get(edge.source);
        const target = peopleById.get(edge.target);
        if (!source || !target) return null;

        const startX = source.position.x + NODE_WIDTH / 2;
        const startY = source.position.y + NODE_HEIGHT;
        const endX = target.position.x + NODE_WIDTH / 2;
        const endY = target.position.y;
        const midY = startY + (endY - startY) * 0.46;
        const path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

        return (
          <g key={edge.id}>
            <path
              d={path}
              fill="none"
              stroke="rgba(37,99,235,0.11)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d={path}
              fill="none"
              filter="url(#altan-urag-edge-glow)"
              stroke="url(#altan-urag-edge-gradient)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </svg>
  );
}

function RoyalNode({
  active,
  onClick,
  person,
}: {
  active: boolean;
  onClick: () => void;
  person: PositionedLineagePerson;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.045, y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="absolute rounded-2xl text-left outline-none"
      style={{
        left: person.position.x,
        top: person.position.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }}
    >
      <div
        className={[
          "relative h-full overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur",
          active
            ? "border-blue-300 bg-white shadow-[0_18px_45px_rgba(37,99,235,0.18)]"
            : "border-blue-100 bg-white/92 shadow-[0_12px_35px_rgba(15,23,42,0.08)]",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_42%)]" />
        <div className="relative flex items-center gap-4">
          <div
            className={`grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${rankGlow[person.rank]} p-[2px] shadow-[0_0_26px_rgba(212,175,55,0.24)]`}
          >
            <div className="grid size-full place-items-center rounded-full bg-white">
              <SoyomboMark rank={person.rank} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-[0.20em] text-blue-500">
              {rankLabels[person.rank]}
            </div>
            <div className="mt-1 truncate text-base font-black text-slate-900">
              {person.name.mn}
            </div>
            <div className="truncate text-xs font-semibold text-slate-500">
              {person.title}
            </div>
            <div className="mt-2 text-[11px] font-bold text-blue-500">
              {person.years}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function SoyomboMark({ rank }: { rank: LineageRank }) {
  const crown = rank === "great-khan" || rank === "empire-founder";

  return (
    <div className="relative grid size-10 place-items-center text-[#2563eb]">
      <div className="absolute top-0 h-2 w-5 rounded-full bg-current" />
      {crown && (
        <div className="absolute top-1 h-3 w-8 [clip-path:polygon(0_100%,16%_10%,32%_100%,50%_0,68%_100%,84%_10%,100%_100%)] bg-current" />
      )}
      <div className="absolute top-4 h-3 w-3 rotate-45 border-2 border-current" />
      <div className="absolute bottom-2 h-4 w-7 rounded-full border-2 border-current" />
      <div className="absolute bottom-0 h-1.5 w-8 rounded-full bg-current" />
    </div>
  );
}

function LineageSidebar({
  onClose,
  person,
}: {
  onClose: () => void;
  person: PositionedLineagePerson;
}) {
  return (
    <motion.aside
      initial={{ x: 44, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 44, opacity: 0 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
      className="relative border-l border-blue-100 bg-white/92 p-5 shadow-[0_18px_55px_rgba(37,99,235,0.12)] backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-blue-100 bg-blue-50 text-sm font-black text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
        aria-label="Угсааны дэлгэрэнгүйг хаах"
      >
        ×
      </button>

      <div className="pr-10">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-500">
          Сонгосон хүн
        </p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">
          {person.name.mn}
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {person.title}
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        <DetailStat label="Цол / байр суурь" value={person.title} />
        <DetailStat label="Он цаг" value={person.years} />
        {person.reign && <DetailStat label="Төр барьсан" value={person.reign} />}
        <DetailStat label="Салбар" value={person.branch} />
        <DetailStat label="Гол төв" value={person.capital.name} />
        <DetailStat
          label="Координат"
          value={`${person.capital.coordinates[1].toFixed(2)}, ${person.capital.coordinates[0].toFixed(2)}`}
        />
      </div>

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/45 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.20em] text-blue-500">
          Түүхэн тайлбар
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-600">{person.bio}</p>
      </div>

      <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.20em] text-blue-500">
          Гол үйл хэрэг
        </p>
        <div className="mt-3 grid gap-2">
          {person.achievements.map((achievement) => (
            <div
              key={achievement}
              className="flex gap-2 rounded-lg border border-blue-100 bg-blue-50/35 px-3 py-2 text-sm leading-6 text-slate-600"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>{achievement}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

function layoutLineage(sourcePeople: LineagePerson[]) {
  const byId = new Map(sourcePeople.map((person) => [person.id, person]));
  const childIdsByParent = new Map<string, string[]>();
  for (const person of sourcePeople) {
    for (const parentId of person.parentIds) {
      childIdsByParent.set(parentId, [
        ...(childIdsByParent.get(parentId) ?? []),
        person.id,
      ]);
    }
  }

  const levelById = new Map<string, number>();
  const resolveLevel = (person: LineagePerson): number => {
    const cached = levelById.get(person.id);
    if (cached !== undefined) return cached;
    if (person.parentIds.length === 0) {
      levelById.set(person.id, 0);
      return 0;
    }

    const level =
      Math.max(
        ...person.parentIds.map((parentId) => {
          const parent = byId.get(parentId);
          return parent ? resolveLevel(parent) : 0;
        }),
      ) + 1;
    levelById.set(person.id, level);
    return level;
  };

  for (const person of sourcePeople) resolveLevel(person);

  const groups = new Map<number, LineagePerson[]>();
  for (const person of sourcePeople) {
    const level = levelById.get(person.id) ?? 0;
    groups.set(level, [...(groups.get(level) ?? []), person]);
  }

  const maxColumns = Math.max(...Array.from(groups.values(), (items) => items.length));
  const canvasWidth = Math.max(1480, maxColumns * (NODE_WIDTH + NODE_GAP_X) + 180);
  const levels = Math.max(...Array.from(groups.keys())) + 1;
  const canvasHeight = levels * (NODE_HEIGHT + NODE_GAP_Y) + 160;

  const people = Array.from(groups.entries()).flatMap(([level, items]) => {
    const sorted = [...items].sort((a, b) => {
      const branch = a.branch.localeCompare(b.branch, "mn");
      return branch || a.name.mn.localeCompare(b.name.mn, "mn");
    });
    const rowWidth = sorted.length * NODE_WIDTH + Math.max(0, sorted.length - 1) * NODE_GAP_X;
    const startX = Math.max(80, (canvasWidth - rowWidth) / 2);
    return sorted.map(
      (person, index): PositionedLineagePerson => ({
        ...person,
        position: {
          x: startX + index * (NODE_WIDTH + NODE_GAP_X),
          y: 72 + level * (NODE_HEIGHT + NODE_GAP_Y),
        },
      }),
    );
  });

  return {
    people,
    peopleById: new Map(people.map((person) => [person.id, person])),
    canvasHeight,
    canvasWidth,
  };
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
      <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-blue-500">
        {label}
      </span>
      <span className="mt-1 block text-sm font-bold text-slate-700">
        {value}
      </span>
    </div>
  );
}
