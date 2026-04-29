import { ensureAtlasDatabase, sql } from "./atlas-db-core";
import type {
  AtlasEventFeature,
  AtlasEventFeatureCollection,
  AtlasEventMetadata,
} from "./types";

type AtlasEventSeed = {
  slug: string;
  startYear: number;
  endYear: number;
  title: string;
  description: string;
  eventType: string;
  relatedStates: string[];
  coordinates: [number, number];
  metadata?: AtlasEventMetadata;
};

type AtlasEventRow = {
  slug: string;
  start_year: number;
  end_year: number;
  title: string;
  description: string;
  event_type: string;
  related_states: string[];
  coordinates: [number, number];
  metadata: AtlasEventMetadata | null;
};

const DEFAULT_EVENTS: AtlasEventSeed[] = [
  {
    slug: "temujin-birth",
    startYear: 1162,
    endYear: 1162,
    title: "Temujin is Born",
    description:
      "Temujin, later known as Chinggis Khan, was born near the Onon River and became the central figure of Mongol unification.",
    eventType: "political",
    relatedStates: ["khamag-mongol"],
    coordinates: [110.5, 48.4],
    metadata: { icon: "★", label: "Temujin", importance: 5 },
  },
  {
    slug: "kurultai-1189",
    startYear: 1189,
    endYear: 1189,
    title: "Temujin Raised as Khan",
    description:
      "A kurultai elevated Temujin as khan of the Khamag Mongol, strengthening his claim over rival steppe factions.",
    eventType: "political",
    relatedStates: ["khamag-mongol"],
    coordinates: [108.2, 47.8],
    metadata: { icon: "★", label: "Kurultai", importance: 4 },
  },
  {
    slug: "merkit-campaign",
    startYear: 1184,
    endYear: 1200,
    title: "Campaigns Against the Merkit",
    description:
      "A series of punitive raids against the Merkit helped Temujin consolidate alliances and eliminate one of his fiercest enemies.",
    eventType: "campaign",
    relatedStates: ["khamag-mongol"],
    coordinates: [103.6, 50.2],
    metadata: { icon: "●", label: "Merkit", importance: 3 },
  },
  {
    slug: "great-kurultai-1206",
    startYear: 1206,
    endYear: 1206,
    title: "Great Kurultai of 1206",
    description:
      "At the Onon River kurultai, Temujin was proclaimed Chinggis Khan and the Mongol Empire formally emerged.",
    eventType: "political",
    relatedStates: ["mongol-empire", "khamag-mongol"],
    coordinates: [110.3, 48.8],
    metadata: { icon: "★", label: "1206", importance: 5 },
  },
  {
    slug: "western-xia-campaign",
    startYear: 1209,
    endYear: 1210,
    title: "Western Xia Campaign",
    description:
      "The Mongols forced Western Xia into submission after a difficult campaign that tested their siege methods and logistics.",
    eventType: "campaign",
    relatedStates: ["mongol-empire", "western-xia"],
    coordinates: [103.2, 38.4],
    metadata: { icon: "●", label: "Xia", importance: 4 },
  },
  {
    slug: "jin-invasion",
    startYear: 1211,
    endYear: 1215,
    title: "Invasion of the Jin Dynasty",
    description:
      "Mongol armies crossed the Gobi, shattered frontier defenses, and captured Zhongdu, opening North China to further conquest.",
    eventType: "war",
    relatedStates: ["mongol-empire", "jin-dynasty"],
    coordinates: [116.4, 39.9],
    metadata: { icon: "⚔", label: "Jin", importance: 5 },
  },
  {
    slug: "qara-khitai-campaign",
    startYear: 1218,
    endYear: 1218,
    title: "Collapse of Qara Khitai",
    description:
      "The Mongols absorbed the Qara Khitai realm, extending their reach deep into Central Asia before the Khwarazm war.",
    eventType: "campaign",
    relatedStates: ["mongol-empire", "qara-khitai"],
    coordinates: [75.2, 43.3],
    metadata: { icon: "●", label: "Qara Khitai", importance: 4 },
  },
  {
    slug: "khwarazmian-campaign",
    startYear: 1219,
    endYear: 1221,
    title: "Khwarazmian Campaign",
    description:
      "After the Otrar incident, Mongol armies swept through Transoxiana and Iran, destroying the Khwarazmian Empire.",
    eventType: "war",
    relatedStates: ["mongol-empire", "khwarazm"],
    coordinates: [66.97, 39.65],
    metadata: { icon: "⚔", label: "Khwarazm", importance: 5 },
  },
  {
    slug: "battle-of-kalka-river",
    startYear: 1223,
    endYear: 1223,
    title: "Battle of the Kalka River",
    description:
      "A Mongol expedition defeated a Rus-Kipchak coalition, demonstrating their reach into the western steppe.",
    eventType: "battle",
    relatedStates: ["mongol-empire", "golden-horde"],
    coordinates: [37.6, 47.3],
    metadata: { icon: "⚔", label: "Kalka", importance: 4 },
  },
  {
    slug: "eastern-europe-campaign",
    startYear: 1236,
    endYear: 1242,
    title: "Campaign into Rus and Eastern Europe",
    description:
      "Under Batu and Subedei, Mongol armies overran Volga Bulgaria, Rus principalities, and pushed into Hungary and Poland.",
    eventType: "war",
    relatedStates: ["mongol-empire", "golden-horde"],
    coordinates: [30.52, 50.45],
    metadata: { icon: "⚔", label: "Rus", importance: 5 },
  },
  {
    slug: "battle-of-mohi",
    startYear: 1241,
    endYear: 1241,
    title: "Battle of Mohi",
    description:
      "The Mongols crushed the Hungarian royal army at Mohi, one of the decisive field victories of the western campaign.",
    eventType: "battle",
    relatedStates: ["mongol-empire", "golden-horde"],
    coordinates: [20.9, 48.15],
    metadata: { icon: "⚔", label: "Mohi", importance: 4 },
  },
  {
    slug: "dali-campaign",
    startYear: 1253,
    endYear: 1254,
    title: "Dali Campaign",
    description:
      "Mongol forces conquered the Dali Kingdom, securing the southwest approach for the final wars against Song China.",
    eventType: "campaign",
    relatedStates: ["mongol-empire", "song-dynasty"],
    coordinates: [100.23, 25.6],
    metadata: { icon: "●", label: "Dali", importance: 3 },
  },
  {
    slug: "baghdad-campaign",
    startYear: 1257,
    endYear: 1258,
    title: "Siege of Baghdad",
    description:
      "Hulegu's campaign ended with the fall of Baghdad, reshaping power across the Islamic world and the Ilkhanate frontier.",
    eventType: "war",
    relatedStates: ["mongol-empire", "ilkhanate"],
    coordinates: [44.37, 33.31],
    metadata: { icon: "⚔", label: "Baghdad", importance: 5 },
  },
  {
    slug: "battle-of-ayn-jalut",
    startYear: 1260,
    endYear: 1260,
    title: "Battle of Ayn Jalut",
    description:
      "Mamluk forces halted the Mongol advance in Syria, marking a major turning point on the empire's western front.",
    eventType: "battle",
    relatedStates: ["ilkhanate", "mamluk-sultanate"],
    coordinates: [35.3, 32.57],
    metadata: { icon: "⚔", label: "Ayn Jalut", importance: 5 },
  },
  {
    slug: "first-japan-campaign",
    startYear: 1274,
    endYear: 1274,
    title: "First Invasion of Japan",
    description:
      "Yuan fleets attacked Kyushu but withdrew after fierce resistance and storm damage.",
    eventType: "campaign",
    relatedStates: ["yuan-dynasty"],
    coordinates: [130.4, 33.7],
    metadata: { icon: "●", label: "Japan I", importance: 3 },
  },
  {
    slug: "song-conquest",
    startYear: 1268,
    endYear: 1279,
    title: "Final Conquest of Song China",
    description:
      "Long campaigns under Kublai Khan ended with the collapse of the Song, completing Mongol domination of China.",
    eventType: "war",
    relatedStates: ["yuan-dynasty", "song-dynasty"],
    coordinates: [113.26, 23.13],
    metadata: { icon: "⚔", label: "Song", importance: 5 },
  },
  {
    slug: "second-japan-campaign",
    startYear: 1281,
    endYear: 1281,
    title: "Second Invasion of Japan",
    description:
      "A larger Yuan expedition failed after logistical strain, Japanese defenses, and a devastating storm.",
    eventType: "campaign",
    relatedStates: ["yuan-dynasty"],
    coordinates: [129.8, 32.8],
    metadata: { icon: "●", label: "Japan II", importance: 4 },
  },
];

let eventsBootstrapPromise: Promise<void> | null = null;

export async function getAtlasEventsForYear(
  year: number
): Promise<AtlasEventFeatureCollection> {
  await ensureAtlasEventsReady();

  const rows = (await sql`
    SELECT
      slug,
      start_year,
      end_year,
      title,
      description,
      event_type,
      related_states,
      coordinates,
      metadata
    FROM atlas_events
    WHERE start_year <= ${year}
      AND end_year >= ${year}
    ORDER BY COALESCE((metadata->>'importance')::int, 0) DESC, start_year ASC, title ASC
  `) as AtlasEventRow[];

  return {
    type: "FeatureCollection",
    year,
    features: rows.map(toAtlasEventFeature),
  };
}

export async function seedAtlasEvents() {
  for (const event of DEFAULT_EVENTS) {
    await sql`
      INSERT INTO atlas_events (
        slug,
        start_year,
        end_year,
        title,
        description,
        event_type,
        related_states,
        coordinates,
        metadata
      )
      VALUES (
        ${event.slug},
        ${event.startYear},
        ${event.endYear},
        ${event.title},
        ${event.description},
        ${event.eventType},
        ${event.relatedStates},
        ${JSON.stringify(event.coordinates)}::jsonb,
        ${JSON.stringify(event.metadata ?? {})}::jsonb
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }
}

async function ensureAtlasEventsReady() {
  if (eventsBootstrapPromise) return eventsBootstrapPromise;

  eventsBootstrapPromise = (async () => {
    await ensureAtlasDatabase();
    await seedAtlasEvents();
  })();

  return eventsBootstrapPromise;
}

function toAtlasEventFeature(row: AtlasEventRow): AtlasEventFeature {
  const metadata = row.metadata ?? {};
  const icon = resolveEventIcon(row.event_type, metadata.icon);
  const label =
    typeof metadata.label === "string" && metadata.label.trim().length > 0
      ? metadata.label.trim()
      : row.title;
  const importance = resolveImportance(row.event_type, metadata.importance);

  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: normalizeEventCoordinates(row.coordinates),
    },
    properties: {
      slug: row.slug,
      startYear: row.start_year,
      endYear: row.end_year,
      title: row.title,
      description: row.description,
      eventType: row.event_type,
      relatedStates: row.related_states ?? [],
      icon,
      label,
      importance,
      metadata,
    },
  };
}

function resolveEventIcon(eventType: string, metadataIcon: unknown) {
  if (typeof metadataIcon === "string" && metadataIcon.trim().length > 0) {
    return metadataIcon;
  }
  if (eventType === "political") return "★";
  if (eventType === "campaign") return "●";
  return "⚔";
}

function resolveImportance(eventType: string, metadataImportance: unknown) {
  const parsed = Number(metadataImportance);
  if (Number.isFinite(parsed)) return parsed;
  if (eventType === "political") return 4;
  if (eventType === "campaign") return 3;
  return 5;
}

function normalizeEventCoordinates(value: unknown): [number, number] {
  if (Array.isArray(value) && value.length >= 2) {
    const lng = Number(value[0]);
    const lat = Number(value[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }
  return [0, 0];
}
