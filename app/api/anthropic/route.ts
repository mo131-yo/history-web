// app/api/anthropic/route.ts
// Admin panel-ийн AI feature generator-т зориулсан proxy
// Энэ route-аар дамжуулж Anthropic API-д хандана

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Anthropic proxy error:', err);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}