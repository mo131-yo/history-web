# Монголын Түүхэн Атлас

`history-web` нь 1162-1300 оны Монгол ба Төв Азийн түүхэн улсуудын хилийг интерактив газрын зураг дээр харуулдаг Next.js апп юм.

## Гол боломжууд

- Neon `DATABASE_URL` дээр суурилсан Postgres + PostGIS хадгалалт
- Schema байхгүй хоосон DB дээр ч эхний request-ээр `CREATE EXTENSION`, table, index, seed data автоматаар үүсгэнэ
- User-facing polygon editor
- Vertex-үүдийг mouse-аар чирж зөөх
- `Add point` горимоор шинэ coordinate оруулах
- `PATCH` update ашиглаж existing geometry-г шинэчлэх
- OpenAI ашигласан тухайн улсын тайлбар

## Ашиглах env

`.env.local` дээр:

```env
DATABASE_URL=postgresql://...
OPENAI_KEY=sk-...
```

## Хөгжүүлэлт

```bash
npm run dev
```

## API

- `GET /api/atlas/years`
- `GET /api/atlas/states?year=1206`
- `PATCH /api/atlas/states/:slug/geometry`
- `POST /api/atlas/insight`

## Schema

SQL reference нь [db/schema.sql](/private/var/administrator/Desktop/vibe-mongol/history-web/db/schema.sql) дээр бий. Runtime bootstrap нь мөн ижил бүтцийг автоматаар үүсгэнэ.
