import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  req: Request,
  { params }: { params: { year: string } },
) {
  try {
    const filePath = path.join(
      process.cwd(),
      'public',
      'data',
      `${params.year}.json`,
    );

    const file = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(file);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
