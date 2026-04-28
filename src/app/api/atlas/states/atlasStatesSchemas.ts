import { z } from "zod";

export const querySchema = z.object({
  year: z.coerce.number().int().min(1100).max(1400),
});

const pointSchema = z.tuple([
  z.coerce.number().min(-180).max(180),
  z.coerce.number().min(-90).max(90),
]);

export const bodySchema = z.object({
  year: z.coerce.number().int().min(1100).max(1400),
  name: z.string().trim().min(2, "Нэр дор хаяж 2 тэмдэгт байна."),
  leader: z.string().trim().optional().default("Тодорхойгүй"),
  capital: z.string().trim().optional().default("Тодорхойгүй"),
  color: z.string().trim().min(4).max(20).default("#c9a45d"),
  summary: z.string().trim().min(8, "Тайлбар дор хаяж 8 тэмдэгт байна."),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  coordinates: z.array(pointSchema).min(4, "Polygon дор хаяж 4 coordinate point-той байна."),
});
