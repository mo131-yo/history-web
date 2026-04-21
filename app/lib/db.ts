// lib/db.ts
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export interface MapFeature {
  id: number;
  year: number;
  is_alternate: boolean;
  name: string;
  feature_type: 'polygon' | 'line' | 'point';
  properties: Record<string, any>;
  coordinates: number[][];
  color: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MapYear {
  id: number;
  year: number;
  label: string;
  is_active: boolean;
}

/**
 * DB-ээс ирсэн coordinates-ийг аюулгүйгээр parse хийнэ.
 * Neon нь JSONB-г заримдаа string хэлбэрээр буцаадаг тул энд шалгана.
 */
export function parseCoordinates(raw: any): number[][] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw;
  return [];
}

/**
 * DB-ээс ирсэн properties-ийг аюулгүйгээр parse хийнэ.
 */
export function parseProperties(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') return raw;
  return {};
}